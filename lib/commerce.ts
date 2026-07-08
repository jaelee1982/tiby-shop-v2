// tiby.shop — purchasable catalog & cart types.
// Prices are tax-included JPY (canon: ¥999 per SKU, all channels).
// The checkout API validates every cart line against this catalog server-side,
// so client-side tampering can never change what is charged.
import { products } from "@/lib/products";

export type CatalogItemId = "love-me-me" | "hug-me-me" | "kiss-me-me" | "trio-set";

export type CatalogItem = {
  id: CatalogItemId;
  name: string;
  nameJa: string;
  sku: string;
  scentName: string;
  volume: string;
  weight: string;
  /** Tax-included price in JPY. */
  price: number;
  currency: "JPY";
  image: string;
  description: string;
  ingredients: string;
  usage: string;
  warnings: string;
  inventoryStatus: "in_stock" | "sold_out";
  /** External payment/product id, if the payment provider needs one. */
  paymentProductId?: string;
};

const img = (slug: string) => products.find((p) => p.slug === slug)?.image ?? "";
const tagline = (slug: string) => products.find((p) => p.slug === slug)?.tagline ?? "";

const SHARED = {
  volume: "30ml",
  weight: "135g",
  currency: "JPY" as const,
  ingredients: "TODO: 全成分表示を入力",
  usage:
    "髪から15〜25cmほど離して、毛先を中心に1〜2プッシュ。ブラッシング後や外出前の仕上げに。",
  warnings:
    "頭皮に異常があるときはご使用をおやめください。目に入った場合はすぐに洗い流してください。火気にご注意ください。高温多湿・直射日光を避けて保管してください。",
  inventoryStatus: "in_stock" as const,
};

export const CATALOG: Record<CatalogItemId, CatalogItem> = {
  "love-me-me": {
    id: "love-me-me",
    name: "LOVE ME ME",
    nameJa: "ラブ ミーミー",
    sku: "TIBY-HP-LOVE",
    scentName: "Fresh Floral Musk Amber",
    price: 999,
    image: img("love-me-me"),
    description: tagline("love-me-me"),
    ...SHARED,
  },
  "hug-me-me": {
    id: "hug-me-me",
    name: "HUG ME ME",
    nameJa: "ハグ ミーミー",
    sku: "TIBY-HP-HUG",
    scentName: "Citrus Floral Vanilla",
    price: 999,
    image: img("hug-me-me"),
    description: tagline("hug-me-me"),
    ...SHARED,
  },
  "kiss-me-me": {
    id: "kiss-me-me",
    name: "KISS ME ME",
    nameJa: "キス ミーミー",
    sku: "TIBY-HP-KISS",
    scentName: "Fruity Floral",
    price: 999,
    image: img("kiss-me-me"),
    description: tagline("kiss-me-me"),
    ...SHARED,
  },
  "trio-set": {
    id: "trio-set",
    name: "TIBY 3-SCENT SET",
    nameJa: "3本セット（LOVE / HUG / KISS）",
    sku: "TIBY-HP-SET3",
    scentName: "LOVE ME ME · HUG ME ME · KISS ME ME",
    price: 2700,
    image: img("hug-me-me"),
    description:
      "ときめき・温もり・情熱。3つの香りを、その日の気分で使い分け。単品より¥297おトクなセットです。",
    ...SHARED,
  },
};

export type CartLine = { id: CatalogItemId; qty: number };

export function getCatalogItem(id: string): CatalogItem | undefined {
  return (CATALOG as Record<string, CatalogItem>)[id];
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => {
    const item = getCatalogItem(l.id);
    return item ? sum + item.price * l.qty : sum;
  }, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function formatJpy(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}
