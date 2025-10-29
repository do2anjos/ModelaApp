const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../db/modela_users.db');
const db = new sqlite3.Database(dbPath);

// Pega o ID do usuário como argumento da linha de comando
const userId = process.argv[2];

if (!userId) {
    console.log('❌ Uso: node check_user_progress.js <user_id>');
    console.log('📋 Usuários disponíveis:');
    
    db.all('SELECT id, nome, username FROM users ORDER BY id', [], (err, rows) => {
        if (err) {
            console.error('❌ Erro ao buscar usuários:', err);
            db.close();
            return;
        }
        
        rows.forEach(user => {
            console.log(`  ID: ${user.id} - ${user.nome} (${user.username})`);
        });
        
        db.close();
    });
    return;
}

console.log(`🔍 Verificando progresso do usuário ID: ${userId}\n`);

// Busca progresso das aulas do usuário
db.all(`
    SELECT 
        lesson_title,
        video_completed,
        exercise_completed,
        practical_completed,
        completed,
        started_at,
        completed_at
    FROM user_progress 
    WHERE user_id = ?
    ORDER BY lesson_title
`, [userId], (err, rows) => {
    if (err) {
        console.error('❌ Erro ao buscar progresso:', err);
        db.close();
        return;
    }

    if (rows.length === 0) {
        console.log('⚠️ Nenhum progresso encontrado para este usuário');
        db.close();
        return;
    }

    console.log(`📊 Progresso encontrado (${rows.length} aulas):\n`);
    
    const lessonsOrder = [
        'Introdução à UML - Unified Modeling Language',
        'O que é um Diagrama de Classes',
        'Diagrama de casos de uso',
        'Diagrama de sequência',
        'Diagrama de atividades',
        'Diagrama de componentes',
        'Diagrama de implantação',
        'Diagrama de estados',
        'Diagrama de pacotes',
        'Boas práticas em UML'
    ];
    
    let completedCount = 0;
    let nextLesson = null;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const lessonTitle of lessonsOrder) {
        const progress = rows.find(r => r.lesson_title === lessonTitle);
        const isCompleted = progress && progress.completed;
        
        if (isCompleted) {
            completedCount++;
            console.log(`✅ ${lessonTitle} - CONCLUÍDA`);
        } else {
            if (!nextLesson) {
                nextLesson = lessonTitle;
            }
            console.log(`⏳ ${lessonTitle} - PENDENTE`);
        }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const totalLessons = lessonsOrder.length;
    const progressPercentage = Math.round((completedCount / totalLessons) * 100);
    
    console.log('📈 RESUMO:');
    console.log(`   Aulas concluídas: ${completedCount}/${totalLessons}`);
    console.log(`   Progresso: ${progressPercentage}%`);
    console.log(`   Próxima aula: ${nextLesson || 'Todas concluídas'}`);
    
    db.close();
});
