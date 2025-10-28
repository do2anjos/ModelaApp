const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 LIMPEZA DE REGISTROS DOS USUÁRIOS');
console.log('=====================================\n');

console.log('⚠️  ATENÇÃO: Este script irá limpar TODOS os dados de progresso dos usuários!');
console.log('📋 Serão mantidos apenas os dados de cadastro (nome, email, matrícula, etc.)');
console.log('🗑️  Serão removidos: progresso, pontuações, tentativas de exercícios, posts do fórum\n');

// Função para executar uma query e retornar uma Promise
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Função para obter contagem de registros
function getCount(tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.count);
      }
    });
  });
}

async function cleanUserData() {
  try {
    console.log('📊 VERIFICANDO DADOS ANTES DA LIMPEZA...\n');
    
    // Contar registros antes da limpeza
    const usersCount = await getCount('users');
    const progressCount = await getCount('user_progress');
    const scoresCount = await getCount('user_scores');
    const attemptsCount = await getCount('exercise_attempts');
    const statesCount = await getCount('exercise_states');
    const topicsCount = await getCount('forum_topics');
    const repliesCount = await getCount('forum_replies');
    
    console.log(`👥 Usuários cadastrados: ${usersCount}`);
    console.log(`📈 Registros de progresso: ${progressCount}`);
    console.log(`🏆 Pontuações: ${scoresCount}`);
    console.log(`🎯 Tentativas de exercícios: ${attemptsCount}`);
    console.log(`📚 Estados de exercícios: ${statesCount}`);
    console.log(`💬 Tópicos do fórum: ${topicsCount}`);
    console.log(`💬 Respostas do fórum: ${repliesCount}\n`);
    
    if (usersCount === 0) {
      console.log('❌ Nenhum usuário encontrado. Não há nada para limpar.');
      db.close();
      return;
    }
    
    console.log('🚀 INICIANDO LIMPEZA...\n');
    
    // Limpar dados de progresso
    const progressRemoved = await runQuery('DELETE FROM user_progress');
    console.log(`✅ Removidos ${progressRemoved} registros de progresso`);
    
    // Limpar pontuações
    const scoresRemoved = await runQuery('DELETE FROM user_scores');
    console.log(`✅ Removidas ${scoresRemoved} pontuações`);
    
    // Limpar tentativas de exercícios
    const attemptsRemoved = await runQuery('DELETE FROM exercise_attempts');
    console.log(`✅ Removidas ${attemptsRemoved} tentativas de exercícios`);
    
    // Limpar estados de exercícios
    const statesRemoved = await runQuery('DELETE FROM exercise_states');
    console.log(`✅ Removidos ${statesRemoved} estados de exercícios`);
    
    // Limpar respostas do fórum primeiro (devido à foreign key)
    const repliesRemoved = await runQuery('DELETE FROM forum_replies');
    console.log(`✅ Removidas ${repliesRemoved} respostas do fórum`);
    
    // Limpar tópicos do fórum
    const topicsRemoved = await runQuery('DELETE FROM forum_topics');
    console.log(`✅ Removidos ${topicsRemoved} tópicos do fórum`);
    
    console.log('\n📊 VERIFICANDO DADOS APÓS A LIMPEZA...\n');
    
    // Verificar contagens após limpeza
    const finalUsersCount = await getCount('users');
    const finalProgressCount = await getCount('user_progress');
    const finalScoresCount = await getCount('user_scores');
    const finalAttemptsCount = await getCount('exercise_attempts');
    const finalStatesCount = await getCount('exercise_states');
    const finalTopicsCount = await getCount('forum_topics');
    const finalRepliesCount = await getCount('forum_replies');
    
    console.log(`👥 Usuários cadastrados: ${finalUsersCount} (mantidos)`);
    console.log(`📈 Registros de progresso: ${finalProgressCount} (limpos)`);
    console.log(`🏆 Pontuações: ${finalScoresCount} (limpas)`);
    console.log(`🎯 Tentativas de exercícios: ${finalAttemptsCount} (limpas)`);
    console.log(`📚 Estados de exercícios: ${finalStatesCount} (limpos)`);
    console.log(`💬 Tópicos do fórum: ${finalTopicsCount} (limpos)`);
    console.log(`💬 Respostas do fórum: ${finalRepliesCount} (limpas)`);
    
    console.log('\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('✨ Todos os usuários agora começam do zero.');
    console.log('🔒 Dados de cadastro foram preservados.');
    
    // Listar usuários mantidos
    db.all('SELECT id, nome, email, username FROM users', [], (err, users) => {
      if (err) {
        console.error('Erro ao listar usuários:', err);
        return;
      }
      
      console.log('\n👥 USUÁRIOS MANTIDOS:');
      users.forEach(user => {
        console.log(`  ID: ${user.id} | Nome: ${user.nome} | Email: ${user.email} | Username: ${user.username}`);
      });
      
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    db.close();
    process.exit(1);
  }
}

cleanUserData();
