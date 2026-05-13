"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  adminCredentials,
  CustomerAccount,
  readAccount,
  saveAccount,
  saveAdminSession,
  validateAdminLogin
} from "@/lib/auth";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const account = readAccount();
    if (account) {
      setEmail(account.email);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") || "").trim();
    const submittedPassword = String(formData.get("password") || "");

    setEmail(submittedEmail);
    setPassword(submittedPassword);
    setError("");
    setStatus("Validando acesso...");

    if (validateAdminLogin(submittedEmail, submittedPassword)) {
      saveAdminSession({
        email: adminCredentials.email,
        name: "Administrador Rise",
        role: "admin",
        createdAt: new Date().toISOString()
      });
      router.push("/");
      return;
    }

    const response = await fetch("/api/auth/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: submittedEmail,
        password: submittedPassword
      })
    });

    if (!response.ok) {
      const data = await response.json() as { message?: string };
      setStatus("");
      setError(data.message || "E-mail ou senha invalidos.");
      return;
    }

    const account = await response.json() as CustomerAccount;
    saveAccount(account);
    router.push("/conta");
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-6">
      <section className="self-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Acesso Rise</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Entre com seu perfil.</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-300">
          Clientes acessam conta, checkout e pedidos. Administradores entram pelas mesmas credenciais e passam a ver a aba Admin no menu.
        </p>
        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm text-zinc-300">
          Credencial admin do MVP: {adminCredentials.email} / {adminCredentials.password}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
        <h2 className="text-xl font-black text-white">Login</h2>
        <label className="mt-5 grid gap-2 text-sm font-semibold text-zinc-300">
          E-mail
          <input
            required
            name="email"
            type="email"
            className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-300">
          Senha
          <input
            required
            name="password"
            type="password"
            minLength={5}
            className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white"
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {status && <p className="mt-4 text-sm font-semibold text-amber-200">{status}</p>}
        {error && <p className="mt-4 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm font-semibold text-red-100">{error}</p>}
        <Link href="/recuperar-senha" className="mt-4 inline-flex text-sm font-semibold text-amber-300 hover:text-amber-200">
          Esqueci minha senha
        </Link>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className="focus-ring rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200">
            Entrar
          </button>
          <Link href="/cadastro" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">
            Criar cadastro
          </Link>
        </div>
      </form>
    </main>
  );
}
