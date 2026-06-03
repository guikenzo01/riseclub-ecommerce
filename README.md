# Rise Club E-commerce

MVP de e-commerce desenvolvido para a Rise Club, grupo de corrida, com foco na venda de produtos oficiais e retirada combinada nos treinos/corres.

O projeto foi criado para entrega academica como um sistema de informacao funcional, com fluxo de cliente, fluxo de administrador, carrinho, pedidos, controle de estoque, banco de dados e painel administrativo.

## Tecnologias usadas

Este projeto nao foi feito apenas com HTML, CSS e JavaScript puro. Ele usa uma estrutura full stack com:

- **Next.js 14**: framework principal do projeto.
- **React**: criacao das telas e componentes.
- **TypeScript**: JavaScript tipado para reduzir erros.
- **Tailwind CSS**: estilização da interface.
- **Prisma**: conexao e modelagem do banco de dados.
- **SQLite**: banco local usado no MVP.

## Front-end e back-end

O projeto tem front-end e back-end no mesmo repositório.

**Front-end**

Fica principalmente em:

```text
src/app
src/components
```

Inclui as telas da loja, login, cadastro, produto, carrinho, checkout, pedidos e admin.

**Back-end**

Fica em:

```text
src/app/api
src/server
```

Inclui as APIs de produtos, clientes, login, pedidos, cupons e avaliacoes.

**Banco de dados**

Fica configurado em:

```text
prisma/schema.prisma
prisma.config.ts
```

O banco usado no MVP e SQLite com Prisma.

## Como rodar o projeto

Dentro da pasta do projeto:

```bash
npm install
npm run dev
```

Depois acesse:

```text
http://localhost:3000
```

## Banco de dados

Para preparar o banco local:

```bash
npx prisma generate
npx prisma db push
```

Para popular com dados iniciais:

```bash
npm run db:seed
```

Para abrir o painel visual do banco:

```bash
npm run db:studio
```

O arquivo `.env.example` mostra a variavel usada:

```text
DATABASE_URL="file:./dev.db"
```

## Paginas principais

- `/` - vitrine com busca, filtro por categoria, filtro por tamanho e compra rapida.
- `/produto/[id]` - detalhe do produto com imagem, preco, tamanho, cor, quantidade e avaliacoes.
- `/checkout` - carrinho, cupom, resumo, retirada nos treinos/corres, Pix simulado e confirmacao do pedido.
- `/login` - login unico para cliente e administrador.
- `/cadastro` - cadastro de cliente com senha e validacao de e-mail duplicado.
- `/recuperar-senha` - recuperacao simples por e-mail e WhatsApp.
- `/conta` - area da conta do cliente.
- `/pedidos` - pedidos da conta logada; admin visualiza todos.
- `/pedidos/[id]` - detalhe, recibo e acompanhamento do pedido.
- `/admin` - painel administrativo.
- `/treinos`, `/sobre`, `/participar` - paginas institucionais da Rise Club.

## Funcionalidades do usuario comum

- Cadastro com nome, e-mail, WhatsApp e senha.
- Validacao de senha com minimo de 5 caracteres.
- Bloqueio de e-mail duplicado.
- Login com e-mail e senha.
- Listagem de produtos com nome, preco e imagem.
- Filtro por categoria e tamanho.
- Tela de detalhe do produto.
- Escolha de tamanho, cor e quantidade.
- Carrinho com adicionar, remover e alterar quantidade.
- Calculo de subtotal, desconto e total.
- Cupom de desconto.
- Retirada combinada nos treinos/corres da Rise Club.
- Pix simulado.
- Geracao de numero de pedido.
- Consulta de status do pedido.
- Acesso restrito aos proprios pedidos.

## Funcionalidades do administrador

- Login usando a mesma tela de login.
- Aba `Admin` disponivel no menu quando o admin esta logado.
- Cadastro de produtos.
- Edicao de produtos pelo catalogo.
- Ativar/inativar produtos.
- Remover produtos.
- Controle de estoque.
- Visualizacao de pedidos.
- Alteracao de status dos pedidos.
- Visualizacao de clientes.
- Gerenciamento de cupons.
- Visualizacao de avaliacoes.
- Indicadores de faturamento, pedidos abertos, produtos ativos e clientes.

## Status dos pedidos

Os status foram definidos para evitar confusao com entrega/retirada:

- `Pedido criado`
- `Separando`
- `Pronto para retirada`
- `Retirado`

Assim, um pedido novo nao aparece como se ja tivesse sido entregue.

## Acessos do MVP

**Cliente**

Use `/cadastro` para criar uma conta.

Depois use `/login` com e-mail e senha.

**Administrador**

Use `/login` com:

```text
E-mail: admin@riseclub.com
Senha: rise123
```

Depois do login, a aba `Admin` fica disponivel no menu.

## APIs locais

- `GET/POST /api/products`
- `PATCH/DELETE /api/products/[id]`
- `GET/POST /api/orders`
- `GET/PATCH /api/orders/[id]`
- `GET/POST /api/coupons`
- `PATCH/DELETE /api/coupons/[code]`
- `GET/POST /api/customers`
- `GET/PATCH /api/customers/[email]`
- `POST /api/auth/customer`
- `POST /api/auth/recover`
- `GET/POST /api/reviews`

## Estrutura resumida

```text
riseclub-ecommerce
├── prisma
│   └── schema.prisma
├── public
│   ├── gallery
│   └── logo
├── src
│   ├── app
│   ├── components
│   ├── lib
│   └── server
├── package.json
└── README.md
```

## Observacoes

Este projeto e um MVP academico. Algumas partes sao simuladas:

- Pix simulado.
- Login administrativo simples.
- Senhas sem criptografia real.
- Sem upload real de imagens.
- Sem integracao com gateway de pagamento.
- Sem deploy de producao configurado.

Mesmo assim, o sistema possui front-end, back-end, banco de dados, rotas de API, regras de estoque, pedidos, carrinho e painel administrativo funcionando localmente.
