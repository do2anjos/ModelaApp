const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados
const dbDir = path.join(__dirname, 'backend', 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'modela_users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar com SQLite:', err.message);
    } else {
        console.log('Conectado ao SQLite em:', dbPath);
    }
});

// Criar tabelas
db.serialize(() => {
    // Tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS users (
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
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        lesson_title TEXT NOT NULL,
        video_completed BOOLEAN DEFAULT 0,
        exercise_completed BOOLEAN DEFAULT 0,
        practical_completed BOOLEAN DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de pontuações do usuário
    db.run(`CREATE TABLE IF NOT EXISTS user_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score_type TEXT NOT NULL,  -- 'exercise', 'module', 'forum_topic', 'forum_reply'
        source_id TEXT NOT NULL,   -- lesson_id, module_id, topic_id
        points INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de tentativas de exercícios
    db.run(`CREATE TABLE IF NOT EXISTS exercise_attempts (
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

    // Tabela de tópicos do fórum
    db.run(`CREATE TABLE IF NOT EXISTS forum_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabela de respostas do fórum
    db.run(`CREATE TABLE IF NOT EXISTS forum_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES forum_topics (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Índices para performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_progress_module_lesson ON user_progress(user_id, module_id, lesson_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_scores_user ON user_scores(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user ON exercise_attempts(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_forum_topics_user ON forum_topics(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id)`);
});

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
        db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
            }
            if (row) {
                return res.status(400).json({ success: false, message: 'Email já cadastrado' });
            }

            // Verificar se matrícula já existe
            db.get('SELECT id FROM users WHERE matricula = ?', [matricula], (err, row) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                }
                if (row) {
                    return res.status(400).json({ success: false, message: 'Matrícula já cadastrada' });
                }

                // Gerar hash da senha e username
                bcrypt.hash(senha, 10, (err, senhaHash) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Erro ao processar senha' });
                    }

                    const username = generateUsername(nome);

                    // Inserir usuário
                    db.run(
                        'INSERT INTO users (nome, email, matricula, telefone, senha_hash, username) VALUES (?, ?, ?, ?, ?, ?)',
                        [nome, email, matricula, telefone, senhaHash, username],
                        function(err) {
                            if (err) {
                                return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
                            }

                            res.json({ 
                                success: true, 
                                message: 'Usuário cadastrado com sucesso!',
                                userId: this.lastID,
                                username: username
                            });
                        }
                    );
                });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
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

        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
            }
            if (!user) {
                return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            }

            bcrypt.compare(senha, user.senha_hash, (err, isValid) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro ao verificar senha' });
                }
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
            });
        });
    } catch (error) {
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
        db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
            }
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
            }

            // Gerar hash da nova senha
            bcrypt.hash(novaSenha, 10, (err, senhaHash) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro ao processar senha' });
                }

                // Atualizar senha
                db.run('UPDATE users SET senha_hash = ? WHERE email = ?', [senhaHash, email], function(err) {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Erro ao atualizar senha' });
                    }

                    res.json({ 
                        success: true, 
                        message: 'Senha redefinida com sucesso!' 
                    });
                });
            });
        });
    } catch (error) {
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

        // Calcular exercícios completos
        progressRows.forEach(row => {
            if (row.exercise_completed) {
                exercises.completed++;
            }
        });

        // Calcular módulos completos (todos os exercícios do módulo)
        const moduleProgress = {};
        progressRows.forEach(row => {
            if (!moduleProgress[row.module_id]) {
                moduleProgress[row.module_id] = { total: 0, completed: 0 };
            }
            moduleProgress[row.module_id].total++;
            if (row.exercise_completed) {
                moduleProgress[row.module_id].completed++;
            }
        });

        // Verificar módulos completos
        Object.keys(moduleProgress).forEach(moduleId => {
            const progress = moduleProgress[moduleId];
            if (progress.completed === progress.total && progress.total > 0) {
                modules.completed++;
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

        res.json({
            success: true,
            exercises,
            modules,
            certificates,
            currentModule
        });
    });
});

// Endpoint para salvar progresso
app.post('/api/user/:userId/progress', (req, res) => {
    const userId = req.params.userId;
    const { moduleId, lessonId, lessonTitle, videoCompleted, exerciseCompleted, practicalCompleted } = req.body;

    if (!moduleId || !lessonId || !lessonTitle) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
    }

    // Inserir ou atualizar progresso
    db.run(`
        INSERT OR REPLACE INTO user_progress 
        (user_id, module_id, lesson_id, lesson_title, video_completed, exercise_completed, practical_completed, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [userId, moduleId, lessonId, lessonTitle, videoCompleted || false, exerciseCompleted || false, practicalCompleted || false], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao salvar progresso' });
        }

        res.json({ success: true, message: 'Progresso salvo com sucesso' });
    });
});

// Endpoint para buscar progresso detalhado de um módulo
app.get('/api/user/:userId/module/:moduleId/progress', (req, res) => {
    const userId = req.params.userId;
    const moduleId = req.params.moduleId;

    db.all(`
        SELECT lesson_id, lesson_title, video_completed, exercise_completed, practical_completed
        FROM user_progress 
        WHERE user_id = ? AND module_id = ?
        ORDER BY lesson_id
    `, [userId, moduleId], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao buscar progresso do módulo' });
        }

        res.json({
            success: true,
            moduleId: parseInt(moduleId),
            lessons: rows
        });
    });
});

// Endpoint para atualizar dados do usuário
app.put('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const { nome, username } = req.body;

    if (!nome || !username) {
        return res.status(400).json({ success: false, message: 'Nome e username são obrigatórios' });
    }

    db.run('UPDATE users SET nome = ?, username = ? WHERE id = ?', [nome, username, userId], function(err) {
        if (err) {
            console.error('Erro ao atualizar usuário:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar usuário' });
        }

        res.json({ success: true, message: 'Usuário atualizado com sucesso' });
    });
});

// ==========================================================================
// ENDPOINTS DE PONTUAÇÃO E RANKING
// ==========================================================================

// Endpoint 1: Adicionar Pontos
app.post('/api/user/:userId/score', (req, res) => {
    const userId = req.params.userId;
    const { scoreType, sourceId, points } = req.body;

    if (!scoreType || !sourceId || !points) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios não fornecidos' });
    }

    db.run(
        'INSERT INTO user_scores (user_id, score_type, source_id, points) VALUES (?, ?, ?, ?)',
        [userId, scoreType, sourceId, points],
        function(err) {
            if (err) {
                console.error('Erro ao adicionar pontos:', err);
                return res.status(500).json({ success: false, message: 'Erro ao adicionar pontos' });
            }

            res.json({ success: true, message: 'Pontos adicionados com sucesso', pointsAdded: points });
        }
    );
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

            // Só pontua se for primeira tentativa e 100% correto
            if (isFirstAttempt && percentage === 100) {
                pointsAwarded = 10;
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

                    // Adicionar pontos se for primeira tentativa e 100%
                    if (pointsAwarded > 0) {
                        db.run(
                            'INSERT INTO user_scores (user_id, score_type, source_id, points) VALUES (?, ?, ?, ?)',
                            [userId, 'exercise', lessonId.toString(), pointsAwarded],
                            (err) => {
                                if (err) console.error('Erro ao adicionar pontos:', err);
                            }
                        );
                    }

                    res.json({
                        success: true,
                        isFirstAttempt,
                        pointsAwarded,
                        message: isFirstAttempt ? 'Tentativa registrada' : 'Tentativa adicional registrada'
                    });
                }
            );
        }
    );
});

// Endpoint 3: Buscar Pontuação Total do Usuário
app.get('/api/user/:userId/total-score', (req, res) => {
    const userId = req.params.userId;

    db.all(
        'SELECT score_type, SUM(points) as total FROM user_scores WHERE user_id = ? GROUP BY score_type',
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Erro ao buscar pontuação:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar pontuação' });
            }

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
        }
    );
});

// Endpoint 4: Ranking Geral
app.get('/api/ranking', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    db.all(`
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
    `, [limit], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar ranking:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar ranking' });
        }

        res.json(rows);
    });
});

// Endpoint 5: Ranking do Fórum
app.get('/api/ranking/forum', (req, res) => {
    db.all(`
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
    `, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar ranking do fórum:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar ranking do fórum' });
        }

        res.json(rows);
    });
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
app.get('/api/forum/topics', (req, res) => {
    db.all(`
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
    `, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar tópicos:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar tópicos' });
        }

        res.json(rows);
    });
});

// Endpoint 9: Buscar Tópico com Respostas
app.get('/api/forum/topic/:topicId', (req, res) => {
    const topicId = req.params.topicId;

    // Buscar tópico
    db.get(`
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
    `, [topicId], (err, topic) => {
        if (err) {
            console.error('Erro ao buscar tópico:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar tópico' });
        }

        if (!topic) {
            return res.status(404).json({ success: false, message: 'Tópico não encontrado' });
        }

        // Buscar respostas
        db.all(`
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
        `, [topicId], (err, replies) => {
            if (err) {
                console.error('Erro ao buscar respostas:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar respostas' });
            }

            res.json({
                success: true,
                topic,
                replies
            });
        });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Conectado ao SQLite em: ${dbPath}`);
    console.log('Sistema de ranking e pontuação ativo!');
});