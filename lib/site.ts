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
  operatorName: "TODO: 運営責任者名を入力",
  address: "TODO: 正式な会社住所を入力",
  phone: "TODO: 正式な電話番号を入力",
  businessHours: "TODO: お問い合わせ対応時間を入力（例：平日 10:00〜17:00）",
  currency: "JPY" as const,
  shippingPolicy:
    "TODO: 配送ポリシーを入力（例：ご入金確認後、3〜5営業日以内に発送いたします）",
  returnPolicy:
    "TODO: 返品ポリシーを確定（例：未開封・未使用品に限り、商品到着後7日以内にメールにてご連絡ください）",
  instagram: "https://www.instagram.com/tibyjapan/",
  x: "https://x.com/tiby_japan",
  masterCopy: "香水は決めすぎるけど、これはズルい。",
} as const;

/** True when the value is still an unfilled placeholder. */
export function isTodo(value: string): boolean {
  return value.startsWith("TODO:");
}
