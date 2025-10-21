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

    const answers = { q1: 'b', q2: 'c', q3: 'd', q4: 'a' };

    // Explicações adicionais para feedback detalhado
    const explanations = {
        q1: {
            correct: 'Correto: swimlanes particionam responsabilidades; paralelismo é indicado por nós fork/join.',
            incorrect: {
                a: 'Incorreto: transições em diagrama de estados podem ocorrer por evento/guarda, sem exigir ação explícita.',
                c: 'Incorreto: interações entre usuários e o sistema são modeladas no diagrama de casos de uso, não no de componentes.',
                d: 'Incorreto: atores podem ser pessoas, sistemas ou outras entidades externas, não apenas humanos.'
            }
        },
        q2: {
            correct: 'Correto: a UML facilita a comunicação entre desenvolvedores, analistas e clientes.',
            incorrect: {
                a: 'Incorreto: a UML não se limita à documentação pós-implementação; apoia todo o ciclo de desenvolvimento.',
                b: 'Incorreto: a UML não é exclusiva de linguagens orientadas a objetos; modela sistemas em diferentes paradigmas.',
                d: 'Incorreto: a UML é predominantemente gráfica; não é uma linguagem textual para algoritmos.'
            }
        },
        q3: {
            correct: 'Correto: o diagrama de classe padroniza três compartimentos: nome, atributos e métodos.',
            incorrect: {
                a: 'Incorreto: "entidade, eventos e métodos" não é a estrutura padrão de uma classe em UML.',
                b: 'Incorreto: "objeto, classificação e nome" não compõe a tripla padrão de uma classe.',
                c: 'Incorreto: falta o nome da classe; a tripla correta é nome, atributos e métodos.',
                e: 'Incorreto: "métodos, objeto e eventos" não representa a estrutura da classe.'
            }
        },
        q4: {
            correct: 'Correto: o diagrama de estrutura composta modela colaborações entre partes internas (de classes ou componentes) para uma finalidade específica.',
            incorrect: {
                b: 'Incorreto: fluxo de atividades é representado no diagrama de atividades, não no de estrutura composta.',
                c: 'Incorreto: ele não substitui o diagrama de classes; complementa a visão estrutural interna.',
                d: 'Incorreto: não é exclusivo para requisitos; é usado no projeto/arquitetura interna também.',
                e: 'Incorreto: atores externos são tratados em casos de uso; estrutura composta foca nas partes internas.'
            }
        }
    };

    function showFeedback() {
        let score = 0;
        const totalQuestions = Object.keys(answers).length;
        let feedbackHTML = '<h4>Resultados:</h4><ul>';

        for (const q in answers) {
            const selected = form.querySelector(`input[name="${q}"]:checked`);
            if (selected) {
                if (selected.value === answers[q]) {
                    score++;
                    feedbackHTML += `<li><strong>Questão ${q.slice(1)}:</strong> Correta`;
                    if (explanations[q] && explanations[q].correct) {
                        feedbackHTML += ` <div class="explanation">${explanations[q].correct}</div>`;
                    }
                    feedbackHTML += `</li>`;
                } else {
                    feedbackHTML += `<li><strong>Questão ${q.slice(1)}:</strong> Incorreta (Correta: ${answers[q].toUpperCase()})`;
                    const wrong = explanations[q] && explanations[q].incorrect && explanations[q].incorrect[selected.value];
                    if (wrong) {
                        feedbackHTML += ` <div class="explanation">${wrong}</div>`;
                    }
                    feedbackHTML += `</li>`;
                }
            } else {
                feedbackHTML += `<li><strong>Questão ${q.slice(1)}:</strong> Não respondida</li>`;
            }
        }
        feedbackHTML += '</ul>';
        
        const allCorrect = score === totalQuestions;
        const feedbackClass = allCorrect ? 'feedback-success' : 'feedback-error';
        const finalMessage = allCorrect 
            ? 'Parabéns! Você acertou tudo. A próxima aula é liberada ao enviar a atividade.' 
            : 'Continue estudando. Você pode tentar novamente.';

        feedbackContainer.innerHTML = `
            <div class="${feedbackClass}">
                ${feedbackHTML}
                <p class="final-score"><strong>Sua pontuação: ${score} de ${totalQuestions}</strong></p>
                <p>${finalMessage}</p>
            </div>
        `;

        // Controles de ações conforme acerto total
        const existingGoBtn = feedbackSlide.querySelector('#go-practical-btn');
        if (existingGoBtn) existingGoBtn.remove();
        if (allCorrect) {
            // Atualiza progresso no storage para liberar a aba prática
            try {
                const header = document.getElementById('lesson-title-header');
                const lessonTitle = header ? header.textContent.trim() : '';
                const saved = localStorage.getItem('userProgress');
                const progress = saved ? JSON.parse(saved) : {};
                if (!progress[lessonTitle]) progress[lessonTitle] = {};
                progress[lessonTitle].exerciseCompleted = true;
                localStorage.setItem('userProgress', JSON.stringify(progress));
            } catch (e) {}

            if (tryAgainBtn) tryAgainBtn.style.display = 'none';
            if (tryAgainContainer) {
                const goBtn = document.createElement('button');
                goBtn.type = 'button';
                goBtn.id = 'go-practical-btn';
                goBtn.className = 'button button-primary';
                goBtn.textContent = 'Ir para Atividade Prática';
                goBtn.addEventListener('click', () => {
                    // Desbloqueia a aba prática visualmente
                    const practicalTab = document.getElementById('practical-tab');
                    if (practicalTab) {
                        practicalTab.disabled = false;
                        practicalTab.style.opacity = '1';
                        const lockIndicator = practicalTab.querySelector('.lock-indicator');
                        if (lockIndicator) {
                            lockIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                        }
                    }
                    // Alterna visualmente para a aba prática
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
            exerciseContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function resetExercise() {
        form.reset();
        feedbackSlide.classList.remove('active');
        formSlide.classList.remove('to-left');
        formSlide.classList.add('active');

        setTimeout(() => {
            exerciseContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    submitBtn.addEventListener('click', showFeedback);
    tryAgainBtn.addEventListener('click', resetExercise);
});
