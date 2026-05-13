"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { readAccount } from "@/lib/auth";
import { addToCart } from "@/lib/cart";
import { findAnyProduct, formatCurrency, Product } from "@/lib/products";
import { getReviewSummary, Review } from "@/lib/reviews";

type ProductDetailProps = {
  productId: string;
};

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | undefined>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: "5", comment: "" });

  useEffect(() => {
    async function loadProduct() {
      const [productsResponse, reviewsResponse] = await Promise.all([
        fetch("/api/products"),
        fetch(`/api/reviews?productId=${productId}`)
      ]);
      const products = await productsResponse.json() as Product[];
      const found = products.find((item) => item.id === productId);
      setProduct(found);
      setSize(found?.sizes[0] || "");
      setColor(found?.colors[0] || "");
      setReviews(await reviewsResponse.json());
    }
    loadProduct();
    const account = readAccount();
    if (account) {
      setReviewForm((current) => ({ ...current, name: account.name }));
    }
  }, [productId]);

  const reviewSummary = useMemo(() => {
    if (!product) return { average: 0, count: 0 };
    return getReviewSummary(product.id, product.rating);
  }, [product, reviews]);

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <Link href="/" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
          Voltar para loja
        </Link>
        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <h1 className="text-2xl font-black text-white">Produto nao encontrado</h1>
          <p className="mt-2 text-zinc-400">Esse item pode ter sido desativado no painel administrativo.</p>
        </div>
      </main>
    );
  }

  function handleAdd() {
    if (!product) return;
    addToCart({ productId: product.id, quantity, size, color });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2400);
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        name: reviewForm.name,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      })
    }).then(async () => {
      const response = await fetch(`/api/reviews?productId=${product.id}`);
      setReviews(await response.json());
    });
    setReviewForm((current) => ({ ...current, rating: "5", comment: "" }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
          <Image src={product.image} alt={product.name} fill className="object-cover" priority />
        </div>

        <section className="space-y-7">
          <div>
            <Link href="/" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
              Voltar para loja
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{product.category}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-sm font-semibold text-amber-200">
              {reviewSummary.average.toFixed(1)} / 5 - {reviewSummary.count || "sem"} avaliacao(oes)
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">{product.description}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-black text-amber-300">{formatCurrency(product.price)}</p>
                {product.oldPrice && <p className="mt-1 text-zinc-500 line-through">{formatCurrency(product.oldPrice)}</p>}
              </div>
              <p className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                {product.stock} em estoque
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Tamanho
                <select className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" value={size} onChange={(event) => setSize(event.target.value)}>
                  {product.sizes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Cor
                <select className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" value={color} onChange={(event) => setColor(event.target.value)}>
                  {product.colors.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button className="focus-ring h-11 w-11 rounded-lg border border-white/10 bg-white/5 text-xl" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span className="grid h-11 w-14 place-items-center rounded-lg border border-white/10 bg-zinc-950 font-black">{quantity}</span>
              <button className="focus-ring h-11 w-11 rounded-lg border border-white/10 bg-white/5 text-xl" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
            </div>

            <button onClick={handleAdd} disabled={product.stock <= 0} className="focus-ring mt-5 min-h-12 w-full rounded-lg bg-amber-300 px-5 text-sm font-black text-zinc-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
              Adicionar ao carrinho
            </button>
            {added && <p className="mt-3 text-sm font-semibold text-amber-200">Produto adicionado ao carrinho.</p>}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {product.details.map((detail) => (
              <div key={detail} className="rounded-lg border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-300">
                {detail}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleReview} className="h-fit rounded-lg border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-xl font-black text-white">Avaliar produto</h2>
          <div className="mt-4 grid gap-3">
            <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Seu nome" value={reviewForm.name} onChange={(event) => setReviewForm({ ...reviewForm, name: event.target.value })} />
            <select className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })}>
              <option value="5">5 - Excelente</option>
              <option value="4">4 - Muito bom</option>
              <option value="3">3 - Bom</option>
              <option value="2">2 - Regular</option>
              <option value="1">1 - Ruim</option>
            </select>
            <textarea required className="focus-ring min-h-28 rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Conte como foi sua experiencia" value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} />
            <button className="focus-ring min-h-12 rounded-lg bg-amber-300 px-5 text-sm font-black text-zinc-950 hover:bg-amber-200">
              Enviar avaliacao
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">Avaliacoes</h2>
            <p className="text-sm text-zinc-400">{reviews.length} comentario(s)</p>
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-400">Ainda nao existem avaliacoes para este produto.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <p className="font-black text-white">{review.name}</p>
                    <p className="text-sm font-semibold text-amber-300">{review.rating} / 5</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
