"""
EduLingua AI Assistant API
Backend em Python com FastAPI + OpenAI GPT-4.1-mini + Supabase
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client
import json
import httpx
import base64
import tempfile
import uuid
from datetime import datetime, date, timedelta

load_dotenv()

# ============================================
# CONFIGURAÇÃO
# ============================================

app = FastAPI(title="EduLingua AI Assistant")

# CORS para permitir chamadas do React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique o domínio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clientes
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")  # Use service key para acesso total
)

# ============================================
# MODELS
# ============================================

class ChatMessage(BaseModel):
    role: str  # "user" ou "assistant"
    content: str

class ChatUser(BaseModel):
    id: Optional[str] = None
    perfil: Optional[str] = None  # 'admin', 'professor', 'supervisor'

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user: Optional[ChatUser] = None

class ChatResponse(BaseModel):
    response: str
    data: Optional[List[Dict[str, Any]]] = None

# ============================================
# SCHEMA DO BANCO (para o GPT entender)
# ============================================

DATABASE_SCHEMA = """
## Tabelas do Sistema EduLingua (Escola de Idiomas)

### usuarios
- id: UUID (PK)
- email: VARCHAR(100) - email do usuário
- nome: VARCHAR(100) - nome completo
- perfil: VARCHAR(20) - 'admin' ou 'professor'
- ativo: BOOLEAN

### turmas
- id: UUID (PK)
- nome: VARCHAR(100) - nome da turma (ex: "Inglês Básico - Segunda 19h")
- idioma: VARCHAR(50) - 'Inglês', 'Espanhol', 'Francês'
- professor_id: UUID (FK → usuarios.id) - professor responsável
- horario: VARCHAR(50) - horário das aulas
- dias_semana: VARCHAR(100) - dias da semana
- livro: VARCHAR(150) - livro didático usado

### alunos
- id: UUID (PK)
- nome: VARCHAR(100) - nome completo
- cpf: VARCHAR(14)
- telefone: VARCHAR(20)
- email: VARCHAR(100)
- cidade: VARCHAR(100)
- estado: VARCHAR(2)
- status_pedagogico: VARCHAR(20) - 'ativo', 'trancado', 'concluido'
- status_financeiro: VARCHAR(20) - 'em_dia', 'pendente', 'inadimplente'
- dia_vencimento: INTEGER - dia do mês para pagamento
- valor_mensalidade: NUMERIC(10,2)
- forma_pagamento: VARCHAR(50) - 'PIX', 'Boleto', 'Cartão', etc
- desconto: NUMERIC(5,2) - percentual de desconto
- usa_transporte: BOOLEAN
- aniversario_dia: INTEGER
- aniversario_mes: INTEGER
- data_inicio: DATE

### matriculas
- id: UUID (PK)
- turma_id: UUID (FK → turmas.id)
- aluno_id: UUID (FK → alunos.id)
- status: VARCHAR(20) - 'ativo', 'cancelado'
- data_matricula: TIMESTAMP

### aulas
- id: UUID (PK)
- turma_id: UUID (FK → turmas.id)
- data: DATE - data da aula
- unidade_livro: VARCHAR(150) - unidade/lição trabalhada
- conteudo: TEXT - conteúdo da aula
- observacoes: TEXT

### presencas
- id: UUID (PK)
- aula_id: UUID (FK → aulas.id)
- aluno_id: UUID (FK → alunos.id)
- presente: BOOLEAN - true = presente, false = faltou
- observacao: VARCHAR(200)

## Relacionamentos importantes:
- turmas.professor_id → usuarios.id (professor da turma)
- matriculas liga alunos ↔ turmas (N:N)
- aulas pertence a turmas
- presencas liga aulas ↔ alunos
"""

# ============================================
# FUNÇÕES AUXILIARES
# ============================================

def get_current_date_context():
    """Retorna contexto de data atual para o GPT"""
    today = datetime.now()
    return f"""
Data atual: {today.strftime('%d/%m/%Y')} ({today.strftime('%A')})
Semana atual: de {(today - timedelta(days=today.weekday())).strftime('%d/%m')} a {(today + timedelta(days=6-today.weekday())).strftime('%d/%m')}
"""

def execute_safe_query(sql: str) -> List[Dict[str, Any]]:
    """
    Executa query SQL de forma segura (somente SELECT)
    """
    # Validação básica de segurança
    sql_upper = sql.upper().strip()
    
    # Só permite SELECT
    if not sql_upper.startswith("SELECT"):
        raise ValueError("Apenas consultas SELECT são permitidas")
    
    # Bloqueia operações perigosas
    forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "GRANT", "REVOKE"]
    for word in forbidden:
        if word in sql_upper:
            raise ValueError(f"Operação '{word}' não permitida")
    
    try:
        result = supabase.rpc('execute_readonly_query', {'query_text': sql}).execute()
        return result.data if result.data else []
    except Exception as e:
        # Fallback: tenta executar diretamente via PostgREST
        # Isso é mais limitado mas funciona para queries simples
        raise e

def query_database(table: str, select: str = "*", filters: Dict = None, limit: int = 100) -> List[Dict]:
    """
    Query segura usando o cliente Supabase
    """
    try:
        query = supabase.table(table).select(select)
        
        if filters:
            for key, value in filters.items():
                if isinstance(value, dict):
                    # Operadores especiais: {"gt": 5}, {"eq": "valor"}, {"ilike": "%texto%"}
                    for op, val in value.items():
                        if op == "eq":
                            query = query.eq(key, val)
                        elif op == "neq":
                            query = query.neq(key, val)
                        elif op == "gt":
                            query = query.gt(key, val)
                        elif op == "gte":
                            query = query.gte(key, val)
                        elif op == "lt":
                            query = query.lt(key, val)
                        elif op == "lte":
                            query = query.lte(key, val)
                        elif op == "ilike":
                            query = query.ilike(key, val)
                        elif op == "in":
                            query = query.in_(key, val)
                else:
                    query = query.eq(key, value)
        
        result = query.limit(limit).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Erro na query: {e}")
        return []

# ============================================
# FERRAMENTAS PARA O GPT (Function Calling)
# ============================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "consultar_turmas",
            "description": "Busca informações sobre turmas. Use para perguntas sobre turmas, idiomas, horários, professores de turmas.",
            "parameters": {
                "type": "object",
                "properties": {
                    "idioma": {
                        "type": "string",
                        "description": "Filtrar por idioma: 'Inglês', 'Espanhol', 'Francês'"
                    },
                    "professor_nome": {
                        "type": "string",
                        "description": "Nome ou parte do nome do professor"
                    },
                    "nome_turma": {
                        "type": "string",
                        "description": "Nome ou parte do nome da turma"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_alunos",
            "description": "Busca informações sobre alunos. Use para perguntas sobre alunos específicos, status financeiro, inadimplentes, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "nome": {
                        "type": "string",
                        "description": "Nome ou parte do nome do aluno"
                    },
                    "status_financeiro": {
                        "type": "string",
                        "enum": ["em_dia", "pendente", "inadimplente"],
                        "description": "Filtrar por status financeiro"
                    },
                    "status_pedagogico": {
                        "type": "string",
                        "enum": ["ativo", "trancado", "concluido"],
                        "description": "Filtrar por status pedagógico"
                    },
                    "usa_transporte": {
                        "type": "boolean",
                        "description": "Filtrar por uso de transporte"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_alunos_turma",
            "description": "Lista todos os alunos matriculados em uma turma específica.",
            "parameters": {
                "type": "object",
                "properties": {
                    "turma_nome": {
                        "type": "string",
                        "description": "Nome ou parte do nome da turma"
                    },
                    "turma_id": {
                        "type": "string",
                        "description": "ID da turma (UUID)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_turmas_aluno",
            "description": "Lista todas as turmas em que um aluno está matriculado.",
            "parameters": {
                "type": "object",
                "properties": {
                    "aluno_nome": {
                        "type": "string",
                        "description": "Nome ou parte do nome do aluno"
                    }
                },
                "required": ["aluno_nome"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_faltas",
            "description": "Busca informações sobre faltas e presenças. Use para perguntas como 'quem faltou essa semana', 'faltas do aluno X', etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "aluno_nome": {
                        "type": "string",
                        "description": "Nome do aluno para ver faltas"
                    },
                    "turma_nome": {
                        "type": "string",
                        "description": "Nome da turma para ver faltas"
                    },
                    "data_inicio": {
                        "type": "string",
                        "description": "Data inicial no formato YYYY-MM-DD"
                    },
                    "data_fim": {
                        "type": "string",
                        "description": "Data final no formato YYYY-MM-DD"
                    },
                    "apenas_faltas": {
                        "type": "boolean",
                        "description": "Se true, retorna apenas registros de falta (presente=false)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_aulas",
            "description": "Busca informações sobre aulas realizadas.",
            "parameters": {
                "type": "object",
                "properties": {
                    "turma_nome": {
                        "type": "string",
                        "description": "Nome da turma"
                    },
                    "data_inicio": {
                        "type": "string",
                        "description": "Data inicial no formato YYYY-MM-DD"
                    },
                    "data_fim": {
                        "type": "string",
                        "description": "Data final no formato YYYY-MM-DD"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_professores",
            "description": "Lista professores e suas turmas.",
            "parameters": {
                "type": "object",
                "properties": {
                    "nome": {
                        "type": "string",
                        "description": "Nome ou parte do nome do professor"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "estatisticas_gerais",
            "description": "Retorna estatísticas gerais da escola: total de turmas, alunos, professores, inadimplentes, etc.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "aniversariantes",
            "description": "Lista aniversariantes de um mês específico ou do mês atual.",
            "parameters": {
                "type": "object",
                "properties": {
                    "mes": {
                        "type": "integer",
                        "description": "Número do mês (1-12). Se não informado, usa o mês atual."
                    }
                }
            }
        }
    }
]

# ============================================
# ESCOPO POR USUÁRIO (RBAC)
# ============================================

def compute_user_scope(user: Optional["ChatUser"]) -> Dict[str, Any]:
    """
    Retorna o escopo de dados que o usuário pode acessar.
    - admin/None: sem restrição (allowed_turma_ids=None)
    - supervisor: só as turmas vinculadas via supervisor_turmas
    - professor: só as turmas onde ele é professor_id
    """
    if not user or not user.perfil or user.perfil == "admin":
        return {"allowed_turma_ids": None, "perfil": "admin"}

    if user.perfil == "supervisor" and user.id:
        result = supabase.table("supervisor_turmas").select("turma_id").eq("usuario_id", user.id).execute()
        ids = [r["turma_id"] for r in (result.data or [])]
        return {"allowed_turma_ids": ids, "perfil": "supervisor"}

    if user.perfil == "professor" and user.id:
        result = supabase.table("turmas").select("id").eq("professor_id", user.id).execute()
        ids = [r["id"] for r in (result.data or [])]
        return {"allowed_turma_ids": ids, "perfil": "professor"}

    # fallback: nega tudo
    return {"allowed_turma_ids": [], "perfil": user.perfil}


def _alunos_in_scope(scope: Dict[str, Any]) -> Optional[List[str]]:
    """Lista de aluno_ids matriculados em turmas do escopo. None = sem restrição."""
    allowed = scope.get("allowed_turma_ids")
    if allowed is None:
        return None
    if not allowed:
        return []
    matriculas = supabase.table("matriculas").select("aluno_id").in_("turma_id", allowed).execute()
    return list({m["aluno_id"] for m in (matriculas.data or [])})


# ============================================
# IMPLEMENTAÇÃO DAS FERRAMENTAS
# ============================================

def tool_consultar_turmas(idioma: str = None, professor_nome: str = None, nome_turma: str = None, _scope: Dict = None) -> List[Dict]:
    """Consulta turmas com filtros"""
    _scope = _scope or {}
    query = supabase.table("turmas").select("*, professor:usuarios!turmas_professor_id_fkey(id, nome, email)")

    allowed = _scope.get("allowed_turma_ids")
    if allowed is not None:
        if not allowed:
            return []
        query = query.in_("id", allowed)

    if idioma:
        query = query.eq("idioma", idioma)
    if nome_turma:
        query = query.ilike("nome", f"%{nome_turma}%")

    result = query.execute()
    turmas = result.data if result.data else []

    # Filtro por nome do professor (pós-query pois é relacionamento)
    if professor_nome:
        turmas = [t for t in turmas if t.get("professor") and professor_nome.lower() in t["professor"].get("nome", "").lower()]

    # Adiciona contagem de alunos
    for turma in turmas:
        matriculas = supabase.table("matriculas").select("id", count="exact").eq("turma_id", turma["id"]).eq("status", "ativo").execute()
        turma["total_alunos"] = matriculas.count if matriculas.count else 0

    return turmas

def tool_consultar_alunos(nome: str = None, status_financeiro: str = None, status_pedagogico: str = None, usa_transporte: bool = None, _scope: Dict = None) -> List[Dict]:
    """Consulta alunos com filtros"""
    _scope = _scope or {}
    query = supabase.table("alunos").select("*")

    aluno_ids = _alunos_in_scope(_scope)
    if aluno_ids is not None:
        if not aluno_ids:
            return []
        query = query.in_("id", aluno_ids)

    if nome:
        query = query.ilike("nome", f"%{nome}%")
    if status_financeiro:
        query = query.eq("status_financeiro", status_financeiro)
    if status_pedagogico:
        query = query.eq("status_pedagogico", status_pedagogico)
    if usa_transporte is not None:
        query = query.eq("usa_transporte", usa_transporte)

    result = query.order("nome").execute()
    return result.data if result.data else []

def tool_consultar_alunos_turma(turma_nome: str = None, turma_id: str = None, _scope: Dict = None) -> Dict:
    """Lista alunos de uma turma"""
    _scope = _scope or {}
    allowed = _scope.get("allowed_turma_ids")

    # Encontra a turma
    if turma_id:
        if allowed is not None and turma_id not in allowed:
            return {"erro": "Você não tem acesso a essa turma"}
        turma_result = supabase.table("turmas").select("*").eq("id", turma_id).single().execute()
    elif turma_nome:
        q = supabase.table("turmas").select("*").ilike("nome", f"%{turma_nome}%")
        if allowed is not None:
            if not allowed:
                return {"erro": "Você não tem turmas atribuídas"}
            q = q.in_("id", allowed)
        turma_result = q.execute()
        if turma_result.data:
            turma_result.data = turma_result.data[0]
        else:
            return {"erro": f"Turma '{turma_nome}' não encontrada (ou fora do seu escopo)"}
    else:
        return {"erro": "Informe o nome ou ID da turma"}

    if not turma_result.data:
        return {"erro": "Turma não encontrada"}

    turma = turma_result.data

    # Busca matrículas com dados do aluno
    matriculas = supabase.table("matriculas").select("*, aluno:alunos(*)").eq("turma_id", turma["id"]).eq("status", "ativo").execute()

    alunos = [m["aluno"] for m in (matriculas.data or []) if m.get("aluno")]

    return {
        "turma": turma,
        "total_alunos": len(alunos),
        "alunos": alunos
    }

def tool_consultar_turmas_aluno(aluno_nome: str, _scope: Dict = None) -> Dict:
    """Lista turmas de um aluno"""
    _scope = _scope or {}
    allowed = _scope.get("allowed_turma_ids")

    # Encontra o aluno
    aluno_result = supabase.table("alunos").select("*").ilike("nome", f"%{aluno_nome}%").execute()

    if not aluno_result.data:
        return {"erro": f"Aluno '{aluno_nome}' não encontrado"}

    aluno = aluno_result.data[0]

    # Busca matrículas com dados da turma
    matriculas = supabase.table("matriculas").select("*, turma:turmas(*, professor:usuarios!turmas_professor_id_fkey(nome))").eq("aluno_id", aluno["id"]).eq("status", "ativo").execute()

    turmas = [m["turma"] for m in (matriculas.data or []) if m.get("turma")]

    if allowed is not None:
        turmas = [t for t in turmas if t.get("id") in allowed]

    if allowed is not None and not turmas:
        return {"erro": f"Aluno '{aluno_nome}' não está em turmas do seu escopo"}

    return {
        "aluno": aluno,
        "total_turmas": len(turmas),
        "turmas": turmas
    }

def tool_consultar_faltas(aluno_nome: str = None, turma_nome: str = None, data_inicio: str = None, data_fim: str = None, apenas_faltas: bool = True, _scope: Dict = None) -> List[Dict]:
    """Consulta presenças/faltas"""
    _scope = _scope or {}
    allowed = _scope.get("allowed_turma_ids")

    # Se não informar datas, usa a semana atual
    if not data_inicio:
        today = datetime.now()
        data_inicio = (today - timedelta(days=today.weekday())).strftime("%Y-%m-%d")
    if not data_fim:
        today = datetime.now()
        data_fim = (today + timedelta(days=6-today.weekday())).strftime("%Y-%m-%d")

    # Busca aulas no período
    aulas_query = supabase.table("aulas").select("id, data, turma:turmas(id, nome), turma_id").gte("data", data_inicio).lte("data", data_fim)

    if allowed is not None:
        if not allowed:
            return []
        aulas_query = aulas_query.in_("turma_id", allowed)

    if turma_nome:
        turma_q = supabase.table("turmas").select("id").ilike("nome", f"%{turma_nome}%")
        if allowed is not None:
            turma_q = turma_q.in_("id", allowed)
        turma = turma_q.execute()
        if turma.data:
            aulas_query = aulas_query.eq("turma_id", turma.data[0]["id"])
        else:
            return []

    aulas = aulas_query.execute()

    if not aulas.data:
        return []

    aula_ids = [a["id"] for a in aulas.data]

    # Busca presenças
    presencas_query = supabase.table("presencas").select("*, aluno:alunos(id, nome), aula:aulas(data, turma:turmas(nome))").in_("aula_id", aula_ids)

    if apenas_faltas:
        presencas_query = presencas_query.eq("presente", False)

    presencas = presencas_query.execute()

    # Filtra por aluno se necessário
    resultado = presencas.data or []
    if aluno_nome:
        resultado = [p for p in resultado if p.get("aluno") and aluno_nome.lower() in p["aluno"].get("nome", "").lower()]

    return resultado

def tool_consultar_aulas(turma_nome: str = None, data_inicio: str = None, data_fim: str = None, _scope: Dict = None) -> List[Dict]:
    """Consulta aulas realizadas"""
    _scope = _scope or {}
    allowed = _scope.get("allowed_turma_ids")

    query = supabase.table("aulas").select("*, turma:turmas(nome, idioma)")

    if allowed is not None:
        if not allowed:
            return []
        query = query.in_("turma_id", allowed)

    if turma_nome:
        turma_q = supabase.table("turmas").select("id").ilike("nome", f"%{turma_nome}%")
        if allowed is not None:
            turma_q = turma_q.in_("id", allowed)
        turma = turma_q.execute()
        if turma.data:
            query = query.eq("turma_id", turma.data[0]["id"])
        else:
            return []

    if data_inicio:
        query = query.gte("data", data_inicio)
    if data_fim:
        query = query.lte("data", data_fim)

    result = query.order("data", desc=True).limit(50).execute()
    return result.data if result.data else []

def tool_consultar_professores(nome: str = None, _scope: Dict = None) -> List[Dict]:
    """Lista professores com suas turmas"""
    _scope = _scope or {}
    allowed = _scope.get("allowed_turma_ids")

    # Se há escopo, só lista professores das turmas permitidas
    if allowed is not None:
        if not allowed:
            return []
        turmas_res = supabase.table("turmas").select("professor_id").in_("id", allowed).execute()
        prof_ids = list({t["professor_id"] for t in (turmas_res.data or []) if t.get("professor_id")})
        if not prof_ids:
            return []
        query = supabase.table("usuarios").select("*").in_("id", prof_ids).eq("ativo", True)
    else:
        query = supabase.table("usuarios").select("*").eq("perfil", "professor").eq("ativo", True)

    if nome:
        query = query.ilike("nome", f"%{nome}%")

    professores = query.execute()
    resultado = []

    for prof in (professores.data or []):
        t_query = supabase.table("turmas").select("id, nome, idioma, horario").eq("professor_id", prof["id"])
        if allowed is not None:
            t_query = t_query.in_("id", allowed)
        turmas = t_query.execute()
        prof["turmas"] = turmas.data or []
        prof["total_turmas"] = len(prof["turmas"])
        resultado.append(prof)

    return resultado

def tool_estatisticas_gerais(_scope: Dict = None) -> Dict:
    """Retorna estatísticas gerais"""
    _scope = _scope or {}
    allowed = _scope.get("allowed_turma_ids")
    stats = {}

    # Modo restrito (supervisor): tudo escopado às turmas permitidas
    if allowed is not None:
        if not allowed:
            return {"escopo": "restrito", "total_turmas": 0, "total_alunos": 0}

        stats["escopo"] = "restrito (apenas suas turmas)"
        stats["total_turmas"] = len(allowed)

        aluno_ids = _alunos_in_scope(_scope) or []
        stats["total_alunos"] = len(aluno_ids)

        if aluno_ids:
            ativos = supabase.table("alunos").select("id", count="exact").eq("status_pedagogico", "ativo").in_("id", aluno_ids).execute()
            stats["alunos_ativos"] = ativos.count or 0
            transporte = supabase.table("alunos").select("id", count="exact").eq("usa_transporte", True).in_("id", aluno_ids).execute()
            stats["alunos_transporte"] = transporte.count or 0
        return stats

    # Total de turmas
    turmas = supabase.table("turmas").select("id", count="exact").execute()
    stats["total_turmas"] = turmas.count or 0

    # Total de alunos
    alunos = supabase.table("alunos").select("id", count="exact").execute()
    stats["total_alunos"] = alunos.count or 0

    # Alunos por status pedagógico
    ativos = supabase.table("alunos").select("id", count="exact").eq("status_pedagogico", "ativo").execute()
    stats["alunos_ativos"] = ativos.count or 0

    trancados = supabase.table("alunos").select("id", count="exact").eq("status_pedagogico", "trancado").execute()
    stats["alunos_trancados"] = trancados.count or 0

    # Alunos por status financeiro
    em_dia = supabase.table("alunos").select("id", count="exact").eq("status_financeiro", "em_dia").execute()
    stats["alunos_em_dia"] = em_dia.count or 0

    pendentes = supabase.table("alunos").select("id", count="exact").eq("status_financeiro", "pendente").execute()
    stats["alunos_pendentes"] = pendentes.count or 0

    inadimplentes = supabase.table("alunos").select("id", count="exact").eq("status_financeiro", "inadimplente").execute()
    stats["alunos_inadimplentes"] = inadimplentes.count or 0

    # Total de professores
    professores = supabase.table("usuarios").select("id", count="exact").eq("perfil", "professor").eq("ativo", True).execute()
    stats["total_professores"] = professores.count or 0

    # Turmas por idioma
    turmas_ingles = supabase.table("turmas").select("id", count="exact").eq("idioma", "Inglês").execute()
    stats["turmas_ingles"] = turmas_ingles.count or 0

    turmas_espanhol = supabase.table("turmas").select("id", count="exact").eq("idioma", "Espanhol").execute()
    stats["turmas_espanhol"] = turmas_espanhol.count or 0

    turmas_frances = supabase.table("turmas").select("id", count="exact").eq("idioma", "Francês").execute()
    stats["turmas_frances"] = turmas_frances.count or 0

    # Alunos que usam transporte
    transporte = supabase.table("alunos").select("id", count="exact").eq("usa_transporte", True).execute()
    stats["alunos_transporte"] = transporte.count or 0

    return stats

def tool_aniversariantes(mes: int = None, _scope: Dict = None) -> List[Dict]:
    """Lista aniversariantes do mês"""
    _scope = _scope or {}
    if mes is None:
        mes = datetime.now().month

    query = supabase.table("alunos").select("id, nome, aniversario_dia, aniversario_mes, telefone").eq("aniversario_mes", mes).eq("status_pedagogico", "ativo")

    aluno_ids = _alunos_in_scope(_scope)
    if aluno_ids is not None:
        if not aluno_ids:
            return []
        query = query.in_("id", aluno_ids)

    result = query.order("aniversario_dia").execute()
    return result.data if result.data else []

# Mapeamento de ferramentas
TOOL_FUNCTIONS = {
    "consultar_turmas": tool_consultar_turmas,
    "consultar_alunos": tool_consultar_alunos,
    "consultar_alunos_turma": tool_consultar_alunos_turma,
    "consultar_turmas_aluno": tool_consultar_turmas_aluno,
    "consultar_faltas": tool_consultar_faltas,
    "consultar_aulas": tool_consultar_aulas,
    "consultar_professores": tool_consultar_professores,
    "estatisticas_gerais": tool_estatisticas_gerais,
    "aniversariantes": tool_aniversariantes,
}

# ============================================
# ENDPOINT PRINCIPAL
# ============================================

def build_system_prompt(scope: Dict[str, Any]) -> str:
    """Constrói o system prompt baseado no escopo do usuário"""
    perfil = scope.get("perfil", "admin")
    allowed = scope.get("allowed_turma_ids")

    if perfil == "supervisor":
        # Busca nomes das turmas para contexto
        turma_nomes = []
        if allowed:
            t = supabase.table("turmas").select("nome").in_("id", allowed).execute()
            turma_nomes = [r["nome"] for r in (t.data or [])]
        turmas_str = ", ".join(turma_nomes) if turma_nomes else "(nenhuma turma vinculada)"

        return f"""Você é o assistente virtual da EduLingua, atendendo um SUPERVISOR de turmas.

IMPORTANTE: Este usuário é supervisor e tem acesso APENAS às seguintes turmas: {turmas_str}.

Todas as ferramentas já estão automaticamente filtradas para retornar somente dados dessas turmas. Você NÃO deve responder perguntas sobre:
- Outras turmas da escola fora do escopo
- Informações financeiras gerais (mensalidades, inadimplência, boletos)
- Lista geral de alunos da escola
- Estatísticas globais que não envolvam suas turmas

Se o usuário pedir algo fora do escopo, responda educadamente que essa informação está fora da sua área de supervisão.

{DATABASE_SCHEMA}

## Instruções:
1. Sempre use as ferramentas disponíveis para buscar dados atualizados
2. Responda de forma clara e objetiva em português brasileiro
3. Formate números, datas e valores de forma legível
4. Se não encontrar dados, informe claramente
5. Quando listar muitos itens, organize em formato de lista
6. Para datas, use formato DD/MM/YYYY

## Contexto temporal:
{get_current_date_context()}

Seja prestativo, claro e direto nas respostas!
"""

    return f"""Você é o assistente virtual da EduLingua, uma escola de idiomas. Seu papel é ajudar os administradores a consultar informações sobre turmas, alunos, professores, presenças e finanças.

{DATABASE_SCHEMA}

## Instruções:
1. Sempre use as ferramentas disponíveis para buscar dados atualizados
2. Responda de forma clara e objetiva em português brasileiro
3. Formate números, datas e valores de forma legível
4. Se não encontrar dados, informe claramente
5. Quando listar muitos itens, organize em formato de lista
6. Para valores monetários, use R$ e formato brasileiro (1.234,56)
7. Para datas, use formato DD/MM/YYYY

## Contexto temporal:
{get_current_date_context()}

Seja prestativo, claro e direto nas respostas!
"""


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint principal do chat
    """
    try:
        # Determina escopo do usuário
        scope = compute_user_scope(request.user)

        # Monta histórico de mensagens
        messages = [{"role": "system", "content": build_system_prompt(scope)}]

        # Adiciona histórico
        for msg in request.history[-10:]:  # Últimas 10 mensagens
            messages.append({"role": msg.role, "content": msg.content})

        # Adiciona mensagem atual
        messages.append({"role": "user", "content": request.message})

        # Primeira chamada - pode solicitar tools
        response = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.3
        )

        assistant_message = response.choices[0].message

        # Se precisar executar ferramentas
        if assistant_message.tool_calls:
            # Adiciona resposta do assistente com tool_calls
            messages.append(assistant_message)

            # Executa cada ferramenta
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                print(f"Executando: {function_name}({function_args}) | escopo: {scope.get('perfil')}")

                # Executa a função (com escopo)
                if function_name in TOOL_FUNCTIONS:
                    try:
                        result = TOOL_FUNCTIONS[function_name](_scope=scope, **function_args)
                    except Exception as e:
                        result = {"erro": str(e)}
                else:
                    result = {"erro": f"Função {function_name} não encontrada"}
                
                # Adiciona resultado da ferramenta
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False, default=str)
                })
            
            # Segunda chamada - gera resposta final
            final_response = openai_client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=messages,
                temperature=0.3
            )
            
            return ChatResponse(
                response=final_response.choices[0].message.content,
                data=None
            )
        
        # Resposta direta (sem tools)
        return ChatResponse(
            response=assistant_message.content,
            data=None
        )
    
    except Exception as e:
        print(f"Erro no chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ALERTAS (Faltas + Inadimplência)
# ============================================

@app.get("/alertas")
async def get_alertas():
    """Retorna alertas de faltas da semana e alunos inadimplentes"""
    today = datetime.now()
    inicio_semana = (today - timedelta(days=today.weekday())).strftime("%Y-%m-%d")
    fim_semana = (today + timedelta(days=6 - today.weekday())).strftime("%Y-%m-%d")

    # Faltas da semana
    aulas = supabase.table("aulas").select("id, data, turma:turmas(id, nome)").gte("data", inicio_semana).lte("data", fim_semana).execute()
    aula_ids = [a["id"] for a in (aulas.data or [])]

    faltas_por_aluno = {}
    if aula_ids:
        presencas = supabase.table("presencas").select("*, aluno:alunos(id, nome, telefone), aula:aulas(data, turma:turmas(nome))").in_("aula_id", aula_ids).eq("presente", False).execute()
        for p in (presencas.data or []):
            aluno = p.get("aluno", {})
            aid = aluno.get("id", "")
            if aid not in faltas_por_aluno:
                faltas_por_aluno[aid] = {"aluno": aluno, "total": 0, "turmas": set(), "datas": []}
            faltas_por_aluno[aid]["total"] += 1
            turma_nome = p.get("aula", {}).get("turma", {}).get("nome", "")
            if turma_nome:
                faltas_por_aluno[aid]["turmas"].add(turma_nome)
            faltas_por_aluno[aid]["datas"].append(p.get("aula", {}).get("data", ""))

    faltas_lista = []
    for aid, info in faltas_por_aluno.items():
        faltas_lista.append({
            "aluno_id": aid,
            "nome": info["aluno"].get("nome", ""),
            "telefone": info["aluno"].get("telefone", ""),
            "total_faltas": info["total"],
            "turmas": list(info["turmas"]),
            "datas": info["datas"],
        })
    faltas_lista.sort(key=lambda x: x["total_faltas"], reverse=True)

    # Inadimplentes
    inadimplentes_result = supabase.table("alunos").select("id, nome, telefone, email, status_financeiro, valor_mensalidade, dia_vencimento").in_("status_financeiro", ["pendente", "inadimplente"]).eq("status_pedagogico", "ativo").order("nome").execute()

    inadimplentes = []
    for aluno in (inadimplentes_result.data or []):
        inadimplentes.append({
            "aluno_id": aluno["id"],
            "nome": aluno.get("nome", ""),
            "telefone": aluno.get("telefone", ""),
            "email": aluno.get("email", ""),
            "status": aluno.get("status_financeiro", ""),
            "valor_mensalidade": aluno.get("valor_mensalidade"),
            "dia_vencimento": aluno.get("dia_vencimento"),
        })

    return {
        "faltas": faltas_lista,
        "inadimplentes": inadimplentes,
        "resumo": {
            "totalFaltasSemana": sum(f["total_faltas"] for f in faltas_lista),
            "alunosComFalta": len(faltas_lista),
            "totalInadimplentes": len(inadimplentes),
        },
        "periodo": {"inicio": inicio_semana, "fim": fim_semana},
    }

# ============================================
# INTEGRAÇÃO BANCO CORA
# ============================================

CORA_CLIENT_ID = os.getenv("CORA_CLIENT_ID", "")
CORA_CERT_B64 = os.getenv("CORA_CERTIFICATE_BASE64", "")
CORA_KEY_B64 = os.getenv("CORA_PRIVATE_KEY_BASE64", "")
CORA_ENV = os.getenv("CORA_ENVIRONMENT", "stage")

CORA_BASE_URLS = {
    "stage": "https://matls-clients.api.stage.cora.com.br",
    "production": "https://matls-clients.api.cora.com.br",
}

_cora_token_cache = {"token": None, "expires_at": 0}

async def cora_get_token() -> str:
    """Obtém access token da Cora via mTLS"""
    now = datetime.now().timestamp()
    if _cora_token_cache["token"] and _cora_token_cache["expires_at"] > now:
        return _cora_token_cache["token"]

    if not CORA_CLIENT_ID or not CORA_CERT_B64 or not CORA_KEY_B64:
        raise HTTPException(status_code=503, detail="Cora não configurada. Defina CORA_CLIENT_ID, CORA_CERTIFICATE_BASE64 e CORA_PRIVATE_KEY_BASE64")

    # Decodifica certificados de base64 para arquivos temporários
    cert_bytes = base64.b64decode(CORA_CERT_B64)
    key_bytes = base64.b64decode(CORA_KEY_B64)

    cert_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pem")
    key_file = tempfile.NamedTemporaryFile(delete=False, suffix=".key")
    cert_file.write(cert_bytes)
    cert_file.close()
    key_file.write(key_bytes)
    key_file.close()

    base_url = CORA_BASE_URLS.get(CORA_ENV, CORA_BASE_URLS["stage"])

    try:
        async with httpx.AsyncClient(cert=(cert_file.name, key_file.name), timeout=30.0) as client:
            resp = await client.post(
                f"{base_url}/token",
                data={"grant_type": "client_credentials", "client_id": CORA_CLIENT_ID},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"Erro auth Cora: {resp.text}")
            data = resp.json()
            _cora_token_cache["token"] = data["access_token"]
            _cora_token_cache["expires_at"] = now + data.get("expires_in", 86400) - 300
            return data["access_token"]
    finally:
        import os as _os
        _os.unlink(cert_file.name)
        _os.unlink(key_file.name)

async def cora_request(method: str, path: str, data: dict = None) -> dict:
    """Request autenticado à API Cora"""
    token = await cora_get_token()
    base_url = CORA_BASE_URLS.get(CORA_ENV, CORA_BASE_URLS["stage"])

    # Decodifica certificados novamente para mTLS
    cert_bytes = base64.b64decode(CORA_CERT_B64)
    key_bytes = base64.b64decode(CORA_KEY_B64)
    cert_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pem")
    key_file = tempfile.NamedTemporaryFile(delete=False, suffix=".key")
    cert_file.write(cert_bytes)
    cert_file.close()
    key_file.write(key_bytes)
    key_file.close()

    try:
        async with httpx.AsyncClient(cert=(cert_file.name, key_file.name), timeout=30.0) as client:
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            if method == "POST":
                headers["Idempotency-Key"] = str(uuid.uuid4())
                resp = await client.post(f"{base_url}{path}", headers=headers, json=data or {})
            elif method == "GET":
                resp = await client.get(f"{base_url}{path}", headers=headers, params=data)
            elif method == "DELETE":
                resp = await client.delete(f"{base_url}{path}", headers=headers)
            else:
                raise ValueError(f"Método {method} não suportado")

            if resp.status_code >= 400:
                return {"error": True, "status": resp.status_code, "detail": resp.text}
            try:
                return resp.json()
            except Exception:
                return {"raw": resp.text}
    finally:
        import os as _os
        _os.unlink(cert_file.name)
        _os.unlink(key_file.name)

class GerarBoletoRequest(BaseModel):
    aluno_id: str
    valor: Optional[int] = None  # em centavos, se não informado usa valor_mensalidade
    vencimento: Optional[str] = None  # YYYY-MM-DD, se não informado calcula

@app.get("/cora/status")
async def cora_status():
    """Verifica se a integração Cora está configurada"""
    configured = bool(CORA_CLIENT_ID and CORA_CERT_B64 and CORA_KEY_B64)
    if not configured:
        return {"configured": False, "environment": CORA_ENV}
    try:
        await cora_get_token()
        return {"configured": True, "authenticated": True, "environment": CORA_ENV}
    except Exception as e:
        return {"configured": True, "authenticated": False, "error": str(e), "environment": CORA_ENV}

@app.post("/cora/gerar-boleto")
async def cora_gerar_boleto(req: GerarBoletoRequest):
    """Gera boleto para um aluno via Cora"""
    # Busca dados do aluno
    aluno_result = supabase.table("alunos").select("*").eq("id", req.aluno_id).single().execute()
    if not aluno_result.data:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    aluno = aluno_result.data

    # Calcula valor (em centavos)
    valor = req.valor
    if not valor:
        if not aluno.get("valor_mensalidade"):
            raise HTTPException(status_code=400, detail="Aluno sem valor de mensalidade configurado")
        desconto = float(aluno.get("desconto", 0) or 0)
        valor_base = float(aluno["valor_mensalidade"])
        valor_final = valor_base * (1 - desconto / 100)
        valor = int(valor_final * 100)  # converte para centavos

    # Calcula vencimento
    vencimento = req.vencimento
    if not vencimento:
        dia = aluno.get("dia_vencimento", 10) or 10
        hoje = date.today()
        mes = hoje.month + 1 if hoje.day > dia else hoje.month
        ano = hoje.year + (1 if mes > 12 else 0)
        mes = mes if mes <= 12 else 1
        try:
            vencimento = date(ano, mes, min(dia, 28)).isoformat()
        except ValueError:
            vencimento = date(ano, mes, 28).isoformat()

    # Monta payload para Cora
    invoice_data = {
        "code": f"EDLNG-{aluno['id'][:8]}-{vencimento}",
        "customer": {
            "name": aluno.get("nome", ""),
            "email": aluno.get("email", "aluno@edulingua.com"),
            "document": {
                "identity": (aluno.get("cpf") or "").replace(".", "").replace("-", ""),
                "type": "CPF",
            },
            "address": {
                "street": aluno.get("rua", ""),
                "number": aluno.get("numero", "S/N"),
                "district": aluno.get("bairro", ""),
                "city": aluno.get("cidade", ""),
                "state": aluno.get("estado", ""),
                "zip_code": (aluno.get("cep") or "").replace("-", ""),
            },
        },
        "services": [{
            "name": "Mensalidade EduLingua",
            "description": f"Mensalidade escola de idiomas - Venc. {vencimento}",
            "amount": valor,
        }],
        "payment_terms": {
            "due_date": vencimento,
        },
        "payment_forms": ["BANK_SLIP", "PIX"],
    }

    # Notificação por email se disponível
    if aluno.get("email"):
        invoice_data["notification"] = {
            "name": aluno.get("nome", ""),
            "channels": [{
                "channel": "EMAIL",
                "contact": aluno["email"],
                "rules": ["BEFORE_DUE_DATE", "ON_DUE_DATE", "AFTER_DUE_DATE"],
            }],
        }

    result = await cora_request("POST", "/v2/invoices/", invoice_data)

    if result.get("error"):
        raise HTTPException(status_code=result.get("status", 500), detail=result.get("detail", "Erro ao gerar boleto"))

    # Salva cobrança no Supabase
    try:
        boleto_url = result.get("payment_options", {}).get("bank_slip", {}).get("url", "")
        boleto_barcode = result.get("payment_options", {}).get("bank_slip", {}).get("digitable", "")
        pix_emv = result.get("pix", {}).get("emv", "")

        supabase.table("cobrancas").insert({
            "aluno_id": req.aluno_id,
            "cora_invoice_id": result.get("id", ""),
            "valor": valor,
            "vencimento": vencimento,
            "status": "aberto",
            "boleto_url": boleto_url,
            "boleto_barcode": boleto_barcode,
            "pix_emv": pix_emv,
        }).execute()
    except Exception as e:
        print(f"Erro ao salvar cobrança: {e}")

    return {
        "success": True,
        "invoice_id": result.get("id"),
        "boleto_url": boleto_url,
        "boleto_barcode": boleto_barcode,
        "pix_emv": pix_emv,
        "valor": valor,
        "vencimento": vencimento,
    }

@app.post("/cora/gerar-mensalidades")
async def cora_gerar_mensalidades():
    """Gera boletos em lote para todos alunos ativos"""
    alunos_result = supabase.table("alunos").select("id, nome, valor_mensalidade, dia_vencimento").eq("status_pedagogico", "ativo").execute()
    alunos = [a for a in (alunos_result.data or []) if a.get("valor_mensalidade")]

    gerados = []
    erros = []
    for aluno in alunos:
        try:
            result = await cora_gerar_boleto(GerarBoletoRequest(aluno_id=aluno["id"]))
            gerados.append({"aluno_id": aluno["id"], "nome": aluno["nome"], "invoice_id": result.get("invoice_id")})
        except Exception as e:
            erros.append({"aluno_id": aluno["id"], "nome": aluno["nome"], "erro": str(e)})

    return {"gerados": len(gerados), "erros": len(erros), "detalhes_gerados": gerados, "detalhes_erros": erros}

@app.get("/cora/boletos")
async def cora_boletos(aluno_id: str = None, status: str = None):
    """Lista cobranças do Supabase"""
    query = supabase.table("cobrancas").select("*, aluno:alunos(id, nome, email, telefone)")
    if aluno_id:
        query = query.eq("aluno_id", aluno_id)
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).limit(100).execute()
    return {"boletos": result.data or []}

@app.post("/cora/webhook")
async def cora_webhook(data: dict = {}):
    """Webhook do Cora — atualiza status de cobranças"""
    print(f"Webhook Cora: {json.dumps(data, ensure_ascii=False, default=str)[:500]}")
    try:
        # Cora envia eventos de mudança de status
        invoice_id = data.get("id", data.get("invoice_id", data.get("data", {}).get("id", "")))
        new_status = data.get("status", data.get("state", data.get("data", {}).get("status", "")))

        if invoice_id:
            status_map = {"PAID": "pago", "CANCELLED": "cancelado", "OVERDUE": "vencido", "OPEN": "aberto"}
            mapped = status_map.get(new_status.upper() if new_status else "", None)

            if mapped:
                # Atualiza cobrança
                update_data = {"status": mapped}
                if mapped == "pago":
                    update_data["pago_em"] = datetime.now().isoformat()
                supabase.table("cobrancas").update(update_data).eq("cora_invoice_id", invoice_id).execute()

                # Se pago, atualiza status financeiro do aluno
                if mapped == "pago":
                    cobranca = supabase.table("cobrancas").select("aluno_id").eq("cora_invoice_id", invoice_id).execute()
                    if cobranca.data:
                        supabase.table("alunos").update({"status_financeiro": "em_dia"}).eq("id", cobranca.data[0]["aluno_id"]).execute()
    except Exception as e:
        print(f"Erro webhook Cora: {e}")

    return {"status": "ok"}

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# ============================================
# WHATSAPP VIA UAZAPI (v2 - uazapiGO)
# ============================================

UAZAPI_URL = os.getenv("UAZAPI_URL", "").rstrip("/")
UAZAPI_TOKEN = os.getenv("UAZAPI_TOKEN", "")

async def uazapi_request(method: str, path: str, data: dict = None) -> dict:
    """Helper para fazer requests à UAZAPI"""
    if not UAZAPI_URL or not UAZAPI_TOKEN:
        raise HTTPException(status_code=503, detail="UAZAPI não configurada. Defina UAZAPI_URL e UAZAPI_TOKEN no .env")

    url = f"{UAZAPI_URL}{path}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "token": UAZAPI_TOKEN,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            if method == "GET":
                resp = await client.get(url, headers=headers)
            elif method == "POST":
                resp = await client.post(url, headers=headers, json=data or {})
            else:
                raise ValueError(f"Método {method} não suportado")

            if resp.status_code >= 400:
                return {"error": True, "status": resp.status_code, "detail": resp.text}

            try:
                return resp.json()
            except Exception:
                return {"raw": resp.text}
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Não foi possível conectar à UAZAPI. Verifique a URL.")
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Timeout ao conectar à UAZAPI.")

class SendMessageRequest(BaseModel):
    phone: str
    message: str
    quotedMessageId: Optional[str] = None

class SendMediaRequest(BaseModel):
    phone: str
    base64: str
    filename: str = "file"
    caption: str = ""
    type: str = "image"  # image, audio, video, document

class DeleteMessageRequest(BaseModel):
    phone: str
    messageId: str

@app.get("/whatsapp/status")
async def whatsapp_status():
    """Verifica status da conexão WhatsApp"""
    result = await uazapi_request("GET", "/api/status")
    # Normaliza resposta - uazapiGO pode retornar formatos diferentes
    connected = False
    phone = None
    if isinstance(result, dict):
        connected = result.get("connected", False) or result.get("status") == "connected" or result.get("state") == "open"
        phone = result.get("phone", result.get("wid", result.get("jid", None)))
    return {"connected": connected, "phone": phone, "raw": result}

@app.get("/whatsapp/qrcode")
async def whatsapp_qrcode():
    """Obtém QR code para conectar o WhatsApp"""
    result = await uazapi_request("GET", "/api/qrcode")
    return result

@app.get("/whatsapp/chats")
async def whatsapp_chats():
    """Lista conversas do WhatsApp, enriquecidas com dados de alunos"""
    result = await uazapi_request("GET", "/api/chats")

    chats = result if isinstance(result, list) else result.get("chats", result.get("data", []))

    # Busca todos os alunos para cruzar por telefone
    alunos_result = supabase.table("alunos").select("id, nome, telefone, email, status_pedagogico").execute()
    alunos_by_phone = {}
    for aluno in (alunos_result.data or []):
        if aluno.get("telefone"):
            # Normaliza telefone: remove tudo que não é dígito
            phone_clean = ''.join(c for c in aluno["telefone"] if c.isdigit())
            alunos_by_phone[phone_clean] = aluno
            # Também mapeia sem código do país (últimos 10-11 dígitos)
            if len(phone_clean) > 10:
                alunos_by_phone[phone_clean[-11:]] = aluno
                alunos_by_phone[phone_clean[-10:]] = aluno

    # Enriquece chats com dados de alunos
    enriched = []
    for chat in (chats if isinstance(chats, list) else []):
        chat_phone = chat.get("id", chat.get("jid", chat.get("phone", "")))
        phone_clean = ''.join(c for c in str(chat_phone) if c.isdigit())

        aluno = alunos_by_phone.get(phone_clean)
        if not aluno and len(phone_clean) > 10:
            aluno = alunos_by_phone.get(phone_clean[-11:]) or alunos_by_phone.get(phone_clean[-10:])

        enriched.append({
            "phone": phone_clean,
            "name": chat.get("name", chat.get("pushName", phone_clean)),
            "lastMessage": chat.get("lastMessage", chat.get("last_message", {}).get("body", "")),
            "timestamp": chat.get("timestamp", chat.get("t", "")),
            "unread": chat.get("unreadCount", chat.get("unread", 0)),
            "isGroup": chat.get("isGroup", False),
            "aluno": aluno,
        })

    # Ordena por timestamp mais recente
    enriched.sort(key=lambda x: x.get("timestamp", 0), reverse=True)

    return {"chats": enriched}

@app.get("/whatsapp/messages/{phone}")
async def whatsapp_messages(phone: str, limit: int = 50):
    """Obtém histórico de mensagens de um contato"""
    # Tenta diferentes formatos de endpoint da uazapiGO
    result = await uazapi_request("POST", "/api/messages", {
        "phone": phone,
        "limit": limit
    })

    messages = result if isinstance(result, list) else result.get("messages", result.get("data", []))

    formatted = []
    for msg in (messages if isinstance(messages, list) else []):
        msg_type = msg.get("type", msg.get("messageType", "text"))
        body = msg.get("body", msg.get("message", msg.get("text", "")))

        # Extrai dados de mídia
        media_url = msg.get("mediaUrl", msg.get("media", msg.get("url", "")))
        mimetype = msg.get("mimetype", msg.get("mimeType", ""))
        filename = msg.get("filename", msg.get("fileName", ""))

        # Extrai quoted message (reply)
        quoted = msg.get("quotedMsg", msg.get("contextInfo", {}).get("quotedMessage", None))
        quoted_data = None
        if quoted:
            quoted_data = {
                "body": quoted.get("body", quoted.get("conversation", quoted.get("text", ""))),
                "fromMe": quoted.get("fromMe", False),
            }

        # Status de entrega
        msg_status = msg.get("ack", msg.get("status", None))
        # 0=pending, 1=sent, 2=delivered, 3=read
        status_map = {0: "pending", 1: "sent", 2: "delivered", 3: "read", "sent": "sent", "delivered": "delivered", "read": "read"}
        status_str = status_map.get(msg_status, "sent") if msg_status is not None else None

        # Sender para grupos
        sender = msg.get("author", msg.get("participant", msg.get("sender", "")))
        sender_name = msg.get("pushName", msg.get("senderName", ""))

        formatted.append({
            "id": msg.get("id", msg.get("key", {}).get("id", "")),
            "body": body,
            "fromMe": msg.get("fromMe", msg.get("key", {}).get("fromMe", False)),
            "timestamp": msg.get("timestamp", msg.get("t", "")),
            "type": msg_type,
            "mediaUrl": media_url,
            "mimetype": mimetype,
            "filename": filename,
            "status": status_str,
            "sender": sender,
            "senderName": sender_name,
            "quoted": quoted_data,
        })

    return {"messages": formatted}

@app.post("/whatsapp/send")
async def whatsapp_send(req: SendMessageRequest):
    """Envia mensagem de texto via WhatsApp (com suporte a reply)"""
    payload = {
        "phone": req.phone,
        "message": req.message
    }
    if req.quotedMessageId:
        payload["quotedMessageId"] = req.quotedMessageId
    result = await uazapi_request("POST", "/api/sendText", payload)
    return {"success": True, "result": result}

@app.post("/whatsapp/send-media")
async def whatsapp_send_media(req: SendMediaRequest):
    """Envia mídia via WhatsApp (imagem, áudio, vídeo, documento)"""
    payload = {
        "phone": req.phone,
        "base64": req.base64,
        "filename": req.filename,
        "caption": req.caption,
    }
    # uazapiGO pode usar diferentes endpoints por tipo
    endpoint_map = {
        "image": "/api/sendFile",
        "audio": "/api/sendFile",
        "video": "/api/sendFile",
        "document": "/api/sendFile",
    }
    endpoint = endpoint_map.get(req.type, "/api/sendFile")
    result = await uazapi_request("POST", endpoint, payload)
    return {"success": True, "result": result}

@app.delete("/whatsapp/message")
async def whatsapp_delete_message(req: DeleteMessageRequest):
    """Deleta mensagem do WhatsApp"""
    result = await uazapi_request("POST", "/api/deleteMessage", {
        "phone": req.phone,
        "messageId": req.messageId,
    })
    return {"success": True, "result": result}

@app.get("/whatsapp/presence/{phone}")
async def whatsapp_presence(phone: str):
    """Verifica presença (online/offline) de um contato"""
    result = await uazapi_request("GET", f"/api/presence/{phone}")
    online = False
    last_seen = None
    if isinstance(result, dict):
        online = result.get("online", result.get("available", False))
        last_seen = result.get("lastSeen", result.get("last_seen", None))
    return {"online": online, "lastSeen": last_seen}

@app.post("/whatsapp/webhook")
async def whatsapp_webhook(data: dict = {}):
    """Receptor de webhooks da UAZAPI (mensagens recebidas)"""
    # Log para debug
    print(f"Webhook UAZAPI: {json.dumps(data, ensure_ascii=False, default=str)[:500]}")

    # Tenta salvar mensagem recebida no Supabase
    try:
        event = data.get("event", "")
        msg_data = data.get("data", data)

        if event in ("message", "messages.upsert", ""):
            phone = msg_data.get("from", msg_data.get("phone", ""))
            body = msg_data.get("body", msg_data.get("message", msg_data.get("text", "")))

            if phone and body:
                phone_clean = ''.join(c for c in str(phone) if c.isdigit())

                # Tenta vincular a um aluno
                aluno_id = None
                alunos = supabase.table("alunos").select("id, telefone").execute()
                for aluno in (alunos.data or []):
                    if aluno.get("telefone"):
                        aluno_phone = ''.join(c for c in aluno["telefone"] if c.isdigit())
                        if phone_clean.endswith(aluno_phone[-10:]) or aluno_phone.endswith(phone_clean[-10:]):
                            aluno_id = aluno["id"]
                            break

                supabase.table("whatsapp_mensagens").insert({
                    "phone": phone_clean,
                    "message": body[:2000],
                    "direction": "incoming",
                    "aluno_id": aluno_id,
                }).execute()
    except Exception as e:
        print(f"Erro ao salvar webhook: {e}")

    return {"status": "ok"}

# ============================================
# EXECUÇÃO
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
