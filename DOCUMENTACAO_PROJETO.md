# Documentacao do Projeto Rise Club E-commerce

## 1. Visao geral

O projeto **Rise Club E-commerce** foi desenvolvido como um MVP, ou seja, uma primeira versao funcional de um sistema de informacao para venda de produtos da Rise Club.

A ideia principal do sistema e permitir que usuarios comuns possam:

- visualizar produtos;
- filtrar produtos;
- ver detalhes de cada item;
- adicionar produtos ao carrinho;
- finalizar um pedido com Pix simulado;
- acompanhar o status do pedido.

E permitir que o administrador possa:

- cadastrar produtos;
- editar produtos;
- visualizar pedidos;
- alterar o status dos pedidos;
- acompanhar clientes, estoque e vendas.

O foco do projeto nao foi criar uma loja real pronta para producao, mas sim um sistema funcional para apresentacao academica, com fluxo de cliente, fluxo de administrador, banco de dados e regras basicas de negocio.

## 2. Tecnologias usadas

O projeto nao foi feito apenas com HTML, CSS e JavaScript puro.

Ele foi desenvolvido usando tecnologias modernas de desenvolvimento web:

- **Next.js**: framework principal do projeto.
- **React**: biblioteca usada para construir as telas e componentes.
- **TypeScript**: versao tipada do JavaScript, usada para reduzir erros no codigo.
- **Tailwind CSS**: ferramenta usada para estilizar as telas.
- **Prisma**: ferramenta usada para conectar o sistema ao banco de dados.
- **SQLite**: banco de dados local usado no MVP.

Na pratica, o projeto usa HTML, CSS e JavaScript por baixo, porque todo site web funciona com essas tecnologias no navegador. Porem, em vez de escrever tudo manualmente em arquivos separados de HTML, CSS e JS puro, foi usado o framework **Next.js com React**, que organiza melhor o projeto e facilita a criacao de telas, rotas, APIs e componentes reutilizaveis.

## 3. Por que foi usado Next.js

O **Next.js** foi escolhido porque ele permite criar no mesmo projeto:

- as paginas do site;
- os componentes visuais;
- as rotas de backend;
- a conexao com o banco de dados;
- a logica de cadastro, login, pedidos e produtos.

Assim, o projeto fica mais organizado do que um site feito somente com HTML, CSS e JavaScript puro.

Exemplo:

- a pagina inicial fica em `src/app/page.tsx`;
- a pagina de login fica em `src/app/login/page.tsx`;
- a API de produtos fica em `src/app/api/products/route.ts`;
- a API de pedidos fica em `src/app/api/orders/route.ts`;
- os componentes visuais ficam em `src/components`.

## 4. Estrutura principal do projeto

A estrutura mais importante do projeto e:

```text
riseclub-ecommerce
├── prisma
│   └── schema.prisma
├── src
│   ├── app
│   │   ├── page.tsx
│   │   ├── login
│   │   ├── cadastro
│   │   ├── checkout
│   │   ├── pedidos
│   │   ├── produto
│   │   ├── admin
│   │   └── api
│   ├── components
│   ├── lib
│   └── server
├── package.json
└── README.md
```

### `src/app`

Guarda as paginas e rotas do sistema.

Exemplos:

- `/` mostra a vitrine da loja.
- `/login` mostra a tela de login.
- `/cadastro` mostra a tela de cadastro.
- `/checkout` mostra o carrinho e finalizacao do pedido.
- `/pedidos` mostra os pedidos.
- `/admin` mostra o painel administrativo.

### `src/components`

Guarda os componentes visuais do projeto.

Exemplos:

- `Storefront.tsx`: vitrine da loja.
- `ProductDetail.tsx`: tela de detalhes do produto.
- `CheckoutClient.tsx`: carrinho e finalizacao do pedido.
- `LoginClient.tsx`: login.
- `CadastroClient.tsx`: cadastro.
- `AdminClient.tsx`: painel administrativo.
- `OrdersClient.tsx`: lista de pedidos.

### `src/app/api`

Guarda as APIs internas do sistema.

Essas APIs fazem o papel de backend.

Exemplos:

- `/api/products`: cria e lista produtos.
- `/api/orders`: cria e lista pedidos.
- `/api/customers`: cria e lista clientes.
- `/api/auth/customer`: faz login do cliente.

### `src/lib`

Guarda funcoes auxiliares e tipos usados no sistema.

Exemplos:

- funcoes do carrinho;
- regras de cupons;
- tipos de produto;
- tipos de pedido;
- regras simples de autenticacao.

### `src/server`

Guarda a parte que conversa com o banco de dados.

Exemplos:

- leitura dos dados;
- gravacao dos dados;
- validacao de estoque;
- baixa de estoque depois do pedido.

## 5. Banco de dados

O projeto usa **SQLite** como banco de dados local.

O SQLite foi escolhido porque e simples para um MVP academico: ele salva os dados em um arquivo local, sem precisar instalar um servidor de banco separado.

A ferramenta usada para organizar o banco foi o **Prisma**.

O arquivo principal do banco e:

```text
prisma/schema.prisma
```

Nele ficam os modelos principais do sistema:

- `Product`: produtos.
- `Customer`: clientes.
- `Order`: pedidos.
- `OrderItem`: itens de cada pedido.
- `Coupon`: cupons.
- `Review`: avaliacoes.

## 6. Fluxo do usuario comum

O usuario comum consegue usar o sistema da seguinte forma:

1. Acessa a loja.
2. Visualiza os produtos.
3. Filtra por categoria ou tamanho.
4. Abre a tela de detalhes de um produto.
5. Escolhe tamanho, cor e quantidade.
6. Adiciona ao carrinho.
7. Vai para o checkout.
8. Informa dados de contato.
9. Confirma o Pix simulado.
10. Finaliza o pedido.
11. Recebe um numero de pedido.
12. Acompanha o status em `/pedidos`.

Como a Rise Club entrega os produtos nos treinos, o sistema nao pede endereco de entrega. A retirada e combinada diretamente nos treinos.

## 7. Cadastro e login

O cadastro do usuario comum possui:

- nome;
- e-mail;
- WhatsApp;
- senha;
- confirmacao de senha.

Foram implementadas validacoes importantes:

- senha com minimo de 5 caracteres;
- confirmacao de senha igual a senha;
- bloqueio de e-mail duplicado.

O login do usuario comum e feito com:

- e-mail;
- senha.

Tambem existe uma tela simples de **esqueci minha senha**, usando e-mail e WhatsApp para simular a recuperacao.

## 8. Login do administrador

A tela de login e unica para cliente e administrador.

Se o usuario entrar com uma conta comum, ele acessa a interface de cliente.

Se entrar com as credenciais de administrador, o sistema identifica que e admin e libera a aba **Admin** no menu.

Credenciais do MVP:

```text
E-mail: admin@riseclub.com
Senha: rise123
```

Essa autenticacao de administrador e simples, feita para fins de MVP e apresentacao academica. Em um sistema real, seria necessario usar autenticacao mais segura, com senha criptografada, controle de sessao no servidor e permissoes mais robustas.

## 9. Produtos

Cada produto possui informacoes como:

- nome;
- categoria;
- preco;
- imagem;
- estoque;
- tamanhos;
- cores;
- descricao;
- SKU;
- status ativo/inativo.

Na loja, o usuario consegue:

- ver nome, preco e imagem;
- buscar produtos;
- filtrar por categoria;
- filtrar por tamanho;
- ordenar por destaque, avaliacao, estoque ou preco;
- acessar a tela de detalhes.

## 10. Carrinho e checkout

O carrinho permite:

- adicionar produto;
- remover produto;
- alterar quantidade;
- calcular subtotal;
- aplicar cupom;
- calcular desconto;
- mostrar total final.

Antes de confirmar o pedido, o usuario ve um resumo com:

- itens escolhidos;
- quantidade;
- subtotal;
- desconto;
- total;
- dados do cliente;
- informacao de retirada nos treinos.

O pagamento e um **Pix simulado**. Isso significa que nao existe integracao real com banco ou gateway de pagamento. O usuario apenas marca que o Pix foi simulado para finalizar o pedido.

## 11. Pedidos

Quando o pedido e finalizado, o sistema:

1. valida se existe estoque suficiente;
2. calcula os totais;
3. gera um numero de pedido;
4. salva o pedido no banco;
5. reduz o estoque dos produtos comprados;
6. cria o status inicial como `Pedido criado`.

O numero do pedido segue um formato simples, por exemplo:

```text
RC-123456
```

O usuario pode consultar seus pedidos em:

```text
/pedidos
```

E ver detalhes de um pedido em:

```text
/pedidos/[id]
```

## 12. Painel administrativo

O painel administrativo fica em:

```text
/admin
```

Nele o administrador consegue:

- cadastrar produtos;
- editar produtos;
- remover produtos;
- controlar estoque;
- visualizar pedidos;
- alterar status dos pedidos;
- visualizar clientes;
- acompanhar indicadores basicos;
- gerenciar cupons;
- visualizar avaliacoes.

Os status de pedido podem ser alterados pelo administrador para acompanhar o andamento do pedido.

## 13. APIs do sistema

O projeto possui APIs internas, que funcionam como backend.

Principais rotas:

```text
GET    /api/products
POST   /api/products
PATCH  /api/products/[id]
DELETE /api/products/[id]

GET    /api/orders
POST   /api/orders
PATCH  /api/orders/[id]

GET    /api/customers
POST   /api/customers

POST   /api/auth/customer
POST   /api/auth/recover

GET    /api/coupons
POST   /api/coupons
PATCH  /api/coupons/[code]
DELETE /api/coupons/[code]

GET    /api/reviews
POST   /api/reviews
```

Essas rotas permitem que a interface converse com o banco de dados.

## 14. Como rodar o projeto

Para rodar o projeto, e necessario ter o Node.js instalado.

Depois, dentro da pasta do projeto:

```bash
npm install
npm run dev
```

Depois acesse:

```text
http://localhost:3000
```

Para preparar o banco de dados:

```bash
npx prisma generate
npx prisma db push
```

Para abrir o painel visual do banco:

```bash
npm run db:studio
```

## 15. O que ja esta pronto no MVP

### Usuario comum

- Cadastro com validacao.
- Bloqueio de e-mail duplicado.
- Login com e-mail e senha.
- Listagem de produtos.
- Filtro por categoria.
- Filtro por tamanho.
- Tela de detalhes.
- Escolha de tamanho, cor e quantidade.
- Validacao de estoque.
- Carrinho com adicionar, remover e alterar quantidade.
- Calculo de total.
- Resumo antes de confirmar pedido.
- Pix simulado.
- Geracao de numero de pedido.
- Consulta de status do pedido.

### Administrador

- Login administrativo.
- Cadastro de produtos.
- Edicao de produtos.
- Remocao de produtos.
- Visualizacao de pedidos.
- Alteracao de status dos pedidos.
- Controle de estoque.
- Visualizacao de clientes.
- Gerenciamento de cupons.

## 16. Limitacoes do MVP

Como o projeto foi feito para entrega academica e nao para producao real, algumas partes sao simuladas ou simplificadas:

- O Pix e simulado.
- O login admin e simples.
- As senhas ainda nao usam criptografia real.
- Nao existe upload real de imagens.
- Nao existe integracao com transportadora, porque a retirada e feita nos treinos.
- Nao existe deploy em servidor online ainda.

Esses pontos podem ser evoluidos em uma versao futura.

## 17. Resumo para apresentar ao grupo

O projeto foi criado com **Next.js, React, TypeScript, Tailwind CSS, Prisma e SQLite**.

Ele nao e apenas um site estatico em HTML, CSS e JavaScript puro. Ele e uma aplicacao web completa, com frontend, backend, banco de dados, cadastro, login, carrinho, pedidos, estoque e painel administrativo.

O sistema funciona como um MVP de e-commerce para a Rise Club, focado na venda de produtos do grupo e retirada nos treinos.
