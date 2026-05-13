"use client";

import { useState } from "react";
import Card from "./Card";

type Item = { q: string; a: string };

export default function FAQ({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const open = openIndex === idx;
        return (
          <Card key={idx} className="p-0 overflow-hidden">
            <button
              className="w-full px-5 py-4 text-left flex items-center justify-between"
              onClick={() => setOpenIndex(open ? null : idx)}
              aria-expanded={open}
            >
              <span className="font-semibold">{item.q}</span>
              <span className="text-amber-300">{open ? "–" : "+"}</span>
            </button>
            {open && <div className="px-5 pb-4 text-zinc-300">{item.a}</div>}
          </Card>
        );
      })}
    </div>
  );
}
