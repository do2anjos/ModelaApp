document.addEventListener('DOMContentLoaded', () => {
    const videoContentTab = document.getElementById('video-content');
    if (!videoContentTab) return;

    const prevButton = videoContentTab.querySelector('.step-prev');
    const nextButton = videoContentTab.querySelector('.step-next');
    const currentStepElement = videoContentTab.querySelector('.current-step');
    const totalStepsElement = videoContentTab.querySelector('.total-steps');
    
    const steps = videoContentTab.querySelectorAll('#lesson-steps .lesson-step');
    const totalSteps = steps.length;
    let currentStep = 1;

    if (!prevButton || !nextButton || !currentStepElement || !totalStepsElement || totalSteps === 0) {
        // If navigation elements are not found, hide the navigation.
        const stepNav = videoContentTab.querySelector('.step-nav');
        if (stepNav) {
            stepNav.style.display = 'none';
        }
        return;
    }

    totalStepsElement.textContent = totalSteps;

    function updateView() {
        steps.forEach((step, index) => {
            if ((index + 1) === currentStep) {
                step.style.display = 'block';
            } else {
                step.style.display = 'none';
            }
        });

        currentStepElement.textContent = currentStep;

        if (currentStep === 1) {
            prevButton.disabled = true;
        } else {
            prevButton.disabled = false;
        }

        if (currentStep === totalSteps) {
            nextButton.disabled = true;
        } else {
            nextButton.disabled = false;
        }
    }

    nextButton.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateView();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateView();
        }
    });

    updateView();
});
