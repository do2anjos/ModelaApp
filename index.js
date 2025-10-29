const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Headers de segurança (relaxar CSP para permitir scripts inline necessários)
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados (SQLite local ou Turso remoto)
const useTurso = !!process.env.TURSO_DATABASE_URL;
let db; // adapter com .run/.get/.all

if (useTurso) {
    const { createClient } = require('@libsql/client');

    const turso = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    // Adapter para compatibilizar com a API callback do sqlite3
    db = {
        run(sql, params, cb) {
            // Se params é uma função, então é db.run(sql, callback)
            if (typeof params === 'function') {
                cb = params;
                params = [];
            }
            turso.execute({ sql, args: params || [] })
                .then((res) => {
                    const ctx = {
                        lastID: Number(res.lastInsertRowid || 0),
                        changes: res.rowsAffected || 0
                    };
                    cb && cb.call(ctx, null);
                })
                .catch((err) => cb && cb(err));
        },
        get(sql, params, cb) {
            if (typeof params === 'function') {
                cb = params;
                params = [];
            }
            turso.execute({ sql, args: params || [] })
                .then((res) => cb && cb(null, res.rows[0]))
                .catch((err) => cb && cb(err));
        },
        all(sql, params, cb) {
            if (typeof params === 'function') {
                cb = params;
                params = [];
            }
            turso.execute({ sql, args: params || [] })
                .then((res) => cb && cb(null, res.rows))
                .catch((err) => cb && cb(err));
        }
    };

    console.log('✅ Conectado ao Turso:', process.env.TURSO_DATABASE_URL);
} else {
    // SQLite local (dev)
    const sqlite3 = require('sqlite3').verbose();
    const dbDir = path.join(__dirname, 'backend', 'db');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'modela_users.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Erro ao conectar com SQLite:', err.message);
        else console.log('✅ Conectado ao SQLite em:', dbPath);
    });
}

// Helpers de Promises para o driver (Turso/SQLite)
function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}
function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}
function getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

async function initializeDatabaseSchema() {
    // Tabela de usuários
    await runAsync(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        matricula TEXT UNIQUE NOT NULL,
        telefone TEXT,
        senha_hash TEXT NOT NULL,
        username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de progresso do usuário
    await runAsync(`CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        lesson_title TEXT NOT NULL,
        video_completed BOOLEAN DEFAULT 0,
        exercise_completed BOOLEAN DEFAULT 0,
        practical_completed BOOLEAN DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        completed_at DATETIME DEFAULT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de pontuações do usuário
    await runAsync(`CREATE TABLE IF NOT EXISTS user_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score_type TEXT NOT NULL,  -- 'exercise', 'module', 'forum_topic', 'forum_reply'
        source_id TEXT NOT NULL,   -- lesson_id, module_id, topic_id
        points INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de tentativas de exercícios
    await runAsync(`CREATE TABLE IF NOT EXISTS exercise_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        lesson_title TEXT NOT NULL,
        score INTEGER NOT NULL,        -- Número de acertos
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,    -- Percentual de acerto
        is_first_attempt BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de estado dos exercícios (para persistir feedback após refresh)
    await runAsync(`CREATE TABLE IF NOT EXISTS exercise_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        lesson_title TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT 0,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        points_awarded INTEGER DEFAULT 0,
        is_first_attempt BOOLEAN DEFAULT 1,
        feedback_data TEXT,            -- JSON com dados do feedback
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, lesson_id)
    )`);

    // Tabela de tópicos do fórum
    await runAsync(`CREATE TABLE IF NOT EXISTS forum_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de respostas do fórum
    await runAsync(`CREATE TABLE IF NOT EXISTS forum_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES forum_topics (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Índices para performance
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_user_progress_module_lesson ON user_progress(user_id, module_id, lesson_id)`);
    // Índice único para permitir INSERT OR REPLACE por (user_id, lesson_id)
    await runAsync(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_lesson_unique ON user_progress(user_id, lesson_id)`);

    // Migration check: garante que colunas 'completed' e 'completed_at' existam (para bancos existentes)
    const cols = await allAsync("PRAGMA table_info('user_progress')");
    const colNames = (cols || []).map(c => c.name);
    if (!colNames.includes('completed')) {
        console.log('🔧 Coluna "completed" não encontrada em user_progress - adicionando...');
        await runAsync('ALTER TABLE user_progress ADD COLUMN completed BOOLEAN DEFAULT 0');
    }
    if (!colNames.includes('completed_at')) {
        console.log('🔧 Coluna "completed_at" não encontrada em user_progress - adicionando...');
        await runAsync('ALTER TABLE user_progress ADD COLUMN completed_at DATETIME DEFAULT NULL');
    }
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_user_scores_user ON user_scores(user_id)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user ON exercise_attempts(user_id)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_forum_topics_user ON forum_topics(user_id)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id)`);
}

// Função para gerar username
function generateUsername(nome) {
    const partes = nome.trim().toLowerCase().split(' ');
    if (partes.length >= 2) {
        return `${partes[0]}.${partes[partes.length - 1]}`;
    }
    return partes[0];
}

// Endpoint de cadastro
app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, matricula, telefone, senha } = req.body;
        
        if (!nome || !email || !matricula || !senha) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos os campos obrigatórios devem ser preenchidos' 
            });
        }

        // Verificar se email já existe
        const emailExists = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }).catch(() => null);

        if (emailExists) {
            return res.status(400).json({ success: false, message: 'Email já cadastrado' });
        }

        // Verificar se matrícula já existe
        const matriculaExists = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE matricula = ?', [matricula], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }).catch(() => null);

        if (matriculaExists) {
            return res.status(400).json({ success: false, message: 'Matrícula já cadastrada' });
        }

        // Gerar hash da senha e username
        const senhaHash = await bcrypt.hash(senha, 10);
        const username = generateUsername(nome);

        // Inserir usuário
        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (nome, email, matricula, telefone, senha_hash, username) VALUES (?, ?, ?, ?, ?, ?)',
                [nome, email, matricula, telefone, senhaHash, username],
                function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                }
            );
        });

        res.json({ 
            success: true, 
            message: 'Usuário cadastrado com sucesso!',
            userId: result.lastID,
            username: username
        });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor: ' + error.message });
    }
});

// Endpoint de login
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email e senha são obrigatórios' 
            });
        }

        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }).catch(() => null);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        const isValid = await bcrypt.compare(senha, user.senha_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        res.json({ 
            success: true, 
            message: 'Login realizado com sucesso!',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                username: user.username,
                matricula: user.matricula,
                telefone: user.telefone
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Endpoint de redefinir senha
app.post('/api/redefinir', async (req, res) => {
    try {
        const { email, novaSenha } = req.body;
        
        if (!email || !novaSenha) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email e nova senha são obrigatórios' 
            });
        }

        // Verificar se usuário existe
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }).catch(() => null);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }

        // Gerar hash da nova senha
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualizar senha
        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET senha_hash = ? WHERE email = ?', [senhaHash, email], function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });

        res.json({ 
            success: true, 
            message: 'Senha redefinida com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Endpoint para buscar dados do dashboard
app.get('/api/user/:userId/dashboard', (req, res) => {
    const userId = req.params.userId;
    
    // Buscar progresso do usuário
    db.all(`
        SELECT module_id, lesson_id, video_completed, exercise_completed, practical_completed 
        FROM user_progress 
        WHERE user_id = ?
    `, [userId], (err, progressRows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao buscar progresso' });
        }

        // Calcular estatísticas
        const exercises = {
            completed: 0,
            total: 40 // Total de exercícios em todos os módulos
        };
        
        const modules = {
            completed: 0,
            total: 4
        };
        
        const certificates = {
            available: 0,
            total: 1
        };

        // Calcular exercícios completos - Soma do total de questões das aulas com 100% de acerto
        db.all(`
            SELECT COALESCE(SUM(total_questions), 0) AS exercises_completed
            FROM exercise_attempts
            WHERE user_id = ? AND (percentage = 100 OR score = total_questions)
        `, [userId], (err, exerciseRows) => {
            if (err) {
                console.error('❌ Erro ao calcular exercícios:', err);
                exercises.completed = 0;
            } else {
                // COALESCE garante que retorna 0 se não houver registros (NULL)
                exercises.completed = exerciseRows[0]?.exercises_completed || 0;
                console.log(`📊 Total de exercícios concluídos (soma de questões 100%): ${exercises.completed}`);
            }
            
            // Continua com o cálculo de módulos...
            continueModuleCalculation();
        });
        
        function continueModuleCalculation() {
            // Calcular módulos completos (todos os exercícios do módulo)
            const moduleProgress = {};
            progressRows.forEach(row => {
                if (!moduleProgress[row.module_id]) {
                    moduleProgress[row.module_id] = { total: 0, completed: 0 };
                }
                moduleProgress[row.module_id].total++;
                // SQLite retorna 1/0 como number, então verificamos explicitamente
                const isCompleted = row.exercise_completed === 1 || row.exercise_completed === true;
                if (isCompleted) {
                    moduleProgress[row.module_id].completed++;
                }
            });

            // Verificar módulos completos
            // Mapeamento de total de aulas por módulo
            const moduleTotals = {
                1: 10, // Modelagem com UML tem 10 aulas
                2: 0,  // Outros módulos (será atualizado quando houver mais aulas)
                3: 0,
                4: 0
            };
            
            Object.keys(moduleProgress).forEach(moduleId => {
                const progress = moduleProgress[moduleId];
                const expectedTotal = moduleTotals[parseInt(moduleId)] || 0;
                
                // Módulo só está completo se todas as aulas esperadas estiverem concluídas
                // E se o número de concluídas for igual ao total esperado
                if (expectedTotal > 0 && 
                    progress.completed === expectedTotal && 
                    progress.total >= expectedTotal) {
                    modules.completed++;
                    console.log(`✅ Módulo ${moduleId} completo: ${progress.completed}/${expectedTotal} aulas concluídas`);
                } else {
                    console.log(`⏳ Módulo ${moduleId} incompleto: ${progress.completed}/${expectedTotal} aulas concluídas`);
                }
            });

            // Certificado disponível se todos os módulos completos
            if (modules.completed === modules.total) {
                certificates.available = 1;
            }

            // Buscar progresso do módulo atual
            const currentModule = {
                id: 1,
                title: 'Modelagem com UML',
                progress: 0,
                currentLesson: 'Aula 01: Introdução à UML',
                nextLesson: 'Aula 02: Diagrama de Classes'
            };

            // Calcular progresso do módulo 1
            if (moduleProgress[1]) {
                const progress = moduleProgress[1];
                currentModule.progress = Math.round((progress.completed / progress.total) * 100);
            }

            // Buscar última aula acessada (mais recente por started_at)
            let lastAccessedLesson = null;
            if (progressRows.length > 0) {
                const sortedRows = progressRows.sort((a, b) => new Date(b.started_at || 0) - new Date(a.started_at || 0));
                const lastRow = sortedRows[0];
                
                // Mapear lesson_id para título da aula
                const lessonTitles = {
                    1: 'Aula 01: Introdução à UML',
                    2: 'Aula 02: O que é um Diagrama de Classes',
                    3: 'Aula 03: Diagrama de Casos de Uso',
                    4: 'Aula 04: Diagrama de Sequência'
                };
                
                lastAccessedLesson = lessonTitles[lastRow.lesson_id] || 'Aula 01: Introdução à UML';
            }

            res.json({
                success: true,
                exercises,
                modules,
                certificates,
                currentModule: lastAccessedLesson ? {
                    ...currentModule,
                    currentLesson: lastAccessedLesson
                } : currentModule
            });
        }
    });
});

// Endpoint para atualizar progresso de uma aula específica
app.post('/api/user/:userId/lesson-progress', (req, res) => {
    const userId = req.params.userId;
    const { lessonTitle, ...updates } = req.body;

    if (!lessonTitle) {
        return res.status(400).json({ success: false, message: 'Título da aula não fornecido' });
    }

    const fields = [];
    const params = [];

    // Constrói a query dinamicamente
    if (updates.exerciseCompleted !== undefined) {
        fields.push('exercise_completed = ?');
        params.push(updates.exerciseCompleted);
    }
    if (updates.practicalCompleted !== undefined) {
        fields.push('practical_completed = ?');
        params.push(updates.practicalCompleted);
    }
    if (updates.completed !== undefined) {
        fields.push('completed = ?');
        params.push(updates.completed);
        // Atualiza a data de conclusão apenas se a aula estiver sendo marcada como completa
        if (updates.completed) {
            fields.push('completed_at = CURRENT_TIMESTAMP');
        }
    }
    
    // Não adiciona updated_at pois a coluna não existe na tabela user_progress

    if (fields.length === 0) { // Verifica se há campos para atualizar
        return res.json({ success: true, message: 'Nenhum campo de progresso para atualizar' });
    }

    const sql = `UPDATE user_progress SET ${fields.join(', ')} WHERE user_id = ? AND lesson_title = ?`;
    params.push(userId, lessonTitle);

    db.run(sql, params, function(err) {
        if (err) {
            console.error('❌ Erro ao atualizar progresso da aula:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar progresso da aula' });
        }
        console.log(`✅ Progresso da aula "${lessonTitle}" atualizado para usuário ${userId}:`, this.changes, 'registros');
        res.json({ success: true, message: 'Progresso da aula atualizado com sucesso' });
    });
});

// Endpoint para salvar progresso
app.post('/api/user/:userId/progress', (req, res) => {
    const userId = req.params.userId;
    const { moduleId, lessonId, lessonTitle, videoCompleted, exerciseCompleted, practicalCompleted, completed } = req.body;

    console.log('📝 Salvando progresso:', { userId, moduleId, lessonId, lessonTitle, videoCompleted, exerciseCompleted, practicalCompleted, completed });

    if (!moduleId || !lessonId || !lessonTitle) {
        console.log('❌ Dados obrigatórios não fornecidos');
        return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
    }

    // CORREÇÃO: Inserir ou atualizar progresso com todos os campos necessários
    db.run(`
        INSERT OR REPLACE INTO user_progress 
        (user_id, module_id, lesson_id, lesson_title, video_completed, exercise_completed, practical_completed, completed, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
    `, [userId, moduleId, lessonId, lessonTitle, videoCompleted || false, exerciseCompleted || false, practicalCompleted || false, completed || false, completed || false], function(err) {
        if (err) {
            console.error('❌ Erro ao salvar progresso:', err);
            return res.status(500).json({ success: false, message: 'Erro ao salvar progresso', error: err.message });
        }

        console.log('✅ Progresso salvo com sucesso');
        res.json({ success: true, message: 'Progresso salvo com sucesso' });
    });
});

// Endpoint para buscar progresso de todas as aulas do usuário
app.get('/api/user/:userId/progress', async (req, res) => {
    try {
        const userId = req.params.userId;

        const rows = await allAsync(`
            SELECT lesson_id, lesson_title, video_completed, exercise_completed, practical_completed, completed, module_id
            FROM user_progress 
            WHERE user_id = ?
            ORDER BY module_id, lesson_id
        `, [userId]);

        res.json({
            success: true,
            lessons: rows
        });
    } catch (error) {
        console.error('❌ Erro ao buscar progresso:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar progresso' });
    }
});

// Endpoint para buscar progresso detalhado de um módulo
app.get('/api/user/:userId/module/:moduleId/progress', async (req, res) => {
    try {
        const userId = req.params.userId;
        const moduleId = req.params.moduleId;

        const rows = await allAsync(`
            SELECT lesson_id, lesson_title, video_completed, exercise_completed, practical_completed, completed
            FROM user_progress 
            WHERE user_id = ? AND module_id = ?
            ORDER BY lesson_id
        `, [userId, moduleId]);

        res.json({
            success: true,
            moduleId: parseInt(moduleId),
            lessons: rows
        });
    } catch (error) {
        console.error('❌ Erro ao buscar progresso do módulo:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar progresso do módulo' });
    }
});

// Endpoint para atualizar dados do usuário
app.put('/api/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { nome, username } = req.body;

        if (!nome || !username) {
            return res.status(400).json({ success: false, message: 'Nome e username são obrigatórios' });
        }

        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET nome = ?, username = ? WHERE id = ?', [nome, username, userId], function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });

        res.json({ success: true, message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar usuário' });
    }
});

// ==========================================================================
// ENDPOINTS DE PONTUAÇÃO E RANKING
// ==========================================================================

// Endpoint 1: Adicionar Pontos (COM VERIFICAÇÃO DE DUPLICAÇÃO)
app.post('/api/user/:userId/score', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { scoreType, sourceId, points } = req.body;

        if (!scoreType || !sourceId || !points) {
            return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
        }

        // Verifica se já existe pontuação para evitar duplicação
        const existingScore = await getAsync(
            'SELECT id FROM user_scores WHERE user_id = ? AND score_type = ? AND source_id = ?',
            [userId, scoreType, sourceId]
        );

        if (existingScore) {
            console.log(`⚠️ Pontuação já existe para user_id=${userId}, score_type=${scoreType}, source_id=${sourceId}`);
            return res.json({ 
                success: true, 
                message: 'Pontuação já registrada anteriormente', 
                pointsAdded: 0,
                alreadyExists: true 
            });
        }

        // Adiciona pontos apenas se não existir
        await runAsync(
            'INSERT INTO user_scores (user_id, score_type, source_id, points) VALUES (?, ?, ?, ?)',
            [userId, scoreType, sourceId, points]
        );

        console.log(`✅ Pontos adicionados: user_id=${userId}, score_type=${scoreType}, source_id=${sourceId}, points=${points}`);
        res.json({ success: true, message: 'Pontos adicionados com sucesso', pointsAdded: points });
    } catch (error) {
        console.error('Erro ao adicionar pontos:', error);
        res.status(500).json({ success: false, message: 'Erro ao adicionar pontos' });
    }
});

// Endpoint 2: Registrar Tentativa de Exercício
app.post('/api/user/:userId/exercise-attempt', (req, res) => {
    const userId = req.params.userId;
    const { lessonId, lessonTitle, score, totalQuestions, percentage } = req.body;

    if (!lessonId || !lessonTitle || score === undefined || !totalQuestions || percentage === undefined) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
    }

    // Verificar se já existe tentativa para esta aula
    db.get(
        'SELECT id FROM exercise_attempts WHERE user_id = ? AND lesson_id = ?',
        [userId, lessonId],
        (err, row) => {
            if (err) {
                console.error('Erro ao verificar tentativa:', err);
                return res.status(500).json({ success: false, message: 'Erro ao verificar tentativa' });
            }

            const isFirstAttempt = !row;
            let pointsAwarded = 0;

            // Pontua proporcionalmente apenas na primeira tentativa
            if (isFirstAttempt) {
                // Calcula pontos proporcionais ao percentual de acertos
                // Máximo de 10 pontos por exercício
                pointsAwarded = Math.round((percentage / 100) * 10);
            }

            // Registrar tentativa
            db.run(
                'INSERT INTO exercise_attempts (user_id, lesson_id, lesson_title, score, total_questions, percentage, is_first_attempt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, lessonId, lessonTitle, score, totalQuestions, percentage, isFirstAttempt],
                function(err) {
                    if (err) {
                        console.error('Erro ao registrar tentativa:', err);
                        return res.status(500).json({ success: false, message: 'Erro ao registrar tentativa' });
                    }

                    // CORREÇÃO: Adicionar pontos apenas se for primeira tentativa e 100% E não existir pontuação anterior
                    if (pointsAwarded > 0) {
                        db.get(
                            'SELECT id FROM user_scores WHERE user_id = ? AND score_type = ? AND source_id = ?',
                            [userId, 'exercise', lessonId.toString()],
                            (err, existingScore) => {
                                if (err) {
                                    console.error('Erro ao verificar pontuação de exercício:', err);
                                    return;
                                }
                                
                                if (!existingScore) {
                                    db.run(
                                        'INSERT INTO user_scores (user_id, score_type, source_id, points) VALUES (?, ?, ?, ?)',
                                        [userId, 'exercise', lessonId.toString(), pointsAwarded],
                                        (err) => {
                                            if (err) console.error('Erro ao adicionar pontos:', err);
                                            else console.log(`✅ Pontos de exercício adicionados: ${pointsAwarded} para aula ${lessonId}`);
                                        }
                                    );
                                } else {
                                    console.log(`⚠️ Pontuação de exercício já existe para aula ${lessonId}`);
                                }
                            }
                        );
                    }

                    res.json({
                        success: true,
                        isFirstAttempt,
                        pointsAwarded,
                        percentage,
                        message: isFirstAttempt ? 'Tentativa registrada' : 'Tentativa adicional registrada'
                    });
                }
            );
        }
    );
});

// Endpoint: Forçar Criação da Tabela Exercise States
app.get('/api/force-create-exercise-states-table', (req, res) => {
    console.log('🔄 Forçando criação da tabela exercise_states...');
    
    // Remove a tabela se existir
    db.run('DROP TABLE IF EXISTS exercise_states', (err) => {
        if (err) {
            console.error('❌ Erro ao remover tabela:', err);
            return res.status(500).json({ success: false, message: 'Erro ao remover tabela', error: err.message });
        }
        
        console.log('✅ Tabela removida com sucesso');
        
        // Cria a tabela com a estrutura correta
        db.run(`CREATE TABLE exercise_states (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            lesson_id INTEGER NOT NULL,
            lesson_title TEXT NOT NULL,
            is_completed BOOLEAN DEFAULT 0,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            percentage INTEGER NOT NULL,
            points_awarded INTEGER DEFAULT 0,
            is_first_attempt BOOLEAN DEFAULT 1,
            feedback_data TEXT,            -- JSON com dados do feedback
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, lesson_id)
        )`, (err) => {
            if (err) {
                console.error('❌ Erro ao criar tabela:', err);
                return res.status(500).json({ success: false, message: 'Erro ao criar tabela', error: err.message });
            }
            
            console.log('✅ Tabela exercise_states criada com sucesso');
            res.json({ success: true, message: 'Tabela exercise_states criada com sucesso' });
        });
    });
});

// Endpoint: Verificar/Criar Tabela Exercise States
app.get('/api/check-exercise-states-table', (req, res) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='exercise_states'", (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar tabela:', err);
            return res.status(500).json({ success: false, message: 'Erro ao verificar tabela', error: err.message });
        }
        
        if (!row) {
            console.log('📋 Tabela exercise_states não existe, criando...');
            
            // Criar tabela se não existir
            db.run(`CREATE TABLE IF NOT EXISTS exercise_states (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                lesson_id INTEGER NOT NULL,
                lesson_title TEXT NOT NULL,
                is_completed BOOLEAN DEFAULT 0,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                percentage INTEGER NOT NULL,
                points_awarded INTEGER DEFAULT 0,
                is_first_attempt BOOLEAN DEFAULT 1,
                feedback_data TEXT,            -- JSON com dados do feedback
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, lesson_id)
            )`, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao criar tabela', error: err.message });
                }
                
                console.log('✅ Tabela exercise_states criada com sucesso');
                res.json({ success: true, message: 'Tabela exercise_states criada com sucesso', created: true });
            });
        } else {
            console.log('✅ Tabela exercise_states já existe');
            res.json({ success: true, message: 'Tabela exercise_states já existe', created: false });
        }
    });
});

// Endpoint: Salvar Estado do Exercício (para persistir feedback)
app.post('/api/user/:userId/exercise-state', (req, res) => {
    const userId = req.params.userId;
    const { lessonId, lessonTitle, isCompleted, score, totalQuestions, percentage, pointsAwarded, isFirstAttempt, feedbackData } = req.body;

    if (!lessonId || !lessonTitle || score === undefined || !totalQuestions || percentage === undefined) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
    }

    console.log('💾 Salvando estado do exercício:', { userId, lessonId, lessonTitle, isCompleted, score, totalQuestions, percentage });

    // Primeiro verifica se a tabela existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='exercise_states'", (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar tabela:', err);
            return res.status(500).json({ success: false, message: 'Erro ao verificar tabela', error: err.message });
        }
        
        if (!row) {
            console.log('📋 Tabela exercise_states não existe, criando...');
            
            // Criar tabela se não existir
            db.run(`CREATE TABLE IF NOT EXISTS exercise_states (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                lesson_id INTEGER NOT NULL,
                lesson_title TEXT NOT NULL,
                is_completed BOOLEAN DEFAULT 0,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                percentage INTEGER NOT NULL,
                points_awarded INTEGER DEFAULT 0,
                is_first_attempt BOOLEAN DEFAULT 1,
                feedback_data TEXT,            -- JSON com dados do feedback
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, lesson_id)
            )`, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao criar tabela', error: err.message });
                }
                
                console.log('✅ Tabela exercise_states criada com sucesso');
                // Após criar a tabela, tenta inserir novamente
                insertExerciseState();
            });
        } else {
            console.log('✅ Tabela exercise_states já existe');
            // Tabela existe, pode inserir
            insertExerciseState();
        }
    });

    function insertExerciseState() {
        // Inserir ou atualizar estado do exercício
        db.run(`
            INSERT OR REPLACE INTO exercise_states 
            (user_id, lesson_id, lesson_title, is_completed, score, total_questions, percentage, points_awarded, is_first_attempt, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [userId, lessonId, lessonTitle, isCompleted || false, score, totalQuestions, percentage, pointsAwarded || 0, isFirstAttempt || false], function(err) {
            if (err) {
                console.error('❌ Erro ao salvar estado do exercício:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar estado do exercício', error: err.message });
            }

            console.log('✅ Estado do exercício salvo com sucesso');
            res.json({ success: true, message: 'Estado do exercício salvo com sucesso' });
        });
    }
});

// Endpoint: Carregar Estado do Exercício
app.get('/api/user/:userId/exercise-state/:lessonId', (req, res) => {
    const userId = req.params.userId;
    const lessonId = req.params.lessonId;

    console.log('📂 Carregando estado do exercício:', { userId, lessonId });

    db.get(`
        SELECT * FROM exercise_states 
        WHERE user_id = ? AND lesson_id = ?
    `, [userId, lessonId], (err, row) => {
        if (err) {
            console.error('❌ Erro ao carregar estado do exercício:', err);
            return res.status(500).json({ success: false, message: 'Erro ao carregar estado do exercício', error: err.message });
        }

        if (!row) {
            console.log('❌ Nenhum estado encontrado para esta aula');
            return res.json({ success: true, state: null });
        }

        console.log('✅ Estado do exercício carregado:', row);
        
        // Parse do feedback_data se existir
        let feedbackData = {};
        if (row.feedback_data) {
            try {
                feedbackData = JSON.parse(row.feedback_data);
            } catch (e) {
                console.error('❌ Erro ao fazer parse do feedback_data:', e);
            }
        }

        res.json({
            success: true,
            state: {
                id: row.id,
                lessonId: row.lesson_id,
                lessonTitle: row.lesson_title,
                isCompleted: row.is_completed,
                score: row.score,
                totalQuestions: row.total_questions,
                percentage: row.percentage,
                pointsAwarded: row.points_awarded,
                isFirstAttempt: row.is_first_attempt,
                feedbackData: feedbackData,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }
        });
    });
});

// Endpoint: Limpar Estado do Exercício
app.delete('/api/user/:userId/exercise-state/:lessonId', (req, res) => {
    const userId = req.params.userId;
    const lessonId = req.params.lessonId;

    console.log('🗑️ Limpando estado do exercício:', { userId, lessonId });

    db.run(`
        DELETE FROM exercise_states 
        WHERE user_id = ? AND lesson_id = ?
    `, [userId, lessonId], function(err) {
        if (err) {
            console.error('❌ Erro ao limpar estado do exercício:', err);
            return res.status(500).json({ success: false, message: 'Erro ao limpar estado do exercício', error: err.message });
        }

        console.log('✅ Estado do exercício limpo com sucesso');
        res.json({ success: true, message: 'Estado do exercício limpo com sucesso' });
    });
});

// Endpoint 3: Buscar Pontuação Total do Usuário
app.get('/api/user/:userId/total-score', async (req, res) => {
    try {
        const userId = req.params.userId;

        const rows = await allAsync(
            'SELECT score_type, SUM(points) as total FROM user_scores WHERE user_id = ? GROUP BY score_type',
            [userId]
        );

        let totalPoints = 0;
        const breakdown = { exercises: 0, modules: 0, forum: 0 };

        rows.forEach(row => {
            totalPoints += row.total;
            if (row.score_type === 'exercise') breakdown.exercises = row.total;
            else if (row.score_type === 'module') breakdown.modules = row.total;
            else if (row.score_type === 'forum_topic' || row.score_type === 'forum_reply') {
                breakdown.forum += row.total;
            }
        });

        res.json({
            success: true,
            totalPoints,
            breakdown
        });
    } catch (error) {
        console.error('Erro ao buscar pontuação:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar pontuação' });
    }
});

// Endpoint 4: Ranking Geral
app.get('/api/ranking', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const rows = await allAsync(`
            SELECT 
                u.id as userId,
                u.nome,
                u.username,
                COALESCE(SUM(us.points), 0) as totalPoints
            FROM users u
            LEFT JOIN user_scores us ON u.id = us.user_id
            GROUP BY u.id, u.nome, u.username
            ORDER BY totalPoints DESC, u.id ASC
            LIMIT ?
        `, [limit]);

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar ranking' });
    }
});

// Endpoint 5: Ranking do Fórum
app.get('/api/ranking/forum', async (req, res) => {
    try {
        const rows = await allAsync(`
            SELECT 
                u.id as userId,
                u.nome,
                u.username,
                COUNT(DISTINCT ft.id) as topicsCount,
                COUNT(DISTINCT fr.id) as repliesCount
            FROM users u
            LEFT JOIN forum_topics ft ON u.id = ft.user_id
            LEFT JOIN forum_replies fr ON u.id = fr.user_id
            GROUP BY u.id, u.nome, u.username
            HAVING topicsCount > 0 OR repliesCount > 0
            ORDER BY topicsCount DESC, repliesCount DESC, u.nome ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar ranking do fórum:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar ranking do fórum' });
    }
});

// ==========================================================================
// ENDPOINTS DO FÓRUM
// ==========================================================================

// Endpoint 6: Criar Tópico
app.post('/api/forum/topic', (req, res) => {
    const { userId, title, content, category } = req.body;

    if (!userId || !title || !content) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
    }

    db.run(
        'INSERT INTO forum_topics (user_id, title, content, category) VALUES (?, ?, ?, ?)',
        [userId, title, content, category],
        function(err) {
            if (err) {
                console.error('Erro ao criar tópico:', err);
                return res.status(500).json({ success: false, message: 'Erro ao criar tópico' });
            }

            const topicId = this.lastID;
            const pointsAwarded = 5;

            // Adicionar pontos por criar tópico
            db.run(
                'INSERT INTO user_scores (user_id, score_type, source_id, points) VALUES (?, ?, ?, ?)',
                [userId, 'forum_topic', topicId.toString(), pointsAwarded],
                (err) => {
                    if (err) console.error('Erro ao adicionar pontos:', err);
                }
            );

            res.json({ success: true, topicId, pointsAwarded });
        }
    );
});

// Endpoint 7: Criar Resposta
app.post('/api/forum/reply', (req, res) => {
    const { userId, topicId, content } = req.body;

    if (!userId || !topicId || !content) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
    }

    db.run(
        'INSERT INTO forum_replies (topic_id, user_id, content) VALUES (?, ?, ?)',
        [topicId, userId, content],
        function(err) {
            if (err) {
                console.error('Erro ao criar resposta:', err);
                return res.status(500).json({ success: false, message: 'Erro ao criar resposta' });
            }

            const replyId = this.lastID;
            const pointsAwarded = 2;

            // Adicionar pontos por responder
            db.run(
                'INSERT INTO user_scores (user_id, score_type, source_id, points) VALUES (?, ?, ?, ?)',
                [userId, 'forum_reply', replyId.toString(), pointsAwarded],
                (err) => {
                    if (err) console.error('Erro ao adicionar pontos:', err);
                }
            );

            res.json({ success: true, replyId, pointsAwarded });
        }
    );
});

// Endpoint 8: Listar Tópicos
app.get('/api/forum/topics', async (req, res) => {
    try {
        const rows = await allAsync(`
            SELECT 
                ft.id,
                ft.user_id,
                u.nome as userName,
                ft.title,
                ft.content,
                ft.category,
                ft.created_at,
                COUNT(fr.id) as repliesCount
            FROM forum_topics ft
            JOIN users u ON ft.user_id = u.id
            LEFT JOIN forum_replies fr ON ft.id = fr.topic_id
            GROUP BY ft.id
            ORDER BY ft.created_at DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar tópicos:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar tópicos' });
    }
});

// Endpoint 9: Buscar Tópico com Respostas
app.get('/api/forum/topic/:topicId', async (req, res) => {
    try {
        const topicId = req.params.topicId;

        // Buscar tópico
        const topic = await getAsync(`
            SELECT 
                ft.id,
                ft.user_id,
                u.nome as userName,
                ft.title,
                ft.content,
                ft.category,
                ft.created_at
            FROM forum_topics ft
            JOIN users u ON ft.user_id = u.id
            WHERE ft.id = ?
        `, [topicId]);

        if (!topic) {
            return res.status(404).json({ success: false, message: 'Tópico não encontrado' });
        }

        // Buscar respostas
        const replies = await allAsync(`
            SELECT 
                fr.id,
                fr.user_id,
                u.nome as userName,
                fr.content,
                fr.created_at
            FROM forum_replies fr
            JOIN users u ON fr.user_id = u.id
            WHERE fr.topic_id = ?
            ORDER BY fr.created_at ASC
        `, [topicId]);

        res.json({
            success: true,
            topic,
            replies
        });
    } catch (error) {
        console.error('Erro ao buscar tópico:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar tópico' });
    }
});

// Inicializar schema e iniciar servidor somente após pronto
initializeDatabaseSchema()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
            if (useTurso) {
                console.log('💾 Banco de dados: Turso (remoto)');
            } else {
                console.log(`💾 Banco de dados: SQLite local em backend/db/modela_users.db`);
            }
            console.log('✨ Sistema de ranking e pontuação ativo!');
        });
    })
    .catch((err) => {
        console.error('❌ Falha ao inicializar schema do banco:', err);
        process.exit(1);
    });