// daltonism-mode.js

class DaltonismManager {
    constructor() {
        this.daltonism = localStorage.getItem('daltonism') || 'nenhum';
        this.init();
    }

    init() {
        this.applyDaltonism();
        this.setupControls();
        this.updateToggle(); // Atualizar toggle em todas as páginas
    }

    // Verificar se a página atual é de autenticação (deve ficar sempre sem daltonismo)
    isAuthPage() {
        const currentPage = window.location.pathname;
        const authPages = ['/index.html', '/', '/login.html', '/cadastro.html', '/redefinir.html'];
        return authPages.includes(currentPage) || currentPage.endsWith('/');
    }

    applyDaltonism() {
        // Aplicar filtro de daltonismo apenas via atributo + CSS (sem SVG)
        const root = document.documentElement;
        root.style.filter = '';
        
        // Se for página de autenticação, não aplicar daltonismo
        if (this.isAuthPage()) {
            root.removeAttribute('data-daltonismo');
            return;
        }
        
        if (this.daltonism && this.daltonism !== 'nenhum') {
            root.setAttribute('data-daltonismo', this.daltonism);
        } else {
            root.removeAttribute('data-daltonismo');
        }
    }

    setupControls() {
        // Configurar controles apenas na página de configurações
        if (!window.location.pathname.includes('configuracoes.html')) {
            return;
        }

        // Aguardar DOM estar pronto
        const daltonismToggle = document.getElementById('modo-daltonismo');
        const daltonismSelect = document.getElementById('tipo-daltonismo');

        if (!daltonismToggle || !daltonismSelect) {
            return;
        }

        // Atualizar controles iniciais
        this.updateControls();

        // Event listener para toggle
        daltonismToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            const selectedType = (daltonismSelect.value && daltonismSelect.value !== 'nenhum')
                ? daltonismSelect.value
                : 'protanopia';

            if (isEnabled) {
                this.daltonism = selectedType;
                daltonismSelect.disabled = false;
                // Garantir que o select mostre o tipo aplicado
                daltonismSelect.value = selectedType;
            } else {
                this.daltonism = 'nenhum';
                daltonismSelect.disabled = true;
            }

            localStorage.setItem('daltonism', this.daltonism);
            this.applyDaltonism();
            this.updateControls();
        });

        // Event listener para seletor de tipo
        daltonismSelect.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            
            if (this.daltonism !== 'nenhum') {
                this.daltonism = selectedType;
                localStorage.setItem('daltonism', this.daltonism);
                this.applyDaltonism();
            }
        });
    }

    updateControls() {
        const daltonismToggle = document.getElementById('modo-daltonismo');
        const daltonismSelect = document.getElementById('tipo-daltonismo');

        if (daltonismToggle && daltonismSelect) {
            const isEnabled = this.daltonism !== 'nenhum';
            daltonismToggle.checked = isEnabled;
            daltonismSelect.value = this.daltonism;
            daltonismSelect.disabled = !isEnabled;

            const parent = daltonismToggle.closest('.preference-item');
            if (parent) {
                if (isEnabled) {
                    parent.classList.add('active');
                } else {
                    parent.classList.remove('active');
                }
            }
        }
    }

    updateToggle() {
        // Atualizar toggle em todas as páginas (se existir)
        const daltonismToggle = document.getElementById('modo-daltonismo');
        if (daltonismToggle) {
            const isEnabled = this.daltonism !== 'nenhum';
            daltonismToggle.checked = isEnabled;

            const parent = daltonismToggle.closest('.preference-item');
            if (parent) {
                if (isEnabled) {
                    parent.classList.add('active');
                } else {
                    parent.classList.remove('active');
                }
            }
        }
    }

    toggleDaltonism(enable, type = 'protanopia') {
        // Não permitir mudança de daltonismo em páginas de autenticação
        if (this.isAuthPage()) {
            return;
        }

        if (enable) {
            this.daltonism = type;
        } else {
            this.daltonism = 'nenhum';
        }

        localStorage.setItem('daltonism', this.daltonism);
        this.applyDaltonism();
        this.updateControls();
        this.updateToggle();
    }

    switchDaltonism() {
        // Não permitir mudança de daltonismo em páginas de autenticação
        if (this.isAuthPage()) {
            return;
        }

        const currentDaltonism = document.documentElement.getAttribute('data-daltonismo');
        if (currentDaltonism && currentDaltonism !== 'nenhum') {
            // Se está ativo, desativar
            this.daltonism = 'nenhum';
        } else {
            // Se está inativo, ativar com protanopia como padrão
            this.daltonism = 'protanopia';
        }

        localStorage.setItem('daltonism', this.daltonism);
        this.applyDaltonism();
        this.updateControls();
        this.updateToggle();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.daltonismManager = new DaltonismManager();
});

// Função global para alternar o daltonismo
function toggleDaltonism() {
    if (window.daltonismManager) {
        window.daltonismManager.switchDaltonism();
    }
}

