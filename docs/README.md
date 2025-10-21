ModelaApp - Projeto de Sistemas
Este repositório contém o código-fonte do ModelaApp, o projeto prático desenvolvido para o curso de Modelagem e Projeto de Sistemas, como parte da disciplina de Design Instrucional.

O objetivo desta aplicação é servir como a implementação FullStack para o sistema proposto no curso. No estágio atual de protótipo, o servidor (construído com Node.js e Express) é responsável por servir o conteúdo estático principal da aplicação (HTML).

O site está publicado e pode ser acessado em: https://modelaapp.onrender.com

Sobre o Curso: Modelagem e Projeto de Sistemas
Este projeto é o resultado prático do curso Modelagem e Projeto de Sistemas, voltado para estudantes de graduação em Computação e áreas afins.

O objetivo geral do curso é formar estudantes para compreenderem e aplicarem técnicas de análise de requisitos, modelagem e projeto de sistemas, utilizando boas práticas de desenvolvimento de software.

Tópicos abordados na ementa:
Levantamento e análise de requisitos funcionais e não funcionais.

Modelagem com UML, Diagrama de Entidade-Relacionamento (ER) e IDEF0.

Construção de CRUDs (Create, Read, Update, Delete) básicos.

Desenvolvimento de protótipos navegáveis.

Integração entre teoria e prática com base em metodologias de aprendizagem significativa.

✨ Funcionalidades do Projeto

## 🎓 **Sistema de Aprendizado**
- **Plataforma de Cursos**: Sistema completo de aulas com vídeos do YouTube
- **Exercícios Interativos**: Questões de concursos (CESPE, Quadrix, FGV) com feedback detalhado *(21/10/2025)*
- **Atividade Prática com Diagramas UML**: Editor Draw.io embarcado para criação de modelos *(19/10/2025)*
- **Progresso do Usuário**: Acompanhamento de aulas concluídas e exercícios realizados
- **Sistema de Certificação**: Modal interativo com visualização em tela cheia e download *(21/10/2025)*
- **Ranking de Alunos**: Sistema de gamificação com pontuação e ranking

## 🎨 **Interface e Experiência**
- **Design Responsivo**: Interface adaptada para desktop, tablet e mobile
- **Modo Escuro/Claro**: Alternância entre temas com persistência no localStorage
- **Modo Daltonismo**: Acessibilidade para usuários com deficiência visual (protanopia, deuteranopia, tritanopia)
- **Navegação Intuitiva**: Breadcrumbs, skip links e navegação por teclado
- **Feedback Visual**: Estados de carregamento, validação em tempo real e mensagens de sistema

## ♿ **Acessibilidade (WCAG 2.1 AA)**
- **Navegação por Teclado**: Suporte completo a Tab, Enter, ESC
- **ARIA Labels**: Semântica adequada para leitores de tela
- **Contraste Adequado**: Cores que atendem padrões de acessibilidade
- **Skip Links**: Links para pular para o conteúdo principal
- **Modo Daltonismo**: Filtros CSS cientificamente otimizados

## 🔧 **Arquitetura Técnica**
- **Servidor Web**: Express.js para servir conteúdo estático
- **Frontend Modular**: JavaScript organizado em classes (DarkModeManager, DaltonismManager, UsabilityManager)
- **CSS Variables**: Sistema de design consistente com variáveis CSS (4000+ linhas)
- **Performance**: Lazy loading, animações otimizadas e código modular
- **Draw.io API Integration**: Editor de diagramas embarcado via `iframe` *(19/10/2025)*
- **Sistema de Tabs**: Navegação moderna sem rolagem entre seções *(15/10/2025)*
- **YouTube API**: Integração completa com player de vídeos *(15/10/2025)*
- **Sistema de Fórum**: Plataforma completa de discussão e interação *(15/10/2025)*
- **Configurações Avançadas**: Interface otimizada com contraste melhorado *(15/10/2025)*
- **Gamificação Rigorosa**: Sistema que exige 100% de acertos para avançar *(15/10/2025)*
- **Conclusão Automática**: Aulas concluídas automaticamente após exercícios *(15/10/2025)*
- **Interface Simplificada**: Remoção de botões desnecessários para UX mais limpa *(15/10/2025)*
- **Sistema de Bloqueio Visual**: Botão "Próxima Aula" com indicadores de estado *(15/10/2025)*
- **Estados Visuais Claros**: Feedback imediato sobre disponibilidade de avanço *(15/10/2025)*

🛠️ Tecnologias Utilizadas

## **Backend**
- **Node.js** - Ambiente de execução para JavaScript no lado do servidor
- **Express.js** - Framework minimalista para aplicações web em Node.js
- **Nodemon** - Ferramenta para reiniciar o servidor automaticamente durante o desenvolvimento

## **Frontend**
- **HTML5** - Estrutura semântica com ARIA labels
- **CSS3** - Variáveis CSS, Grid, Flexbox, Animações
- **JavaScript (ES6+)** - Classes, Modules, Async/Await, LocalStorage
- **YouTube API** - Integração com player de vídeos
- **Draw.io API** - Editor de diagramas UML embarcado *(19/10/2025)*

## **Design e UX**
- **Google Fonts** - Tipografia (Montserrat + Roboto)
- **SVG Icons** - Ícones vetoriais escaláveis
- **CSS Filters** - Modo daltonismo cientificamente otimizado
- **Responsive Design** - Mobile-first approach

## **Acessibilidade**
- **WCAG 2.1 AA** - Padrões de acessibilidade web
- **ARIA** - Atributos para leitores de tela
- **Keyboard Navigation** - Navegação completa por teclado
- **Screen Reader Support** - Compatibilidade com tecnologias assistivas

🚀 Como Rodar o Projeto Localmente
Siga os passos abaixo para executar o projeto no seu próprio computador.

1. Clone o repositório
   git clone https://github.com/do2anjos/ModelaApp.git
   
2. Navegue até a pasta do projeto
   cd ModelaApp
   
3. Instale as dependências
   Este comando irá baixar todas as bibliotecas necessárias listadas no package.json.
   npm install

4. Execute o servidor em modo de desenvolvimento
   Este comando usa o nodemon para iniciar o servidor, que reiniciará automaticamente a cada alteração salva nos arquivos.
   npm run dev

5. Acesse no navegador
Após iniciar o servidor, você poderá acessá-lo em http://localhost:3000.

## 📄 **Estrutura do Projeto**

### **Organização dos Arquivos**
```
ModelaApp/
├── 📁 docs/                      # Documentação organizada
│   ├── 📄 README.md              # Este arquivo
│   ├── 📄 TECHNICAL_ARCHITECTURE.md # Arquitetura técnica
│   └── 📄 USABILITY_IMPROVEMENTS.md # Melhorias de UX
│
├── 📁 public/                    # Frontend organizado
│   ├── 📁 js/                    # Scripts JavaScript
│   │   ├── 🌙 dark-mode.js       # Gerenciador de temas
│   │   ├── 🎨 daltonism-mode.js  # Gerenciador daltonismo
│   │   └── ♿ usability.js        # Funcionalidades UX
│   │
│   ├── 📁 images/                # Imagens organizadas
│   │   ├── 📸 Modela+a.png       # Logo claro
│   │   ├── 📸 Modela+p.png       # Logo escuro
│   │   ├── 📸 flow-create.png    # Imagem cadastro
│   │   ├── 📸 uml-case.png       # Imagem login
│   │   ├── 📸 passflow.png       # Imagem redefinir
│   │   └── 📸 index-home.png     # Imagem home
│   │
│   ├── 🎨 index.html             # Páginas HTML
│   ├── 🔐 login.html
│   ├── 📝 cadastro.html
│   ├── 🏠 home.html
│   ├── 🎥 aulas.html
│   ├── 🎯 exercicios.html
│   ├── 📚 conteudos.html
│   ├── 💬 forum.html
│   ├── 🏆 ranking.html
│   ├── 🏅 certificado.html
│   ├── 👤 perfil.html
│   ├── ⚙️ configuracoes.html
│   └── 🎨 style.css
│
├── 📄 index.js                   # Servidor Express
└── 📄 package.json               # Dependências
```

### **Páginas Principais**
- **`index.html`** - Landing page com apresentação do curso
- **`login.html`** - Página de login (protótipo sem validação)
- **`cadastro.html`** - Página de cadastro (protótipo sem validação)
- **`home.html`** - Painel principal com dashboard e estatísticas
- **`aulas.html`** - Sistema completo de aulas com vídeos e exercícios
- **`exercicios.html`** - Plataforma de exercícios interativos
- **`conteudos.html`** - Lista de módulos e cursos disponíveis
- **`forum.html`** - Sistema de fórum e discussões
- **`ranking.html`** - Ranking de alunos com sistema de pontuação
- **`certificado.html`** - Geração e visualização de certificados
- **`perfil.html`** - Perfil do usuário e configurações pessoais
- **`configuracoes.html`** - Configurações avançadas (tema, daltonismo)

### **Funcionalidades Específicas**

#### **🎥 Sistema de Aulas (`aulas.html`)**
- **Player de vídeos integrado** com YouTube API
- **Sistema de progresso por vídeo** (90% para desbloquear exercícios)
- **Sistema de tabs interativo** - Navegação entre vídeo, exercício e atividade prática
- **Exercícios de concursos** - Questões de CESPE/CEBRASPE, Quadrix e FGV com feedback detalhado
- **Correção automática** - 4 questões corrigidas com explicações específicas para cada alternativa
- **Botão "Ir para Atividade Prática"** - Desbloqueado após 100% de acertos no exercício
- **Atividade prática com editor Draw.io** - Criação de diagramas UML com navegação por passos e upload de arquivo
- **Navegação sequencial** entre aulas com desbloqueio progressivo
- **Sistema de bloqueio progressivo** - Aulas desbloqueadas conforme progresso
- **Estados visuais dinâmicos** - Ícones que mudam conforme progresso (todo, play, video-watched, completed)
- **Atalhos de teclado** - Ctrl+1 (vídeo), Ctrl+2 (exercício), Ctrl+3 (atividade)
- **Feedback detalhado** - Explicações para cada questão com correções

#### **🎯 Sistema de Exercícios (`exercicios.html`)**
- Questões de múltipla escolha
- Feedback imediato com explicações
- Sistema de pontuação
- Integração com progresso do usuário

#### **🏆 Sistema de Gamificação**
- Ranking de alunos (`ranking.html`)
- Sistema de pontos por atividades
- Certificados de conclusão (`certificado.html`)
  - Modal interativo com visualização e download
  - Visualização em tela cheia simulando navegação
  - Botão "Voltar" para retornar à lista de certificados
- Progresso visual em dashboards

#### **🎨 Sistema de Temas**
- Modo escuro/claro com persistência
- Modo daltonismo (3 tipos: protanopia, deuteranopia, tritanopia)
- Filtros CSS cientificamente otimizados
- Transições suaves entre temas

Scripts Disponíveis
npm start: Inicia o servidor em modo de produção. É este o comando que a Render utiliza.

npm run dev: Inicia o servidor em modo de desenvolvimento com nodemon.

☁️ Deploy
Este projeto é publicado automaticamente na plataforma Render. Qualquer push para a branch main do repositório no GitHub irá acionar um novo deploy, atualizando o site que está no ar.

👤 Autor
Feito por do2anjos.
