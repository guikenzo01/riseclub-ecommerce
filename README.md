# Rise Club Store

Prototipo avancado de e-commerce para a Rise Club, criado a partir do site do grupo de corrida e das oportunidades do projeto academico.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Paginas

- `/` - vitrine com busca, filtros e compra rapida.
- `/produto/[id]` - pagina de detalhe com tamanho, cor, quantidade e avaliacoes.
- `/checkout` - carrinho, dados do cliente, Pix simulado, retirada no treino e pedido.
- `/login` - login unico que diferencia cliente e administrador.
- `/cadastro` - cadastro e edicao dos dados do cliente.
- `/recuperar-senha` - recuperacao simples por e-mail e WhatsApp.
- `/conta` - perfil local do cliente.
- `/pedidos` - historico local de pedidos.
- `/pedidos/[id]` - detalhe do pedido, recibo, acompanhamento e recompra.
- `/admin` - painel para produtos, cupons, pedidos, estoque, ranking e avaliacoes.
- `/treinos`, `/sobre`, `/participar` - paginas institucionais da Rise.

## Recursos prontos

- Backend local em rotas `/api/*` com persistencia principal em SQLite pelo Prisma.
- Clientes salvos no backend por `/api/customers`.
- Login simples separado entre cliente e administrador.
- Area administrativa restrita por sessao simples de admin.
- Catalogo com produtos base e produtos cadastrados no admin.
- Carrinho persistente no navegador.
- Cupons dinamicos com percentual, valor fixo, minimo de compra e status ativo/inativo.
- Retirada dos pedidos nos treinos da Rise Club.
- Pagamento por Pix simulado no checkout.
- Geracao de pedidos com baixa de estoque.
- Validacao de estoque no servidor antes de criar pedido.
- Painel administrativo local.
- Mini CRM no admin com clientes, pedidos, contato e total comprado.
- Conta local do cliente com preenchimento automatico do checkout.
- Avaliacoes por produto com media dinamica e painel no admin.

## Acessos do MVP

Cliente:
- Use `/cadastro` para criar conta com nome, e-mail, telefone e senha.
- A senha do cliente precisa ter pelo menos 5 caracteres.
- Use `/login` para entrar com e-mail e senha.
- Use `/recuperar-senha` para redefinir a senha com e-mail e WhatsApp cadastrados.

Administrador:
- Use `/login` com as credenciais de admin.
- E-mail: `admin@riseclub.com`
- Senha: `rise123`
- O sistema redireciona automaticamente para `/admin`.

## APIs locais

- `GET/POST /api/products`
- `PATCH/DELETE /api/products/[id]`
- `GET/POST /api/orders`
- `GET/PATCH /api/orders/[id]`
- `GET/POST /api/coupons`
- `PATCH/DELETE /api/coupons/[code]`
- `GET/POST /api/reviews`
- `GET/POST /api/customers`
- `GET/PATCH /api/customers/[email]`

## Banco de dados

O projeto ja tem schema Prisma com SQLite em `prisma/schema.prisma`.

Para ativar o banco real:

```bash
npm install prisma @prisma/client
npx prisma generate
npx prisma db push
npm run db:seed
```

Depois, use `npm run db:studio` para abrir o painel visual do banco.

Produtos, cupons, pedidos, clientes e avaliacoes ja estao conectados ao SQLite pelo Prisma. O JSON local permanece apenas como fallback de desenvolvimento.

Na versao 7 do Prisma, a URL do banco fica em `prisma.config.ts`.

## Observacao

Este backend ja usa SQLite/Prisma nas principais entidades. Para producao, os proximos passos sao autenticacao real, pagamentos, upload de imagens e deploy.
