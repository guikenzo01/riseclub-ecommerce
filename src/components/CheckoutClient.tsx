"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createAccount, readAccount, saveAccount } from "@/lib/auth";
import { CartItem, getCartSummary, readCart, saveCart } from "@/lib/cart";
import { validateCoupon } from "@/lib/coupons";
import type { Order } from "@/lib/orders";
import { findAnyProduct, formatCurrency } from "@/lib/products";

type CheckoutStep = "cart" | "pix";

export default function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [finishedOrder, setFinishedOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("cart");

  useEffect(() => {
    setItems(readCart());
    const account = readAccount();
    if (account) {
      setCustomer({ name: account.name, email: account.email, phone: account.phone });
      setAccountLoaded(true);
    }
  }, []);

  const summary = useMemo(() => getCartSummary(items, coupon), [coupon, items]);
  const couponFeedback = useMemo(() => validateCoupon(coupon, summary.subtotal), [coupon, summary.subtotal]);
  const finalTotal = summary.subtotal - summary.discount;
  const canGoToPix = items.length > 0 && customer.name && customer.email && customer.phone;

  function updateCart(nextItems: CartItem[]) {
    setItems(nextItems);
    saveCart(nextItems);
  }

  function changeQuantity(index: number, quantity: number) {
    const product = findAnyProduct(items[index]?.productId);
    const maxQuantity = Math.max(1, product?.stock || 1);
    const safeQuantity = Math.min(maxQuantity, quantity);
    const nextItems = items
      .map((item, currentIndex) => currentIndex === index ? { ...item, quantity: safeQuantity } : item)
      .filter((item) => item.quantity > 0);
    updateCart(nextItems);
  }

  function removeItem(index: number) {
    updateCart(items.filter((_, currentIndex) => currentIndex !== index));
  }

  function goToPix() {
    setOrderError("");
    if (!canGoToPix) {
      setOrderError("Preencha seus dados e mantenha pelo menos um produto no carrinho.");
      return;
    }
    setStep("pix");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function syncAccount() {
    const existing = readAccount();
    const accountData = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: {
        cep: "",
        street: "Retirada no treino",
        number: "",
        city: "Sao Paulo",
        state: "SP"
      }
    };

    if (existing) {
      saveAccount({ ...accountData, createdAt: existing.createdAt, password: existing.password });
    } else {
      createAccount(accountData);
    }

    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountData)
    });
  }

  async function finishOrder() {
    if (!canGoToPix) return;
    setOrderError("");
    await syncAccount();
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customer,
        address: {
          cep: "",
          street: "Retirada no treino",
          number: "",
          city: "Sao Paulo",
          state: "SP"
        },
        delivery: "Retirada no treino",
        payment: "Pix simulado",
        coupon
      })
    });

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      setOrderError(error.message || "Nao foi possivel finalizar o pedido.");
      return;
    }

    const order = await response.json() as Order;
    setFinishedOrder(order);
    updateCart([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (finishedOrder) {
    return <OrderSuccess order={finishedOrder} />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <Link href="/" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
          Continuar comprando
        </Link>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
          {step === "pix" ? "Pagamento Pix" : "Carrinho"}
        </h1>
        <p className="mt-2 text-zinc-400">
          {step === "pix"
            ? "Simule o pagamento por Pix para confirmar o pedido."
            : "Revise seus itens, aplique cupom e confira a retirada nos treinos da Rise Club."}
        </p>
      </div>

      {step === "pix" ? (
        <PixStep
          customer={customer}
          finalTotal={finalTotal}
          items={items}
          orderError={orderError}
          onBack={() => setStep("cart")}
          onConfirm={finishOrder}
          summary={summary}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <section className="space-y-5">
            <CartItems items={items} onChangeQuantity={changeQuantity} onRemove={removeItem} />
            <CustomerForm accountLoaded={accountLoaded} customer={customer} onCustomerChange={setCustomer} />
            <PickupNotice />
          </section>

          <OrderSummary
            coupon={coupon}
            couponFeedback={couponFeedback}
            finalTotal={finalTotal}
            orderError={orderError}
            summary={summary}
            onCouponChange={setCoupon}
            onGoToPix={goToPix}
          />
        </div>
      )}
    </main>
  );
}

function CartItems({
  items,
  onChangeQuantity,
  onRemove
}: {
  items: CartItem[];
  onChangeQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-black text-white">Itens escolhidos</h2>
          <p className="mt-1 text-sm text-zinc-400">Edite quantidades ou remova produtos antes de seguir para o pagamento.</p>
        </div>
        <Link href="/" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">
          Continuar comprando
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {items.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
            <p className="font-semibold text-white">Seu carrinho esta vazio.</p>
            <p className="mt-1 text-sm text-zinc-400">Volte para a loja e escolha os produtos da Rise Club.</p>
          </div>
        )}

        {items.map((item, index) => {
          const product = findAnyProduct(item.productId);
          if (!product) return null;

          return (
            <article key={`${item.productId}-${item.size}-${item.color}`} className="grid gap-4 rounded-lg border border-white/10 bg-zinc-950/70 p-4 sm:grid-cols-[96px_1fr_auto]">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-lg font-black text-white">{product.name}</p>
                <p className="mt-1 text-sm text-zinc-400">Tamanho {item.size} - Cor {item.color}</p>
                <p className="mt-2 text-sm text-zinc-500">Estoque disponivel: {product.stock}</p>
                <p className="mt-3 font-black text-amber-300">{formatCurrency(product.price)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button className="focus-ring h-10 w-10 rounded-lg border border-white/10 bg-white/5" onClick={() => onChangeQuantity(index, item.quantity - 1)}>-</button>
                <span className="grid h-10 w-12 place-items-center rounded-lg border border-white/10 bg-black/20 font-black">{item.quantity}</span>
                <button className="focus-ring h-10 w-10 rounded-lg border border-white/10 bg-white/5" onClick={() => onChangeQuantity(index, item.quantity + 1)}>+</button>
                <button className="focus-ring min-h-10 rounded-lg border border-red-300/30 bg-red-300/10 px-3 text-sm font-semibold text-red-100 hover:bg-red-300/20" onClick={() => onRemove(index)}>
                  Remover
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CustomerForm({
  accountLoaded,
  customer,
  onCustomerChange
}: {
  accountLoaded: boolean;
  customer: { name: string; email: string; phone: string };
  onCustomerChange: (customer: { name: string; email: string; phone: string }) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-black text-white">Dados para o pedido</h2>
        {accountLoaded ? (
          <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-200">Conta carregada</span>
        ) : (
          <Link href="/cadastro" className="text-sm font-semibold text-amber-300 hover:text-amber-200">Criar conta</Link>
        )}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="Nome completo" value={customer.name} onChange={(event) => onCustomerChange({ ...customer, name: event.target.value })} />
        <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="E-mail" value={customer.email} onChange={(event) => onCustomerChange({ ...customer, email: event.target.value })} />
        <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white" placeholder="WhatsApp" value={customer.phone} onChange={(event) => onCustomerChange({ ...customer, phone: event.target.value })} />
      </div>
    </div>
  );
}

function PickupNotice() {
  return (
    <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-5">
      <h2 className="text-xl font-black text-white">Forma de retirada</h2>
      <p className="mt-3 text-sm leading-6 text-amber-100">
        A entrega sera combinada nos treinos e corres da Rise Club. Depois da confirmacao do Pix simulado,
        o pedido entra como criado e o acompanhamento fica disponivel na area de pedidos.
      </p>
    </div>
  );
}

function OrderSummary({
  coupon,
  couponFeedback,
  finalTotal,
  orderError,
  summary,
  onCouponChange,
  onGoToPix
}: {
  coupon: string;
  couponFeedback: { discount: number; message: string };
  finalTotal: number;
  orderError: string;
  summary: ReturnType<typeof getCartSummary>;
  onCouponChange: (coupon: string) => void;
  onGoToPix: () => void;
}) {
  return (
    <aside className="h-fit rounded-lg border border-white/10 bg-zinc-950/90 p-5 shadow-2xl shadow-black/40">
      <h2 className="text-xl font-black text-white">Resumo da compra</h2>
      <label className="mt-5 grid gap-2 text-sm font-semibold text-zinc-300">
        Cupom de desconto
        <input className="focus-ring rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-white uppercase" placeholder="RISE10" value={coupon} onChange={(event) => onCouponChange(event.target.value.toUpperCase())} />
      </label>
      {couponFeedback.message && (
        <p className={["mt-2 text-xs font-semibold", couponFeedback.discount > 0 ? "text-emerald-200" : "text-amber-200"].join(" ")}>
          {couponFeedback.message}
        </p>
      )}

      <div className="mt-5 space-y-3 text-sm text-zinc-300">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
        <div className="flex justify-between"><span>Desconto</span><span>- {formatCurrency(summary.discount)}</span></div>
        <div className="flex justify-between"><span>Retirada</span><span>Treinos/corres Rise</span></div>
        <div className="border-t border-white/10 pt-3">
          <div className="flex justify-between text-lg font-black text-white"><span>Total</span><span>{formatCurrency(finalTotal)}</span></div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
        Retirada combinada diretamente nos treinos ou corres da Rise Club.
      </p>
      <button
        onClick={onGoToPix}
        className="focus-ring mt-5 min-h-12 w-full rounded-lg bg-amber-300 px-5 text-sm font-black text-zinc-950 hover:bg-amber-200"
      >
        Seguir com a compra
      </button>
      {orderError && (
        <p className="mt-3 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm font-semibold text-red-100">
          {orderError}
        </p>
      )}
    </aside>
  );
}

function PixStep({
  customer,
  finalTotal,
  items,
  orderError,
  onBack,
  onConfirm,
  summary
}: {
  customer: { name: string; email: string; phone: string };
  finalTotal: number;
  items: CartItem[];
  orderError: string;
  onBack: () => void;
  onConfirm: () => void;
  summary: ReturnType<typeof getCartSummary>;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
      <div className="space-y-5">
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Pix simulado</p>
          <h2 className="mt-3 text-3xl font-black text-white">Confirme o pagamento para gerar o pedido.</h2>
          <p className="mt-3 max-w-2xl text-emerald-50/85">
            Esta etapa apenas simula o Pix para o MVP da faculdade. Clique em confirmar para fingir que o pagamento foi realizado.
          </p>
          <div className="mt-5 rounded-lg border border-emerald-300/25 bg-zinc-950/80 p-4">
            <p className="text-sm font-black text-emerald-100">Chave Pix</p>
            <p className="mt-2 text-lg font-black text-white">riseclub@store.com</p>
            <p className="mt-3 break-all rounded-md bg-black/40 p-3 text-xs font-semibold text-zinc-100">
              PIX-RISE-{customer.email || "CLIENTE"}-{Math.max(0, finalTotal).toFixed(2)}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={onConfirm} className="focus-ring rounded-lg bg-emerald-200 px-5 py-3 text-sm font-black text-emerald-950 hover:bg-emerald-100">
              Confirmar Pix simulado
            </button>
            <button onClick={onBack} className="focus-ring rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Voltar ao carrinho
            </button>
          </div>
          {orderError && (
            <p className="mt-4 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm font-semibold text-red-100">
              {orderError}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-xl font-black text-white">Itens do pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const product = findAnyProduct(item.productId);
              if (!product) return null;

              return (
                <article key={`${item.productId}-${item.size}-${item.color}`} className="grid gap-4 rounded-lg border border-white/10 bg-zinc-950/70 p-4 sm:grid-cols-[72px_1fr_auto]">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-white">{product.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">Tamanho {item.size} - Cor {item.color}</p>
                    <p className="mt-1 text-sm text-zinc-500">Quantidade: {item.quantity}</p>
                  </div>
                  <p className="font-black text-amber-300 sm:text-right">{formatCurrency(product.price * item.quantity)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-white/10 bg-zinc-950/90 p-5">
        <h2 className="text-xl font-black text-white">Resumo final</h2>
        <div className="mt-5 space-y-3 text-sm text-zinc-300">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
          <div className="flex justify-between"><span>Desconto</span><span>- {formatCurrency(summary.discount)}</span></div>
          <div className="flex justify-between"><span>Retirada</span><span>Treinos/corres Rise</span></div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between text-lg font-black text-white"><span>Total</span><span>{formatCurrency(finalTotal)}</span></div>
          </div>
        </div>
        <div className="mt-5 rounded-lg bg-white/[0.06] p-4 text-sm text-zinc-300">
          <p className="font-black text-white">{customer.name}</p>
          <p className="mt-1">{customer.email}</p>
          <p>{customer.phone}</p>
        </div>
      </aside>
    </section>
  );
}

function OrderSuccess({ order }: { order: Order }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-200">Pedido confirmado</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">{order.id}</h1>
            <p className="mt-3 max-w-2xl text-zinc-200">
              Recebemos seu pedido e ele ja entrou na fila da Rise Club. Voce pode acompanhar o status pela area de pedidos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/pedidos/${order.id}`} className="focus-ring inline-flex min-h-11 items-center rounded-lg bg-emerald-200 px-4 text-sm font-black text-emerald-950">
                Acompanhar pedido
              </Link>
              <Link href="/" className="focus-ring inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10">
                Continuar comprando
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Status" value={order.status} />
            <InfoCard label="Retirada" value="Treinos/corres Rise" />
            <InfoCard label="Pagamento" value={order.payment} />
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <h2 className="text-xl font-black text-white">Itens do pedido</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => {
                const product = findAnyProduct(item.productId);
                if (!product) return null;

                return (
                  <article key={`${item.productId}-${item.size}-${item.color}`} className="grid gap-4 rounded-lg border border-white/10 bg-zinc-950/70 p-4 sm:grid-cols-[72px_1fr_auto]">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">Tamanho {item.size} - Cor {item.color}</p>
                      <p className="mt-1 text-sm text-zinc-500">Quantidade: {item.quantity}</p>
                    </div>
                    <p className="font-black text-amber-300 sm:text-right">{formatCurrency(product.price * item.quantity)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-white/10 bg-zinc-950/80 p-5">
          <h2 className="text-xl font-black text-white">Recibo</h2>
          <div className="mt-5 space-y-3 text-sm text-zinc-300">
            <div className="flex justify-between gap-4"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between gap-4"><span>Desconto</span><span>- {formatCurrency(order.discount)}</span></div>
            <div className="flex justify-between gap-4"><span>Retirada</span><span>Treinos/corres Rise</span></div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between gap-4 text-lg font-black text-white"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-white/[0.06] p-4 text-sm text-zinc-300">
            <p className="font-black text-white">{order.customer.name}</p>
            <p className="mt-1">{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p className="mt-3">Retirada combinada em um treino ou corre da Rise Club.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}
