import type { CartItem } from "./cart";

export type ProductCategory = "Vestuario" | "Acessorios" | "Kits";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  image: string;
  badge: string;
  rating: number;
  stock: number;
  description: string;
  details: string[];
  colors: string[];
  sizes: string[];
  sku: string;
  active: boolean;
};

export const PRODUCT_STORAGE_KEY = "riseclub-products";
export const STOCK_STORAGE_KEY = "riseclub-stock";

export const productImages = [
  "/gallery/01.jpg",
  "/gallery/02.jpg",
  "/gallery/03.jpg",
  "/gallery/04.jpg",
  "/gallery/05.jpg",
  "/gallery/06.jpg",
  "/gallery/09.jpg",
  "/gallery/12.jpg"
];

export const defaultProducts: Product[] = [
  {
    id: "camiseta-race-day",
    name: "Camiseta Race Day Rise",
    category: "Vestuario",
    price: 89.9,
    oldPrice: 109.9,
    image: "/gallery/02.jpg",
    badge: "Mais vendida",
    rating: 4.9,
    stock: 18,
    description: "Camiseta leve para treinos, provas e encontros da comunidade Rise Club.",
    details: ["Tecido dry fit", "Modelagem unissex", "Secagem rapida"],
    colors: ["Preto", "Amarelo", "Branco"],
    sizes: ["P", "M", "G", "GG"],
    sku: "RC-CAM-RACE",
    active: true
  },
  {
    id: "regata-pace",
    name: "Regata Pace Livre",
    category: "Vestuario",
    price: 79.9,
    image: "/gallery/03.jpg",
    badge: "Novo",
    rating: 4.8,
    stock: 12,
    description: "Regata respiravel pensada para longoes e treinos de intensidade.",
    details: ["Recorte esportivo", "Toque macio", "Logo frontal"],
    colors: ["Preto", "Cinza"],
    sizes: ["P", "M", "G"],
    sku: "RC-REG-PACE",
    active: true
  },
  {
    id: "bone-rise",
    name: "Bone Run Club",
    category: "Acessorios",
    price: 69.9,
    image: "/gallery/09.jpg",
    badge: "Essencial",
    rating: 4.7,
    stock: 24,
    description: "Bone ajustavel para proteger do sol sem pesar no treino.",
    details: ["Aba curva", "Fecho ajustavel", "Tecido leve"],
    colors: ["Preto", "Off white"],
    sizes: ["Unico"],
    sku: "RC-BON-RUN",
    active: true
  },
  {
    id: "meia-performance",
    name: "Meia Performance 5K/10K",
    category: "Acessorios",
    price: 39.9,
    oldPrice: 49.9,
    image: "/gallery/12.jpg",
    badge: "10% off",
    rating: 4.6,
    stock: 31,
    description: "Meia cano medio com conforto para rodagem e provas curtas.",
    details: ["Cano medio", "Compressao leve", "Costura confortavel"],
    colors: ["Preto", "Amarelo"],
    sizes: ["34-38", "39-43"],
    sku: "RC-MEI-5K",
    active: true
  },
  {
    id: "garrafa-hydra",
    name: "Garrafa Hydra Rise 650ml",
    category: "Acessorios",
    price: 54.9,
    image: "/gallery/06.jpg",
    badge: "Treino",
    rating: 4.8,
    stock: 16,
    description: "Garrafa pratica para treinos na semana e encontros de fim de semana.",
    details: ["650ml", "Tampa flip", "Livre de BPA"],
    colors: ["Preto", "Transparente"],
    sizes: ["Unico"],
    sku: "RC-GAR-HYDRA",
    active: true
  },
  {
    id: "kit-primeiro-corre",
    name: "Kit Primeiro Corre",
    category: "Kits",
    price: 149.9,
    oldPrice: 179.7,
    image: "/gallery/01.jpg",
    badge: "Kit",
    rating: 5,
    stock: 9,
    description: "Combo com camiseta, meia e garrafa para entrar na comunidade com tudo.",
    details: ["Economia no combo", "Ideal para iniciantes", "Pronto para presente"],
    colors: ["Preto"],
    sizes: ["P", "M", "G", "GG"],
    sku: "RC-KIT-01",
    active: true
  }
];

export const products = defaultProducts;
export const categories = ["Todos", "Vestuario", "Acessorios", "Kits"] as const;

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function readCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PRODUCT_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomProducts(nextProducts: Product[]) {
  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(nextProducts));
  window.dispatchEvent(new Event("riseclub-products-updated"));
}

export function readStockOverrides(): Record<string, number> {
  if (typeof window === "undefined") return {};

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STOCK_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStockOverrides(nextStock: Record<string, number>) {
  window.localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(nextStock));
  window.dispatchEvent(new Event("riseclub-products-updated"));
}

function applyStockOverrides(items: Product[]) {
  const stockOverrides = readStockOverrides();
  return items.map((product) => ({
    ...product,
    stock: stockOverrides[product.id] ?? product.stock
  }));
}

export function getAllProducts() {
  return applyStockOverrides([...defaultProducts, ...readCustomProducts()]);
}

export function getActiveProducts() {
  return getAllProducts().filter((product) => product.active);
}

export function findProduct(id: string) {
  return getAllProducts().find((product) => product.id === id && defaultProducts.some((base) => base.id === id));
}

export function findAnyProduct(id: string) {
  return getAllProducts().find((product) => product.id === id);
}

export function decrementStock(items: CartItem[]) {
  const currentProducts = getAllProducts();
  const overrides = readStockOverrides();
  const nextOverrides = { ...overrides };

  for (const item of items) {
    const product = currentProducts.find((current) => current.id === item.productId);
    if (!product) continue;
    nextOverrides[item.productId] = Math.max(0, product.stock - item.quantity);
  }

  saveStockOverrides(nextOverrides);
}
