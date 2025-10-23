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
        // Introdução à UML - formulário padrão inicial
        return { q1: 'd', q2: 'e', q3: 'b', q4: 'd' };
    }

    // Explicações adicionais para feedback detalhado (Introdução)
    const explanationsIntro = {
        q1: {
            correct: 'Correto: I Caso de Uso; II Classe; III Sequência; IV Atividade.',
            incorrect: {
                a: 'Incorreto: II não é Comunicação e III não é Componentes.',
                b: 'Incorreto: I não é Componentes e II não é Objetos.',
                c: 'Incorreto: I não é Atividade e III não é Objetos.',
                e: 'Duplicada de d); a alternativa correta é d).'
            }
        },
        q2: {
            correct: 'Correto: "Contexto" não é diagrama padrão da UML.',
            incorrect: {
                a: 'Incorreto: Casos de uso é diagrama da UML.',
                b: 'Incorreto: Classes é diagrama da UML.',
                c: 'Incorreto: Sequência é diagrama da UML.',
                d: 'Incorreto: Estados (máquina de estados) é diagrama da UML.'
            }
        },
        q3: {
            correct: 'Correto: no OMT, o Modelo de Objetos cobre aspectos estáticos, estruturais e de dados.',
            incorrect: {
                a: 'Incorreto: o modelo funcional trata funções/fluxos, não estrutura estática.',
                c: 'Incorreto: "relacional" não é um dos modelos do OMT.',
                d: 'Incorreto: não corresponde ao modelo estrutural do OMT.',
                e: 'Incorreto: não é um modelo do OMT.'
            }
        },
        q4: {
            correct: 'Correto: Implementação (implantação/deployment) e Estrutura Composta são diagramas estruturais.',
            incorrect: {
                a: 'Incorreto: Atividades é comportamental, não estrutural.',
                b: 'Incorreto: Casos de Uso é comportamental.',
                c: 'Incorreto: Transições de Estado é comportamental.',
                e: 'Incorreto: Sequência é comportamental.'
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

            // Fluxo especial para a aula de Introdução: ir para "Próxima Aula" no cabeçalho
            if (lessonTitle === 'Introdução à UML - Unified Modeling Language') {
                // Desbloqueia a próxima aula visualmente (remove lock da próxima li)
                const activeLessonLink = document.querySelector('.lesson-list a.active');
                if (activeLessonLink && activeLessonLink.parentElement) {
                    const currentLi = activeLessonLink.parentElement;
                    const nextLi = currentLi.nextElementSibling;
                    if (nextLi) {
                        nextLi.classList.remove('lesson-locked');
                        nextLi.classList.add('lesson-unlocked');
                        // Remove ícone de cadeado (se houver)
                        const lockIcon = nextLi.querySelector('svg');
                        if (lockIcon) lockIcon.remove();
                        // Garante ícone padrão
                        const hasIcon = nextLi.querySelector('.lesson-icon');
                        const nextLink = nextLi.querySelector('a');
                        if (nextLink && !hasIcon) {
                            const iconSpan = document.createElement('span');
                            iconSpan.className = 'lesson-icon todo';
                            nextLink.insertBefore(iconSpan, nextLink.firstChild);
                        }
                    }
                }
                // Exibe e habilita o botão "Próxima Aula" do cabeçalho
                const nextLessonBtn = document.getElementById('next-lesson-btn');
                if (nextLessonBtn) {
                    nextLessonBtn.classList.remove('hidden');
                    nextLessonBtn.classList.add('visible');
                    nextLessonBtn.disabled = false;
                    const lockIndicator = nextLessonBtn.querySelector('.next-lesson-lock-indicator');
                    if (lockIndicator) {
                        lockIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                    }
                    // Scroll até o botão
                    setTimeout(() => { nextLessonBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
                }
            } else {
                // Demais aulas: manter fluxo padrão de ir para atividade prática
                if (tryAgainContainer) {
                    const goBtn = document.createElement('button');
                    goBtn.type = 'button';
                    goBtn.id = 'go-practical-btn';
                    goBtn.className = 'button button-primary';
                    goBtn.textContent = 'Ir para Atividade Prática';
                    goBtn.addEventListener('click', () => {
                        const practicalTab = document.getElementById('practical-tab');
                        if (practicalTab) {
                            practicalTab.disabled = false;
                            practicalTab.style.opacity = '1';
                            const lockIndicator = practicalTab.querySelector('.lock-indicator');
                            if (lockIndicator) {
                                lockIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                            }
                        }
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
