"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CustomerAccount, readAccount, saveAccount } from "@/lib/auth";

export default function CadastroClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const account = readAccount();
    if (account) {
      setForm({
        name: account.name,
        email: account.email,
        phone: account.phone,
        password: "",
        confirmPassword: ""
      });
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password.length < 5) {
      setStatus("A senha precisa ter pelo menos 5 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus("As senhas nao conferem.");
      return;
    }
    setStatus("Salvando cadastro...");
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: {
          cep: "",
          street: "Retirada no treino",
          number: "",
          city: "Sao Paulo",
          state: "SP"
        }
      })
    });

    if (!response.ok) {
      const data = await response.json() as { message?: string };
      setStatus(data.message || "Nao foi possivel salvar o cadastro.");
      return;
    }

    const account = await response.json() as CustomerAccount;
    saveAccount(account);
    router.push("/conta");
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-6">
      <section className="self-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Cadastro</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Crie sua conta Rise.</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-300">
          O cadastro salva seus dados de contato para agilizar checkout, pedidos e atendimento nos treinos.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-black text-white">Dados do cliente</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Nome completo" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input required type="email" className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="E-mail" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="WhatsApp" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <input required type="password" minLength={5} className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Senha (min. 5 caracteres)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <input required type="password" minLength={5} className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Confirmar senha" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
        </div>
        <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
          Os pedidos sao combinados para retirada nos treinos da Rise Club.
        </p>
        {status && <p className="mt-4 text-sm font-semibold text-amber-200">{status}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className="focus-ring rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200">
            Salvar cadastro
          </button>
          <Link href="/login" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">
            Ja tenho conta
          </Link>
        </div>
      </form>
    </main>
  );
}
