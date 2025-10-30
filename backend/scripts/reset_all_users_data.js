require('dotenv').config();
const { createClient } = require('@libsql/client');
const path = require('path');

// Conectar ao Turso
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run(sql, params = []) {
  const res = await turso.execute({ sql, args: params });
  return res.rowsAffected || 0;
}

async function get(sql, params = []) {
  const res = await turso.execute({ sql, args: params });
  return res.rows[0] || null;
}

async function all(sql, params = []) {
  const res = await turso.execute({ sql, args: params });
  return res.rows || [];
}

async function resetAllUsersData() {
  console.log('🧹 Zerando dados de TODOS os usuários (preservando cadastros)...\n');
  
  const results = {};
  
  try {
    // Listar usuários antes da limpeza
    const users = await all('SELECT id, nome, email FROM users ORDER BY id');
    console.log(`📋 Encontrados ${users.length} usuários\n`);
    
    // Zerar todos os dados de progresso e atividades
    console.log('🗑️  Limpando dados...');
    
    results.forum_replies = await run('DELETE FROM forum_replies');
    console.log(`  ✅ ${results.forum_replies} respostas do fórum removidas`);
    
    results.forum_topics = await run('DELETE FROM forum_topics');
    console.log(`  ✅ ${results.forum_topics} tópicos do fórum removidos`);
    
    results.exercise_attempts = await run('DELETE FROM exercise_attempts');
    console.log(`  ✅ ${results.exercise_attempts} tentativas de exercícios removidas`);
    
    results.exercise_states = await run('DELETE FROM exercise_states');
    console.log(`  ✅ ${results.exercise_states} estados de exercícios removidos`);
    
    results.user_scores = await run('DELETE FROM user_scores');
    console.log(`  ✅ ${results.user_scores} pontuações removidas`);
    
    results.user_progress = await run('DELETE FROM user_progress');
    console.log(`  ✅ ${results.user_progress} registros de progresso removidos`);
    
    console.log('\n✅ ZERAMENTO COMPLETO!');
    console.log('\n📊 Resumo:');
    console.log(`  👥 Usuários preservados: ${users.length}`);
    console.log(`  🗑️  Dados removidos:`);
    Object.entries(results).forEach(([k, v]) => {
      console.log(`     - ${k}: ${v}`);
    });
    
    console.log('\n✨ Todos os usuários agora começam do zero!');
    
  } catch (err) {
    console.error('❌ Erro:', err);
    throw err;
  }
}

(async () => {
  try {
    await resetAllUsersData();
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha:', err.message);
    process.exit(1);
  }
})();

