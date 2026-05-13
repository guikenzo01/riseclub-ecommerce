"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CustomerAccount, saveAccount } from "@/lib/auth";

export default function RecoverPasswordClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (form.password.length < 5) {
      setError("A nova senha precisa ter pelo menos 5 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    setMessage("Validando dados...");
    const response = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        phone: form.phone,
        password: form.password
      })
    });

    if (!response.ok) {
      const data = await response.json() as { message?: string };
      setMessage("");
      setError(data.message || "Nao foi possivel recuperar a senha.");
      return;
    }

    const account = await response.json() as CustomerAccount;
    saveAccount(account);
    setMessage("Senha atualizada com sucesso.");
    window.setTimeout(() => router.push("/conta"), 700);
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-6">
      <section className="self-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Recuperacao</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Recupere sua senha.</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-300">
          Para o MVP, a recuperacao valida o e-mail e o WhatsApp cadastrados antes de permitir uma nova senha.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-black text-white">Dados de recuperacao</h2>
        <div className="mt-5 grid gap-4">
          <input required type="email" className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="E-mail cadastrado" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="WhatsApp cadastrado" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <input required type="password" minLength={5} className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Nova senha" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <input required type="password" minLength={5} className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Confirmar nova senha" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
        </div>
        {message && <p className="mt-4 text-sm font-semibold text-emerald-200">{message}</p>}
        {error && <p className="mt-4 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm font-semibold text-red-100">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="focus-ring rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200">
            Atualizar senha
          </button>
          <Link href="/login" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">
            Voltar ao login
          </Link>
        </div>
      </form>
    </main>
  );
}
