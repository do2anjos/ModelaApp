# 🧪 Guia de Teste - Fluxo Completo de Aulas

## 📋 Checklist de Teste

### 1️⃣ **Assistir 90% do Vídeo**

**Ações:**
- [ ] Abra a aula "Introdução à UML"
- [ ] Assista o vídeo até 90% ou mais

**Logs Esperados no Console:**
```
✅ Vídeo completado (90%+): Introdução à UML - Unified Modeling Language
🔄 updateUserProgress chamada: Introdução à UML... {videoCompleted: true, videoProgress: 100}
📊 Estado atualizado do userProgress: {videoCompleted: true, ...}
✅ Exercício desbloqueado (vídeo 90%+)
```

**Resultado Esperado:**
- ✅ Aba "Exercício" deve ficar desbloqueada (sem cadeado, clicável)
- ✅ Ícone da aula muda para "video-watched"
- ❌ Aula NÃO deve ser marcada como concluída ainda
- ❌ Contador de progresso ainda deve ser "0/10"

---

### 2️⃣ **Responder Exercícios**

**Ações:**
- [ ] Clique na aba "Exercício"
- [ ] Responda todas as 4 questões
- [ ] Clique em "Verificar Respostas"

**Logs Esperados (1ª tentativa, 100% acertos):**
```
🎯 registerExerciseAttempt chamada: {lessonTitle: "...", score: 4, total: 4}
💾 REGISTRANDO TENTATIVA DE EXERCÍCIO
✅ TENTATIVA REGISTRADA COM SUCESSO!
✅ Pontos: 10 (ou proporcional ao acerto)
✅ Primeira tentativa: true
🎉 Primeira tentativa! Mostrando pontos: 10
```

**Resultado Esperado:**
- ✅ Notificação de pontos aparece (canto superior direito): "+10 pontos!"
- ✅ Feedback detalhado de cada questão é exibido
- ✅ Se 100% correto: Aba "Atividade Prática" é desbloqueada
- ✅ Scroll automático até a aba "Atividade Prática"
- ✅ Botão "Ir para Atividade Prática" aparece

---

### 3️⃣ **Enviar Atividade Prática**

**Ações:**
- [ ] Clique em "Ir para Atividade Prática"
- [ ] Navegue pelos passos da atividade
- [ ] Selecione um arquivo (PNG, JPG, SVG ou PDF)
- [ ] Clique em "🚀 Enviar Atividade"

**Logs Esperados:**
```
🚀 BOTÃO ENVIAR ATIVIDADE CLICADO!
🚀 currentLessonTitle: Introdução à UML...
🚀 selectedFile: [File object]
📊 Estado ANTES do envio: {videoCompleted: true, exerciseCompleted: true, ...}
🔄 updateUserProgress chamada: ... {practicalSubmitted: true, practicalCompleted: true}
📊 Estado APÓS marcar como enviada: {videoCompleted: true, exerciseCompleted: true, practicalSubmitted: true, practicalCompleted: true}
✅ Feedback visual mostrado
🔄 Atualizando estado dos botões após envio da atividade...
✅ updateButtonStates chamada
🎯 Desbloqueando botão "Próxima Aula"...
✅ showNextLessonButton() chamada
✅ unlockNextLessonButton() chamada
✅ Botão "Próxima Aula" mostrado e desbloqueado
📜 Scroll automático para botão "Próxima Aula" executado
```

**Resultado Esperado:**
- ✅ Feedback de sucesso aparece
- ✅ Botão "Próxima Aula" aparece no HEADER (topo da página)
- ✅ Botão "Próxima Aula" está DESBLOQUEADO (clicável, sem cadeado)
- ✅ Scroll automático leva até o botão
- ❌ Aula ainda NÃO está marcada como concluída
- ❌ Contador ainda é "0/10"

---

### 4️⃣ **Clicar em Próxima Aula**

**Ações:**
- [ ] Clique no botão "Próxima Aula" no header

**Logs Esperados:**
```
🎯 BOTÃO PRÓXIMA AULA CLICADO!
🎯 Aula atual: Introdução à UML...
🎯 Estado ANTES da marcação: {videoCompleted: true, exerciseCompleted: true, practicalSubmitted: true, practicalCompleted: true}
📊 Verificação de etapas:
  videoCompleted: true
  exerciseCompleted: true
  practicalSubmitted: true
  practicalCompleted: true
  hasAllStages: true
✅ Todas as etapas completadas - prosseguindo com marcação...
🔄 updateUserProgress chamada: ... {completed: true, fullyCompleted: true, completedAt: "..."}
✅ BLINDAGEM PASSOU!
✅ Todas as etapas completas
✅ Prosseguindo com marcação como concluída...
📊 Estado atualizado do userProgress: {videoCompleted: true, exerciseCompleted: true, practicalSubmitted: true, practicalCompleted: true, completed: true, fullyCompleted: true}
🏆 AULA MARCADA COMO CONCLUÍDA!
🏆 Iniciando processo de pontuação...
👤 Usuário: [user_id]
🗺️ Mapping: {moduleId: 1, lessonId: 1}
✅ Mapping encontrado - prosseguindo...
🎯 Chamando awardLessonPoints para lessonId: 1
🏆 awardLessonPoints INICIADA
🏆 userId: [user_id]
🏆 lessonId: 1
💰 Atribuindo +5 pontos...
✅ PONTOS ATRIBUÍDOS COM SUCESSO!
✅ Aula 1 concluída: +5 pts
📊 Atualizando progresso do tópico: 1/10
✅ Ícone da aula atual atualizado para "completed"
✅ Contadores de progresso atualizados
🔓 Desbloqueando próxima aula...
✅ Próxima aula desbloqueada
🔄 Navegando para próxima aula...
```

**Resultado Esperado:**
- ✅ Notificação de pontos: "+5 pontos! 🎉"
- ✅ Ícone da aula muda para "✓" (completed)
- ✅ Contador atualiza: "Modelagem com UML 0/10" → "1/10"
- ✅ Próxima aula ("O que é um Diagrama de Classes") é desbloqueada
- ✅ Navegação automática para a próxima aula

---

## 🚨 Problemas Conhecidos e Soluções

### ❌ Problema: "Aba Atividade Prática não desbloqueia"
**Solução:** Verifique se acertou 100% do exercício. Só desbloqueia com pontuação completa.

### ❌ Problema: "Botão Próxima Aula não aparece"
**Solução:** 
1. Verifique se enviou a atividade prática
2. Veja os logs: `practicalSubmitted` deve ser `true`
3. Recarregue a página e tente novamente

### ❌ Problema: "Não pontua ao clicar em Próxima Aula"
**Solução:**
1. Abra o console (F12)
2. Procure por "🏆 awardLessonPoints"
3. Se não aparecer, verifique se `LESSON_MAPPING` está definido
4. Verifique se o backend `/api/user/:userId/score` está respondendo

### ❌ Problema: "Contador não atualiza (fica 0/10)"
**Solução:**
1. Verifique se a função `updateTopicProgress` está sendo chamada
2. Verifique se `userProgress[lessonTitle].completed === true`
3. Recarregue a página após completar a aula

---

## 🔍 Como Debugar

### 1. **Abra o Console do Navegador**
```
F12 → Console
```

### 2. **Verifique o Estado do Progresso**
```javascript
// No console, digite:
console.log(window.userProgress || userProgress);
```

### 3. **Force a Atualização do Contador**
```javascript
// No console, digite:
document.querySelectorAll('.topic-accordion').forEach(acc => {
    const progressSpan = acc.querySelector('.topic-progress');
    const lessonLinks = acc.querySelectorAll('.lesson-list a');
    console.log('Total aulas:', lessonLinks.length);
    console.log('Aulas completas:', document.querySelectorAll('.lesson-icon.completed').length);
});
```

### 4. **Verifique Pontuação no Backend**
```javascript
// No console, digite (substitua USER_ID):
fetch('/api/user/USER_ID/score/lesson/1')
  .then(r => r.json())
  .then(data => console.log('Pontuação da aula 1:', data));
```

---

## ✅ Resumo do Fluxo Correto

```
90% Vídeo → Desbloqueia Exercício
            ↓
      Responde Questões → Pontua (1ª tentativa)
            ↓
      100% Acertos → Desbloqueia Atividade Prática
            ↓
      Envia Arquivo → Desbloqueia Botão "Próxima Aula"
            ↓
      Clica "Próxima Aula" → Marca como Concluída + Pontua +5
            ↓
      Contador Atualiza (0/10 → 1/10) + Desbloqueia Próxima Aula
```

---

## 📞 Se nada funcionar...

1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Recarregue a página (Ctrl + F5)
3. Verifique se o backend está rodando
4. Verifique se há erros no console
5. Exporte os logs do console e compartilhe

---

**Última atualização:** Correção completa do fluxo de aulas

