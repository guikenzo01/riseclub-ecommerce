export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-zinc-400 md:grid-cols-[1fr_auto] md:px-6">
        <div>
          <p className="font-semibold text-zinc-200">Rise Club</p>
          <p className="mt-1">Produtos para quem corre junto, treina melhor e leva a comunidade no peito.</p>
          <p className="mt-4 text-xs text-zinc-500">
            © {new Date().getFullYear()} Rise Club. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex gap-4 text-zinc-300">
          <a className="hover:text-amber-300" href="https://instagram.com/riseclubbr" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a className="hover:text-amber-300" href="https://www.tiktok.com/@riseclubbr" target="_blank" rel="noreferrer">
            TikTok
          </a>
          <a className="hover:text-amber-300" href="https://chat.whatsapp.com/DAlEyNXs6ON2E91X0yulXd" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
