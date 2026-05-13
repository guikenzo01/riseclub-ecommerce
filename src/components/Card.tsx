export default function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm transition hover:border-amber-400/40 hover:bg-zinc-900/60",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}
