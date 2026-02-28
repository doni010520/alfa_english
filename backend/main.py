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
from datetime import datetime, date

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

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

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

from datetime import timedelta

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
# IMPLEMENTAÇÃO DAS FERRAMENTAS
# ============================================

def tool_consultar_turmas(idioma: str = None, professor_nome: str = None, nome_turma: str = None) -> List[Dict]:
    """Consulta turmas com filtros"""
    query = supabase.table("turmas").select("*, professor:usuarios!turmas_professor_id_fkey(id, nome, email)")
    
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

def tool_consultar_alunos(nome: str = None, status_financeiro: str = None, status_pedagogico: str = None, usa_transporte: bool = None) -> List[Dict]:
    """Consulta alunos com filtros"""
    query = supabase.table("alunos").select("*")
    
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

def tool_consultar_alunos_turma(turma_nome: str = None, turma_id: str = None) -> Dict:
    """Lista alunos de uma turma"""
    # Encontra a turma
    if turma_id:
        turma_result = supabase.table("turmas").select("*").eq("id", turma_id).single().execute()
    elif turma_nome:
        turma_result = supabase.table("turmas").select("*").ilike("nome", f"%{turma_nome}%").execute()
        if turma_result.data:
            turma_result.data = turma_result.data[0]
        else:
            return {"erro": f"Turma '{turma_nome}' não encontrada"}
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

def tool_consultar_turmas_aluno(aluno_nome: str) -> Dict:
    """Lista turmas de um aluno"""
    # Encontra o aluno
    aluno_result = supabase.table("alunos").select("*").ilike("nome", f"%{aluno_nome}%").execute()
    
    if not aluno_result.data:
        return {"erro": f"Aluno '{aluno_nome}' não encontrado"}
    
    aluno = aluno_result.data[0]
    
    # Busca matrículas com dados da turma
    matriculas = supabase.table("matriculas").select("*, turma:turmas(*, professor:usuarios!turmas_professor_id_fkey(nome))").eq("aluno_id", aluno["id"]).eq("status", "ativo").execute()
    
    turmas = [m["turma"] for m in (matriculas.data or []) if m.get("turma")]
    
    return {
        "aluno": aluno,
        "total_turmas": len(turmas),
        "turmas": turmas
    }

def tool_consultar_faltas(aluno_nome: str = None, turma_nome: str = None, data_inicio: str = None, data_fim: str = None, apenas_faltas: bool = True) -> List[Dict]:
    """Consulta presenças/faltas"""
    # Se não informar datas, usa a semana atual
    if not data_inicio:
        today = datetime.now()
        data_inicio = (today - timedelta(days=today.weekday())).strftime("%Y-%m-%d")
    if not data_fim:
        today = datetime.now()
        data_fim = (today + timedelta(days=6-today.weekday())).strftime("%Y-%m-%d")
    
    # Busca aulas no período
    aulas_query = supabase.table("aulas").select("id, data, turma:turmas(id, nome)").gte("data", data_inicio).lte("data", data_fim)
    
    if turma_nome:
        # Primeiro encontra a turma
        turma = supabase.table("turmas").select("id").ilike("nome", f"%{turma_nome}%").execute()
        if turma.data:
            aulas_query = aulas_query.eq("turma_id", turma.data[0]["id"])
    
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

def tool_consultar_aulas(turma_nome: str = None, data_inicio: str = None, data_fim: str = None) -> List[Dict]:
    """Consulta aulas realizadas"""
    query = supabase.table("aulas").select("*, turma:turmas(nome, idioma)")
    
    if turma_nome:
        turma = supabase.table("turmas").select("id").ilike("nome", f"%{turma_nome}%").execute()
        if turma.data:
            query = query.eq("turma_id", turma.data[0]["id"])
    
    if data_inicio:
        query = query.gte("data", data_inicio)
    if data_fim:
        query = query.lte("data", data_fim)
    
    result = query.order("data", desc=True).limit(50).execute()
    return result.data if result.data else []

def tool_consultar_professores(nome: str = None) -> List[Dict]:
    """Lista professores com suas turmas"""
    query = supabase.table("usuarios").select("*").eq("perfil", "professor").eq("ativo", True)
    
    if nome:
        query = query.ilike("nome", f"%{nome}%")
    
    professores = query.execute()
    resultado = []
    
    for prof in (professores.data or []):
        turmas = supabase.table("turmas").select("id, nome, idioma, horario").eq("professor_id", prof["id"]).execute()
        prof["turmas"] = turmas.data or []
        prof["total_turmas"] = len(prof["turmas"])
        resultado.append(prof)
    
    return resultado

def tool_estatisticas_gerais() -> Dict:
    """Retorna estatísticas gerais"""
    stats = {}
    
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

def tool_aniversariantes(mes: int = None) -> List[Dict]:
    """Lista aniversariantes do mês"""
    if mes is None:
        mes = datetime.now().month
    
    result = supabase.table("alunos").select("id, nome, aniversario_dia, aniversario_mes, telefone").eq("aniversario_mes", mes).eq("status_pedagogico", "ativo").order("aniversario_dia").execute()
    
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

SYSTEM_PROMPT = f"""Você é o assistente virtual da EduLingua, uma escola de idiomas. Seu papel é ajudar os administradores a consultar informações sobre turmas, alunos, professores, presenças e finanças.

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
        # Monta histórico de mensagens
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
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
                
                print(f"Executando: {function_name}({function_args})")
                
                # Executa a função
                if function_name in TOOL_FUNCTIONS:
                    try:
                        result = TOOL_FUNCTIONS[function_name](**function_args)
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

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# ============================================
# EXECUÇÃO
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
