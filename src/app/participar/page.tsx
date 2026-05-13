const steps = [
  "Entre na comunidade da Rise Club.",
  "Escolha seus produtos na loja.",
  "Finalize o pedido e combine a retirada no treino.",
  "Use no próximo treino e siga evoluindo."
];

export default function ParticiparPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Participar</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Do primeiro treino ao primeiro pedido.</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <article key={step} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <p className="text-3xl font-black text-amber-300">{index + 1}</p>
            <p className="mt-4 text-sm leading-6 text-zinc-200">{step}</p>
          </article>
        ))}
      </div>
      <a
        href="https://chat.whatsapp.com/DAlEyNXs6ON2E91X0yulXd"
        target="_blank"
        rel="noreferrer"
        className="focus-ring mt-8 inline-flex rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200"
      >
        Entrar no WhatsApp
      </a>
    </main>
  );
}
