# Guia de Deploy - Modela App

## 🚀 Como hospedar no Render

### Pré-requisitos
- Conta no GitHub
- Conta no Turso (https://turso.tech)
- Conta no Render (https://render.com)

### 1. Configurar o Turso

1. Acesse https://turso.tech e faça login
2. Crie um novo database
3. Anote a `TURSO_DATABASE_URL` (ex: `libsql://seu-database.turso.io`)
4. Gere um token de autenticação e anote o `TURSO_AUTH_TOKEN`

### 2. Subir código para o GitHub

```bash
git add .
git commit -m "Configuração para deploy no Render"
git push origin main
```

### 3. Configurar Web Service no Render

1. Acesse https://render.com e faça login
2. Clique em **New** → **Web Service**
3. Conecte seu repositório do GitHub
4. Configure:
   - **Name**: modela-app (ou outro nome)
   - **Region**: US East (ou mais próximo)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: (deixe automático - usa `npm install`)
   - **Start Command**: `npm start`

### 4. Configurar Variáveis de Ambiente

Na seção **Environment** do seu serviço no Render, adicione:

```
NODE_ENV=production
TURSO_DATABASE_URL=libsql://seu-database.turso.io
TURSO_AUTH_TOKEN=seu-token-aqui
ALLOWED_ORIGINS=https://modelaapp.onrender.com
```

**⚠️ IMPORTANTE**: Nunca commite suas credenciais no repositório!

### 5. Deploy

1. Clique em **Create Web Service**
2. Aguarde o build e deploy (3-5 minutos)
3. Quando aparecer "Live", clique na URL do serviço
4. O banco de dados Turso será inicializado automaticamente na primeira execução

### 6. Verificação pós-deploy

1. Health check:
```
https://modelaapp.onrender.com/health
```
Deve retornar `{"ok":true,"db":"turso"}`

2. Cadastro: testar `cadastro.html` e verificar logs do serviço

---

## 💻 Desenvolvimento Local

### Executar localmente

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (com auto-reload)
npm run dev

# Ou rodar em modo produção local
npm start
```

O servidor vai iniciar em `http://localhost:3001`.
Por padrão em desenvolvimento usa SQLite local (sem `TURSO_*`).

### Como funciona

- **Local**: Sem variáveis `TURSO_*`, usa SQLite local
- **Produção (Render)**: Com variáveis `TURSO_*`, usa Turso remoto

### CORS

O servidor habilita CORS amplo com:
```
credentials: true
methods: GET, POST, PUT, DELETE, OPTIONS
allowedHeaders: Content-Type, Authorization, X-Request-Id
```

---

## 📝 Publicar Alterações

Sempre que fizer mudanças e quiser publicar:

```bash
git add .
git commit -m "Descrição das alterações"
git push origin main
```

O Render detecta automaticamente o push e faz deploy automático.

---

## 🔧 Troubleshooting

### Erro de conexão com Turso
- Verifique se as variáveis `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` estão configuradas corretamente
- Gere um novo token no Turso se necessário

### Banco não está sendo criado
- Acesse os logs do Render para ver erros
- Verifique se as tabelas foram criadas no Turso Dashboard

### Build falhou no Render
- Verifique se o `package.json` está commitado
- Verifique os logs de build no Render

---

## 📚 Recursos

- [Documentação do Turso](https://docs.turso.tech)
- [Documentação do Render](https://render.com/docs)
- [Node.js no Render](https://render.com/docs/deploy-node-express-app)

