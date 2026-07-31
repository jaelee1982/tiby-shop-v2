// 향수 분석 + TIBY 레이어링 추천 로직 — 구 tiby.me src/utils/perfumeAnalyzer.ts 이식 (로직 동일).

import { tibyProducts, type TibyProduct } from "./products";

export interface Perfume {
  brand: string;
  name: string;
  sweet: number;
  woody: number;
  fresh: number;
  musk: number;
  longevity: number;
  intensity: number;
  main_family: string;
  main_family_simple: string;
  gender_balance: string;
  top_notes: string;
  mid_notes: string;
  base_notes: string;
  search_key: string;
}

export interface PerfumeAnalysis {
  personality: string;
  intensityDescription: string;
}

export interface LayeringRecommendation {
  product: TibyProduct;
  score: number;
  reason: string;
  howTo: string[];
  tips: string[];
}

export const analyzePerfume = (perfume: Perfume): PerfumeAnalysis => {
  const { sweet, woody, fresh, musk, intensity, longevity } = perfume;

  const traits: string[] = [];
  if (sweet >= 3) traits.push("甘くてロマンティックな印象");
  if (woody >= 3) traits.push("落ち着いた大人の雰囲気");
  if (fresh >= 3) traits.push("爽やかで清潔感のある印象");
  if (musk >= 3) traits.push("セクシーで記憶に残る余韻");

  const personality =
    traits.length === 0 ? "バランスの取れた上品な香りです。" : traits.join("に、") + "が特徴的です。";

  let intensityDescription = "";
  if (intensity >= 4) intensityDescription = "つけたての香りは華やかで存在感があり、";
  else if (intensity >= 2) intensityDescription = "つけたての香りは程よく華やかで、";
  else intensityDescription = "つけたての香りは控えめで優しく、";

  if (longevity >= 4) intensityDescription += "長時間しっかりと香りが持続します";
  else if (longevity >= 2) intensityDescription += "数時間心地よく香りが続きます";
  else intensityDescription += "ふんわりと柔らかく香ります";

  return { personality, intensityDescription };
};

export const recommendLayering = (perfume: Perfume): LayeringRecommendation[] => {
  const recommendations: LayeringRecommendation[] = [];

  for (const product of tibyProducts) {
    let score = 0;
    const reasons: string[] = [];

    const sweetDiff = Math.abs(perfume.sweet - product.characteristics.sweet);
    const woodyDiff = Math.abs(perfume.woody - product.characteristics.woody);
    const freshDiff = Math.abs(perfume.fresh - product.characteristics.fresh);
    const muskDiff = Math.abs(perfume.musk - product.characteristics.musk);

    if (perfume.woody >= 3 && product.characteristics.fresh >= 3) {
      score += 2;
      reasons.push(
        `あなたの香水はWoodyが強め(${perfume.woody})なので、${product.nameJa}のFresh系と合わせると、重さを軽やかに中和してバランスの良い香りになります`
      );
    }
    if (perfume.sweet >= 3 && product.characteristics.fresh >= 3) {
      score += 1.5;
      reasons.push(`甘さ(${perfume.sweet})をフレッシュな香りで爽やかに仕上げます`);
    }
    if (perfume.fresh <= 2 && product.characteristics.fresh >= 3) {
      score += 1.5;
      reasons.push("フレッシュ感を補って、より爽やかな印象に");
    }
    if (perfume.musk >= 3 && product.characteristics.musk >= 3) {
      score += 1;
      reasons.push("ムスクの相乗効果で、より深みのある香りに");
    }

    score += (5 - (sweetDiff + woodyDiff + freshDiff + muskDiff) / 4) * 0.5;
    if (woodyDiff >= 2) score += 0.5;
    if (freshDiff >= 2) score += 0.5;

    const howTo = [
      `まず${product.nameJa}を髪の内側にスプレーします（15〜25cm離して）`,
      `お持ちの${perfume.name}を手首や首筋につけます`,
      `髪を動かすたびに${product.nameJa}の香りがふんわり広がります`,
    ];

    const tips: string[] = [];
    if (perfume.intensity >= 4) {
      tips.push("強い香水の場合は、TIBYを先につけてください（軽い香りが先）");
    }
    if (perfume.sweet >= 3 && product.characteristics.sweet >= 3) {
      tips.push("同じ系統（甘い×甘い）ですが、レイヤリングすることで奥行きが出ます");
    } else {
      tips.push("異なる系統を重ねることで、より複雑で魅力的な香りになります");
    }

    recommendations.push({
      product,
      score: Math.min(5, Math.max(2, score)),
      reason: reasons.join("。") || `${product.nameJa}の特徴が、あなたの香水と良いバランスを作ります`,
      howTo,
      tips,
    });
  }

  return recommendations.sort((a, b) => b.score - a.score);
};

export const getStarRating = (score: number): string => {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(5 - Math.ceil(score));
};
