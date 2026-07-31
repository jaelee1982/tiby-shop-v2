// TIBY 3 SKU 향 프로필 — 구 tiby.me(볼트 SPA) src/data/tibyProducts.ts 이식.
// 색상은 쇼핑몰 디자인 시스템 SKU 토큰(globals.css --tiby-*)과 일치시킴.

export interface ScentProfile {
  sweet: number;
  woody: number;
  fresh: number;
  musk: number;
}

export interface TibyProduct {
  id: "love" | "hug" | "kiss";
  slug: string;
  nameJa: string;
  nameEn: string;
  description: string;
  notes: { top: string[]; mid: string[]; base: string[] };
  characteristics: ScentProfile;
  scene: string;
  accent: string;
  soft: string;
}

export const tibyProducts: TibyProduct[] = [
  {
    id: "love",
    slug: "love-me-me",
    nameJa: "ラブミーミー",
    nameEn: "LOVE ME ME",
    description: "ロマンティックフローラル",
    notes: {
      top: ["ベルガモット", "ピンクペッパー"],
      mid: ["ジャスミン", "ローズ"],
      base: ["アンバー", "ムスク"],
    },
    characteristics: { sweet: 3, woody: 2, fresh: 2, musk: 3 },
    scene: "デート・特別な日",
    accent: "#ED8CA5",
    soft: "rgba(237, 140, 165, 0.12)",
  },
  {
    id: "hug",
    slug: "hug-me-me",
    nameJa: "ハグミーミー",
    nameEn: "HUG ME ME",
    description: "温かみのあるシトラス",
    notes: {
      top: ["レモン", "マンダリン"],
      mid: ["ガーデニア", "ネロリ"],
      base: ["バニラ", "サンダルウッド"],
    },
    characteristics: { sweet: 2, woody: 2, fresh: 4, musk: 2 },
    scene: "毎日使い・リラックス",
    accent: "#62BFC3",
    soft: "rgba(98, 191, 195, 0.12)",
  },
  {
    id: "kiss",
    slug: "kiss-me-me",
    nameJa: "キスミーミー",
    nameEn: "KISS ME ME",
    description: "官能的なフルーティー",
    notes: {
      top: ["アップル", "ピーチ"],
      mid: ["ガーデニア", "フリージア"],
      base: ["ムスク", "アンバー"],
    },
    characteristics: { sweet: 4, woody: 1, fresh: 2, musk: 4 },
    scene: "夜のお出かけ・特別なシーン",
    accent: "#A89CC8",
    soft: "rgba(168, 156, 200, 0.12)",
  },
];

export const getProductById = (id?: string) => tibyProducts.find((p) => p.id === id);
