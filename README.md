# 📚 EduLingua - Sistema de Gestão para Escola de Idiomas

Sistema completo de gestão escolar com **Assistente IA integrado** para consultas em linguagem natural.

## ✨ Funcionalidades

### 🤖 Assistente IA (GPT-4.1-mini)
- Chat inteligente com Function Calling
- Consultas em linguagem natural sobre turmas, alunos, professores
- Verificação de faltas e presenças
- Lista de aniversariantes do mês
- Estatísticas gerais da escola
- Identificação de alunos inadimplentes

### 👥 Gestão de Alunos
- Cadastro completo (CPF, RG, data nascimento, contato)
- Endereço completo com CEP
- Dados do responsável (para menores)
- Status pedagógico: ativo, trancado, concluído
- Status financeiro: em dia, pendente, inadimplente
- Controle de mensalidade, vencimento e descontos
- Controle de uso de transporte escolar

### 📖 Gestão de Turmas
- CRUD completo de turmas
- Idioma, nível, professor responsável
- Horários e dias da semana
- Livro didático utilizado

### 📝 Aulas e Presenças
- Registro de aulas por turma
- Conteúdo e unidade do livro trabalhada
- Controle de presença por aluno
- Observações por presença

### 🔐 Autenticação
- Login com email e senha
- Perfis: Admin e Professor
- Controle de acesso por perfil

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | FastAPI + Python 3.11 |
| **IA** | OpenAI GPT-4.1-mini (Function Calling) |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Deploy** | Docker + Nginx |

---

## 📁 Estrutura do Projeto

```
alfa_english/
├── src/
│   ├── App.jsx              # Aplicação React completa
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos Tailwind
├── backend/
│   ├── main.py              # API FastAPI + OpenAI
│   ├── requirements.txt     # Dependências Python
│   └── Dockerfile           # Build do backend
├── index.html               # HTML principal
├── package.json             # Dependências Node
├── vite.config.js           # Config Vite
├── tailwind.config.js       # Config Tailwind
├── Dockerfile               # Build do frontend
├── nginx.conf               # Config Nginx
└── supabase-setup.sql       # Schema do banco
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Usuários do sistema (admin/professor) |
| `turmas` | Turmas com idioma, nível, professor, horários |
| `alunos` | Dados completos dos alunos |
| `matriculas` | Relacionamento N:N entre alunos e turmas |
| `aulas` | Registro de aulas realizadas |
| `presencas` | Controle de presença por aula |

---

## 🤖 Ferramentas da IA

O assistente possui 9 ferramentas disponíveis:

| Ferramenta | Descrição |
|------------|-----------|
| `consultar_turmas` | Busca turmas por idioma ou professor |
| `consultar_alunos` | Busca alunos por nome, status ou cidade |
| `consultar_alunos_turma` | Lista alunos de uma turma específica |
| `consultar_turmas_aluno` | Lista turmas de um aluno |
| `consultar_faltas` | Verifica faltas em período |
| `consultar_aulas` | Lista aulas realizadas |
| `consultar_professores` | Lista professores e suas turmas |
| `estatisticas_gerais` | Dashboard com métricas da escola |
| `aniversariantes` | Lista aniversariantes do mês |

**Exemplos de perguntas:**
- "Quais turmas de inglês existem?"
- "Quem são os alunos inadimplentes?"
- "Quem faltou essa semana?"
- "Quantos alunos estão matriculados?"
- "Quem faz aniversário em março?"

---

## 🚀 Deploy

### 1️⃣ Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o `supabase-setup.sql` no SQL Editor
3. Crie a função de login:

```sql
CREATE OR REPLACE FUNCTION verificar_login(p_email TEXT, p_senha TEXT)
RETURNS TABLE(id UUID, email VARCHAR, nome VARCHAR, perfil VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.nome, u.perfil
    FROM usuarios u
    WHERE u.email = p_email AND u.senha = p_senha AND u.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. Crie a função para queries da IA:

```sql
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query_text || ') t' INTO result;
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2️⃣ Variáveis de Ambiente

**Frontend (.env.local):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_ASSISTANT_API_URL=http://localhost:8000
```

**Backend (.env):**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...
OPENAI_API_KEY=sk-...
```

### 3️⃣ Rodar Localmente

**Frontend:**
```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API em http://localhost:8000
```

### 4️⃣ Deploy com Docker

**Frontend (Easypanel/Coolify):**
- Dockerfile: `./Dockerfile`
- Port: `80`
- Build Args:
  ```
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
  VITE_ASSISTANT_API_URL=https://api.seudominio.com
  ```

**Backend:**
- Dockerfile: `./backend/Dockerfile`
- Port: `8000`
- Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `OPENAI_API_KEY`

---

## 📋 Requisitos

- Node.js 18+
- Python 3.11+
- Conta Supabase
- Chave API OpenAI

---

## 📝 Licença

MIT License
