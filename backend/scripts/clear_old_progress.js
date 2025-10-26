const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Limpando dados antigos de progresso...\n');

// Remove todos os dados de progresso
db.run('DELETE FROM user_progress', function(err) {
    if (err) {
        console.error('❌ Erro ao limpar progresso:', err);
        return;
    }
    
    console.log(`✅ Removidos ${this.changes} registros de progresso`);
    
    // Lista usuários após limpeza
    db.all('SELECT id, nome, email FROM users', [], (err, users) => {
        if (err) {
            console.error('Erro ao listar usuários:', err);
            return;
        }
        
        console.log('\n👥 USUÁRIOS APÓS LIMPEZA:');
        users.forEach(user => {
            console.log(`  ID: ${user.id} | Nome: ${user.nome} | Email: ${user.email}`);
        });
        
        db.close();
        console.log('\n✅ Limpeza concluída! Todos os usuários agora começam do zero.');
    });
});
