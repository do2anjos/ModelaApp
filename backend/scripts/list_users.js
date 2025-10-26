const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error('Erro ao conectar ao SQLite:', err.message);
  }
});

db.all('SELECT id, nome, email, matricula, telefone, username FROM users', [], (err, rows) => {
  if (err) {
    console.error('Erro ao buscar usuários:', err.message);
    process.exit(1);
  }
  if (!rows.length) {
    console.log('Nenhum usuário cadastrado.');
  } else {
    console.log('Usuários cadastrados:');
    rows.forEach((row) => {
      console.log(row);
    });
  }
  db.close();
});
