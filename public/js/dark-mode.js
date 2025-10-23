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

    // Verificar se a página atual é de autenticação (deve ficar sempre clara)
    isAuthPage() {
        const currentPage = window.location.pathname;
        const authPages = ['/index.html', '/', '/login.html', '/cadastro.html', '/redefinir.html'];
        return authPages.includes(currentPage) || currentPage.endsWith('/');
    }

    applyTheme() {
        // Se for página de autenticação, sempre forçar tema claro
        if (this.isAuthPage()) {
            document.documentElement.setAttribute('data-theme', 'light');
            this.updateLogo('light');
            return;
        }

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (this.theme === 'dark' || (this.theme === 'system' && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateLogo('dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.updateLogo('light');
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
        // Suporta múltiplos menus na mesma página
        const menus = [
            { button: 'user-menu-button', dropdown: 'user-dropdown' },
            { button: 'user-menu-button-detail', dropdown: 'user-dropdown-detail' }
        ];

        menus.forEach(menu => {
            const userMenuButton = document.getElementById(menu.button);
            const userDropdown = document.getElementById(menu.dropdown);

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
        });
    }

    toggleDarkMode(enable) {
        // Não permitir mudança de tema em páginas de autenticação
        if (this.isAuthPage()) {
            return;
        }

        if (enable) {
            this.theme = 'dark';
        } else {
            this.theme = 'light';
        }

        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    updateLogo(theme) {
        console.log('🔄 Dark mode - Updating logo for theme:', theme);

        // Trocar logo baseada no tema (evitar conflito com inicialização precoce)
        const logos = document.querySelectorAll('img[src*="Modela"]:not(#main-logo)');
        console.log('📸 Other logos found:', logos.length);
        logos.forEach(logo => {
            if (theme === 'dark') {
                // Tema escuro: usar Modela+p.png
                if (logo.src.includes('Modela+a.png')) {
                    logo.src = logo.src.replace('Modela+a.png', 'Modela+p.png');
                    console.log('🔄 Changed to dark logo:', logo.src);
                }
            } else {
                // Tema claro: usar Modela+a.png
                if (logo.src.includes('Modela+p.png')) {
                    logo.src = logo.src.replace('Modela+p.png', 'Modela+a.png');
                    console.log('🔄 Changed to light logo:', logo.src);
                }
            }
        });

        // Atualizar logo principal se necessário
        const mainLogo = document.getElementById('main-logo');
        if (mainLogo) {
            const expectedSrc = theme === 'dark' ? '/Modela+p.png' : '/Modela+a.png';
            console.log('🎯 Main logo current:', mainLogo.src, 'expected:', expectedSrc);
            if (!mainLogo.src.includes(expectedSrc)) {
                mainLogo.src = expectedSrc;
                console.log('🔄 Updated main logo to:', expectedSrc);
            } else {
                console.log('✅ Main logo already correct');
            }
        }
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
        // Não permitir mudança de tema em páginas de autenticação
        if (this.isAuthPage()) {
            return;
        }

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