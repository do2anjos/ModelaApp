// daltonism-mode.js
// Sistema de daltonismo cientificamente otimizado
// Baseado na teoria das cores para daltônicos

class DaltonismManager {
    constructor() {
        this.daltonism = localStorage.getItem('daltonism') || 'nenhum';
        this.isInitialized = false;
        this.observers = new Set();
        this.init();
    }

    init() {
        try {
            this.applyDaltonism();
            this.setupControls();
            this.updateToggle();
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('🎨 DaltonismManager inicializado com sucesso');
            console.log(`🎨 Tipo de daltonismo ativo: ${this.daltonism}`);
        } catch (error) {
            console.error('❌ Erro ao inicializar DaltonismManager:', error);
        }
    }

    // Verificar se a página atual é de autenticação (deve ficar sempre sem daltonismo)
    isAuthPage() {
        const currentPage = window.location.pathname;
        const authPages = ['/index.html', '/', '/login.html', '/cadastro.html', '/redefinir.html'];
        return authPages.includes(currentPage) || currentPage.endsWith('/');
    }

    applyDaltonism() {
        try {
            const root = document.documentElement;
            root.style.filter = '';
            
            // Se for página de autenticação, não aplicar daltonismo
            if (this.isAuthPage()) {
                root.removeAttribute('data-daltonismo');
                console.log('🔒 Página de autenticação detectada - daltonismo desabilitado');
                return;
            }
            
            if (this.daltonism && this.daltonism !== 'nenhum') {
                root.setAttribute('data-daltonismo', this.daltonism);
                console.log(`🎨 Aplicando daltonismo: ${this.daltonism}`);
                
                // Notificar observadores
                this.notifyObservers('daltonism-applied', this.daltonism);
            } else {
                root.removeAttribute('data-daltonismo');
                console.log('🎨 Daltonismo removido');
                
                // Notificar observadores
                this.notifyObservers('daltonism-removed', null);
            }
        } catch (error) {
            console.error('❌ Erro ao aplicar daltonismo:', error);
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
            console.warn('⚠️ Controles de daltonismo não encontrados na página de configurações');
            return;
        }

        // Atualizar controles iniciais
        this.updateControls();

        // Event listener para toggle
        daltonismToggle.addEventListener('change', (e) => {
            try {
                const isEnabled = e.target.checked;
                const selectedType = (daltonismSelect.value && daltonismSelect.value !== 'nenhum')
                    ? daltonismSelect.value
                    : 'protanopia';

                if (isEnabled) {
                    this.daltonism = selectedType;
                    daltonismSelect.disabled = false;
                    daltonismSelect.value = selectedType;
                    console.log(`🎨 Daltonismo ativado: ${selectedType}`);
                } else {
                    this.daltonism = 'nenhum';
                    daltonismSelect.disabled = true;
                    console.log('🎨 Daltonismo desativado');
                }

                localStorage.setItem('daltonism', this.daltonism);
                this.applyDaltonism();
                this.updateControls();
                
                // Notificar mudança
                this.notifyObservers('daltonism-changed', this.daltonism);
            } catch (error) {
                console.error('❌ Erro ao alterar daltonismo:', error);
            }
        });

        // Event listener para seletor de tipo
        daltonismSelect.addEventListener('change', (e) => {
            try {
                const selectedType = e.target.value;
                
                if (this.daltonism !== 'nenhum') {
                    this.daltonism = selectedType;
                    localStorage.setItem('daltonism', this.daltonism);
                    this.applyDaltonism();
                    console.log(`🎨 Tipo de daltonismo alterado para: ${selectedType}`);
                    
                    // Notificar mudança
                    this.notifyObservers('daltonism-type-changed', selectedType);
                }
            } catch (error) {
                console.error('❌ Erro ao alterar tipo de daltonismo:', error);
            }
        });
    }

    // Configurar event listeners globais
    setupEventListeners() {
        // Listener para mudanças de tema (sincronização com dark mode)
        document.addEventListener('theme-changed', (e) => {
            console.log('🎨 Tema alterado, verificando daltonismo...');
            this.updateControls();
        });

        // Listener para mudanças de página (SPA navigation)
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.setupControls();
                this.updateToggle();
            }, 100);
        });
    }

    updateControls() {
        try {
            const daltonismToggle = document.getElementById('modo-daltonismo');
            const daltonismSelect = document.getElementById('tipo-daltonismo');

            if (daltonismToggle && daltonismSelect) {
                const isEnabled = this.daltonism !== 'nenhum';
                daltonismToggle.checked = isEnabled;
                daltonismSelect.value = this.daltonism;
                daltonismSelect.disabled = !isEnabled;

                // Atualizar estado visual do container
                const parent = daltonismToggle.closest('.preference-item');
                if (parent) {
                    if (isEnabled) {
                        parent.classList.add('active');
                    } else {
                        parent.classList.remove('active');
                    }
                }

                console.log(`🎨 Controles atualizados - Ativo: ${isEnabled}, Tipo: ${this.daltonism}`);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar controles:', error);
        }
    }

    // Sistema de observadores para notificar mudanças
    addObserver(callback) {
        this.observers.add(callback);
    }

    removeObserver(callback) {
        this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ Erro ao notificar observador:', error);
            }
        });
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
            console.log(`🎨 Modo daltonismo ativado: ${this.getDaltonismInfo(type)}`);
        } else {
            this.daltonism = 'nenhum';
            console.log('🎨 Modo daltonismo desativado');
        }

        localStorage.setItem('daltonism', this.daltonism);
        this.applyDaltonism();
        this.updateControls();
        this.updateToggle();
    }

    // Informações científicas sobre cada tipo de daltonismo
    getDaltonismInfo(type) {
        const info = {
            'protanopia': {
                name: 'Protanopia',
                description: 'Ausência de cones L (vermelho)',
                prevalence: '1% da população masculina',
                affects: 'Dificuldade para distinguir vermelho e verde',
                filter: 'Compensação de matiz +10°, saturação +20%, contraste +15%',
                severity: 'Moderada',
                coneType: 'L (Long-wavelength)',
                commonColors: ['Vermelho', 'Verde', 'Laranja', 'Marrom']
            },
            'deuteranopia': {
                name: 'Deuteranopia', 
                description: 'Ausência de cones M (verde)',
                prevalence: '1.5% da população masculina',
                affects: 'Dificuldade para distinguir verde e vermelho',
                filter: 'Compensação de matiz -5°, saturação +10%, contraste +20%',
                severity: 'Moderada',
                coneType: 'M (Medium-wavelength)',
                commonColors: ['Verde', 'Vermelho', 'Amarelo', 'Marrom']
            },
            'tritanopia': {
                name: 'Tritanopia',
                description: 'Ausência de cones S (azul)', 
                prevalence: '0.003% da população',
                affects: 'Dificuldade para distinguir azul e amarelo',
                filter: 'Compensação de matiz +15°, saturação +30%, contraste +25%',
                severity: 'Rara',
                coneType: 'S (Short-wavelength)',
                commonColors: ['Azul', 'Amarelo', 'Roxo', 'Rosa']
            }
        };
        
        return info[type] || { 
            name: 'Tipo não reconhecido',
            description: 'Tipo de daltonismo não identificado',
            prevalence: 'Desconhecida',
            affects: 'Efeitos desconhecidos',
            filter: 'Nenhum filtro aplicado',
            severity: 'Desconhecida',
            coneType: 'Desconhecido',
            commonColors: []
        };
    }

    // Obter informações do daltonismo ativo
    getCurrentDaltonismInfo() {
        return this.getDaltonismInfo(this.daltonism);
    }

    // Verificar se o daltonismo está ativo
    isDaltonismActive() {
        return this.daltonism && this.daltonism !== 'nenhum';
    }

    // Obter lista de todos os tipos disponíveis
    getAvailableTypes() {
        return ['protanopia', 'deuteranopia', 'tritanopia'];
    }

    // Validar tipo de daltonismo
    isValidType(type) {
        return this.getAvailableTypes().includes(type);
    }

    switchDaltonism() {
        try {
            // Não permitir mudança de daltonismo em páginas de autenticação
            if (this.isAuthPage()) {
                console.log('🔒 Mudança de daltonismo bloqueada em página de autenticação');
                return;
            }

            const currentDaltonism = document.documentElement.getAttribute('data-daltonismo');
            if (currentDaltonism && currentDaltonism !== 'nenhum') {
                // Se está ativo, desativar
                this.daltonism = 'nenhum';
                console.log('🎨 Daltonismo desativado via switch');
            } else {
                // Se está inativo, ativar com protanopia como padrão
                this.daltonism = 'protanopia';
                console.log('🎨 Daltonismo ativado via switch (protanopia)');
            }

            localStorage.setItem('daltonism', this.daltonism);
            this.applyDaltonism();
            this.updateControls();
            this.updateToggle();
            
            // Notificar mudança
            this.notifyObservers('daltonism-switched', this.daltonism);
        } catch (error) {
            console.error('❌ Erro ao alternar daltonismo:', error);
        }
    }

    // Métodos de debug e estatísticas
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentDaltonism: this.daltonism,
            isActive: this.isDaltonismActive(),
            isAuthPage: this.isAuthPage(),
            currentPage: window.location.pathname,
            hasObservers: this.observers.size > 0,
            localStorageValue: localStorage.getItem('daltonism'),
            domAttribute: document.documentElement.getAttribute('data-daltonismo')
        };
    }

    // Log de estatísticas para debug
    logStats() {
        const info = this.getCurrentDaltonismInfo();
        console.group('🎨 DaltonismManager - Estatísticas');
        console.log('Tipo ativo:', info.name);
        console.log('Descrição:', info.description);
        console.log('Prevalência:', info.prevalence);
        console.log('Cores afetadas:', info.commonColors.join(', '));
        console.log('Filtro aplicado:', info.filter);
        console.log('Página atual:', window.location.pathname);
        console.log('É página de auth:', this.isAuthPage());
        console.groupEnd();
    }

    // Reset para estado padrão
    reset() {
        try {
            this.daltonism = 'nenhum';
            localStorage.removeItem('daltonism');
            document.documentElement.removeAttribute('data-daltonismo');
            this.updateControls();
            this.updateToggle();
            
            console.log('🎨 DaltonismManager resetado para estado padrão');
            this.notifyObservers('daltonism-reset', null);
        } catch (error) {
            console.error('❌ Erro ao resetar daltonismo:', error);
        }
    }

    // Destruir instância (cleanup)
    destroy() {
        try {
            this.observers.clear();
            this.isInitialized = false;
            console.log('🎨 DaltonismManager destruído');
        } catch (error) {
            console.error('❌ Erro ao destruir DaltonismManager:', error);
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.daltonismManager = new DaltonismManager();
        
        // Adicionar métodos globais para debug (apenas em desenvolvimento)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.debugDaltonism = () => window.daltonismManager?.getDebugInfo();
            window.logDaltonismStats = () => window.daltonismManager?.logStats();
            window.resetDaltonism = () => window.daltonismManager?.reset();
            
            console.log('🎨 Métodos de debug disponíveis:');
            console.log('  - debugDaltonism(): Obter informações de debug');
            console.log('  - logDaltonismStats(): Log de estatísticas');
            console.log('  - resetDaltonism(): Resetar para estado padrão');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar DaltonismManager:', error);
    }
});

// Função global para alternar o daltonismo
function toggleDaltonism() {
    if (window.daltonismManager) {
        window.daltonismManager.switchDaltonism();
    } else {
        console.warn('⚠️ DaltonismManager não está disponível');
    }
}

// Função global para ativar daltonismo específico
function enableDaltonism(type = 'protanopia') {
    if (window.daltonismManager) {
        if (window.daltonismManager.isValidType(type)) {
            window.daltonismManager.toggleDaltonism(true, type);
        } else {
            console.warn(`⚠️ Tipo de daltonismo inválido: ${type}`);
            console.log('Tipos disponíveis:', window.daltonismManager.getAvailableTypes());
        }
    } else {
        console.warn('⚠️ DaltonismManager não está disponível');
    }
}

// Função global para desativar daltonismo
function disableDaltonism() {
    if (window.daltonismManager) {
        window.daltonismManager.toggleDaltonism(false);
    } else {
        console.warn('⚠️ DaltonismManager não está disponível');
    }
}

// Função global para obter informações do daltonismo ativo
function getDaltonismInfo() {
    if (window.daltonismManager) {
        return window.daltonismManager.getCurrentDaltonismInfo();
    } else {
        console.warn('⚠️ DaltonismManager não está disponível');
        return null;
    }
}

// Exportar para uso em módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DaltonismManager, toggleDaltonism, enableDaltonism, disableDaltonism, getDaltonismInfo };
}

