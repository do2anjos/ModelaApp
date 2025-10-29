const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../db/modela_users.db');
const db = new sqlite3.Database(dbPath);

// Pega o ID do usuário como argumento da linha de comando
const userId = process.argv[2] || '9';

console.log(`🔍 Verificando exercícios concluídos do usuário ID: ${userId}\n`);

// Busca progresso das aulas do usuário
db.all(`
    SELECT 
        lesson_id,
        lesson_title,
        video_completed,
        exercise_completed,
        practical_completed,
        completed
    FROM user_progress 
    WHERE user_id = ?
    ORDER BY lesson_id
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let exercisesCount = 0;
    
    rows.forEach(row => {
        const exerciseCompleted = row.exercise_completed === 1 || row.exercise_completed === true;
        const status = exerciseCompleted ? '✅' : '⏳';
        
        console.log(`${status} ${row.lesson_title}`);
        console.log(`   exercise_completed: ${row.exercise_completed} (tipo: ${typeof row.exercise_completed})`);
        console.log(`   video_completed: ${row.video_completed}`);
        console.log(`   practical_completed: ${row.practical_completed}`);
        console.log(`   completed: ${row.completed}`);
        console.log('');
        
        if (exerciseCompleted) {
            exercisesCount++;
        }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📈 TOTAL DE EXERCÍCIOS CONCLUÍDOS: ${exercisesCount}`);
    
    db.close();
});
