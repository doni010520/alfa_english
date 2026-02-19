# 📚 EduLingua - Sistema de Gestão de Turmas

Sistema simples e funcional para gerenciamento de turmas de escola de idiomas.

## ✨ Funcionalidades

- **Dashboard** com estatísticas gerais
- **Gestão de Turmas**: CRUD completo com idioma, nível, professor e horários
- **Gestão de Alunos**: Cadastro com email, telefone e data de nascimento
- **Matrículas**: Associar alunos a turmas facilmente
- **Busca**: Filtrar turmas e alunos rapidamente

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Deploy**: Docker + Nginx

---

## 🚀 Deploy Rápido

### 1️⃣ Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e execute o conteúdo do arquivo `supabase-setup.sql`
3. Copie a **URL** e **Anon Key** em **Settings > API**

### 2️⃣ Subir para o GitHub

```bash
# No terminal, dentro da pasta do projeto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/escola-idiomas.git
git push -u origin main
```

### 3️⃣ Deploy no Easypanel

1. No Easypanel, crie um novo **App**
2. Selecione **GitHub** como source
3. Conecte o repositório `escola-idiomas`
4. Configure o **Build**:
   - **Dockerfile**: `./Dockerfile`
   - **Build Args** (muito importante!):
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
     ```
5. Configure o **Port**: `80`
6. Clique em **Deploy**

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar arquivo .env.local
echo "VITE_SUPABASE_URL=sua_url_aqui" > .env.local
echo "VITE_SUPABASE_ANON_KEY=sua_chave_aqui" >> .env.local

# Rodar em modo desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

---

## 📁 Estrutura do Projeto

```
escola-idiomas/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Entry point
│   └── index.css        # Estilos Tailwind
├── index.html           # HTML principal
├── package.json         # Dependências
├── vite.config.js       # Config Vite
├── tailwind.config.js   # Config Tailwind
├── Dockerfile           # Build Docker
├── nginx.conf           # Config Nginx
└── supabase-setup.sql   # Schema do banco
```

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase |

---

## 📝 Licença

MIT License - Use como quiser!
