const schedule = [
  { day: "Terça-feira", time: "18:30", place: "Senac Nações Unidas" },
  { day: "Quinta-feira", time: "18:30", place: "Senac Nações Unidas" },
  { day: "Fim de semana", time: "Manhã", place: "Local divulgado na comunidade" }
];

export default function TreinosPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Agenda</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Treinos Rise Club</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        A loja foi pensada para complementar os encontros: compra online, retirada no treino e produtos alinhados com a rotina do grupo.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {schedule.map((item) => (
          <article key={item.day} className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
            <p className="text-sm font-semibold text-amber-300">{item.day}</p>
            <p className="mt-2 text-3xl font-black text-white">{item.time}</p>
            <p className="mt-2 text-zinc-400">{item.place}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
