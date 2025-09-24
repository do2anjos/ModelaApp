const express = require('express');
const path = require('path');

const app = express();

// Define a porta usando a variável de ambiente da Render (process.env.PORT)
// ou usa a porta 3000 como padrão se estiver rodando no seu computador.
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos da pasta 'public'.
// Isso permite que seu site carregue arquivos como HTML, CSS, imagens, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Inicia o servidor e o faz "escutar" por requisições na porta definida.
app.listen(PORT, () => {
  // Mensagem útil para ver qual porta está sendo usada nos logs da Render.
  console.log(`Servidor rodando na porta ${PORT}`);

  // Mensagem com o link público para facilitar o acesso quando estiver online.
  console.log(`Acesse publicamente em: https://modelaapp.onrender.com`);
});