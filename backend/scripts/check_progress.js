const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando dados de progresso no banco...\n');

// Lista todos os usuários
db.all('SELECT id, nome, email, username FROM users', [], (err, users) => {
    if (err) {
        console.error('Erro ao buscar usuários:', err);
        return;
    }
    
    console.log('👥 USUÁRIOS CADASTRADOS:');
    users.forEach(user => {
        console.log(`  ID: ${user.id} | Nome: ${user.nome} | Email: ${user.email} | Username: ${user.username}`);
    });
    
    console.log('\n📊 PROGRESSO POR USUÁRIO:');
    
    // Para cada usuário, mostra seu progresso
    users.forEach(user => {
        db.all(`
            SELECT 
                module_id,
                lesson_id,
                lesson_title,
                video_completed,
                exercise_completed,
                practical_completed,
                lesson_completed
            FROM user_progress 
            WHERE user_id = ?
            ORDER BY module_id, lesson_id
        `, [user.id], (err, progress) => {
            if (err) {
                console.error(`Erro ao buscar progresso do usuário ${user.id}:`, err);
                return;
            }
            
            console.log(`\n👤 USUÁRIO ${user.id} (${user.nome}):`);
            if (progress.length === 0) {
                console.log('  📝 Nenhum progresso registrado');
            } else {
                progress.forEach(p => {
                    const status = [];
                    if (p.video_completed) status.push('📹');
                    if (p.exercise_completed) status.push('📝');
                    if (p.practical_completed) status.push('🔧');
                    if (p.lesson_completed) status.push('✅');
                    
                    console.log(`  Módulo ${p.module_id}, Aula ${p.lesson_id}: ${p.lesson_title} ${status.join(' ')}`);
                });
            }
        });
    });
    
    // Aguarda um pouco para mostrar todos os resultados
    setTimeout(() => {
        db.close();
        console.log('\n✅ Verificação concluída!');
    }, 1000);
});
