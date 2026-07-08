// tiby.shop — site-wide configuration (single place the owner edits).
// Canon source: tiby-content-os/00-canon/brand-facts.md — brand Tiby / タイビー,
// company Giant Korea Co., Ltd., price ¥999 tax-included, Hair Perfume / ヘアパフューム.
//
// ⚠️ 「TODO:」で始まる値は正式な情報が未入力のプレースホルダーです。
//     このファイルを編集して正しい値に置き換えてください（他のファイルは触らなくてOK）。

export const siteConfig = {
  brandName: "Tiby",
  brandNameJa: "タイビー",
  category: "Hair Perfume",
  categoryJa: "ヘアパフューム",
  siteUrl: "https://tiby.shop",
  contactEmail: "work@giantkorea.kr",
  customerSupportEmail: "work@giantkorea.kr",
  companyLegalName: "Giant Korea Co., Ltd.",
  operatorName: "Lee Jaeho",
  address:
    "31 Ttukseom-ro 1-gil #402（Seoul Forest M Tower）, Seongdong-gu, Seoul 04778, Republic of Korea",
  phone: "+82-70-8648-3795",
  businessHours: "メールにて受付（ご返信には2〜3営業日いただく場合があります）",
  currency: "JPY" as const,
  shippingPolicy: "ご注文後、1〜2日以内に発送いたします。",
  returnPolicy:
    "発送前であれば、お客様都合によるキャンセルを承ります。発送後のお客様都合によるキャンセル・返品・交換は承っておりません。初期不良の場合、ご購入から7日以内にご連絡いただけますと対応させていただきます。",
  instagram: "https://www.instagram.com/tibyjapan/",
  x: "https://x.com/tiby_japan",
  masterCopy: "香水は決めすぎるけど、これはズルい。",
} as const;

/** True when the value is still an unfilled placeholder. */
export function isTodo(value: string): boolean {
  return value.startsWith("TODO:");
}
