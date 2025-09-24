const express = require('express');
const path = require('path');

const app = express();
// A linha abaixo é a principal mudança.
// Ela usa a porta da Render (process.env.PORT) ou a 3000 se não existir.
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  // Alterei a mensagem para refletir a porta correta.
  console.log(`Servidor rodando na porta ${PORT}`);
});