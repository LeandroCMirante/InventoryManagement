# Gestão de Estoque e Vendas

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 Sobre o Projeto

Este é um sistema completo de gestão de inventário, desenvolvido para controlar o fluxo de produtos, desde a compra de fornecedores até a venda final. A aplicação permite o gerenciamento detalhado de produtos com múltiplas variações, o registro de entradas (compras) e saídas (vendas) de estoque, e a visualização de relatórios financeiros através de um dashboard interativo.

O projeto foi construído com uma arquitetura moderna, utilizando Next.js no frontend para uma experiência de usuário rápida e reativa, e um backend robusto com Node.js e Prisma para interagir com o banco de dados de forma segura e eficiente.

---

## ✨ Funcionalidades

-   **Autenticação:** Sistema de login seguro para usuários utilizando JWT.
-   **Dashboard:** Painel com relatórios de vendas, compras e lucro, com filtro por período.
-   **Gestão de Produtos:** CRUD completo para produtos e suas variações (ex: tamanho, cor, sabor).
-   **Gestão de Compras:** CRUD completo para compras (entrada de estoque), com detalhes de fornecedor, custo e itens.
-   **Gestão de Vendas:** CRUD completo para vendas (saída de estoque), com atualização e validação automática da quantidade de produtos.
-   **Cache Inteligente:** Utilização do RTK Query para caching de dados, revalidação automática e uma interface de usuário otimizada que reflete as alterações em tempo real.

---

## 🛠️ Tecnologias Utilizadas

A aplicação é um monorepo dividido em `server` (backend) e `client` (frontend).

### Backend

-   **Node.js:** Ambiente de execução JavaScript.
-   **Express.js:** Framework para a construção da API REST.
-   **Prisma:** ORM de última geração para interação com o banco de dados, garantindo segurança e tipagem.
-   **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
-   **JWT (JSON Web Token):** Para autenticação e autorização de rotas.
-   **Zod:** Para validação de esquemas e dados de entrada.

### Frontend

-   **Next.js (App Router):** Framework React para renderização no servidor e construção de interfaces rápidas.
-   **React:** Biblioteca para construção de interfaces de usuário.
-   **Redux Toolkit (RTK Query):** Para gerenciamento de estado global e data fetching, com caching e revalidação automática.
-   **TypeScript:** Para um desenvolvimento mais seguro e escalável.
-   **Tailwind CSS:** Framework CSS utility-first para estilização rápida e responsiva.
-   **ShadCN/UI:** Coleção de componentes de UI reutilizáveis e acessíveis.
-   **date-fns & react-day-picker:** Para manipulação e seleção de datas no dashboard.
-   **lucide-react:** Pacote de ícones.

---

## 🚀 Como Rodar o Projeto

Para rodar este projeto, você precisará configurar tanto o backend quanto o frontend.

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
-   Uma instância de banco de dados (ex: PostgreSQL, MySQL, SQLite) suportada pelo Prisma.

---

### 1. Configuração do Backend (`server`)

```sh
# 1. Navegue para a pasta do servidor
cd server

# 2. Instale as dependências
npm install

# 3. Crie um arquivo .env na raiz da pasta 'server'
#    Copie o conteúdo de .env.example (se houver) ou use o modelo abaixo:
touch .env
```

**Conteúdo do arquivo `.env`:**

```env
# URL de conexão com o seu banco de dados.
# Exemplo para PostgreSQL:
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"

# Chave secreta para a geração de tokens JWT
JWT_SECRET="SUA_CHAVE_SECRETA_SUPER_FORTE"
```

```sh
# 4. Rode as migrações do Prisma para criar as tabelas no banco de dados
npx prisma migrate dev

# 5. Inicie o servidor de desenvolvimento do backend
npm run dev
```

O servidor backend estará rodando, por padrão, em `http://localhost:8000`.

---

### 2. Configuração do Frontend (`client`)

```sh
# 1. Em um novo terminal, navegue para a pasta do cliente (ou a raiz do projeto)
cd client

# 2. Instale as dependências
npm install

# 3. Se ainda não tiver configurado o ShadCN/UI, rode o comando:
npx shadcn-ui@latest init

# 4. Crie um arquivo .env.local na raiz da pasta 'client'
touch .env.local
```

**Conteúdo do arquivo `.env.local`:**

```env
# URL onde a sua API do backend está rodando
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```sh
# 5. Inicie o servidor de desenvolvimento do frontend
npm run dev
```

O servidor frontend estará rodando, por padrão, em `http://localhost:3000`. Abra este endereço no seu navegador para ver a aplicação.
