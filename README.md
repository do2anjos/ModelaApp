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
- **Exercícios Interativos**: Questões de múltipla escolha com feedback detalhado
- **Progresso do Usuário**: Acompanhamento de aulas concluídas e exercícios realizados
- **Sistema de Certificação**: Geração de certificados após conclusão dos módulos
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
- **CSS Variables**: Sistema de design consistente com variáveis CSS
- **Performance**: Lazy loading, animações otimizadas e código modular

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
- Player de vídeos integrado com YouTube API
- Sistema de progresso por vídeo (90% para desbloquear exercícios)
- Exercícios integrados com feedback detalhado
- Navegação sequencial entre aulas
- Sistema de bloqueio progressivo

#### **🎯 Sistema de Exercícios (`exercicios.html`)**
- Questões de múltipla escolha
- Feedback imediato com explicações
- Sistema de pontuação
- Integração com progresso do usuário

#### **🏆 Sistema de Gamificação**
- Ranking de alunos (`ranking.html`)
- Sistema de pontos por atividades
- Certificados de conclusão
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
