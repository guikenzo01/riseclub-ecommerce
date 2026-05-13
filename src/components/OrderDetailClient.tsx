"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import type { Order } from "@/lib/orders";
import { orderStatuses } from "@/lib/orders";
import { findAnyProduct, formatCurrency } from "@/lib/products";

type OrderDetailClientProps = {
  orderId: string;
};

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order | undefined>();
  const [addedAgain, setAddedAgain] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        setOrder(undefined);
        return;
      }
      setOrder(await response.json());
    }
    loadOrder();
  }, [orderId]);

  const currentStatusIndex = useMemo(() => {
    if (!order) return 0;
    return orderStatuses.indexOf(order.status);
  }, [order]);

  function buyAgain() {
    if (!order) return;
    for (const item of order.items) {
      addToCart(item);
    }
    setAddedAgain(true);
    window.setTimeout(() => setAddedAgain(false), 2400);
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <Link href="/pedidos" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
          Voltar para pedidos
        </Link>
        <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h1 className="text-3xl font-black text-white">Pedido nao encontrado</h1>
          <p className="mt-2 text-zinc-400">Esse pedido pode ter sido removido ou ainda nao sincronizado com o banco.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link href="/pedidos" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
            Voltar para pedidos
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Detalhe do pedido</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">{order.id}</h1>
          <p className="mt-2 text-zinc-400">{new Date(order.createdAt).toLocaleString("pt-BR")} - {order.delivery} - {order.payment}</p>
        </div>
        <button onClick={buyAgain} className="focus-ring rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200">
          Comprar novamente
        </button>
      </div>

      {addedAgain && (
        <div className="mb-5 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-100">
          Itens adicionados ao carrinho.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <h2 className="text-xl font-black text-white">Acompanhamento</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {orderStatuses.map((status, index) => {
                const active = index <= currentStatusIndex;
                return (
                  <div key={status} className={["rounded-lg border p-4", active ? "border-amber-300 bg-amber-300 text-zinc-950" : "border-white/10 bg-zinc-950/70 text-zinc-400"].join(" ")}>
                    <p className="text-sm font-black">{status}</p>
                    <p className="mt-1 text-xs">{active ? "Etapa concluida ou em andamento" : "Proxima etapa"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <h2 className="text-xl font-black text-white">Itens</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => {
                const product = findAnyProduct(item.productId);
                if (!product) return null;
                return (
                  <article key={`${item.productId}-${item.size}-${item.color}`} className="grid gap-4 rounded-lg border border-white/10 bg-zinc-950/70 p-4 md:grid-cols-[84px_1fr_auto]">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">Tamanho {item.size} - Cor {item.color}</p>
                      <p className="mt-2 text-sm text-zinc-500">Quantidade: {item.quantity}</p>
                    </div>
                    <p className="font-black text-amber-300 md:text-right">{formatCurrency(product.price * item.quantity)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-white/10 bg-zinc-950/80 p-5">
          <h2 className="text-xl font-black text-white">Recibo</h2>
          <div className="mt-5 space-y-3 text-sm text-zinc-300">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Desconto</span><span>- {formatCurrency(order.discount)}</span></div>
            <div className="flex justify-between"><span>Retirada</span><span>Nos treinos</span></div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-lg font-black text-white"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>
          <div className="mt-5 rounded-lg bg-white/[0.06] p-4 text-sm text-zinc-300">
            <p className="font-black text-white">{order.customer.name}</p>
            <p className="mt-1">{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p className="mt-3">Retirada combinada nos treinos da Rise Club.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
