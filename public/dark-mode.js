// dark-mode.js

class DarkModeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'system';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
        this.setupMenuToggle(); // Adicionar toggle do menu em todas as páginas
    }

    applyTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (this.theme === 'dark' || (this.theme === 'system' && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        this.updateToggle();
    }

    setupEventListeners() {
        // Listener para mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.theme === 'system') {
                this.applyTheme();
            }
        });
    }

    setupMenuToggle() {
        // Menu dropdown do usuário (funciona em todas as páginas)
        const userMenuButton = document.getElementById('user-menu-button') || 
                              document.getElementById('user-menu-button-detail');
        const userDropdown = document.getElementById('user-dropdown') || 
                            document.getElementById('user-dropdown-detail');

        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            // Fechar dropdown quando clicar fora
            document.addEventListener('click', function() {
                userDropdown.classList.add('hidden');
            });

            // Prevenir fechamento quando clicar dentro do dropdown
            userDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }

    toggleDarkMode(enable) {
        if (enable) {
            this.theme = 'dark';
        } else {
            this.theme = 'light';
        }
        
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    updateToggle() {
        const darkModeToggle = document.getElementById('modo-escuro');
        if (darkModeToggle) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            darkModeToggle.checked = isDark;
            
            const parent = darkModeToggle.closest('.preference-item');
            if (parent) {
                if (isDark) {
                    parent.classList.add('active');
                } else {
                    parent.classList.remove('active');
                }
            }
        }
    }

    switchTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        this.applyTheme();
        
        // Mostrar notificação se a função existir
        if (typeof this.showNotification === 'function') {
            this.showNotification(`Modo ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
        }
    }

    // Sistema de notificações (opcional, para usar em todas as páginas)
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            background: ${type === 'success' ? 'var(--secondary)' : 'hsl(0, 84%, 60%)'};
            color: white;
            box-shadow: var(--shadow-medium);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease;
        `;
        
        notification.querySelector('button').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.darkModeManager = new DarkModeManager();
});

// Função global para alternar o tema
function toggleDarkMode() {
    if (window.darkModeManager) {
        window.darkModeManager.switchTheme();
    }
}

// Adicionar CSS para animação da notificação se não existir
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}