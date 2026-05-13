import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

export default function Button({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99]";
  const styles: Record<Variant, string> = {
    primary: "bg-amber-400 text-black hover:bg-amber-300",
    secondary:
      "border border-amber-400/40 text-amber-300 hover:bg-amber-400/10",
    ghost:
      "border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900/30"
  };

  const isExternal = href.startsWith("http") || href.startsWith("#");

  if (isExternal) {
    return (
      <a
        className={`${base} ${styles[variant]}`}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={`${base} ${styles[variant]}`} href={href}>
      {children}
    </Link>
  );
}
