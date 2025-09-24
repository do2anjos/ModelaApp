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
Servidor Web: Utiliza o framework Express.js para criar um servidor Node.js robusto.

Servir Arquivos Estáticos: Configurado para servir todo o conteúdo da pasta public, que abriga o front-end da aplicação.

Pronto para Deploy: O projeto está configurado para deploy contínuo na plataforma Render.

🛠️ Tecnologias Utilizadas
Node.js - Ambiente de execução para JavaScript no lado do servidor.

Express.js - Framework minimalista para aplicações web em Node.js.

Nodemon - Ferramenta para reiniciar o servidor automaticamente durante o desenvolvimento.

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

Scripts Disponíveis
npm start: Inicia o servidor em modo de produção. É este o comando que a Render utiliza.

npm run dev: Inicia o servidor em modo de desenvolvimento com nodemon.

☁️ Deploy
Este projeto é publicado automaticamente na plataforma Render. Qualquer push para a branch main do repositório no GitHub irá acionar um novo deploy, atualizando o site que está no ar.

👤 Autor
Feito por do2anjos.
