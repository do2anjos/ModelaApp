const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../db/modela_users.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando estrutura das tabelas...\n');

// Verifica estrutura da tabela user_progress
db.all("PRAGMA table_info(user_progress)", [], (err, rows) => {
    if (err) {
        console.error('❌ Erro ao verificar user_progress:', err);
    } else {
        console.log('📋 Estrutura da tabela user_progress:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        rows.forEach(col => {
            console.log(`${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'} - ${col.pk ? 'PRIMARY KEY' : ''}`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    
    // Verifica estrutura da tabela exercise_states
    db.all("PRAGMA table_info(exercise_states)", [], (err, rows) => {
        if (err) {
            console.error('❌ Erro ao verificar exercise_states:', err);
        } else {
            console.log('📋 Estrutura da tabela exercise_states:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            rows.forEach(col => {
                console.log(`${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'} - ${col.pk ? 'PRIMARY KEY' : ''}`);
            });
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
        
        // Lista dados de user_progress
        db.all("SELECT * FROM user_progress LIMIT 5", [], (err, rows) => {
            if (err) {
                console.error('❌ Erro ao buscar dados de user_progress:', err);
            } else {
                console.log('📊 Dados de user_progress (primeiros 5 registros):');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                rows.forEach((row, index) => {
                    console.log(`Registro ${index + 1}:`, JSON.stringify(row, null, 2));
                });
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }
            
            db.close();
        });
    });
});
