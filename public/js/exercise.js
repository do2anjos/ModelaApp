document.addEventListener('DOMContentLoaded', () => {
    // Adiciona CSS para navegação por passos
    const style = document.createElement('style');
    style.textContent = `
        /* Usa o mesmo estilo step-nav da página de aulas */
        .exercise-feedback .step-nav {
            display: flex;
            gap: .5rem;
            align-items: center;
            justify-content: flex-end;
            margin: .25rem 0 1rem;
        }

        .exercise-feedback .step-counter {
            font-weight: 600;
            color: var(--foreground);
            min-width: 3rem;
            text-align: center;
        }

        .exercise-feedback .step-prev:disabled,
        .exercise-feedback .step-next:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .questions-container {
            min-height: 200px;
            position: relative;
        }

        /* Container das perguntas do formulário */
        .questions-form-container {
            min-height: 300px;
            position: relative;
        }

        .questions-form-container .exercise-question {
            transition: all 0.3s ease;
            animation: slideInQuestion 0.3s ease-out;
        }

        .question-feedback {
            padding: 1.5rem;
            border-radius: var(--radius);
            border-left: 4px solid;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
            animation: slideInQuestion 0.3s ease-out;
        }

        @keyframes slideInQuestion {
            from { 
                opacity: 0; 
                transform: translateX(20px); 
            }
            to { 
                opacity: 1; 
                transform: translateX(0); 
            }
        }

        .question-feedback h4 {
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            font-weight: 600;
        }

        .question-feedback .result {
            font-size: 1rem;
            font-weight: 500;
            margin: 0.5rem 0;
        }

        .question-feedback .explanation {
            font-size: 0.95rem;
            line-height: 1.6;
            color: var(--muted-foreground);
            margin-top: 0.75rem;
        }

        .question-feedback.correct {
            background-color: hsl(142 76% 36% / 0.05);
            border-left-color: hsl(142 76% 36%);
        }

        .question-feedback.incorrect {
            background-color: hsl(0 84% 60% / 0.05);
            border-left-color: hsl(0 84% 60%);
        }

        .question-feedback.neutral {
            background-color: hsl(45 93% 47% / 0.05);
            border-left-color: hsl(45 93% 47%);
        }

        .feedback-header {
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            font-weight: 600;
            margin-bottom: 1rem;
            text-align: center;
        }

        .feedback-header.success {
            background-color: hsl(142 76% 36% / 0.1);
            color: hsl(142 76% 36%);
            border: 1px solid hsl(142 76% 36% / 0.2);
        }

        .feedback-header.partial {
            background-color: hsl(45 93% 47% / 0.1);
            color: hsl(45 93% 47%);
            border: 1px solid hsl(45 93% 47% / 0.2);
        }

        .feedback-header.error {
            background-color: hsl(0 84% 60% / 0.1);
            color: hsl(0 84% 60%);
            border: 1px solid hsl(0 84% 60% / 0.2);
        }

        /* Responsividade mantém o padrão da página de aulas */
        @media (max-width: 768px) {
            .exercise-feedback .step-nav {
                justify-content: center;
                gap: 1rem;
            }

            .questions-container {
                min-height: 150px;
            }

            .questions-form-container {
                min-height: 250px;
            }

            .question-feedback {
                padding: 1rem;
            }
        }
    `;
    document.head.appendChild(style);

    const exerciseContent = document.getElementById('exercise-content');
    if (!exerciseContent) return;

    const submitBtn = exerciseContent.querySelector('#submit-exercise');
    const tryAgainBtn = exerciseContent.querySelector('#try-again-btn');
    const formSlide = exerciseContent.querySelector('#exercise-form-slide');
    const feedbackSlide = exerciseContent.querySelector('#exercise-feedback-slide');
    const feedbackContainer = exerciseContent.querySelector('#exercise-feedback');
    const form = exerciseContent.querySelector('#exercise-form');
    const tryAgainContainer = feedbackSlide.querySelector('.exercise-actions');

    // Retorna o título atual da aula exibida no cabeçalho
    function getCurrentLessonTitle() {
        try {
            const header = document.getElementById('lesson-title-header');
            const title = header ? header.textContent.trim() : '';
            console.log('🔍 getCurrentLessonTitle:', title);
            return title;
        } catch (e) {
            console.error('❌ Erro em getCurrentLessonTitle:', e);
            return '';
        }
    }

    // Gabaritos por aula (fallback = Introdução)
    function getAnswersForCurrentLesson() {
        const title = getCurrentLessonTitle();
        if (title === 'O que é um Diagrama de Classes') {
            // Gabarito para o formulário dinâmico da Aula 2 (injetado em aulas.html)
            return { q1: 'b', q2: 'a', q3: 'c', q4: 'a' };
        }
        // Introdução à UML - Unified Modeling Language - formulário padrão inicial
        return { q1: 'b', q2: 'c', q3: 'd', q4: 'a' };
    }

    // Explicações adicionais para feedback detalhado (Introdução)
    const explanationsIntro = {
        q1: {
            correct: 'Correto. A UML fornece uma linguagem visual padrão para modelar sistemas de software, permitindo que desenvolvedores, analistas e stakeholders visualizem, especifiquem, construam e documentem os artefatos de um sistema de forma unificada.',
            incorrect: {
                a: 'Incorreto. A UML não é usada para escrever código-fonte final, mas sim para modelar e visualizar sistemas antes da implementação. O código é escrito em linguagens de programação específicas.',
                b: '',
                c: 'Incorreto. A UML não é uma ferramenta de gerenciamento de projetos para cronogramas e custos. Ela é especificamente uma linguagem de modelagem de software.',
                d: 'Incorreto. A UML não é usada para testar segurança de bancos de dados. Ela é uma linguagem de modelagem que ajuda a visualizar e documentar sistemas de software.'
            }
        },
        q2: {
            correct: 'Correto. A UML é uma linguagem gráfica que facilita a comunicação entre desenvolvedores, analistas e clientes do projeto, conforme afirmado no próprio enunciado.',
            incorrect: {
                a: 'Incorreto. A UML não serve apenas para documentar sistemas já implementados, mas também para projetar e visualizar sistemas antes da implementação.',
                b: 'Incorreto. A UML não é usada exclusivamente para linguagens orientadas a objetos, embora seja mais comum nesse contexto.',
                d: 'Incorreto. A UML é uma linguagem visual/gráfica, não textual.'
            }
        },
        q3: {
            correct: 'Correto. Os três itens básicos de uma classe em UML são: Nome (identificação da classe), Atributos (características/propriedades) e Métodos (comportamentos/operações).',
            incorrect: {
                a: 'Incorreto. Entidade e eventos não são os três itens padrão de um diagrama de classes UML.',
                b: 'Incorreto. Objeto e classificação não são os três itens padrão de um diagrama de classes UML.',
                c: 'Incorreto. Entidade não é um dos três itens padrão de um diagrama de classes UML.',
                e: 'Incorreto. Objeto e eventos não são os três itens padrão de um diagrama de classes UML.'
            }
        },
        q4: {
            correct: 'Correto. O diagrama de estrutura composta da UML 2 é usado para modelar a colaboração entre partes internas de uma classe ou componente, mostrando como essas partes trabalham juntas.',
            incorrect: {
                b: 'Incorreto. O diagrama de atividades é usado para representar o fluxo de atividades, não o diagrama de estrutura composta.',
                c: 'Incorreto. O diagrama de estrutura composta não substitui o diagrama de classes, são diagramas complementares com propósitos diferentes.',
                d: 'Incorreto. O diagrama de estrutura composta não serve exclusivamente para modelagem de requisitos.',
                e: 'Incorreto. O diagrama de estrutura composta não é responsável pela modelagem de comportamento de atores externos.'
            }
        }
    };

    // Explicações para a Aula 2: O que é um Diagrama de Classes
    const explanationsClasses = {
        q1: { correct: 'Modela a estrutura estática: classes, atributos, operações e relacionamentos.' },
        q2: { correct: 'Ordem: Nome da Classe, Atributos, Operações (Métodos).' },
        q3: { correct: 'Atributo é uma propriedade/dado que objetos da classe possuem.' },
        q4: { correct: 'Diagrama de Classes é um diagrama estrutural (estático).' }
    };

    function getExplanationsForCurrentLesson() {
        return getCurrentLessonTitle() === 'O que é um Diagrama de Classes' ? explanationsClasses : explanationsIntro;
    }

    // Função global chamada por aulas.html ao trocar para a aba Exercício
    // Injeta as questões específicas da aula "O que é um Diagrama de Classes" com navegação por passos
    try {
        window.renderClassesQuestions = function() {
            const title = getCurrentLessonTitle();
            if (title !== 'O que é um Diagrama de Classes') return;
            const formEl = document.getElementById('exercise-form');
            if (!formEl) return;
            // Evita reinjetar se já estiver correto
            if (formEl.querySelector('legend') && formEl.innerHTML.includes('Diagrama de Classes')) return;
            
            formEl.innerHTML = `
                <!-- Navegação por passos das perguntas -->
                <div class="step-nav" aria-label="Navegação entre questões">
                    <button class="button step-prev" id="prev-question-form-btn" aria-label="Questão anterior" disabled>◀</button>
                    <span class="step-counter" aria-live="polite">
                        <strong id="current-question-form">1</strong> / <span class="total-questions-form">4</span>
                    </span>
                    <button class="button step-next" id="next-question-form-btn" aria-label="Próxima questão">▶</button>
                </div>
                
                <!-- Container das questões (uma por vez) -->
                <div class="questions-form-container">
                    <fieldset class="exercise-question" data-question="1" style="display: block;">
                        <legend>1. (TRT 1ª REGIÃO - FCC - 2023) Qual é o principal objetivo de um Diagrama de Classes no contexto da UML (Linguagem de Modelagem Unificada)?</legend>
                        <div class="radio-group">
                            <label><input type="radio" name="q1" value="a" required> a) Descrever a sequência temporal de mensagens trocadas entre objetos.</label>
                            <label><input type="radio" name="q1" value="b" required> b) Modelar a estrutura estática de um sistema, mostrando suas classes, atributos, operações e relacionamentos.</label>
                            <label><input type="radio" name="q1" value="c" required> c) Apresentar as funcionalidades do sistema do ponto de vista do usuário (ator).</label>
                            <label><input type="radio" name="q1" value="d" required> d) Detalhar o fluxo de atividades e decisões de um processo de negócio.</label>
                        </div>
                    </fieldset>
                    <fieldset class="exercise-question" data-question="2" style="display: none;">
                        <legend>2. (Prefeitura de Recife - IBFC - 2024) Em um Diagrama de Classes, a representação padrão de uma classe é um retângulo dividido em três compartimentos. Na ordem correta, de cima para baixo, esses compartimentos representam:</legend>
                        <div class="radio-group">
                            <label><input type="radio" name="q2" value="a" required> a) Nome da Classe, Atributos, Operações (Métodos).</label>
                            <label><input type="radio" name="q2" value="b" required> b) Nome da Classe, Operações (Métodos), Atributos.</label>
                            <label><input type="radio" name="q2" value="c" required> c) Nome da Tabela, Chaves Primárias, Chaves Estrangeiras.</label>
                            <label><input type="radio" name="q2" value="d" required> d) Nome do Objeto, Estados, Eventos.</label>
                        </div>
                    </fieldset>
                    <fieldset class="exercise-question" data-question="3" style="display: none;">
                        <legend>3. (EBSERH - VUNESP - 2022) Considerando os elementos fundamentais de uma classe na UML, o que um "atributo" define?</legend>
                        <div class="radio-group">
                            <label><input type="radio" name="q3" value="a" required> a) Uma ação, função ou comportamento que a classe pode executar.</label>
                            <label><input type="radio" name="q3" value="b" required> b) O nome único que identifica a classe no diagrama.</label>
                            <label><input type="radio" name="q3" value="c" required> c) Uma propriedade ou característica de dados que os objetos daquela classe irão possuir.</label>
                            <label><input type="radio" name="q3" value="d" required> d) O relacionamento de herança entre a classe e sua superclasse.</label>
                        </div>
                    </fieldset>
                    <fieldset class="exercise-question" data-question="4" style="display: none;">
                        <legend>4. (Petrobras - CESPE/CEBRASPE - 2023) Os diagramas da UML são divididos em duas categorias principais. O Diagrama de Classes é classificado como um diagrama:</legend>
                        <div class="radio-group">
                            <label><input type="radio" name="q4" value="a" required> a) Estrutural (ou Estático).</label>
                            <label><input type="radio" name="q4" value="b" required> b) Comportamental (ou Dinâmico).</label>
                            <label><input type="radio" name="q4" value="c" required> c) De Interação.</label>
                            <label><input type="radio" name="q4" value="d" required> d) De Implantação.</label>
                        </div>
                    </fieldset>
                </div>
                
                <div class="exercise-actions">
                    <button type="button" id="submit-exercise" class="button button-primary">Verificar Respostas</button>
                </div>
            `;
            
            // Inicializa navegação das perguntas
            initializeQuestionsNavigation();
        };
    } catch (e) { /* no-op */ }

    // Garante que as questões da aula de Classes sejam injetadas quando a aba Exercício ativar
    function ensureClassesQuestionsInjected() {
        if (getCurrentLessonTitle() !== 'O que é um Diagrama de Classes') return;
        const formEl = document.getElementById('exercise-form');
        if (!formEl) return;
        const hasQ1 = formEl.querySelector('input[name="q1"]');
        const legendText = (formEl.querySelector('legend') || {}).textContent || '';
        if (!hasQ1 || !legendText.includes('Diagrama de Classes')) {
            if (typeof window.renderClassesQuestions === 'function') {
                window.renderClassesQuestions();
            }
        }
    }

    // Função para registrar tentativa de exercício no backend
    async function registerExerciseAttempt(lessonTitle, score, total) {
        console.log('🎯 registerExerciseAttempt chamada:', { lessonTitle, score, total });
        const userData = localStorage.getItem('modela_user');
        if (!userData) {
            console.error('❌ Usuário não encontrado no localStorage');
            return null;
        }
        
        const user = JSON.parse(userData);
        const percentage = Math.round((score / total) * 100);
        console.log('📊 Cálculo:', { score, total, percentage });
        
        // Buscar lesson_id do LESSON_MAPPING (definido em aulas.html)
        const mapping = window.LESSON_MAPPING ? window.LESSON_MAPPING[lessonTitle] : null;
        if (!mapping) {
            console.warn('❌ LESSON_MAPPING não encontrado para:', lessonTitle);
            return null;
        }
        
        console.log('🗺️ Mapping encontrado:', mapping);
        
        try {
            console.log('💾 ========================================');
            console.log('💾 REGISTRANDO TENTATIVA DE EXERCÍCIO');
            console.log('💾 POST /api/user/' + user.id + '/exercise-attempt');
            console.log('💾 Payload:', JSON.stringify({
                lessonId: mapping.lessonId,
                lessonTitle: lessonTitle,
                score: score,
                totalQuestions: total,
                percentage: percentage
            }, null, 2));
            console.log('💾 ========================================');
            
            const reqId = 'exercise-attempt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
            console.log('[EXERCISE] ▶️ attempt', { reqId, userId: user.id, lessonId, lessonTitle });
            console.time(`[EXERCISE] tempo ${reqId}`);
            const response = await (window.apiFetch ? window.apiFetch(`/api/user/${user.id}/exercise-attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Request-Id': reqId },
                body: JSON.stringify({
                    lessonId: mapping.lessonId,
                    lessonTitle: lessonTitle,
                    score: score,
                    totalQuestions: total,
                    percentage: percentage
                })
            }) : fetch(`/api/user/${user.id}/exercise-attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Request-Id': reqId },
                body: JSON.stringify({
                    lessonId: mapping.lessonId,
                    lessonTitle: lessonTitle,
                    score: score,
                    totalQuestions: total,
                    percentage: percentage
                })
            }));
            console.timeEnd(`[EXERCISE] tempo ${reqId}`);
            console.log('[EXERCISE] ◀️ attempt response', { reqId, status: response.status, ok: response.ok });
            
            const result = await response.json();
            console.log('📡 Resposta do backend:', result);
            
            if (result.success) {
                console.log('✅ ========================================');
                console.log('✅ TENTATIVA REGISTRADA COM SUCESSO!');
                console.log('✅ Pontos:', result.pointsAwarded);
                console.log('✅ Primeira tentativa:', result.isFirstAttempt);
                console.log('✅ ========================================');
            }
            
            // Armazena resultado globalmente para uso no feedback
            window.exerciseAttemptResult = result;
            
            // Mostrar feedback de pontos (sempre na primeira tentativa)
            if (result.isFirstAttempt) {
                console.log('🎉 Primeira tentativa! Mostrando pontos:', result.pointsAwarded);
                showPointsNotification(result.pointsAwarded, result.percentage);
            } else {
                console.log('🔄 Não é primeira tentativa, pontos não serão mostrados');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao registrar tentativa:', error);
            return null;
        }
    }

    // Função para mostrar notificação de pontos
    function showPointsNotification(points, percentage) {
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        
        // Verificação de segurança para evitar "undefined"
        const safePoints = points || 0;
        const safePercentage = percentage || 0;
        
        if (safePoints === 0) {
            notification.innerHTML = `0 pontos (${safePercentage}% na 1ª tentativa) 📊`;
        } else if (safePercentage === 100) {
            notification.innerHTML = `+${safePoints} pontos! Perfeito! 🎉`;
        } else {
            notification.innerHTML = `+${safePoints} pontos! (${safePercentage}% na 1ª tentativa) 📊`;
        }
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Variáveis para controle da navegação do feedback
    let currentQuestionIndex = 0;
    let totalQuestionsCount = 0;

    // Variáveis para controle da navegação das perguntas do formulário
    let currentFormQuestionIndex = 0;
    let totalFormQuestionsCount = 0;

    // Função para navegar entre perguntas do formulário
    function navigateFormQuestion(direction) {
        const questions = document.querySelectorAll('.exercise-question[data-question]');
        if (!questions.length) return;

        // Esconde pergunta atual
        questions[currentFormQuestionIndex].style.display = 'none';

        // Calcula nova posição
        if (direction === 'next') {
            currentFormQuestionIndex = Math.min(currentFormQuestionIndex + 1, questions.length - 1);
        } else if (direction === 'prev') {
            currentFormQuestionIndex = Math.max(currentFormQuestionIndex - 1, 0);
        }

        // Mostra nova pergunta
        questions[currentFormQuestionIndex].style.display = 'block';

        // Atualiza controles
        updateFormNavigation();
    }

    // Atualiza estado dos botões de navegação do formulário
    function updateFormNavigation() {
        const prevBtn = document.getElementById('prev-question-form-btn');
        const nextBtn = document.getElementById('next-question-form-btn');
        const currentQuestionSpan = document.getElementById('current-question-form');

        if (prevBtn) {
            prevBtn.disabled = currentFormQuestionIndex === 0;
            prevBtn.setAttribute('aria-label', currentFormQuestionIndex === 0 ? 'Primeira questão' : 'Questão anterior');
        }
        if (nextBtn) {
            nextBtn.disabled = currentFormQuestionIndex === totalFormQuestionsCount - 1;
            nextBtn.setAttribute('aria-label', currentFormQuestionIndex === totalFormQuestionsCount - 1 ? 'Última questão' : 'Próxima questão');
        }
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = currentFormQuestionIndex + 1;
        }
    }

    // Inicializa navegação das perguntas do formulário
    function initializeQuestionsNavigation() {
        const questions = document.querySelectorAll('.exercise-question[data-question]');
        currentFormQuestionIndex = 0;
        totalFormQuestionsCount = questions.length;

        // Adiciona event listeners aos botões
        const prevBtn = document.getElementById('prev-question-form-btn');
        const nextBtn = document.getElementById('next-question-form-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigateFormQuestion('prev'));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => navigateFormQuestion('next'));
        }

        // Atalhos de teclado para navegação das perguntas
        const handleFormKeydown = function(e) {
            const formVisible = document.querySelector('.questions-form-container');
            if (!formVisible) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateFormQuestion('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateFormQuestion('next');
            }
        };

        // Remove listener anterior se existir
        document.removeEventListener('keydown', handleFormKeydown);
        document.addEventListener('keydown', handleFormKeydown);

        // Atualiza estado inicial
        updateFormNavigation();
    }

    // Função para navegar entre questões do feedback
    function navigateFeedbackQuestion(direction) {
        const questions = document.querySelectorAll('.question-feedback[data-question]');
        if (!questions.length) return;

        // Esconde questão atual
        questions[currentQuestionIndex].style.display = 'none';

        // Calcula nova posição
        if (direction === 'next') {
            currentQuestionIndex = Math.min(currentQuestionIndex + 1, questions.length - 1);
        } else if (direction === 'prev') {
            currentQuestionIndex = Math.max(currentQuestionIndex - 1, 0);
        }

        // Mostra nova questão
        questions[currentQuestionIndex].style.display = 'block';

        // Atualiza controles
        updateFeedbackNavigation();
    }

    // Atualiza estado dos botões de navegação
    function updateFeedbackNavigation() {
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');
        const currentQuestionSpan = document.getElementById('current-question');

        if (prevBtn) {
            prevBtn.disabled = currentQuestionIndex === 0;
            prevBtn.setAttribute('aria-label', currentQuestionIndex === 0 ? 'Primeira questão' : 'Questão anterior');
        }
        if (nextBtn) {
            nextBtn.disabled = currentQuestionIndex === totalQuestionsCount - 1;
            nextBtn.setAttribute('aria-label', currentQuestionIndex === totalQuestionsCount - 1 ? 'Última questão' : 'Próxima questão');
        }
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = currentQuestionIndex + 1;
        }
    }

    // Inicializa navegação do feedback
    function initializeFeedbackNavigation(totalQuestions) {
        currentQuestionIndex = 0;
        totalQuestionsCount = totalQuestions;

        // Adiciona event listeners aos botões
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigateFeedbackQuestion('prev'));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => navigateFeedbackQuestion('next'));
        }

        // Atalhos de teclado
        const handleKeydown = function(e) {
            const feedbackVisible = document.querySelector('.exercise-feedback');
            if (!feedbackVisible) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateFeedbackQuestion('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateFeedbackQuestion('next');
            }
        };

        // Remove listener anterior se existir
        document.removeEventListener('keydown', handleKeydown);
        document.addEventListener('keydown', handleKeydown);

        // Atualiza estado inicial
        updateFeedbackNavigation();
    }

    // Função global para mostrar feedback (pode ser chamada externamente)
    function showExerciseFeedback(score, totalQuestions, percentage) {
        console.log('🎯 showExerciseFeedback chamada com:', { score, totalQuestions, percentage });
        
        const answers = getAnswersForCurrentLesson();
        const explanations = getExplanationsForCurrentLesson();
        
        // Usa os valores passados como parâmetros
        const finalScore = score || 0;
        const finalTotal = totalQuestions || Object.keys(answers).length;
        const finalPercentage = percentage || Math.round((finalScore / finalTotal) * 100);
        
        console.log('📊 Valores finais:', { finalScore, finalTotal, finalPercentage });
        
        // Para restaurar estado, precisa simular as respostas do usuário
        // Baseado no score, determina quais questões foram acertadas
        const userAnswers = {};
        let correctCount = 0;
        
        for (let i = 1; i <= finalTotal; i++) {
            const qKey = `q${i}`;
            const correctAnswer = answers[qKey];
            
            if (correctCount < finalScore) {
                // Esta questão foi acertada
                userAnswers[qKey] = correctAnswer;
                correctCount++;
            } else {
                // Esta questão foi errada - escolhe uma resposta incorreta
                const wrongAnswers = ['a', 'b', 'c', 'd', 'e'].filter(ans => ans !== correctAnswer);
                userAnswers[qKey] = wrongAnswers[0] || 'a';
            }
        }
        
        console.log('🎯 Respostas simuladas:', userAnswers);
        
        // Temporariamente substitui as respostas do formulário para o feedback
        const originalAnswers = {};
        for (let i = 1; i <= finalTotal; i++) {
            const qKey = `q${i}`;
            const input = form.querySelector(`input[name="${qKey}"]:checked`);
            if (input) {
                originalAnswers[qKey] = input.value;
            }
            // Simula a resposta do usuário
            const userAnswer = userAnswers[qKey];
            if (userAnswer) {
                const userInput = form.querySelector(`input[name="${qKey}"][value="${userAnswer}"]`);
                if (userInput) {
                    userInput.checked = true;
                }
            }
        }
        
        showFeedbackWithValues(finalScore, finalTotal, finalPercentage);
        
        // Restaura as respostas originais após mostrar o feedback
        setTimeout(() => {
            for (let i = 1; i <= finalTotal; i++) {
                const qKey = `q${i}`;
                const originalAnswer = originalAnswers[qKey];
                if (originalAnswer) {
                    const originalInput = form.querySelector(`input[name="${qKey}"][value="${originalAnswer}"]`);
                    if (originalInput) {
                        originalInput.checked = true;
                    }
                }
            }
        }, 100);
    }
    
    // Disponibiliza função globalmente
    window.showExerciseFeedback = showExerciseFeedback;

    function showFeedback() {
        console.log('🎯 showFeedback chamada');
        const answers = getAnswersForCurrentLesson();
        const explanations = getExplanationsForCurrentLesson();
        console.log('📋 Respostas:', answers);
        console.log('📖 Explicações:', explanations);
        
        let score = 0;
        const totalQuestions = Object.keys(answers).length;
        console.log('📊 Total de questões:', totalQuestions);

        // Calcula score primeiro
        for (let i = 1; i <= totalQuestions; i++) {
            const qKey = `q${i}`;
            const selected = form.querySelector(`input[name="${qKey}"]:checked`);
            const correctValue = answers[qKey];
            const isCorrect = selected && selected.value === correctValue;
            console.log(`❓ Questão ${i}: selecionada=${selected?.value}, correta=${correctValue}, acertou=${isCorrect}`);
            if (isCorrect) score++;
        }
        
        const percentage = Math.round((score / totalQuestions) * 100);
        console.log('🎯 Score final:', score, 'de', totalQuestions, '(', percentage, '%)');
        
        // Registrar tentativa no backend
        const lessonTitle = getCurrentLessonTitle();
        if (lessonTitle) {
            // CORREÇÃO CRÍTICA: Registra tentativa e salva estado do exercício
            const attemptPromise = registerExerciseAttempt(lessonTitle, score, totalQuestions);
            
            // Aguarda o resultado da tentativa
            if (attemptPromise && typeof attemptPromise.then === 'function') {
                attemptPromise.then(() => {
                    console.log('✅ Tentativa registrada, agora salvando estado do exercício...');
                    saveExerciseState(lessonTitle, score, totalQuestions, percentage);
                }).catch(err => {
                    console.error('❌ Erro ao registrar tentativa:', err);
                    // Mesmo com erro, tenta salvar o estado
                    saveExerciseState(lessonTitle, score, totalQuestions, percentage);
                });
            } else {
                // Se não retornou Promise, salva imediatamente
                console.log('⚠️ registerExerciseAttempt não retornou Promise, salvando estado...');
                saveExerciseState(lessonTitle, score, totalQuestions, percentage);
            }
        }
        
        // Função auxiliar para salvar estado do exercício
        function saveExerciseState(lessonTitle, score, totalQuestions, percentage) {
            if (typeof window.saveExerciseStateToDB === 'function') {
                const exerciseState = {
                    lessonTitle: lessonTitle,
                    isCompleted: true,
                    score: score,
                    totalQuestions: totalQuestions,
                    percentage: percentage,
                    pointsAwarded: window.exerciseAttemptResult ? window.exerciseAttemptResult.pointsAwarded : 0,
                    isFirstAttempt: window.exerciseAttemptResult ? window.exerciseAttemptResult.isFirstAttempt : false,
                    feedbackData: {
                        timestamp: Date.now(),
                        score: score,
                        totalQuestions: totalQuestions,
                        percentage: percentage
                    }
                };
                
                console.log('💾 Salvando estado do exercício no banco:', exerciseState);
                window.saveExerciseStateToDB(exerciseState);
            } else {
                console.warn('⚠️ saveExerciseStateToDB não está disponível');
            }
        }
        
        showFeedbackWithValues(score, totalQuestions, percentage);
    }
    
    function showFeedbackWithValues(score, totalQuestions, percentage) {
        console.log('🎨 showFeedbackWithValues chamada com:', { score, totalQuestions, percentage });
        
        const answers = getAnswersForCurrentLesson();
        const explanations = getExplanationsForCurrentLesson();
        const lessonTitle = getCurrentLessonTitle(); // Adiciona esta linha
        
        // ... resto do código ...
        
        // Header com resultado geral
        let summaryHTML = '';
        let allCorrect = score === totalQuestions;
        
        // Mensagem sobre pontuação (apenas primeira tentativa)
        let pointsMessage = '';
        if (window.exerciseAttemptResult && window.exerciseAttemptResult.isFirstAttempt) {
            const points = window.exerciseAttemptResult.pointsAwarded || 0;
            pointsMessage = `<div class="points-info">Pontuação obtida: <strong>${points} pontos</strong> (primeira tentativa)</div>`;
        }
        
        if (allCorrect) {
            summaryHTML = `<div class="feedback-header success">🎉 Parabéns! Você acertou todas as ${totalQuestions} questões!${pointsMessage}</div>`;
        } else {
            const headerClass = score > 0 ? 'partial' : 'error';
            summaryHTML = `<div class="feedback-header ${headerClass}">Você acertou ${score} de ${totalQuestions} questões.${score > 0 ? ' Continue estudando para acertar todas!' : ''}${pointsMessage}</div>`;
        }

        // Controles de navegação usando padrão step-nav
        const navigationHTML = `
            <div class="step-nav" aria-label="Navegação entre questões">
                <button class="button step-prev" id="prev-question-btn" aria-label="Questão anterior" disabled>◀</button>
                <span class="step-counter" aria-live="polite">
                    <strong id="current-question">1</strong> / <span class="total-questions">${totalQuestions}</span>
                </span>
                <button class="button step-next" id="next-question-btn" aria-label="Próxima questão">▶</button>
            </div>
        `;

        // Container para as questões (uma por vez)
        let questionsHTML = '<div class="questions-container">';
        for (let i = 1; i <= totalQuestions; i++) {
            const qKey = `q${i}`;
            const selected = form.querySelector(`input[name="${qKey}"]:checked`);
            const correctValue = answers[qKey];
            const isCorrect = selected && selected.value === correctValue;
            const statusClass = isCorrect ? 'correct' : (selected ? 'incorrect' : 'neutral');
            const displayStyle = i === 1 ? 'block' : 'none';

            questionsHTML += `<div class="question-feedback ${statusClass}" data-question="${i}" style="display: ${displayStyle};">`;
            questionsHTML += `<h4>Questão ${i}</h4>`;
            if (isCorrect) {
                questionsHTML += `<p class="result">✅ Correta</p>`;
                if (explanations[qKey] && explanations[qKey].correct) {
                    questionsHTML += `<p class="explanation">${explanations[qKey].correct}</p>`;
                }
            } else if (selected) {
                questionsHTML += `<p class="result">❌ Incorreta</p>`;
                const wrong = explanations[qKey] && explanations[qKey].incorrect && explanations[qKey].incorrect[selected.value];
                if (wrong) {
                    questionsHTML += `<p class="explanation">${wrong}</p>`;
                }
            } else {
                questionsHTML += `<p class="result">⚠️ Não respondida</p>`;
            }
            questionsHTML += `</div>`;
        }
        questionsHTML += '</div>';

        const finalHTML = `<div class="exercise-feedback">${summaryHTML}${navigationHTML}${questionsHTML}</div>`;
        feedbackContainer.innerHTML = finalHTML;

        // Muda para o slide de feedback
        const formSlide = document.getElementById('exercise-form-slide');
        const feedbackSlide = document.getElementById('exercise-feedback-slide');
        
        if (formSlide && feedbackSlide) {
            formSlide.classList.remove('active');
            feedbackSlide.classList.add('active');
            console.log('🔄 Mudou para slide de feedback');
        }

        // Inicializa navegação por passos
        initializeFeedbackNavigation(totalQuestions);

        // Controles de ações conforme acerto total
        const existingGoBtn = feedbackSlide.querySelector('#go-practical-btn');
        if (existingGoBtn) existingGoBtn.remove();
        if (allCorrect) {
            // Atualiza progresso usando a função do aulas.html
            const lessonTitle = getCurrentLessonTitle();
            if (lessonTitle && typeof window.updateUserProgress === 'function') {
                window.updateUserProgress(lessonTitle, { exerciseCompleted: true });
            }

            if (tryAgainBtn) tryAgainBtn.style.display = 'none';

            // FLUXO CORRETO: Desbloqueia atividade prática apenas se exercício for 100% correto
            console.log('✅ Exercício 100% correto - desbloqueando atividade prática');
            
            // DESBLOQUEIA IMEDIATAMENTE o header quando o feedback aparece (exercício 100% correto)
            const practicalTabEl = document.getElementById('practical-tab');
            if (practicalTabEl) {
                console.log('🔍 Estado atual da aba prática:', {
                    disabled: practicalTabEl.disabled,
                    classes: practicalTabEl.className,
                    opacity: practicalTabEl.style.opacity,
                    cursor: practicalTabEl.style.cursor
                });
                
                // Desbloqueia imediatamente o header (exercício 100% correto)
                console.log('🔓 Desbloqueando header da atividade prática IMEDIATAMENTE (exercício 100% correto)');
                practicalTabEl.classList.remove('disabled', 'locked');
                practicalTabEl.disabled = false;
                practicalTabEl.style.opacity = '1';
                practicalTabEl.style.cursor = 'pointer';
                
                // Atualiza o ícone de cadeado para check
                const lockIndicator = practicalTabEl.querySelector('.lock-indicator');
                if (lockIndicator) {
                    lockIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                }
                
                console.log('✅ Header da atividade prática desbloqueado IMEDIATAMENTE (exercício 100% correto)');
            }
            
            // Salva estado do exercício no banco de dados
            if (lessonTitle && typeof window.saveExerciseStateToDB === 'function') {
                const exerciseState = {
                    lessonTitle: lessonTitle,
                    isCompleted: true,
                    score: score,
                    totalQuestions: totalQuestions,
                    percentage: percentage,
                    pointsAwarded: window.exerciseAttemptResult ? window.exerciseAttemptResult.pointsAwarded : 0,
                    isFirstAttempt: window.exerciseAttemptResult ? window.exerciseAttemptResult.isFirstAttempt : false,
                    feedbackData: {
                        allCorrect: true,
                        timestamp: new Date().toISOString()
                    }
                };
                window.saveExerciseStateToDB(exerciseState);
                
                // Atualiza os botões e abas APÓS salvar no banco
                setTimeout(() => {
                    if (typeof window.updateButtonStates === 'function') {
                        console.log('🔄 Chamando updateButtonStates após salvar exercício');
                        console.log('📊 Progresso atual:', window.userProgress);
                        console.log('📝 Título da aula:', lessonTitle);
                        window.updateButtonStates(lessonTitle);
                        
                        // Força o desbloqueio da aba prática imediatamente
                        const practicalTabEl = document.getElementById('practical-tab');
                        if (practicalTabEl && typeof window.unlockPracticalTab === 'function') {
                            console.log('🔓 Forçando desbloqueio da aba prática');
                            window.unlockPracticalTab();
                        }
                    } else {
                        console.log('❌ updateButtonStates não é uma função');
                    }
                }, 500);
            }

            // FLUXO CORRETO: ir para atividade prática após exercício 100% correto
            if (tryAgainContainer) {
                const goBtn = document.createElement('button');
                goBtn.type = 'button';
                goBtn.id = 'go-practical-btn';
                goBtn.className = 'button button-primary';
                goBtn.textContent = 'Ir para Atividade Prática';
                goBtn.addEventListener('click', () => {
                    console.log('🎯 Botão "Ir para Atividade Prática" clicado (exercício 100% correto)');
                    
                    // FLUXO CORRETO: Garante que a aba prática está desbloqueada (exercício 100% correto)
                    const practicalTabEl = document.getElementById('practical-tab');
                    if (practicalTabEl) {
                        // Remove todas as classes de bloqueio
                        practicalTabEl.classList.remove('disabled', 'locked');
                        practicalTabEl.disabled = false;
                        practicalTabEl.style.opacity = '1';
                        
                        // Atualiza o ícone de cadeado para check
                        const lockIndicator = practicalTabEl.querySelector('.lock-indicator');
                        if (lockIndicator) {
                            lockIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                        }
                        
                        console.log('✅ Aba prática desbloqueada antes da troca');
                    }
                    
                    // Troca para a aba de atividade prática
                    const videoTab = document.getElementById('video-tab');
                    const exerciseTab = document.getElementById('exercise-tab');
                    const videoContent = document.getElementById('video-content');
                    const exerciseContentEl = document.getElementById('exercise-content');
                    const practicalContent = document.getElementById('practical-content');
                    
                    if (videoTab) { 
                        videoTab.classList.remove('active'); 
                        videoTab.setAttribute('aria-selected','false'); 
                    }
                    if (exerciseTab) { 
                        exerciseTab.classList.remove('active'); 
                        exerciseTab.setAttribute('aria-selected','false'); 
                    }
                    if (practicalTabEl) { 
                        practicalTabEl.classList.add('active'); 
                        practicalTabEl.setAttribute('aria-selected','true'); 
                    }
                    if (videoContent) videoContent.classList.remove('active');
                    if (exerciseContentEl) exerciseContentEl.classList.remove('active');
                    if (practicalContent) practicalContent.classList.add('active');
                    
                    console.log('🔄 Troca para aba prática realizada');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                tryAgainContainer.appendChild(goBtn);
            }
        } else {
            if (tryAgainBtn) tryAgainBtn.style.display = '';
            if (tryAgainContainer) tryAgainContainer.style.display = '';
            
            // Salva estado do exercício no banco de dados mesmo com pontuação parcial
            if (lessonTitle && typeof window.saveExerciseStateToDB === 'function') {
                const exerciseState = {
                    lessonTitle: lessonTitle,
                    isCompleted: true,
                    score: score,
                    totalQuestions: totalQuestions,
                    percentage: percentage,
                    pointsAwarded: window.exerciseAttemptResult ? window.exerciseAttemptResult.pointsAwarded : 0,
                    isFirstAttempt: window.exerciseAttemptResult ? window.exerciseAttemptResult.isFirstAttempt : false,
                    feedbackData: {
                        allCorrect: false,
                        timestamp: new Date().toISOString()
                    }
                };
                window.saveExerciseStateToDB(exerciseState);
            }
        }

        formSlide.classList.add('to-left');
        formSlide.classList.remove('active');
        feedbackSlide.classList.add('active');
        
        setTimeout(() => {
            const titleEl = document.getElementById('lesson-title-header');
            if (titleEl) {
                titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (exerciseContent) {
                exerciseContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    function resetExercise() {
        form.reset();
        feedbackSlide.classList.remove('active');
        formSlide.classList.remove('to-left');
        formSlide.classList.add('active');
        
        // Limpa estado do exercício usando a nova função
        if (typeof window.clearExerciseStateOnRetry === 'function') {
            window.clearExerciseStateOnRetry();
        } else if (typeof window.clearExerciseState === 'function') {
            window.clearExerciseState();
        }

        setTimeout(() => {
            const titleEl = document.getElementById('lesson-title-header');
            if (titleEl) {
                titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (exerciseContent) {
                exerciseContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    // Delegação de eventos: garante funcionamento após troca dinâmica do formulário
    exerciseContent.addEventListener('click', (e) => {
        const target = e.target;
        console.log('🖱️ Clique detectado:', target.id);
        if (!target) return;
        if (target.id === 'submit-exercise') {
            console.log('✅ Botão Verificar Respostas clicado!');
            e.preventDefault();
            ensureClassesQuestionsInjected();
            showFeedback();
        } else if (target.id === 'try-again-btn') {
            e.preventDefault();
            resetExercise();
        }
    });

    // Injeta automaticamente ao exibir a aba de exercício
    const exerciseTab = document.getElementById('exercise-tab');
    if (exerciseTab) {
        exerciseTab.addEventListener('click', () => {
            // após troca de aba, o DOM pode ainda estar pintando; aguarde um tick
            setTimeout(() => ensureClassesQuestionsInjected(), 50);
        });
    }

    // Observa mudanças na seção de exercício (ex.: reset do form, troca de aula)
    try {
        const observer = new MutationObserver(() => {
            ensureClassesQuestionsInjected();
        });
        observer.observe(exerciseContent, { childList: true, subtree: true });
    } catch (e) { /* no-op */ }
});
