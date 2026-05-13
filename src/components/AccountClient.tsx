"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAccount, CustomerAccount, readAccount, saveAccount } from "@/lib/auth";
import type { Order } from "@/lib/orders";
import { formatCurrency } from "@/lib/products";

export default function AccountClient() {
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    async function loadAccount() {
      const localAccount = readAccount();
      if (!localAccount) return;

      const customerResponse = await fetch(`/api/customers/${encodeURIComponent(localAccount.email)}`);
      const customer = customerResponse.ok ? await customerResponse.json() as CustomerAccount : localAccount;
      saveAccount(customer);
      setAccount(customer);

      const ordersResponse = await fetch("/api/orders");
      const orders = await ordersResponse.json() as Order[];
      const customerOrders = orders.filter((order) => order.customer.email.toLowerCase() === customer.email.toLowerCase());
      setOrdersCount(customerOrders.length);
      setOrdersTotal(customerOrders.reduce((total, order) => total + order.total, 0));
    }
    loadAccount();
  }, []);

  function logout() {
    clearAccount();
    setAccount(null);
  }

  if (!account) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h1 className="text-3xl font-black text-white">Voce ainda nao tem conta.</h1>
          <p className="mt-2 text-zinc-400">Crie uma conta para preencher o checkout automaticamente e salvar seus dados no banco da loja.</p>
          <Link href="/cadastro" className="mt-5 inline-flex rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950">
            Criar conta
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Minha conta</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Ola, {account.name.split(" ")[0]}</h1>
        <p className="mt-2 text-zinc-400">Gerencie seus dados e acompanhe sua relacao com a Rise Club Store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
          <p className="text-sm text-zinc-400">Pedidos</p>
          <p className="mt-2 text-3xl font-black text-amber-300">{ordersCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
          <p className="text-sm text-zinc-400">Total comprado</p>
          <p className="mt-2 text-3xl font-black text-amber-300">{formatCurrency(ordersTotal)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
          <p className="text-sm text-zinc-400">Cliente desde</p>
          <p className="mt-2 text-2xl font-black text-amber-300">{new Date(account.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      <section className="mt-8 rounded-lg border border-white/10 bg-zinc-950/70 p-5">
        <h2 className="text-xl font-black text-white">Dados salvos no backend</h2>
        <div className="mt-4 grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
          <p>Nome: {account.name}</p>
          <p>E-mail: {account.email}</p>
          <p>WhatsApp: {account.phone}</p>
          <p>Retirada: combinada nos treinos da Rise Club</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/cadastro" className="focus-ring rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200">
            Editar dados
          </Link>
          <Link href="/pedidos" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">
            Ver pedidos
          </Link>
          <button onClick={logout} className="focus-ring rounded-lg border border-red-300/30 px-5 py-3 text-sm font-semibold text-red-200 hover:bg-red-300/10">
            Sair
          </button>
        </div>
      </section>
    </main>
  );
}
