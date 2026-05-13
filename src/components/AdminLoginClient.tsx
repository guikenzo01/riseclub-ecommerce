"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { adminCredentials, saveAdminSession, validateAdminLogin } from "@/lib/auth";

export default function AdminLoginClient() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validateAdminLogin(form.email, form.password)) {
      setError("E-mail ou senha de administrador invalidos.");
      return;
    }

    saveAdminSession({
      email: adminCredentials.email,
      name: "Administrador Rise",
      role: "admin",
      createdAt: new Date().toISOString()
    });
    router.push("/");
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-6">
      <section className="self-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Backoffice</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Acesso administrativo.</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-300">
          Interface separada para quem gerencia catalogo, estoque, cupons, clientes e pedidos da Rise Club Store.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-black text-white">Login do admin</h2>
        <div className="mt-4 rounded-lg border border-white/10 bg-zinc-950/70 p-4 text-sm text-zinc-300">
          <p className="font-black text-white">Credenciais do MVP</p>
          <p className="mt-1">E-mail: {adminCredentials.email}</p>
          <p>Senha: {adminCredentials.password}</p>
        </div>
        <div className="mt-5 grid gap-4">
          <input required type="email" className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="E-mail do admin" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required type="password" className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Senha" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </div>
        {error && <p className="mt-4 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm font-semibold text-red-100">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="focus-ring rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200">
            Entrar no admin
          </button>
          <Link href="/" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">
            Voltar para loja
          </Link>
        </div>
      </form>
    </main>
  );
}
