/*
  Migration script: Local SQLite -> Turso

  Usage:
  TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node backend/scripts/migrate_to_turso.js

  This script reads from local SQLite file backend/db/modela_users.db and writes into Turso.
*/

const path = require('path');
const fs = require('fs');

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl || !tursoToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  const sqlite3 = require('sqlite3').verbose();
  const { createClient } = require('@libsql/client');

  const dbPath = path.join(process.cwd(), 'backend', 'db', 'modela_users.db');
  if (!fs.existsSync(dbPath)) {
    console.error('Local SQLite not found at', dbPath);
    process.exit(1);
  }

  const sqlite = new sqlite3.Database(dbPath);
  const turso = createClient({ url: tursoUrl, authToken: tursoToken });

  const readAll = (sql, params = []) => new Promise((resolve, reject) => {
    sqlite.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

  const tables = [
    { name: 'users', pk: 'id' },
    { name: 'user_progress', pk: 'id' },
    { name: 'user_scores', pk: 'id' },
    { name: 'exercise_attempts', pk: 'id' },
    { name: 'exercise_states', pk: 'id' },
    { name: 'forum_topics', pk: 'id' },
    { name: 'forum_replies', pk: 'id' }
  ];

  async function ensureSchema() {
    // Rely on application boot to create schema; just a sanity ping
    await turso.execute('SELECT 1');
  }

  async function getDestColumns(tableName) {
    const res = await turso.execute(`PRAGMA table_info(${tableName})`);
    return res.rows.map((r) => r.name);
  }

  async function migrateTable(table) {
    const rows = await readAll(`SELECT * FROM ${table.name}`);
    if (!rows.length) {
      console.log(`- ${table.name}: nothing to migrate`);
      return;
    }
    const destCols = await getDestColumns(table.name);
    const columns = Object.keys(rows[0]).filter((c) => destCols.includes(c));
    const placeholders = columns.map(() => '?').join(', ');
    const insertSql = `INSERT OR REPLACE INTO ${table.name} (${columns.join(', ')}) VALUES (${placeholders})`;

    // Insert respecting order to satisfy FKs implicitly by table ordering
    for (const row of rows) {
      const args = columns.map((c) => row[c]);
      try {
        await turso.execute({ sql: insertSql, args });
      } catch (e) {
        console.error(`Error inserting into ${table.name}:`, e.message, '\nRow:', row);
        throw e;
      }
    }
    console.log(`- ${table.name}: migrated ${rows.length} rows`);
  }

  try {
    console.log('Connecting and ensuring schema...');
    await ensureSchema();

    // Order matters for FKs
    const ordered = [
      'users',
      'forum_topics',
      'forum_replies',
      'user_scores',
      'exercise_attempts',
      'exercise_states',
      'user_progress'
    ];

    for (const t of ordered) {
      await migrateTable({ name: t });
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

main();


