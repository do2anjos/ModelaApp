const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
    process.exit(1);
  }
});

db.run('DELETE FROM users', [], function(err) {
  if (err) {
    console.error('Erro ao limpar usuários:', err.message);
    process.exit(1);
  }
  console.log(`Usuários removidos: ${this.changes}`);
  db.close();
});


