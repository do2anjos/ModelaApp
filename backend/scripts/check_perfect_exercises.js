const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../db/modela_users.db');
const db = new sqlite3.Database(dbPath);

// Pega o ID do usuário como argumento da linha de comando
const userId = process.argv[2] || '9';

console.log(`🔍 Verificando exercícios 100% corretos do usuário ID: ${userId}\n`);

// Busca tentativas de exercícios com 100% de acerto
db.all(`
    SELECT 
        lesson_id,
        lesson_title,
        score,
        total_questions,
        percentage,
        created_at
    FROM exercise_attempts 
    WHERE user_id = ? AND (percentage = 100 OR score = total_questions)
    ORDER BY lesson_id, created_at
`, [userId], (err, rows) => {
    if (err) {
        console.error('❌ Erro ao buscar tentativas:', err);
        db.close();
        return;
    }

    if (rows.length === 0) {
        console.log('⚠️ Nenhuma tentativa com 100% de acerto encontrada para este usuário');
        db.close();
        return;
    }

    console.log(`📊 Tentativas com 100% de acerto (${rows.length}):\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const uniqueLessons = new Set();
    
    rows.forEach(row => {
        uniqueLessons.add(row.lesson_id);
        console.log(`✅ ${row.lesson_title}`);
        console.log(`   Score: ${row.score}/${row.total_questions} (${row.percentage}%)`);
        console.log(`   Data: ${row.created_at}`);
        console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📈 TOTAL DE EXERCÍCIOS CONCLUÍDOS (aulas com 100%): ${uniqueLessons.size}`);
    console.log(`📋 Aulas únicas com 100%: ${Array.from(uniqueLessons).join(', ')}`);
    
    // Verificar também todas as tentativas para comparação
    db.all(`
        SELECT 
            lesson_id,
            lesson_title,
            score,
            total_questions,
            percentage
        FROM exercise_attempts 
        WHERE user_id = ?
        ORDER BY lesson_id, created_at
    `, [userId], (err, allRows) => {
        if (!err && allRows.length > 0) {
            console.log(`\n📊 Comparação - Todas as tentativas (${allRows.length}):`);
            allRows.forEach(row => {
                const isPerfect = row.percentage === 100 || row.score === row.total_questions;
                console.log(`   ${isPerfect ? '✅' : '❌'} Aula ${row.lesson_id}: ${row.score}/${row.total_questions} (${row.percentage}%)`);
            });
        }
        
        db.close();
    });
});

