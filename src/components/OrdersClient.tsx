"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/orders";
import { formatCurrency } from "@/lib/products";

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const refresh = async () => {
      const response = await fetch("/api/orders");
      setOrders(await response.json());
    };
    refresh();
    window.addEventListener("riseclub-orders-updated", refresh);
    return () => window.removeEventListener("riseclub-orders-updated", refresh);
  }, []);

  const totals = useMemo(() => {
    return {
      spent: orders.reduce((total, order) => total + order.total, 0),
      items: orders.reduce((total, order) => total + order.items.reduce((sum, item) => sum + item.quantity, 0), 0),
      open: orders.filter((order) => order.status !== "Entregue").length
    };
  }, [orders]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Minha conta</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Pedidos</h1>
        <p className="mt-2 text-zinc-400">Pedidos criados no checkout ficam salvos no banco da loja.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Total comprado" value={formatCurrency(totals.spent)} />
        <Metric label="Itens comprados" value={String(totals.items)} />
        <Metric label="Pedidos abertos" value={String(totals.open)} />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <p className="font-semibold text-white">Nenhum pedido encontrado.</p>
          <Link href="/" className="mt-4 inline-flex rounded-lg bg-amber-300 px-4 py-3 text-sm font-black text-zinc-950">
            Fazer primeira compra
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-xl font-black text-white">{order.id}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {new Date(order.createdAt).toLocaleString("pt-BR")} - {order.delivery} - {order.payment}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-zinc-400">{order.status}</p>
                  <p className="text-2xl font-black text-amber-300">{formatCurrency(order.total)}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-zinc-300 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p>Cliente: {order.customer.name}</p>
                  <p>Itens: {order.items.reduce((total, item) => total + item.quantity, 0)}</p>
                  <p>Contato: {order.customer.phone}</p>
                </div>
                <Link href={`/pedidos/${order.id}`} className="focus-ring rounded-lg bg-amber-300 px-4 py-3 text-center text-sm font-black text-zinc-950 hover:bg-amber-200">
                  Ver detalhe
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-amber-300">{value}</p>
    </div>
  );
}
