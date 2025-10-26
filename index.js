const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Define a porta usando a variável de ambiente da Render (process.env.PORT)
// ou usa a porta 3001 como padrão se estiver rodando no seu computador.
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados
const dbDir = path.join(__dirname, 'backend', 'db');
const dbPath = path.join(dbDir, 'modela_users.db');

// Criar diretório se não existir
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

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
        lesson_completed BOOLEAN DEFAULT 0,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, module_id, lesson_id)
    )`);

    // Índices para performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_progress ON user_progress(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_module ON user_progress(user_id, module_id)`);
});

// Função para gerar username
function generateUsername(nome) {
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
        const primeiro = palavras[0].toLowerCase();
        const ultimo = palavras[palavras.length - 1].toLowerCase();
        return `${primeiro}.${ultimo}`;
    }
    return nome.toLowerCase().replace(/\s+/g, '.');
}

// Endpoint de cadastro
app.post('/api/cadastro', async (req, res) => {
    const { nome, email, matricula, telefone, senha } = req.body;

    if (!nome || !email || !matricula || !senha) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos os campos obrigatórios devem ser preenchidos' 
        });
    }

    try {
        const senha_hash = await bcrypt.hash(senha, 10);
        const username = generateUsername(nome);

        db.run(
            `INSERT INTO users (nome, email, matricula, telefone, senha_hash, username) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, email, matricula, telefone, senha_hash, username],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Email ou matrícula já cadastrados' 
                        });
                    }
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro interno do servidor' 
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Usuário cadastrado com sucesso!',
                    userId: this.lastID,
                    username: username
                });
            }
        );
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Endpoint de login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email e senha são obrigatórios' 
        });
    }

    db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno do servidor' 
                });
            }

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Email ou senha incorretos' 
                });
            }

            try {
                const senhaValida = await bcrypt.compare(senha, user.senha_hash);
                if (!senhaValida) {
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Email ou senha incorretos' 
                    });
                }

                // Retorna dados do usuário (sem a senha)
                const { senha_hash, ...userData } = user;
                res.json({ 
                    success: true, 
                    message: 'Login realizado com sucesso!',
                    user: userData
                });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno do servidor' 
                });
            }
        }
    );
});

// Endpoint de redefinir senha
app.post('/api/redefinir', async (req, res) => {
    const { email, nova_senha } = req.body;

    if (!email || !nova_senha) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email e nova senha são obrigatórios' 
        });
    }

    try {
        const senha_hash = await bcrypt.hash(nova_senha, 10);

        db.run(
            'UPDATE users SET senha_hash = ? WHERE email = ?',
            [senha_hash, email],
            function(err) {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro interno do servidor' 
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'Email não encontrado' 
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Senha redefinida com sucesso!' 
                });
            }
        );
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Endpoint para dashboard do usuário
app.get('/api/user/:userId/dashboard', (req, res) => {
    const userId = req.params.userId;

    // Busca progresso agregado do usuário
    db.all(`
        SELECT 
            module_id,
            lesson_id,
            video_completed,
            exercise_completed,
            practical_completed,
            lesson_completed
        FROM user_progress 
        WHERE user_id = ?
    `, [userId], (err, progress) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar progresso' 
            });
        }

        // Calcula estatísticas
        const totalExercises = progress.reduce((sum, p) => sum + (p.exercise_completed ? 1 : 0), 0);
        const completedModules = progress.filter(p => p.lesson_completed).length;
        const certificates = completedModules >= 4 ? 1 : 0;
        
        // Progresso do módulo 1 (UML)
        const module1Progress = progress.filter(p => p.module_id === 1);
        const module1Completed = module1Progress.filter(p => p.lesson_completed).length;
        const module1ProgressPercent = Math.round((module1Completed / 10) * 100);

        // Última aula acessada
        const lastLesson = progress
            .filter(p => p.video_completed || p.exercise_completed || p.practical_completed)
            .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];

        res.json({
            success: true,
            data: {
                totalExercises,
                completedModules,
                certificates,
                module1Progress: module1ProgressPercent,
                lastLesson: lastLesson ? lastLesson.lesson_title : null
            }
        });
    });
});

// Endpoint para salvar progresso
app.post('/api/user/:userId/progress', (req, res) => {
    const userId = req.params.userId;
    const { moduleId, lessonId, lessonTitle, videoCompleted, exerciseCompleted, practicalCompleted } = req.body;

    if (!moduleId || !lessonId || !lessonTitle) {
        return res.status(400).json({ 
            success: false, 
            message: 'Dados obrigatórios não fornecidos' 
        });
    }

    // Verifica se a aula está completa
    const lessonCompleted = videoCompleted && exerciseCompleted && practicalCompleted;

    db.run(`
        INSERT OR REPLACE INTO user_progress 
        (user_id, module_id, lesson_id, lesson_title, video_completed, exercise_completed, practical_completed, lesson_completed, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        userId, moduleId, lessonId, lessonTitle, 
        videoCompleted ? 1 : 0, 
        exerciseCompleted ? 1 : 0, 
        practicalCompleted ? 1 : 0,
        lessonCompleted ? 1 : 0,
        lessonCompleted ? new Date().toISOString() : null
    ], function(err) {
        if (err) {
            console.error('Erro ao salvar progresso:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao salvar progresso' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Progresso salvo com sucesso' 
        });
    });
});

// Endpoint para buscar progresso detalhado de um módulo
app.get('/api/user/:userId/module/:moduleId/progress', (req, res) => {
    const userId = req.params.userId;
    const moduleId = req.params.moduleId;

    db.all(`
        SELECT 
            lesson_id,
            lesson_title,
            video_completed,
            exercise_completed,
            practical_completed,
            lesson_completed
        FROM user_progress 
        WHERE user_id = ? AND module_id = ?
        ORDER BY lesson_id
    `, [userId, moduleId], (err, progress) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar progresso do módulo' 
            });
        }

        res.json({
            success: true,
            data: progress
        });
    });
});

// Endpoint para atualizar dados do usuário
app.put('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const { nome, username } = req.body;

    if (!nome || !username) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nome e username são obrigatórios' 
        });
    }

    db.run(
        'UPDATE users SET nome = ?, username = ? WHERE id = ?',
        [nome, username, userId],
        function(err) {
            if (err) {
                console.error('Erro ao atualizar usuário:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar usuário' 
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuário não encontrado' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Usuário atualizado com sucesso' 
            });
        }
    );
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Conectado ao SQLite em: ${dbPath}`);
});