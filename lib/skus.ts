// TIBY SKU data — content from the TIBY Design System (ui_kits/pdp/app.jsx),
// product imagery mapped from the live Shopify CDN (lib/products.ts).
// Copy here is brand-approved per Guidelines v2.0 (§04/§05b/§5.3/§12).
import { products } from "@/lib/products";

export type SkuId = "love" | "hug" | "kiss";

export type Sku = {
  id: SkuId;
  slug: string;
  name: string;
  jp: string;
  act: string;
  body: string;
  accent: string;
  cap: string;
  halo: string;
  family: string;
  top: string;
  mid: string;
  base: string;
  copy: string;
  timeline: { t: string; jp: string }[];
  front: string;
};

const img = (slug: string) =>
  products.find((p) => p.slug === slug)?.image ?? "";

export const SKUS: Record<SkuId, Sku> = {
  love: {
    id: "love",
    slug: "love-me-me",
    name: "LOVE ME ME",
    jp: "ときめきの​始まり",
    act: "Act 1 · ときめき",
    body: "#FBBFD0",
    accent: "#ED8CA5",
    cap: "#ED8CA5",
    halo: "#FFEEF4",
    family: "Fresh Floral Musk Amber",
    top: "Bergamot · Orange · Peach",
    mid: "Orchid · Rose · Jasmine · Freesia",
    base: "Musk · Amber",
    copy: "ビターオレンジのきらめきから、ジャスミンのロマンティックなブーケへ。",
    timeline: [
      { t: "0 min", jp: "ひと吹きした瞬間、ビターオレンジのきらめき" },
      { t: "30 min", jp: "ジャスミンのロマンティックなブーケ" },
      { t: "To night", jp: "夜まで続く、ムスク・アンバーの余韻" },
    ],
    front: img("love-me-me"),
  },
  hug: {
    id: "hug",
    slug: "hug-me-me",
    name: "HUG ME ME",
    jp: "そばにいる温もり",
    act: "Act 2 · ぬくもり",
    body: "#62BFC3",
    accent: "#EDD9B4",
    cap: "#3A9EA2",
    halo: "#E3F4F4",
    family: "Floral Musk Woody Sweet",
    top: "Lemon · Tangerine",
    mid: "Orchid · Lily of the Valley · Heliotrope",
    base: "Musk · Sandalwood · Vanilla · Amber",
    copy: "甘く濃厚なシトラスから、バニラの甘い吐息へ。咲き誇るフローラルに溶け込んで。",
    timeline: [
      { t: "0 min", jp: "濃厚なシトラス&バニラのやわらかな立ち上がり" },
      { t: "30 min", jp: "咲き誇るフローラルの、そばにいる温もり" },
      { t: "To night", jp: "サンダルウッドとムスクが、静かに寄り添う夜" },
    ],
    front: img("hug-me-me"),
  },
  kiss: {
    id: "kiss",
    slug: "kiss-me-me",
    name: "KISS ME ME",
    jp: "もっと近づきたい",
    act: "Act 3 · 情熱",
    body: "#A89CC8",
    accent: "#E8B4BE",
    cap: "#8A7BB4",
    halo: "#F0ECF8",
    family: "Fruity Floral Musk Amber",
    top: "Apple · Raspberry",
    mid: "Orchid · Gardenia · Freesia · Cyclamen",
    base: "Musk · Amber · Wood",
    copy: "ジューシーなレッドアップルから、やわらかなスエードの余韻へ。",
    timeline: [
      { t: "0 min", jp: "ジューシーなレッドアップルの、甘い吐息" },
      { t: "30 min", jp: "ガーデニアとフリージアが、距離を近づけて" },
      { t: "To night", jp: "スエードとアンバーが残す、情熱の余韻" },
    ],
    front: img("kiss-me-me"),
  },
};

export const SKU_ORDER: SkuId[] = ["love", "hug", "kiss"];
export const SLUG_TO_SKU: Record<string, SkuId> = {
  "love-me-me": "love",
  "hug-me-me": "hug",
  "kiss-me-me": "kiss",
};
