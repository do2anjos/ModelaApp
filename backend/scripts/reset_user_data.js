const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const arg = process.argv[2];
if (!arg) {
  console.error('Uso: node reset_user_data.js <user_id|username|email>');
  process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'db', 'modela_users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
    process.exit(1);
  }
});

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) return reject(err);
      resolve(this.changes || 0);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function resolveUser(input) {
  // Se for número, trate como ID
  if (/^\d+$/.test(input)) {
    const user = await get('SELECT id, nome, email, username FROM users WHERE id = ?', [Number(input)]);
    if (!user) throw new Error(`Usuário com id ${input} não encontrado.`);
    return user;
  }
  // Tenta por username
  let user = await get('SELECT id, nome, email, username FROM users WHERE username = ?', [input]);
  if (user) return user;
  // Tenta por email
  user = await get('SELECT id, nome, email, username FROM users WHERE email = ?', [input]);
  if (user) return user;
  // Tenta por nome exato
  user = await get('SELECT id, nome, email, username FROM users WHERE nome = ?', [input]);
  if (user) return user;
  throw new Error(`Usuário não encontrado por identificador: ${input}`);
}

async function resetUserData(userId) {
  // Ordem segura: replies -> topics -> exercise_attempts/states -> scores -> progress
  // Observação: todos preservam cadastro na tabela users
  const results = {};
  try {
    results.forum_replies = await run('DELETE FROM forum_replies WHERE user_id = ?', [userId]);
  } catch (e) {
    if (e.message.includes('no such table')) results.forum_replies = 0; else throw e;
  }
  try {
    results.forum_topics = await run('DELETE FROM forum_topics WHERE user_id = ?', [userId]);
  } catch (e) {
    if (e.message.includes('no such table')) results.forum_topics = 0; else throw e;
  }
  try {
    results.exercise_attempts = await run('DELETE FROM exercise_attempts WHERE user_id = ?', [userId]);
  } catch (e) {
    if (e.message.includes('no such table')) results.exercise_attempts = 0; else throw e;
  }
  try {
    results.exercise_states = await run('DELETE FROM exercise_states WHERE user_id = ?', [userId]);
  } catch (e) {
    if (e.message.includes('no such table')) results.exercise_states = 0; else throw e;
  }
  try {
    results.user_scores = await run('DELETE FROM user_scores WHERE user_id = ?', [userId]);
  } catch (e) {
    if (e.message.includes('no such table')) results.user_scores = 0; else throw e;
  }
  try {
    results.user_progress = await run('DELETE FROM user_progress WHERE user_id = ?', [userId]);
  } catch (e) {
    if (e.message.includes('no such table')) results.user_progress = 0; else throw e;
  }
  return results;
}

(async () => {
  try {
    console.log('🔎 Localizando usuário...');
    const user = await resolveUser(arg);
    console.log(`👤 Usuário: ID ${user.id} | ${user.nome} | ${user.email} | ${user.username}`);

    console.log('\n🧹 Zerando dados do usuário (preservando cadastro)...');
    const res = await resetUserData(user.id);

    console.log('\n📊 Resultado da limpeza:');
    Object.entries(res).forEach(([k, v]) => console.log(`  ${k}: ${v} removidos`));

    // Checagem rápida de progresso restante
    const remaining = await get('SELECT COUNT(*) as c FROM user_progress WHERE user_id = ?', [user.id]);
    console.log(`\n✅ Concluído. Registros de progresso restantes: ${remaining ? remaining.c : 0}`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
})();

