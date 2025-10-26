const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
    process.exit(1);
  }
});

// Função para gerar username: primeiro.ultimonome
function generateUsername(nome) {
  const words = nome.trim().toLowerCase().split(' ').filter(w => w.length > 0);
  if (words.length === 0) return 'usuario';
  if (words.length === 1) return words[0];
  
  const primeiro = words[0];
  const ultimo = words[words.length - 1];
  
  return `${primeiro}.${ultimo}`;
}

console.log('Atualizando usernames de todos os usuários...\n');

db.all('SELECT id, nome, username FROM users', [], (err, rows) => {
  if (err) {
    console.error('Erro ao buscar usuários:', err.message);
    process.exit(1);
  }
  
  let updated = 0;
  let skipped = 0;
  
  rows.forEach((user) => {
    const newUsername = generateUsername(user.nome);
    
    if (user.username === newUsername) {
      console.log(`⏭️  ID ${user.id}: ${user.nome} → username já correto: ${newUsername}`);
      skipped++;
    } else {
      db.run('UPDATE users SET username = ? WHERE id = ?', [newUsername, user.id], (err2) => {
        if (err2) {
          console.error(`❌ Erro ao atualizar ID ${user.id}:`, err2.message);
        } else {
          console.log(`✅ ID ${user.id}: ${user.nome} → username: ${newUsername}`);
          updated++;
        }
      });
    }
  });
  
  setTimeout(() => {
    console.log(`\n📊 Resumo:`);
    console.log(`   Atualizados: ${updated}`);
    console.log(`   Já corretos: ${skipped}`);
    db.close();
  }, 500);
});

