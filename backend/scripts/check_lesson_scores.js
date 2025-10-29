const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../db/modela_users.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando pontuações de aulas...\n');

// Verificar todas as pontuações tipo 'lesson'
db.all(`
    SELECT 
        us.id,
        us.user_id,
        u.nome as user_name,
        us.score_type,
        us.source_id as lesson_id,
        us.points,
        us.created_at
    FROM user_scores us
    JOIN users u ON us.user_id = u.id
    WHERE us.score_type = 'lesson'
    ORDER BY us.created_at DESC
`, [], (err, rows) => {
    if (err) {
        console.error('❌ Erro ao buscar pontuações:', err);
        db.close();
        return;
    }

    if (rows.length === 0) {
        console.log('⚠️ Nenhuma pontuação de aula encontrada na tabela user_scores');
        console.log('ℹ️ Execute uma aula completa (vídeo 90% + exercício 100% + atividade prática enviada) e clique em "Próxima Aula" para gerar pontos.');
    } else {
        console.log(`✅ ${rows.length} pontuação(ões) de aula encontrada(s):\n`);
        rows.forEach(row => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`ID: ${row.id}`);
            console.log(`Usuário: ${row.user_name} (ID: ${row.user_id})`);
            console.log(`Tipo: ${row.score_type}`);
            console.log(`Aula ID: ${row.lesson_id}`);
            console.log(`Pontos: ${row.points}`);
            console.log(`Data: ${row.created_at}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        });
    }

    // Mostrar total de pontos por usuário (incluindo todos os tipos)
    console.log('\n📊 Total de pontos por usuário (todos os tipos):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    db.all(`
        SELECT 
            u.id,
            u.nome,
            COALESCE(SUM(us.points), 0) as total_points,
            COUNT(us.id) as total_scores
        FROM users u
        LEFT JOIN user_scores us ON u.id = us.user_id
        GROUP BY u.id
        ORDER BY total_points DESC
    `, [], (err, totals) => {
        if (err) {
            console.error('❌ Erro ao calcular totais:', err);
        } else {
            totals.forEach(user => {
                console.log(`${user.nome}: ${user.total_points} pontos (${user.total_scores} registros)`);
            });
        }
        
        db.close();
        console.log('\n✅ Verificação concluída!');
    });
});

