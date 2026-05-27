"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import { categories, formatCurrency, Product } from "@/lib/products";

export default function Storefront() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos");
  const [size, setSize] = useState("Todos");
  const [sort, setSort] = useState("featured");
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const refreshProducts = async () => {
      const response = await fetch("/api/products");
      const data = await response.json() as Product[];
      setProducts(data.filter((product) => product.active));
    };
    refreshProducts();
    window.addEventListener("riseclub-products-updated", refreshProducts);
    window.addEventListener("storage", refreshProducts);
    return () => {
      window.removeEventListener("riseclub-products-updated", refreshProducts);
      window.removeEventListener("storage", refreshProducts);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesSize = size === "Todos" || product.sizes.includes(size);
      const searchable = `${product.name} ${product.description} ${product.sku}`.toLowerCase();
      return matchesCategory && matchesSize && searchable.includes(normalizedQuery);
    });

    return [...result].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "stock") return b.stock - a.stock;
      return Number(Boolean(b.oldPrice)) - Number(Boolean(a.oldPrice));
    });
  }, [category, products, query, size, sort]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((product) => product.sizes.forEach((item) => sizes.add(item)));
    return ["Todos", ...Array.from(sizes).sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))];
  }, [products]);

  const stats = useMemo(() => {
    const averageRating = products.reduce((total, product) => total + product.rating, 0) / Math.max(1, products.length);
    const stock = products.reduce((total, product) => total + product.stock, 0);
    return { averageRating, stock };
  }, [products]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function handleQuickBuy(product: Product) {
    addToCart({
      productId: product.id,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0]
    });
    flash(`${product.name} adicionado ao carrinho`);
  }

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image src="/gallery/04.jpg" alt="Rise Club em treino" fill className="object-cover opacity-35" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/78 to-zinc-950/25" />
        </div>

        <div className="relative mx-auto grid min-h-[630px] max-w-7xl content-center gap-8 px-4 py-12 md:grid-cols-[1.08fr_0.92fr] md:px-6">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
              Rise Club Store
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight text-white md:text-7xl">
              RISE CLUB
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-200">
              Loja simples para produtos do grupo: vitrine, busca, estoque, cupom,
              carrinho, retirada nos treinos e backoffice separado para administradores.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#produtos" className="focus-ring rounded-lg bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-amber-200">
                Comprar agora
              </a>
            </div>
          </div>

          <div className="self-end rounded-lg border border-amber-300/25 bg-zinc-950 p-5 shadow-2xl shadow-black/60">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-4">
                <p className="text-3xl font-black text-amber-300">{products.length}</p>
                <p className="mt-1 text-xs font-medium text-zinc-200">produtos ativos</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-4">
                <p className="text-3xl font-black text-amber-300">{stats.stock}</p>
                <p className="mt-1 text-xs font-medium text-zinc-200">itens em estoque</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-4">
                <p className="text-3xl font-black text-amber-300">{stats.averageRating.toFixed(1)}</p>
                <p className="mt-1 text-xs font-medium text-zinc-200">avaliacao media</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-amber-300/30 bg-amber-300 px-4 py-4 text-sm font-semibold text-zinc-950">
              Use o cupom <strong>RISE10</strong> no checkout para simular 10% de desconto.
            </div>
          </div>
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Catalogo</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Produtos oficiais</h2>
          </div>
          <p className="text-sm text-zinc-400">{filteredProducts.length} resultado(s)</p>
        </div>

        <div className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur md:grid-cols-[1fr_auto_auto_auto]">
          <input
            className="focus-ring min-h-11 rounded-lg border border-white/10 bg-zinc-950/70 px-4 text-sm text-white placeholder:text-zinc-500"
            placeholder="Buscar camiseta, bone, meia, SKU..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={[
                  "focus-ring min-h-11 whitespace-nowrap rounded-lg border px-4 text-sm font-semibold",
                  category === item
                    ? "border-amber-300 bg-amber-300 text-zinc-950"
                    : "border-white/10 bg-zinc-950/60 text-zinc-200 hover:bg-white/10"
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
          <select
            className="focus-ring min-h-11 rounded-lg border border-white/10 bg-zinc-950/80 px-3 text-sm text-white"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            aria-label="Filtrar por tamanho"
          >
            {availableSizes.map((item) => (
              <option key={item} value={item}>
                {item === "Todos" ? "Todos tamanhos" : `Tam. ${item}`}
              </option>
            ))}
          </select>
          <select
            className="focus-ring min-h-11 rounded-lg border border-white/10 bg-zinc-950/80 px-3 text-sm text-white"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="featured">Destaques</option>
            <option value="rating">Melhor avaliacao</option>
            <option value="stock">Mais estoque</option>
            <option value="price-asc">Menor preco</option>
            <option value="price-desc">Maior preco</option>
          </select>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950/72 shadow-xl shadow-black/20">
              <Link href={`/produto/${product.id}`} className="group relative block aspect-[4/3] overflow-hidden bg-zinc-900">
                <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-zinc-950">
                  {product.badge}
                </span>
              </Link>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">{product.category}</p>
                  <Link href={`/produto/${product.id}`} className="mt-1 block text-xl font-black text-white hover:text-amber-200">
                    {product.name}
                  </Link>
                </div>
                <p className="min-h-12 text-sm leading-6 text-zinc-400">{product.description}</p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-black text-amber-300">{formatCurrency(product.price)}</p>
                      {product.oldPrice && <p className="text-sm text-zinc-500 line-through">{formatCurrency(product.oldPrice)}</p>}
                    </div>
                    <p className="text-xs text-zinc-500">SKU {product.sku} - Estoque {product.stock}</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">{product.rating.toFixed(1)} / 5</p>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button
                    onClick={() => handleQuickBuy(product)}
                    disabled={product.stock <= 0}
                    className="focus-ring min-h-11 rounded-lg bg-amber-300 px-4 text-sm font-black text-zinc-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Comprar
                  </button>
                  <Link href={`/produto/${product.id}`} className="focus-ring grid min-h-11 place-items-center rounded-lg border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:bg-white/10">
                    Ver
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-amber-300/40 bg-zinc-950 px-4 py-3 text-sm text-amber-100 shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  );
}
