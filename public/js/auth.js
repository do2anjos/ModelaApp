// public/js/auth.js
// Script de autenticação e carregamento de dados do usuário

(function() {
  'use strict';

  // 1. PROTEÇÃO DE ROTA - Verifica se usuário está logado
  function checkAuth() {
    const userData = localStorage.getItem('modela_user');
    if (!userData) {
      console.warn('⚠️ Usuário não autenticado, redirecionando para login...');
      window.location.href = '/login.html';
      return null;
    }
    
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('❌ Erro ao parsear dados do usuário:', e);
      localStorage.removeItem('modela_user');
      window.location.href = '/login.html';
      return null;
    }
  }

  // 2. GERA INICIAIS DO NOME
  function getInitials(fullName) {
    if (!fullName) return 'U';
    
    const names = fullName
      .trim()
      .split(' ')
      .filter(n => n.length > 0);
    
    if (names.length === 0) return 'U';
    if (names.length === 1) return names[0][0].toUpperCase();
    
    // Primeira e última palavra
    const first = names[0][0].toUpperCase();
    const last = names[names.length - 1][0].toUpperCase();
    
    return first + last;
  }

  // 3. CARREGA PONTUAÇÃO DO USUÁRIO
  async function loadUserScore(userId) {
    try {
      const reqId = 'auth-score-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      console.log('[AUTH] ▶️ score', { reqId, userId });
      console.time(`[AUTH] tempo ${reqId}`);
      const response = await (window.apiFetch ? window.apiFetch(`/api/user/${userId}/total-score`, {
        headers: { 'X-Request-Id': reqId }
      }) : fetch(`/api/user/${userId}/total-score`, {
        headers: { 'X-Request-Id': reqId }
      }));
      console.timeEnd(`[AUTH] tempo ${reqId}`);
      console.log('[AUTH] ◀️ score response', { reqId, status: response.status, ok: response.ok });
      const data = await response.json();
      
      if (data.success) {
        // Adicionar pontuação ao dropdown do usuário
        const dropdownHeaders = document.querySelectorAll('.dropdown-header');
        dropdownHeaders.forEach(dropdown => {
          // Remove pontuação anterior se existir
          const existingScore = dropdown.querySelector('.user-score');
          if (existingScore) {
            existingScore.remove();
          }
          
          // Adiciona nova pontuação
          const scoreDiv = document.createElement('p');
          scoreDiv.className = 'user-score';
          scoreDiv.innerHTML = `<strong>${data.totalPoints}</strong> pontos`;
          scoreDiv.style.cssText = 'margin: 0.5rem 0; padding: 0.5rem; background: var(--muted); border-radius: 4px; text-align: center; font-size: 0.9rem; color: var(--foreground);';
          dropdown.appendChild(scoreDiv);
        });
        
        console.log('✅ Pontuação carregada:', data.totalPoints, 'pontos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pontuação:', error);
    }
  }

  // 4. PREENCHE DADOS DO USUÁRIO NA INTERFACE
  function populateUserData(user) {
    const initials = getInitials(user.nome);
    
    // Avatar (iniciais) - suporta múltiplos IDs
    const avatarSelectors = ['user-menu-button', 'user-menu-button-detail'];
    avatarSelectors.forEach(id => {
      const avatarBtn = document.getElementById(id);
      if (avatarBtn) {
        avatarBtn.textContent = initials;
        console.log('✅ Avatar atualizado:', id, initials);
      }
    });
    
    // Nome no dropdown - todos os elementos com classe .user-name
    const userNames = document.querySelectorAll('.user-name');
    userNames.forEach(userName => {
      userName.textContent = user.nome || 'Usuário';
    });
    if (userNames.length > 0) {
      console.log('✅ Nome atualizado em', userNames.length, 'lugares:', user.nome);
    }
    
    // Email no dropdown - todos os elementos com classe .user-email
    const userEmails = document.querySelectorAll('.user-email');
    userEmails.forEach(userEmail => {
      userEmail.textContent = user.email || '';
    });
    if (userEmails.length > 0) {
      console.log('✅ Email atualizado em', userEmails.length, 'lugares:', user.email);
    }

    // Carregar pontuação do usuário
    loadUserScore(user.id);
  }

  // 5. CONFIGURA LOGOUT
  function setupLogout() {
    // Encontra todos os links de "Sair"
    const allLinks = document.querySelectorAll('a');
    
    allLinks.forEach(link => {
      const linkText = link.textContent.trim();
      
      if (linkText.includes('Sair') || linkText.toLowerCase().includes('logout')) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          console.log('🚪 Realizando logout...');
          
          // Limpa dados do usuário
          localStorage.removeItem('modela_user');
          
          // Redireciona para login
          window.location.href = '/login.html';
        });
        
        console.log('✅ Logout configurado no link:', linkText);
      }
    });
  }

  // 6. INICIALIZAÇÃO
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Inicializando autenticação...');
    
    // Verifica autenticação
    const user = checkAuth();
    if (!user) return; // Já redireciona no checkAuth
    
    // Preenche dados do usuário
    populateUserData(user);
    
    // Configura logout
    setupLogout();
    
    console.log('✅ Autenticação inicializada com sucesso');
  });
})();

