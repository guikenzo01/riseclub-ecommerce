"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Coupon } from "@/lib/coupons";
import { clearAdminSession, readAdminSession } from "@/lib/auth";
import type { CustomerAccount } from "@/lib/auth";
import { orderStatuses, Order } from "@/lib/orders";
import {
  categories,
  formatCurrency,
  productImages,
  Product,
  slugify
} from "@/lib/products";
import type { Review } from "@/lib/reviews";

const blankProduct = {
  name: "",
  category: "Vestuario",
  price: "99.90",
  oldPrice: "",
  image: "/gallery/02.jpg",
  badge: "Novo",
  stock: "10",
  description: "",
  colors: "Preto, Amarelo",
  sizes: "P, M, G",
  details: "Tecido leve, Produto oficial, Pronto para treino",
  active: true
};

const blankCoupon = {
  code: "",
  type: "percent" as Coupon["type"],
  value: "10",
  minSubtotal: "0",
  active: true
};

export default function AdminClient() {
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [customCoupons, setCustomCoupons] = useState<Coupon[]>([]);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [form, setForm] = useState(blankProduct);
  const [couponForm, setCouponForm] = useState(blankCoupon);

  useEffect(() => {
    setAdminAllowed(Boolean(readAdminSession()));
  }, []);

  useEffect(() => {
    if (!adminAllowed) return;

    const refreshProducts = async () => {
      const response = await fetch("/api/products");
      const products = await response.json() as Product[];
      setCustomProducts(products);
      setAllProducts(products);
    };
    const refreshOrders = async () => {
      const response = await fetch("/api/orders");
      setOrders(await response.json());
    };
    const refreshCoupons = async () => {
      const response = await fetch("/api/coupons");
      const coupons = await response.json() as Coupon[];
      setCustomCoupons(coupons);
      setAllCoupons(coupons);
    };
    const refreshReviews = async () => {
      const response = await fetch("/api/reviews");
      setReviews(await response.json());
    };
    const refreshCustomers = async () => {
      const response = await fetch("/api/customers");
      setCustomers(await response.json());
    };
    refreshProducts();
    refreshOrders();
    refreshCoupons();
    refreshReviews();
    refreshCustomers();
    window.addEventListener("riseclub-products-updated", refreshProducts);
    window.addEventListener("riseclub-orders-updated", refreshOrders);
    window.addEventListener("riseclub-coupons-updated", refreshCoupons);
    window.addEventListener("riseclub-reviews-updated", refreshReviews);
    return () => {
      window.removeEventListener("riseclub-products-updated", refreshProducts);
      window.removeEventListener("riseclub-orders-updated", refreshOrders);
      window.removeEventListener("riseclub-coupons-updated", refreshCoupons);
      window.removeEventListener("riseclub-reviews-updated", refreshReviews);
    };
  }, [adminAllowed]);

  const totalStock = allProducts.reduce((total, product) => total + product.stock, 0);
  const totalValue = allProducts.reduce((total, product) => total + product.stock * product.price, 0);
  const revenue = orders.reduce((total, order) => total + order.total, 0);
  const openOrders = orders.filter((order) => order.status !== "Entregue").length;
  const lowStock = allProducts.filter((product) => product.stock <= 10);
  const soldRanking = useMemo(() => {
    const soldByProduct = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        soldByProduct.set(item.productId, (soldByProduct.get(item.productId) || 0) + item.quantity);
      }
    }

    return allProducts
      .map((product) => ({
        product,
        sold: soldByProduct.get(product.id) || 0
      }))
      .filter((item) => item.sold > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [allProducts, orders]);
  const customerRanking = useMemo(() => {
    return customers
      .map((customer) => {
        const customerOrders = orders.filter((order) => order.customer.email.toLowerCase() === customer.email.toLowerCase());
        return {
          customer,
          orders: customerOrders.length,
          spent: customerOrders.reduce((total, order) => total + order.total, 0),
          lastOrder: customerOrders[0]?.createdAt || customer.createdAt
        };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [customers, orders]);

  async function refreshProductsFromApi() {
    const response = await fetch("/api/products");
    const products = await response.json() as Product[];
    setCustomProducts(products);
    setAllProducts(products);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = slugify(form.name || `produto-${Date.now()}`);
    const product: Product = {
      id,
      name: form.name,
      category: form.category as Product["category"],
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      image: form.image,
      badge: form.badge,
      rating: 4.8,
      stock: Number(form.stock),
      description: form.description,
      colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
      details: form.details.split(",").map((item) => item.trim()).filter(Boolean),
      sku: `RC-${id.slice(0, 8).toUpperCase()}`,
      active: form.active
    };

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });
    await refreshProductsFromApi();
    setForm(blankProduct);
  }

  async function toggleProduct(productId: string) {
    const product = allProducts.find((item) => item.id === productId);
    if (!product) return;
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active })
    });
    await refreshProductsFromApi();
  }

  async function removeProduct(productId: string) {
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    await refreshProductsFromApi();
  }

  async function changeOrderStatus(orderId: string, status: Order["status"]) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const response = await fetch("/api/orders");
    setOrders(await response.json());
  }

  async function refreshCouponsFromApi() {
    const response = await fetch("/api/coupons");
    const coupons = await response.json() as Coupon[];
    setCustomCoupons(coupons);
    setAllCoupons(coupons);
  }

  async function handleCouponSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const coupon: Coupon = {
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minSubtotal: Number(couponForm.minSubtotal),
      active: couponForm.active
    };
    await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon)
    });
    await refreshCouponsFromApi();
    setCouponForm(blankCoupon);
  }

  async function toggleCoupon(code: string) {
    const coupon = allCoupons.find((item) => item.code === code);
    if (!coupon) return;
    await fetch(`/api/coupons/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active })
    });
    await refreshCouponsFromApi();
  }

  async function removeCoupon(code: string) {
    await fetch(`/api/coupons/${code}`, { method: "DELETE" });
    await refreshCouponsFromApi();
  }

  function logoutAdmin() {
    clearAdminSession();
    setAdminAllowed(false);
  }

  if (!adminAllowed) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Area restrita</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Login de administrador necessario.</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Esta tela controla catalogo, estoque, cupons, pedidos e clientes. Entre com o perfil administrativo para acessar.
          </p>
          <Link href="/login" className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-lg bg-amber-300 px-5 text-sm font-black text-zinc-950 hover:bg-amber-200">
            Ir para login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Backoffice</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Painel administrativo</h1>
          <p className="mt-2 text-zinc-400">Controle produtos, estoque, pedidos e faturamento do prototipo da Rise Club.</p>
        </div>
        <button onClick={logoutAdmin} className="focus-ring rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">
          Sair do admin
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Faturamento" value={formatCurrency(revenue)} />
        <Metric label="Pedidos abertos" value={String(openOrders)} />
        <Metric label="Produtos ativos" value={String(allProducts.filter((product) => product.active).length)} />
        <Metric label="Clientes" value={String(customers.length)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-amber-100">Atencao de estoque</h2>
              <p className="mt-1 text-sm text-amber-100/75">{lowStock.length} produto(s) com 10 unidades ou menos.</p>
            </div>
            <p className="text-sm font-semibold text-amber-100">Estoque total: {totalStock} unidades</p>
          </div>
          {lowStock.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {lowStock.slice(0, 3).map((product) => (
                <div key={product.id} className="rounded-lg border border-amber-300/20 bg-zinc-950/50 p-3 text-sm text-amber-50">
                  <strong>{product.name}</strong>
                  <p className="mt-1 text-amber-100/70">{product.stock} em estoque</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-5">
          <h2 className="text-xl font-black text-emerald-100">Mais vendidos</h2>
          {soldRanking.length === 0 ? (
            <p className="mt-3 text-sm text-emerald-100/70">Finalize pedidos para gerar ranking de vendas.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {soldRanking.map(({ product, sold }) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg bg-zinc-950/50 p-3 text-sm text-emerald-50">
                  <span>{product.name}</span>
                  <strong>{sold} vendido(s)</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="h-fit rounded-lg border border-white/10 bg-zinc-950/75 p-5">
          <h2 className="text-xl font-black text-white">Novo produto</h2>
          <div className="mt-4 grid gap-3">
            <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <select className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {categories.filter((item) => item !== "Todos").map((item) => <option key={item}>{item}</option>)}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Preco" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Preco antigo" value={form.oldPrice} onChange={(event) => setForm({ ...form, oldPrice: event.target.value })} />
            </div>
            <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Estoque" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
            <select className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })}>
              {productImages.map((image) => <option key={image}>{image}</option>)}
            </select>
            <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Selo" value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} />
            <textarea required className="focus-ring min-h-24 rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Descricao" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Cores separadas por virgula" value={form.colors} onChange={(event) => setForm({ ...form, colors: event.target.value })} />
            <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Tamanhos separados por virgula" value={form.sizes} onChange={(event) => setForm({ ...form, sizes: event.target.value })} />
            <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Detalhes separados por virgula" value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} />
            <button className="focus-ring min-h-12 rounded-lg bg-amber-300 px-5 text-sm font-black text-zinc-950 hover:bg-amber-200">
              Salvar produto
            </button>
          </div>
        </form>

        <section className="space-y-6">
          <Panel title="Cupons" right={`${allCoupons.length} cupom(ns)`}>
            <form onSubmit={handleCouponSubmit} className="grid gap-3 rounded-lg border border-white/10 bg-zinc-950/70 p-4 md:grid-cols-[1fr_130px_120px_140px_auto]">
              <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white uppercase" placeholder="CODIGO" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value.toUpperCase() })} />
              <select className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" value={couponForm.type} onChange={(event) => setCouponForm({ ...couponForm, type: event.target.value as Coupon["type"] })}>
                <option value="percent">Percentual</option>
                <option value="fixed">Valor fixo</option>
              </select>
              <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Valor" value={couponForm.value} onChange={(event) => setCouponForm({ ...couponForm, value: event.target.value })} />
              <input required className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Minimo" value={couponForm.minSubtotal} onChange={(event) => setCouponForm({ ...couponForm, minSubtotal: event.target.value })} />
              <button className="focus-ring rounded-lg bg-amber-300 px-4 py-3 text-sm font-black text-zinc-950">Salvar</button>
            </form>
            <div className="mt-4 space-y-2">
              {allCoupons.map((coupon) => {
                const isCustom = customCoupons.some((item) => item.code === coupon.code);
                const description = coupon.type === "percent" ? `${coupon.value}% off` : `${formatCurrency(coupon.value)} off`;
                return (
                  <div key={coupon.code} className="flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950/70 p-4 md:flex-row md:items-center">
                    <div>
                      <p className="font-black text-white">{coupon.code}</p>
                      <p className="mt-1 text-sm text-zinc-400">{description} - minimo {formatCurrency(coupon.minSubtotal)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={["rounded-full px-3 py-1 text-xs font-black", coupon.active ? "bg-emerald-300 text-emerald-950" : "bg-zinc-700 text-zinc-200"].join(" ")}>
                        {coupon.active ? "Ativo" : "Inativo"}
                      </span>
                      {isCustom ? (
                        <>
                          <button className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200" onClick={() => toggleCoupon(coupon.code)}>Alternar</button>
                          <button className="focus-ring rounded-lg border border-red-300/30 px-3 py-2 text-sm text-red-200" onClick={() => removeCoupon(coupon.code)}>Remover</button>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-500">Cupom base</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Pedidos recentes" right={`${orders.length} pedido(s)`}>
            {orders.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum pedido criado ainda. Finalize uma compra para ver a operacao funcionando aqui.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <article key={order.id} className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="font-black text-white">{order.id}</p>
                        <p className="mt-1 text-sm text-zinc-400">{order.customer.name} - {order.delivery} - {formatCurrency(order.total)}</p>
                      </div>
                      <select className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white" value={order.status} onChange={(event) => changeOrderStatus(order.id, event.target.value as Order["status"])}>
                        {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Avaliacoes recentes" right={`${reviews.length} review(s)`}>
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhuma avaliacao enviada ainda.</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 5).map((review) => {
                  const product = allProducts.find((item) => item.id === review.productId);
                  return (
                    <article key={review.id} className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        <div>
                          <p className="font-black text-white">{product?.name || review.productId}</p>
                          <p className="mt-1 text-sm text-zinc-400">{review.name} - {new Date(review.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <p className="text-sm font-black text-amber-300">{review.rating} / 5</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">{review.comment}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Clientes recentes" right={`${customers.length} cliente(s)`}>
            {customers.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum cliente cadastrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {customerRanking.map(({ customer, orders: orderCount, spent, lastOrder }) => (
                  <article key={customer.email} className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="font-black text-white">{customer.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">{customer.email} - {customer.phone}</p>
                        <p className="mt-1 text-xs text-zinc-500">Ultimo movimento: {new Date(lastOrder).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-zinc-400">{orderCount} pedido(s)</p>
                        <p className="text-xl font-black text-amber-300">{formatCurrency(spent)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Catalogo" right={`${allProducts.length} produto(s)`}>
            <div className="space-y-3">
              {allProducts.map((product) => {
                const isCustom = customProducts.some((item) => item.id === product.id);
                return (
                  <article key={product.id} className="grid gap-4 rounded-lg border border-white/10 bg-zinc-950/70 p-4 md:grid-cols-[84px_1fr_auto]">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{product.sku} - {product.category} - {product.stock} em estoque</p>
                      <p className="mt-2 text-sm font-black text-amber-300">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <span className={["rounded-full px-3 py-1 text-xs font-black", product.active ? "bg-emerald-300 text-emerald-950" : "bg-zinc-700 text-zinc-200"].join(" ")}>
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                      {isCustom ? (
                        <>
                          <button className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200" onClick={() => toggleProduct(product.id)}>
                            Alternar
                          </button>
                          <button className="focus-ring rounded-lg border border-red-300/30 px-3 py-2 text-sm text-red-200" onClick={() => removeProduct(product.id)}>
                            Remover
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-500">Produto base</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-amber-300">{value}</p>
    </div>
  );
}

function Panel({ title, right, children }: { title: string; right: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white">{title}</h2>
        <p className="text-sm text-zinc-400">{right}</p>
      </div>
      {children}
    </section>
  );
}
