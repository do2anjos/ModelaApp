# Configuração das Variáveis de Ambiente no Render

## Instruções para configurar o Turso no Render

Após o push para o GitHub, o Render vai fazer o deploy automaticamente. Você precisa adicionar as variáveis de ambiente no painel do Render.

### Passos:

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Selecione seu serviço "ModelaApp"
3. Vá em **Environment** (no menu lateral)
4. Adicione as seguintes variáveis de ambiente clicando em **"Add Environment Variable"**:

### Variáveis necessárias:

```
TURSO_DATABASE_URL
libsql://modelaapp-do2anjos.aws-us-east-1.turso.io
```

```
TURSO_AUTH_TOKEN
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjE3MjYwOTQsImlkIjoiMmQ5ZTg0ZmUtZDhjMi00ZWQ3LTk1YmItYjY2NWEzZTBlMjRkIiwicmlkIjoiNWE1OTdkN2UtMGIyZS00YzI3LWJkY2YtNWE5OWQyMGE1MGM5In0.xaik2ixP_vrMcTGwT8h7G3jMOEigVAgdjWXSgOZz-AEXV4pZlaVuJTz1CT-ex-4FJ6HDrIbjMfONNx4Y7lf5AA
```

```
NODE_ENV
production
```

```
ALLOWED_ORIGINS
https://modelaapp.onrender.com
```

### Depois de adicionar as variáveis:

1. Clique em **"Save Changes"**
2. O Render vai reiniciar o serviço automaticamente
3. Aguarde o deploy completar (geralmente 2-3 minutos)

### Verificar se está funcionando:

Após o deploy, teste acessando:
```
https://modelaapp.onrender.com/health
```

Você deve ver:
```json
{"ok":true,"db":"turso","time":...,"status":"healthy"}
```

Se aparecer `"db":"turso"` significa que está conectado ao banco remoto do Turso! ✅

### Importante:

- Não adicione o arquivo `.env` ao Git (ele já está no .gitignore)
- As variáveis devem ser configuradas diretamente no painel do Render
- O `dotenv` foi adicionado ao `package.json` e ao código para carregar essas variáveis automaticamente
