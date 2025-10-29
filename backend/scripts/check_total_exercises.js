const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../db/modela_users.db');
const db = new sqlite3.Database(dbPath);

// Pega o ID do usuário como argumento da linha de comando
const userId = process.argv[2] || '9';

console.log(`🔍 Verificando total de exercícios concluídos do usuário ID: ${userId}\n`);

// Busca todas as tentativas de exercícios
db.all(`
    SELECT 
        lesson_id,
        lesson_title,
        score,
        total_questions,
        percentage,
        created_at
    FROM exercise_attempts 
    WHERE user_id = ?
    ORDER BY lesson_id, created_at
`, [userId], (err, rows) => {
    if (err) {
        console.error('❌ Erro ao buscar tentativas:', err);
        db.close();
        return;
    }

    if (rows.length === 0) {
        console.log('⚠️ Nenhuma tentativa de exercício encontrada para este usuário');
        db.close();
        return;
    }

    console.log(`📊 Tentativas encontradas (${rows.length}):\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalScore = 0;
    const byLesson = {};
    
    rows.forEach(row => {
        if (!byLesson[row.lesson_id]) {
            byLesson[row.lesson_id] = [];
        }
        byLesson[row.lesson_id].push(row);
        totalScore += row.score;
        
        console.log(`📚 ${row.lesson_title}`);
        console.log(`   Score: ${row.score}/${row.total_questions} (${row.percentage}%)`);
        console.log(`   Data: ${row.created_at}`);
        console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📈 TOTAL DE EXERCÍCIOS CONCLUÍDOS (soma de todos os score): ${totalScore}`);
    console.log(`📋 Resumo por aula:`);
    
    Object.keys(byLesson).forEach(lessonId => {
        const attempts = byLesson[lessonId];
        const lessonTotal = attempts.reduce((sum, att) => sum + att.score, 0);
        console.log(`   Aula ${lessonId}: ${lessonTotal} exercícios (${attempts.length} tentativa(s))`);
    });
    
    db.close();
});
