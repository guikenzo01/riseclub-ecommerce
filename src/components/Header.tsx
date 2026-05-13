"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { readAccount, readAdminSession } from "@/lib/auth";
import { getCartSummary, readCart } from "@/lib/cart";

const nav = [
  { href: "/", label: "Loja" },
  { href: "/checkout", label: "Carrinho" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/treinos", label: "Treinos" }
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [accountName, setAccountName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const updateCart = () => setCount(getCartSummary(readCart()).count);
    const updateAccount = () => setAccountName(readAccount()?.name.split(" ")[0] || "");
    const updateAdmin = () => setIsAdmin(Boolean(readAdminSession()));
    updateCart();
    updateAccount();
    updateAdmin();
    window.addEventListener("riseclub-cart-updated", updateCart);
    window.addEventListener("riseclub-account-updated", updateAccount);
    window.addEventListener("riseclub-admin-session-updated", updateAdmin);
    window.addEventListener("storage", updateCart);
    window.addEventListener("storage", updateAccount);
    window.addEventListener("storage", updateAdmin);
    return () => {
      window.removeEventListener("riseclub-cart-updated", updateCart);
      window.removeEventListener("riseclub-account-updated", updateAccount);
      window.removeEventListener("riseclub-admin-session-updated", updateAdmin);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("storage", updateAccount);
      window.removeEventListener("storage", updateAdmin);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/logo/riseclub-logo.png"
            alt="Rise Club"
            width={42}
            height={42}
            className="shrink-0 rounded-lg object-contain"
            priority
          />
          <div className="min-w-0 leading-tight">
            <p className="whitespace-nowrap font-black tracking-tight">Rise Club Store</p>
            <p className="whitespace-nowrap text-xs text-zinc-400">O corre nao para</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "text-sm transition",
                  active ? "text-amber-300" : "text-zinc-300 hover:text-zinc-50"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={["text-sm transition", pathname === "/admin" ? "text-amber-300" : "text-zinc-300 hover:text-zinc-50"].join(" ")}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={isAdmin ? "/admin" : accountName ? "/conta" : "/login"}
            className="focus-ring hidden h-10 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-100 hover:bg-white/10 sm:inline-flex"
          >
            {isAdmin ? "Admin" : accountName || "Entrar"}
          </Link>
          <Link
            href="/checkout"
            className="focus-ring relative inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-300 px-3 text-sm font-black text-zinc-950 shadow-lg shadow-amber-500/10"
            aria-label="Abrir carrinho"
            title="Carrinho"
          >
            Carrinho
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-zinc-50 px-1 text-xs text-zinc-950">
                {count}
              </span>
            )}
          </Link>
          <button
            className="focus-ring inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Abrir menu"
          >
            {open ? "Fechar" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-zinc-950 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4">
            <Link href={isAdmin ? "/admin" : accountName ? "/conta" : "/login"} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100">
              {isAdmin ? "Admin" : accountName ? `Conta de ${accountName}` : "Entrar"}
            </Link>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
