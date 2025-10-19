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

    const answers = { q1: 'a', q2: 'a', q3: 'a' };

    function showFeedback() {
        let score = 0;
        const totalQuestions = Object.keys(answers).length;
        let feedbackHTML = '<h4>Resultados:</h4><ul>';

        for (const q in answers) {
            const selected = form.querySelector(`input[name="${q}"]:checked`);
            if (selected) {
                if (selected.value === answers[q]) {
                    score++;
                    feedbackHTML += `<li><strong>Questão ${q.slice(1)}:</strong> Correta</li>`;
                } else {
                    feedbackHTML += `<li><strong>Questão ${q.slice(1)}:</strong> Incorreta (Correta: ${answers[q].toUpperCase()})</li>`;
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

        // Apenas controla o "Tentar novamente" conforme acerto total
        if (allCorrect) {
            if (tryAgainContainer) tryAgainContainer.style.display = 'none';
        } else {
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
