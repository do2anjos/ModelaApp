/**
 * Sistema de Ranking - Primeira Tentativa
 * Implementa lógica de ranking baseada apenas na primeira tentativa de cada exercício
 */

class RankingSystem {
    constructor() {
        this.currentUserId = "user-1"; // Simulado - em produção viria do sistema de autenticação
        this.apiBase = "/api";
    }

    /**
     * Registra uma tentativa de exercício
     * @param {string} exerciseId - ID do exercício
     * @param {number} score - Pontuação obtida (0-10)
     * @param {object} attemptData - Dados adicionais da tentativa
     */
    async registerAttempt(exerciseId, score, attemptData = {}) {
        try {
            // Verificar se é a primeira tentativa
            const isFirstAttempt = await this.isFirstAttempt(exerciseId);

            if (isFirstAttempt) {
                // Registrar tentativa no banco de dados
                await this.saveAttempt(exerciseId, score, attemptData);

                // Atualizar ranking se for primeira tentativa
                await this.updateRanking(exerciseId, score);

                // Atualizar dados do usuário
                await this.updateUserStats(exerciseId, score);

                return {
                    success: true,
                    isFirstAttempt: true,
                    message: "Primeira tentativa registrada no ranking!"
                };
            } else {
                // Salvar tentativa mas não alterar ranking
                await this.saveAttempt(exerciseId, score, attemptData);

                return {
                    success: true,
                    isFirstAttempt: false,
                    message: "Tentativa salva, mas ranking não alterado (apenas primeira tentativa conta)"
                };
            }
        } catch (error) {
            console.error("Erro ao registrar tentativa:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica se é a primeira tentativa do usuário para um exercício
     * @param {string} exerciseId - ID do exercício
     * @returns {boolean}
     */
    async isFirstAttempt(exerciseId) {
        try {
            const response = await fetch(`${this.apiBase}/submissions.json`);
            const data = await response.json();

            const firstAttempts = data.attempts.filter(attempt =>
                attempt.userId === this.currentUserId &&
                attempt.exerciseId === exerciseId &&
                attempt.isFirstAttempt === true
            );

            return firstAttempts.length === 0;
        } catch (error) {
            console.error("Erro ao verificar primeira tentativa:", error);
            return true; // Em caso de erro, considerar como primeira tentativa
        }
    }

    /**
     * Salva tentativa no banco de dados
     * @param {string} exerciseId - ID do exercício
     * @param {number} score - Pontuação
     * @param {object} attemptData - Dados adicionais
     */
    async saveAttempt(exerciseId, score, attemptData) {
        const attempt = {
            id: `attempt-${Date.now()}`,
            userId: this.currentUserId,
            exerciseId: exerciseId,
            score: score,
            submittedAt: new Date().toISOString(),
            isFirstAttempt: await this.isFirstAttempt(exerciseId),
            duration: attemptData.duration || 0,
            diagramData: attemptData.diagramData || null
        };

        // Em um sistema real, isso seria uma chamada para API
        // Por agora, armazenamos no localStorage como exemplo
        const attempts = JSON.parse(localStorage.getItem('attempts') || '[]');
        attempts.push(attempt);
        localStorage.setItem('attempts', JSON.stringify(attempts));
    }

    /**
     * Atualiza ranking do usuário
     * @param {string} exerciseId - ID do exercício
     * @param {number} score - Pontuação da primeira tentativa
     */
    async updateRanking(exerciseId, score) {
        try {
            const response = await fetch(`${this.apiBase}/exercises.json`);
            const data = await response.json();

            const exercise = data.exercises.find(ex => ex.id === exerciseId);
            const points = exercise ? exercise.points : 10;

            // Calcular XP baseado na pontuação (0-10) e pontos do exercício
            const xpGained = Math.round((score / 10) * points);

            // Atualizar dados do usuário
            const users = data.users;
            const currentUser = users.find(u => u.id === this.currentUserId);

            if (currentUser) {
                currentUser.xp += xpGained;

                // Verificar se ganhou algum badge
                currentUser.badges = this.checkNewBadges(currentUser, exerciseId);

                // Atualizar nível se necessário
                currentUser.level = this.calculateLevel(currentUser.xp);
            }

            // Recalcular posições do ranking
            await this.recalculateLeaderboard();

            // Em sistema real, salvaria no banco
            localStorage.setItem('users', JSON.stringify(users));

            return xpGained;
        } catch (error) {
            console.error("Erro ao atualizar ranking:", error);
            return 0;
        }
    }

    /**
     * Atualiza estatísticas do usuário
     * @param {string} exerciseId - ID do exercício
     * @param {number} score - Pontuação
     */
    async updateUserStats(exerciseId, score) {
        try {
            const response = await fetch(`${this.apiBase}/exercises.json`);
            const data = await response.json();

            const users = data.users;
            const currentUser = users.find(u => u.id === this.currentUserId);

            if (currentUser) {
                currentUser.lastActivity = new Date().toISOString();

                // Atualizar streak (dias consecutivos)
                const today = new Date().toDateString();
                const lastActivity = new Date(currentUser.lastActivity).toDateString();

                if (today !== lastActivity) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (lastActivity === yesterday.toDateString()) {
                        currentUser.streak += 1;
                    } else {
                        currentUser.streak = 1;
                    }
                }
            }

            localStorage.setItem('users', JSON.stringify(users));
        } catch (error) {
            console.error("Erro ao atualizar estatísticas:", error);
        }
    }

    /**
     * Verifica se usuário ganhou novos badges
     * @param {object} user - Dados do usuário
     * @param {string} exerciseId - ID do exercício completado
     * @returns {array} - Lista atualizada de badges
     */
    checkNewBadges(user, exerciseId) {
        const badges = [...user.badges];

        // Badge por completar primeira atividade
        if (!badges.includes("primeiro-exercicio") && user.xp >= 10) {
            badges.push("primeiro-exercicio");
        }

        // Badge por dominar relacionamentos Include
        if (exerciseId === "include-part1" && !badges.includes("include-master")) {
            badges.push("include-master");
        }

        // Badge por dominar relacionamentos Extend
        if (exerciseId === "extend-part2" && !badges.includes("extend-specialist")) {
            badges.push("extend-specialist");
        }

        // Badge por completar diagrama completo
        if (exerciseId === "complete-usecase-part3" && !badges.includes("usecase-champion")) {
            badges.push("usecase-champion");
        }

        return badges;
    }

    /**
     * Calcula nível baseado no XP
     * @param {number} xp - Pontos de experiência
     * @returns {string} - Nível do usuário
     */
    calculateLevel(xp) {
        if (xp >= 2000) return 'Expert';
        if (xp >= 1000) return 'Avançado';
        if (xp >= 500) return 'Intermediário';
        return 'Iniciante';
    }

    /**
     * Recalcula posições do ranking geral
     */
    async recalculateLeaderboard() {
        try {
            const response = await fetch(`${this.apiBase}/exercises.json`);
            const data = await response.json();

            const users = data.users;

            // Ordenar por XP
            users.sort((a, b) => b.xp - a.xp);

            // Atualizar posições
            users.forEach((user, index) => {
                user.rankingPosition = index + 1;
            });

            localStorage.setItem('users', JSON.stringify(users));
        } catch (error) {
            console.error("Erro ao recalcular ranking:", error);
        }
    }

    /**
     * Obtém dados do ranking atualizados
     * @returns {object} - Dados do ranking
     */
    async getCurrentRanking() {
        try {
            const response = await fetch(`${this.apiBase}/users.json`);
            const data = await response.json();

            return {
                currentUser: data.users.find(u => u.id === this.currentUserId),
                leaderboard: data.users
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, 10)
                    .map((user, index) => ({
                        position: index + 1,
                        name: user.name,
                        xp: user.xp,
                        level: user.level,
                        avatar: user.avatar
                    }))
            };
        } catch (error) {
            console.error("Erro ao obter ranking:", error);
            return null;
        }
    }

    /**
     * Obtém histórico de tentativas do usuário
     * @param {string} exerciseId - ID do exercício (opcional)
     * @returns {array} - Lista de tentativas
     */
    async getUserAttempts(exerciseId = null) {
        try {
            // Em sistema real, viria do banco de dados
            const attempts = JSON.parse(localStorage.getItem('attempts') || '[]');

            if (exerciseId) {
                return attempts.filter(a => a.userId === this.currentUserId && a.exerciseId === exerciseId);
            }

            return attempts.filter(a => a.userId === this.currentUserId);
        } catch (error) {
            console.error("Erro ao obter tentativas:", error);
            return [];
        }
    }

    /**
     * Obtém estatísticas detalhadas do usuário
     * @returns {object} - Estatísticas do usuário
     */
    async getUserStats() {
        try {
            const attempts = await this.getUserAttempts();
            const currentRanking = await this.getCurrentRanking();

            return {
                totalAttempts: attempts.length,
                averageScore: attempts.length > 0 ?
                    attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : 0,
                bestScore: attempts.length > 0 ?
                    Math.max(...attempts.map(a => a.score)) : 0,
                exercisesCompleted: new Set(attempts.map(a => a.exerciseId)).size,
                currentStreak: currentRanking?.currentUser?.streak || 0,
                rankingPosition: currentRanking?.currentUser?.rankingPosition || 0
            };
        } catch (error) {
            console.error("Erro ao obter estatísticas:", error);
            return null;
        }
    }
}

// Exportar instância global
window.RankingSystem = new RankingSystem();
