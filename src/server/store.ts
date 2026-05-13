import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CartItem } from "@/lib/cart";
import type { Coupon } from "@/lib/coupons";
import { defaultCoupons } from "@/lib/coupons";
import type { CustomerAccount } from "@/lib/auth";
import type { Order } from "@/lib/orders";
import type { Product } from "@/lib/products";
import { defaultProducts } from "@/lib/products";
import type { Review } from "@/lib/reviews";
import { prisma } from "./prisma";

export type StoreData = {
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  customers: CustomerAccount[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "riseclub-store.json");

type DbProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
type DbCoupon = Awaited<ReturnType<typeof prisma.coupon.findMany>>[number];
type DbOrder = Awaited<ReturnType<typeof prisma.order.findMany<{ include: { items: true } }>>>[number];
type DbCustomer = Awaited<ReturnType<typeof prisma.customer.findMany>>[number] & {
  password?: string;
  cep?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
};
type DbReview = Awaited<ReturnType<typeof prisma.review.findMany>>[number];

function parseJsonList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function mapDbProduct(product: DbProduct): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category as Product["category"],
    price: product.price,
    oldPrice: product.oldPrice ?? undefined,
    image: product.image,
    badge: product.badge,
    rating: product.rating,
    stock: product.stock,
    description: product.description,
    details: parseJsonList(product.details),
    colors: parseJsonList(product.colors),
    sizes: parseJsonList(product.sizes),
    sku: product.sku,
    active: product.active
  };
}

function mapDbCoupon(coupon: DbCoupon): Coupon {
  return {
    code: coupon.code,
    type: coupon.type as Coupon["type"],
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    active: coupon.active
  };
}

function mapDbOrder(order: DbOrder): Order {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    status: order.status as Order["status"],
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    })),
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone
    },
    address: {
      cep: order.cep,
      street: order.street,
      number: order.number,
      city: order.city,
      state: order.state
    },
    delivery: order.delivery as Order["delivery"],
    payment: order.payment,
    coupon: order.coupon,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total
  };
}

function mapDbCustomer(customer: DbCustomer): CustomerAccount {
  return {
    name: customer.name,
    email: customer.email,
    password: customer.password || "",
    phone: customer.phone,
    address: {
      cep: customer.cep || "",
      street: customer.street || "",
      number: customer.number || "",
      city: customer.city || "",
      state: customer.state || ""
    },
    createdAt: customer.createdAt.toISOString()
  };
}

function mapDbReview(review: DbReview): Review {
  return {
    id: review.id,
    productId: review.productId,
    name: review.name,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString()
  };
}

async function readJsonStore(): Promise<StoreData> {
  try {
    const raw = await readFile(dataFile, "utf-8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      products: parsed.products || defaultProducts,
      coupons: parsed.coupons || defaultCoupons,
      orders: parsed.orders || [],
      reviews: parsed.reviews || [],
      customers: parsed.customers || []
    };
  } catch {
    const initialStore: StoreData = {
      products: defaultProducts,
      coupons: defaultCoupons,
      orders: [],
      reviews: [],
      customers: []
    };
    await writeJsonStore(initialStore);
    return initialStore;
  }
}

async function writeJsonStore(store: StoreData) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf-8");
}

async function readDatabaseCatalog() {
  const [products, coupons] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return {
    products: products.map(mapDbProduct),
    coupons: coupons.map(mapDbCoupon)
  };
}

async function readDatabaseOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return orders.map(mapDbOrder);
}

async function readDatabaseCustomers() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (customers as DbCustomer[]).map(mapDbCustomer);
}

async function readDatabaseReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" }
  });

  return reviews.map(mapDbReview);
}

async function syncDatabaseCatalog(store: StoreData) {
  const productIds = store.products.map((product) => product.id);
  const couponCodes = store.coupons.map((coupon) => coupon.code);

  await prisma.$transaction([
    prisma.product.deleteMany({
      where: productIds.length ? { id: { notIn: productIds } } : {}
    }),
    prisma.coupon.deleteMany({
      where: couponCodes.length ? { code: { notIn: couponCodes } } : {}
    }),
    ...store.products.map((product) =>
      prisma.product.upsert({
        where: { id: product.id },
        create: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          oldPrice: product.oldPrice ?? null,
          image: product.image,
          badge: product.badge,
          rating: product.rating,
          stock: product.stock,
          description: product.description,
          details: JSON.stringify(product.details),
          colors: JSON.stringify(product.colors),
          sizes: JSON.stringify(product.sizes),
          sku: product.sku,
          active: product.active
        },
        update: {
          name: product.name,
          category: product.category,
          price: product.price,
          oldPrice: product.oldPrice ?? null,
          image: product.image,
          badge: product.badge,
          rating: product.rating,
          stock: product.stock,
          description: product.description,
          details: JSON.stringify(product.details),
          colors: JSON.stringify(product.colors),
          sizes: JSON.stringify(product.sizes),
          sku: product.sku,
          active: product.active
        }
      })
    ),
    ...store.coupons.map((coupon) =>
      prisma.coupon.upsert({
        where: { code: coupon.code },
        create: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minSubtotal: coupon.minSubtotal,
          active: coupon.active
        },
        update: {
          type: coupon.type,
          value: coupon.value,
          minSubtotal: coupon.minSubtotal,
          active: coupon.active
        }
      })
    )
  ]);
}

function toOrderDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function syncDatabaseOrders(store: StoreData) {
  const orderIds = store.orders.map((order) => order.id);
  const productById = new Map(store.products.map((product) => [product.id, product]));

  await prisma.$transaction([
    prisma.order.deleteMany({
      where: orderIds.length ? { id: { notIn: orderIds } } : {}
    }),
    ...store.orders.map((order) =>
      prisma.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id,
          createdAt: toOrderDate(order.createdAt),
          status: order.status,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone,
          cep: order.address.cep,
          street: order.address.street,
          number: order.address.number,
          city: order.address.city,
          state: order.address.state,
          delivery: order.delivery,
          payment: order.payment,
          coupon: order.coupon,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping: order.shipping,
          total: order.total,
          items: {
            create: order.items.map((item) => {
              const product = productById.get(item.productId);

              return {
                productId: item.productId,
                name: product?.name || item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                unitPrice: product?.price || 0
              };
            })
          }
        },
        update: {
          status: order.status,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone,
          cep: order.address.cep,
          street: order.address.street,
          number: order.address.number,
          city: order.address.city,
          state: order.address.state,
          delivery: order.delivery,
          payment: order.payment,
          coupon: order.coupon,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping: order.shipping,
          total: order.total,
          items: {
            deleteMany: {},
            create: order.items.map((item) => {
              const product = productById.get(item.productId);

              return {
                productId: item.productId,
                name: product?.name || item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                unitPrice: product?.price || 0
              };
            })
          }
        }
      })
    )
  ]);
}

function toCustomerDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function syncDatabaseCustomers(store: StoreData) {
  const customerEmails = store.customers.map((customer) => customer.email.toLowerCase());

  await prisma.$transaction([
    prisma.customer.deleteMany({
      where: customerEmails.length ? { email: { notIn: customerEmails } } : {}
    }),
    ...store.customers.map((customer) =>
      prisma.customer.upsert({
        where: { email: customer.email.toLowerCase() },
        create: {
          name: customer.name,
          email: customer.email.toLowerCase(),
          password: customer.password || "",
          phone: customer.phone,
          cep: customer.address.cep,
          street: customer.address.street,
          number: customer.address.number,
          city: customer.address.city,
          state: customer.address.state,
          createdAt: toCustomerDate(customer.createdAt)
        } as any,
        update: {
          name: customer.name,
          password: customer.password || "",
          phone: customer.phone,
          cep: customer.address.cep,
          street: customer.address.street,
          number: customer.address.number,
          city: customer.address.city,
          state: customer.address.state
        } as any
      })
    )
  ]);
}

function toReviewDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function syncDatabaseReviews(store: StoreData) {
  const reviewIds = store.reviews.map((review) => review.id);
  const productIds = new Set(store.products.map((product) => product.id));
  const validReviews = store.reviews.filter((review) => productIds.has(review.productId));

  await prisma.$transaction([
    prisma.review.deleteMany({
      where: reviewIds.length ? { id: { notIn: reviewIds } } : {}
    }),
    ...validReviews.map((review) =>
      prisma.review.upsert({
        where: { id: review.id },
        create: {
          id: review.id,
          productId: review.productId,
          name: review.name,
          rating: review.rating,
          comment: review.comment,
          createdAt: toReviewDate(review.createdAt)
        },
        update: {
          productId: review.productId,
          name: review.name,
          rating: review.rating,
          comment: review.comment
        }
      })
    )
  ]);
}

export async function readStore(): Promise<StoreData> {
  const jsonStore = await readJsonStore();

  try {
    const [catalog, orders, customers, reviews] = await Promise.all([
      readDatabaseCatalog(),
      readDatabaseOrders(),
      readDatabaseCustomers(),
      readDatabaseReviews()
    ]);

    return {
      ...jsonStore,
      products: catalog.products.length ? catalog.products : jsonStore.products,
      coupons: catalog.coupons.length ? catalog.coupons : jsonStore.coupons,
      orders: orders.length ? orders : jsonStore.orders,
      customers: customers.length ? customers : jsonStore.customers,
      reviews: reviews.length ? reviews : jsonStore.reviews
    };
  } catch {
    return jsonStore;
  }
}

export async function writeStore(store: StoreData) {
  await writeJsonStore(store);

  try {
    await syncDatabaseCatalog(store);
    await syncDatabaseCustomers(store);
    await syncDatabaseOrders(store);
    await syncDatabaseReviews(store);
  } catch {
    // Keep the JSON fallback working if the local database is unavailable.
  }
}

export function calculateDiscount(coupons: Coupon[], code: string, subtotal: number) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return 0;

  const coupon = coupons.find((item) => item.code.toUpperCase() === normalizedCode);
  if (!coupon || !coupon.active || subtotal < coupon.minSubtotal) return 0;

  const rawDiscount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value;
  return Math.min(subtotal, rawDiscount);
}

export function calculateOrderTotals(products: Product[], coupons: Coupon[], items: CartItem[], couponCode: string, pickup: boolean) {
  const subtotal = items.reduce((total, item) => {
    const product = products.find((current) => current.id === item.productId);
    return total + (product?.price || 0) * item.quantity;
  }, 0);
  const discount = calculateDiscount(coupons, couponCode, subtotal);
  const shipping = pickup || subtotal - discount >= 250 || subtotal === 0 ? 0 : 18.9;
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping
  };
}

export function decrementProductStock(products: Product[], items: CartItem[]) {
  return products.map((product) => {
    const soldQuantity = items
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => total + item.quantity, 0);

    if (!soldQuantity) return product;
    return {
      ...product,
      stock: Math.max(0, product.stock - soldQuantity)
    };
  });
}

export function validateStock(products: Product[], items: CartItem[]) {
  for (const item of items) {
    const product = products.find((current) => current.id === item.productId);
    if (!product) {
      return {
        ok: false,
        message: "Produto nao encontrado no catalogo."
      };
    }

    if (!product.active) {
      return {
        ok: false,
        message: `${product.name} esta inativo no catalogo.`
      };
    }

    if (item.quantity > product.stock) {
      return {
        ok: false,
        message: `${product.name} tem apenas ${product.stock} unidade(s) em estoque.`
      };
    }
  }

  return { ok: true, message: "" };
}
