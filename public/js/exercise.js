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

    const answers = { q1: 'a', q2: 'a', q3: 'd', q4: 'a' };

    function showFeedback() {
        let score = 0;
        const questionIds = Object.keys(answers).sort();
        const totalQuestions = questionIds.length;
        const feedbackItems = [];

        questionIds.forEach((qid) => {
            const correct = answers[qid];
            const selectedInput = form.querySelector(`input[name="${qid}"]:checked`);
            const selected = selectedInput ? selectedInput.value : null;
            const num = qid.replace('q', '');
            if (selected && selected === correct) {
                score++;
                feedbackItems.push(`<li>Questão ${num}: Correta (Sua: ${selected.toUpperCase()})</li>`);
            } else if (selected) {
                feedbackItems.push(`<li>Questão ${num}: Incorreta (Sua: ${selected.toUpperCase()} · Correta: ${correct.toUpperCase()})</li>`);
            } else {
                feedbackItems.push(`<li>Questão ${num}: Não respondida (Correta: ${correct.toUpperCase()})</li>`);
            }
        });

        const gabaritoResumo = questionIds
            .map((qid, idx) => `${idx + 1}) ${answers[qid]}`)
            .join(', ');

        const allCorrect = score === totalQuestions;
        const feedbackClass = allCorrect ? 'feedback-success' : 'feedback-error';
        const finalMessage = allCorrect 
            ? 'Parabéns! Você acertou tudo. A próxima aula é liberada ao enviar a atividade.' 
            : 'Continue estudando. Você pode tentar novamente.';

        feedbackContainer.innerHTML = `
            <div class="${feedbackClass}">
                <h4>Resultados:</h4>
                <ul>${feedbackItems.join('')}</ul>
                <p class="final-score"><strong>Sua pontuação: ${score} de ${totalQuestions}</strong></p>
                <p><strong>Gabarito:</strong> ${gabaritoResumo}</p>
                <p>${finalMessage}</p>
            </div>
        `;

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
