"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function Carousel({
  images,
  title = "Momentos do Rise Club",
  autoPlay = true,
  intervalMs = 3500
}: {
  images: { src: string; alt?: string }[];
  title?: string;
  autoPlay?: boolean;
  intervalMs?: number;
}) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);

  const hasImages = safeImages.length > 0;

  function prev() {
    if (!hasImages) return;
    setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  }

  function next() {
    if (!hasImages) return;
    setIndex((i) => (i + 1) % safeImages.length);
  }

  useEffect(() => {
    if (!autoPlay || !hasImages) return;
    const id = setInterval(() => next(), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, intervalMs, hasImages]);

  if (!hasImages) return null;

  const current = safeImages[index];

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>

        <div className="flex gap-2">
          <button
            onClick={prev}
            className="rounded-xl border border-zinc-800 bg-zinc-900/20 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/40"
            aria-label="Anterior"
          >
            ←
          </button>
          <button
            onClick={next}
            className="rounded-xl border border-zinc-800 bg-zinc-900/20 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/40"
            aria-label="Próximo"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/25">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={current.src}
            alt={current.alt ?? "Rise Club"}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex items-center justify-center gap-2 p-3">
          {safeImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={[
                "h-2 w-2 rounded-full transition",
                i === index ? "bg-amber-300" : "bg-zinc-700"
              ].join(" ")}
              aria-label={`Ir para imagem ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}