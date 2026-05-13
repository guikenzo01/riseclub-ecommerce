# Banco de dados Rise Club

Este projeto ja esta preparado para usar Prisma com SQLite. Por enquanto a loja continua rodando com o arquivo `data/riseclub-store.json`, porque o Prisma ainda precisa ser instalado na maquina.

## 1. Instalar Prisma

No terminal do projeto:

```powershell
npm install prisma @prisma/client
```

## 2. Configurar variavel de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="file:./dev.db"
```

## 3. Criar as tabelas

```powershell
npx prisma generate
npx prisma db push
```

## 4. Abrir painel visual do banco

Popular produtos e cupons iniciais:

```powershell
npm run db:seed
```

Abrir o painel visual:

```powershell
npx prisma studio
```

## Estrutura criada

- `Product`: catalogo de produtos da Rise Club.
- `Coupon`: cupons de desconto.
- `Customer`: clientes cadastrados na conta.
- `Order`: pedido com endereco, entrega, pagamento e totais.
- `OrderItem`: itens comprados em cada pedido.
- `Review`: avaliacoes dos produtos.

## Proximo passo tecnico

Produtos, cupons, pedidos, clientes e avaliacoes ja passam pelo Prisma Client em `src/server/store.ts`. O JSON local permanece apenas como fallback de desenvolvimento.

Depois de mudancas no `schema.prisma`, rode:

```powershell
npx prisma db push
npx prisma generate
```

## Observacao sobre Prisma 7

Na versao 7 do Prisma, a URL do banco fica em `prisma.config.ts`, nao mais dentro do `schema.prisma`. Por isso o projeto tem:

```ts
datasource: {
  url: env("DATABASE_URL")
}
```
