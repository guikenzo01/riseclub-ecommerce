import Image from "next/image";

export default function SobrePage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[0.95fr_1.05fr] md:px-6">
      <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
        <Image src="/gallery/05.jpg" alt="Comunidade Rise Club" fill className="object-cover" priority />
      </div>
      <section className="self-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Sobre a Rise</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Comunidade antes de vitrine.</h1>
        <p className="mt-5 text-lg leading-8 text-zinc-300">
          A Rise Club nasceu como grupo de corrida e o e-commerce acompanha essa energia:
          produtos úteis, identidade forte e compra simples para quem já treina com o grupo.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Treinos semanais", "Produtos próprios", "Retirada no encontro"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold text-zinc-200">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
