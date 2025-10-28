const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const userId = process.argv[2] || 2;
const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
    process.exit(1);
  }
});

console.log(`\n📊 Progresso do usuário ID: ${userId}\n`);

db.all(
  `SELECT 
    id, module_id, lesson_id, lesson_title,
    video_completed, exercise_completed, practical_completed, completed,
    started_at, completed_at
  FROM user_progress 
  WHERE user_id = ? 
  ORDER BY module_id, lesson_id`,
  [userId],
  (err, rows) => {
    if (err) {
      console.error('Erro ao buscar progresso:', err.message);
      process.exit(1);
    }
    
    if (!rows.length) {
      console.log('Nenhum progresso registrado para este usuário.');
    } else {
      console.log('Aulas em Progresso/Concluídas:\n');
      rows.forEach((row) => {
        const status = row.completed ? '✅' : '🔄';
        console.log(`${status} Módulo ${row.module_id} - Aula ${row.lesson_id}: ${row.lesson_title}`);
        console.log(`   Vídeo: ${row.video_completed ? '✅' : '❌'} | Exercício: ${row.exercise_completed ? '✅' : '❌'} | Prática: ${row.practical_completed ? '✅' : '❌'}`);
        console.log(`   Iniciada: ${row.started_at} | Concluída: ${row.completed_at || 'N/A'}\n`);
      });
      
      // Resumo
      const completed = rows.filter(r => r.completed).length;
      const exercises = rows.filter(r => r.exercise_completed).length;
      console.log(`\n📈 Resumo:`);
      console.log(`   Aulas concluídas: ${completed}`);
      console.log(`   Exercícios feitos: ${exercises}`);
    }
    
    db.close();
  }
);

