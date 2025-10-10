// usability.js - Melhorias de Usabilidade

class UsabilityManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('UsabilityManager initialized');
        this.setupLoadingStates();
        this.setupKeyboardNavigation();
        this.setupAccessibility();
        this.setupMobileOptimizations();
    }

    // A função setupFormValidation foi movida para scripts inline nas páginas de login e cadastro.

    // Funções de validação removidas para protótipo fluido

    // Validadores removidos para protótipo fluido

    // Handlers de Submit removidos para protótipo fluido

    // Estados de Carregamento
    setupLoadingStates() {
        // Adicionar indicadores de carregamento para links e botões
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.startsWith('http') && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
                // Verificar se é um link interno
                if (link.href.includes(window.location.origin) || link.href.startsWith('/') || link.href.startsWith('./')) {
                    this.showLoadingIndicator();
                }
            }
        });

        // Adicionar loading para navegação programática
        window.addEventListener('beforeunload', () => {
            this.showLoadingIndicator();
        });
    }

    setLoadingState(button, isLoading) {
        const buttonText = button.querySelector('.button-text');
        const loadingSpinner = button.querySelector('.loading-spinner');
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            if (buttonText) buttonText.style.display = 'none';
            if (loadingSpinner) loadingSpinner.style.display = 'inline';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (buttonText) buttonText.style.display = 'inline';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    showLoadingIndicator() {
        // Evitar múltiplos overlays
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) {
            return;
        }

        // Criar overlay de carregamento
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner-large"></div>
                <p>Carregando...</p>
            </div>
        `;
        
        // Adicionar estilos inline para garantir funcionamento
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
        `;
        
        document.body.appendChild(overlay);
        
        // Remover após um tempo ou quando a página carregar
        const removeOverlay = () => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        };
        
        // Remover após 2 segundos ou quando a página carregar
        setTimeout(removeOverlay, 2000);
        
        // Remover quando a página carregar
        window.addEventListener('load', removeOverlay, { once: true });
    }

    // Navegação por Teclado
    setupKeyboardNavigation() {
        // Adicionar suporte a navegação por teclado
        document.addEventListener('keydown', (e) => {
            // ESC para fechar modais/dropdowns
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
            
            // Enter para ativar botões focados
            if (e.key === 'Enter' && e.target.matches('button')) {
                e.target.click();
            }
        });
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }

    // Acessibilidade
    setupAccessibility() {
        // Adicionar skip links
        this.addSkipLinks();
        
        // Melhorar ARIA labels
        this.improveAriaLabels();
        
        // Adicionar suporte a screen readers
        this.setupScreenReaderSupport();
    }

    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Pular para o conteúdo principal';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    improveAriaLabels() {
        // Melhorar labels de botões sem texto
        const iconButtons = document.querySelectorAll('button:not([aria-label])');
        iconButtons.forEach(button => {
            const icon = button.querySelector('svg');
            if (icon && !button.textContent.trim()) {
                button.setAttribute('aria-label', 'Botão de ação');
            }
        });
    }

    setupScreenReaderSupport() {
        // Adicionar anúncios para mudanças dinâmicas
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'announcer';
        document.body.appendChild(announcer);
    }

    // Otimizações Mobile
    setupMobileOptimizations() {
        // Detectar se é mobile
        if (window.innerWidth <= 768) {
            this.setupMobileMenu();
            this.optimizeTouchTargets();
        }
        
        // Reagir a mudanças de tamanho
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.setupMobileMenu();
            }
        });
    }

    setupMobileMenu() {
        const sidebar = document.querySelector('.dashboard-sidebar');
        const toggleButton = document.querySelector('.mobile-menu-toggle');
        
        if (sidebar && !toggleButton) {
            const button = document.createElement('button');
            button.className = 'mobile-menu-toggle';
            button.innerHTML = '☰';
            button.setAttribute('aria-label', 'Abrir menu');
            
            const header = document.querySelector('.dashboard-header');
            if (header) {
                header.insertBefore(button, header.firstChild);
                
                button.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                    button.setAttribute('aria-expanded', 
                        sidebar.classList.contains('open'));
                });
            }
        }
    }

    optimizeTouchTargets() {
        // Garantir que botões tenham pelo menos 44px de altura
        const buttons = document.querySelectorAll('button, a.button');
        buttons.forEach(button => {
            if (button.offsetHeight < 44) {
                button.style.minHeight = '44px';
                button.style.padding = '12px 16px';
            }
        });
    }

    // Sistema de Mensagens
    showMessage(containerId, message, type = 'info') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" aria-label="Fechar mensagem">&times;</button>
        `;

        // Limpar mensagens anteriores
        container.innerHTML = '';
        container.appendChild(messageDiv);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);

        // Anunciar para screen readers
        this.announceToScreenReader(message);
    }

    announceToScreenReader(message) {
        const announcer = document.getElementById('announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    }
}

// Inicializar imediatamente
window.usabilityManager = new UsabilityManager();

// Adicionar estilos para loading overlay
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    
    .loading-content {
        background: var(--card);
        padding: 2rem;
        border-radius: var(--radius);
        text-align: center;
        box-shadow: var(--shadow-lg);
    }
    
    .loading-spinner-large {
        width: 40px;
        height: 40px;
        border: 4px solid var(--muted);
        border-top: 4px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
`;
document.head.appendChild(loadingStyles);

