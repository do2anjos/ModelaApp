document.addEventListener('DOMContentLoaded', () => {
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
            return header ? header.textContent.trim() : '';
        } catch (e) {
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
        return { q1: 'a', q2: 'c', q3: 'd', q4: 'a' };
    }

    // Explicações adicionais para feedback detalhado (Introdução)
    const explanationsIntro = {
        q1: {
            correct: 'Correto. No diagrama de estados, uma transição entre dois estados realmente só pode ocorrer se houver uma ação, evento ou condição associada a ela.',
            incorrect: {
                b: 'Incorreto. As swimlanes (raias) no diagrama de atividades podem expressar paralelismo no fluxo de atividades.',
                c: 'Incorreto. O diagrama de componentes modela a estrutura e organização de componentes de software, não as interações entre usuários e o sistema (isso seria o diagrama de casos de uso).',
                d: 'Incorreto. Atores em diagramas de casos de uso podem ser pessoas, sistemas externos, hardwares ou qualquer entidade externa que interaja com o sistema.'
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
    // Injeta as questões específicas da aula "O que é um Diagrama de Classes"
    try {
        window.renderClassesQuestions = function() {
            const title = getCurrentLessonTitle();
            if (title !== 'O que é um Diagrama de Classes') return;
            const formEl = document.getElementById('exercise-form');
            if (!formEl) return;
            // Evita reinjetar se já estiver correto
            if (formEl.querySelector('legend') && formEl.innerHTML.includes('Diagrama de Classes')) return;
            formEl.innerHTML = `
                <fieldset class="exercise-question">
                    <legend>1. (TRT 1ª REGIÃO - FCC - 2023) Qual é o principal objetivo de um Diagrama de Classes no contexto da UML (Linguagem de Modelagem Unificada)?</legend>
                    <div class="radio-group">
                        <label><input type="radio" name="q1" value="a" required> a) Descrever a sequência temporal de mensagens trocadas entre objetos.</label>
                        <label><input type="radio" name="q1" value="b" required> b) Modelar a estrutura estática de um sistema, mostrando suas classes, atributos, operações e relacionamentos.</label>
                        <label><input type="radio" name="q1" value="c" required> c) Apresentar as funcionalidades do sistema do ponto de vista do usuário (ator).</label>
                        <label><input type="radio" name="q1" value="d" required> d) Detalhar o fluxo de atividades e decisões de um processo de negócio.</label>
                    </div>
                </fieldset>
                <fieldset class="exercise-question">
                    <legend>2. (Prefeitura de Recife - IBFC - 2024) Em um Diagrama de Classes, a representação padrão de uma classe é um retângulo dividido em três compartimentos. Na ordem correta, de cima para baixo, esses compartimentos representam:</legend>
                    <div class="radio-group">
                        <label><input type="radio" name="q2" value="a" required> a) Nome da Classe, Atributos, Operações (Métodos).</label>
                        <label><input type="radio" name="q2" value="b" required> b) Nome da Classe, Operações (Métodos), Atributos.</label>
                        <label><input type="radio" name="q2" value="c" required> c) Nome da Tabela, Chaves Primárias, Chaves Estrangeiras.</label>
                        <label><input type="radio" name="q2" value="d" required> d) Nome do Objeto, Estados, Eventos.</label>
                    </div>
                </fieldset>
                <fieldset class="exercise-question">
                    <legend>3. (EBSERH - VUNESP - 2022) Considerando os elementos fundamentais de uma classe na UML, o que um "atributo" define?</legend>
                    <div class="radio-group">
                        <label><input type="radio" name="q3" value="a" required> a) Uma ação, função ou comportamento que a classe pode executar.</label>
                        <label><input type="radio" name="q3" value="b" required> b) O nome único que identifica a classe no diagrama.</label>
                        <label><input type="radio" name="q3" value="c" required> c) Uma propriedade ou característica de dados que os objetos daquela classe irão possuir.</label>
                        <label><input type="radio" name="q3" value="d" required> d) O relacionamento de herança entre a classe e sua superclasse.</label>
                    </div>
                </fieldset>
                <fieldset class="exercise-question">
                    <legend>4. (Petrobras - CESPE/CEBRASPE - 2023) Os diagramas da UML são divididos em duas categorias principais. O Diagrama de Classes é classificado como um diagrama:</legend>
                    <div class="radio-group">
                        <label><input type="radio" name="q4" value="a" required> a) Estrutural (ou Estático).</label>
                        <label><input type="radio" name="q4" value="b" required> b) Comportamental (ou Dinâmico).</label>
                        <label><input type="radio" name="q4" value="c" required> c) De Interação.</label>
                        <label><input type="radio" name="q4" value="d" required> d) De Implantação.</label>
                    </div>
                </fieldset>
                <div class="exercise-actions">
                    <button type="button" id="submit-exercise" class="button button-primary">Verificar Respostas</button>
                </div>
            `;
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
        const userData = localStorage.getItem('modela_user');
        if (!userData) return;
        
        const user = JSON.parse(userData);
        const percentage = Math.round((score / total) * 100);
        
        // Buscar lesson_id do LESSON_MAPPING (definido em aulas.html)
        const mapping = window.LESSON_MAPPING ? window.LESSON_MAPPING[lessonTitle] : null;
        if (!mapping) {
            console.warn('LESSON_MAPPING não encontrado para:', lessonTitle);
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3001/api/user/${user.id}/exercise-attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId: mapping.lessonId,
                    lessonTitle: lessonTitle,
                    score: score,
                    totalQuestions: total,
                    percentage: percentage
                })
            });
            
            const result = await response.json();
            
            // Mostrar feedback de pontos
            if (result.isFirstAttempt && result.pointsAwarded > 0) {
                showPointsNotification(result.pointsAwarded);
            }
            
            return result;
        } catch (error) {
            console.error('Erro ao registrar tentativa:', error);
        }
    }

    // Função para mostrar notificação de pontos
    function showPointsNotification(points) {
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `+${points} pontos! 🎉`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    function showFeedback() {
        const answers = getAnswersForCurrentLesson();
        const explanations = getExplanationsForCurrentLesson();
        let score = 0;
        const totalQuestions = Object.keys(answers).length;

        // Blocos por questão com classes de estado para mesclar cores individualmente
        let questionsHTML = '';
        for (let i = 1; i <= totalQuestions; i++) {
            const qKey = `q${i}`;
            const selected = form.querySelector(`input[name="${qKey}"]:checked`);
            const correctValue = answers[qKey];
            const isCorrect = selected && selected.value === correctValue;
            const statusClass = isCorrect ? 'correct' : (selected ? 'incorrect' : 'neutral');

            questionsHTML += `<div class="question-feedback ${statusClass}">`;
            questionsHTML += `<h4>Questão ${i}</h4>`;
            if (isCorrect) {
                questionsHTML += `<p class="result">✅ Correta</p>`;
                if (explanations[qKey] && explanations[qKey].correct) {
                    questionsHTML += `<p class="explanation">${explanations[qKey].correct}</p>`;
                }
                score++;
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

        const allCorrect = score === totalQuestions;
        let summaryHTML = '';
        if (allCorrect) {
            summaryHTML = `<div class="feedback-header success">🎉 Parabéns! Você acertou todas as ${totalQuestions} questões!</div>`;
        } else {
            const headerClass = score > 0 ? 'partial' : 'error';
            summaryHTML = `<div class="feedback-header ${headerClass}">Você acertou ${score} de ${totalQuestions} questões.${score > 0 ? ' Continue estudando para acertar todas!' : ''}</div>`;
        }

        // Registrar tentativa no backend
        const lessonTitle = getCurrentLessonTitle();
        if (lessonTitle) {
            registerExerciseAttempt(lessonTitle, score, totalQuestions);
        }

        const finalHTML = `<div class="exercise-feedback">${questionsHTML}${summaryHTML}</div>`;
        feedbackContainer.innerHTML = finalHTML;

        // Controles de ações conforme acerto total
        const existingGoBtn = feedbackSlide.querySelector('#go-practical-btn');
        if (existingGoBtn) existingGoBtn.remove();
        if (allCorrect) {
            // Atualiza progresso no storage e aplica fluxo condicional por aula
            let lessonTitle = getCurrentLessonTitle();
            try {
                const saved = localStorage.getItem('userProgress');
                const progress = saved ? JSON.parse(saved) : {};
                if (!progress[lessonTitle]) progress[lessonTitle] = {};
                progress[lessonTitle].exerciseCompleted = true;
                localStorage.setItem('userProgress', JSON.stringify(progress));
            } catch (e) {}

            if (tryAgainBtn) tryAgainBtn.style.display = 'none';

            // Desbloqueia a aba de Atividade Prática quando exercício é 100% correto
            const practicalTab = document.getElementById('practical-tab');
            if (practicalTab) {
                practicalTab.disabled = false;
                practicalTab.style.opacity = '1';
                const lockIndicator = practicalTab.querySelector('.lock-indicator');
                if (lockIndicator) {
                    lockIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                }
            }

            // Fluxo padrão: ir para atividade prática após exercício 100% correto
            if (tryAgainContainer) {
                const goBtn = document.createElement('button');
                goBtn.type = 'button';
                goBtn.id = 'go-practical-btn';
                goBtn.className = 'button button-primary';
                goBtn.textContent = 'Ir para Atividade Prática';
                goBtn.addEventListener('click', () => {
                    // Troca para a aba de atividade prática
                    const videoTab = document.getElementById('video-tab');
                    const exerciseTab = document.getElementById('exercise-tab');
                    const practicalTabEl = document.getElementById('practical-tab');
                    const videoContent = document.getElementById('video-content');
                    const exerciseContentEl = document.getElementById('exercise-content');
                    const practicalContent = document.getElementById('practical-content');
                    if (videoTab) { videoTab.classList.remove('active'); videoTab.setAttribute('aria-selected','false'); }
                    if (exerciseTab) { exerciseTab.classList.remove('active'); exerciseTab.setAttribute('aria-selected','false'); }
                    if (practicalTabEl) { practicalTabEl.classList.add('active'); practicalTabEl.setAttribute('aria-selected','true'); }
                    if (videoContent) videoContent.classList.remove('active');
                    if (exerciseContentEl) exerciseContentEl.classList.remove('active');
                    if (practicalContent) practicalContent.classList.add('active');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                tryAgainContainer.appendChild(goBtn);
            }
        } else {
            if (tryAgainBtn) tryAgainBtn.style.display = '';
            if (tryAgainContainer) tryAgainContainer.style.display = '';
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
        if (!target) return;
        if (target.id === 'submit-exercise') {
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
