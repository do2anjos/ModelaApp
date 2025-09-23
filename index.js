const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});