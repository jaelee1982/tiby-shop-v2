// tiby.shop — 配送先・送料 (特定商取引法表記と同じ値: 全国一律 ¥350 / 北海道・沖縄 ¥400).
// 서버(/api/checkout)와 클라이언트(/checkout)가 같은 함수로 계산 — 청구액은 항상 서버 재계산.

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県",
  "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;
export type Prefecture = (typeof PREFECTURES)[number];

export const SHIPPING_FEE_STANDARD = 350;
export const SHIPPING_FEE_REMOTE = 400;
const REMOTE: ReadonlySet<string> = new Set(["北海道", "沖縄県"]);

export function isPrefecture(v: unknown): v is Prefecture {
  return typeof v === "string" && (PREFECTURES as readonly string[]).includes(v);
}

/** 都道府県 → 送料(税込 JPY). 미선택이면 표준 요금(화면 미리보기용). */
export function shippingFee(prefecture: string | null | undefined): number {
  return prefecture && REMOTE.has(prefecture) ? SHIPPING_FEE_REMOTE : SHIPPING_FEE_STANDARD;
}

export type ShippingAddress = {
  name: string;
  postal: string;      // 7 digits, no hyphen
  prefecture: Prefecture;
  city: string;        // 市区町村・番地
  building: string;    // 建物名・部屋番号 (optional, may be "")
  phone: string;       // digits only, 10–11
  email: string;
};

export type PaymentMethod = "card" | "convenience";
export const PAYMENT_METHODS: { id: PaymentMethod; label: string; note: string }[] = [
  { id: "card", label: "クレジットカード", note: "VISA / Mastercard / JCB / American Express / Diners Club" },
  { id: "convenience", label: "コンビニ決済", note: "お支払い番号を発行し、全国のコンビニでお支払い" },
];
export function isPaymentMethod(v: unknown): v is PaymentMethod {
  return v === "card" || v === "convenience";
}
/** コンビニ決済 개통 여부 — Eximbay 가 가맹점에 편의점 결제를 열어준 뒤 Netlify env NEXT_PUBLIC_PAY_CONVENIENCE=on 으로 켠다.
 *  꺼져 있으면 화면은 「近日対応予定」로 비활성 표시, 서버는 card 로 강제(게이트웨이에 없는 수단을 고르지 못하게). */
export const convenienceEnabled = (): boolean => (process.env.NEXT_PUBLIC_PAY_CONVENIENCE || "").toLowerCase() === "on";

const digits = (s: string) => s.replace(/[^\d]/g, "");
const normalizeDigits = (s: string) => digits(s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)));

/** 폼 입력 → 검증된 배송지 또는 필드별 오류 메시지(日本語). 서버·클라이언트 공용. */
export function validateShipping(input: Record<string, unknown>): { ok: true; value: ShippingAddress } | { ok: false; errors: Partial<Record<keyof ShippingAddress, string>> } {
  const str = (k: string) => (typeof input[k] === "string" ? (input[k] as string).trim() : "");
  const errors: Partial<Record<keyof ShippingAddress, string>> = {};
  const name = str("name");
  if (!name) errors.name = "お名前を入力してください。";
  else if (name.length > 60) errors.name = "お名前が長すぎます。";
  const postal = normalizeDigits(str("postal"));
  if (!/^\d{7}$/.test(postal)) errors.postal = "郵便番号は7桁の数字で入力してください。";
  const prefecture = str("prefecture");
  if (!isPrefecture(prefecture)) errors.prefecture = "都道府県を選択してください。";
  const city = str("city");
  if (!city) errors.city = "市区町村・番地を入力してください。";
  else if (city.length > 120) errors.city = "住所が長すぎます。";
  const building = str("building");
  if (building.length > 120) errors.building = "建物名が長すぎます。";
  const phone = normalizeDigits(str("phone"));
  if (!/^0\d{9,10}$/.test(phone)) errors.phone = "電話番号はハイフンなしの10〜11桁で入力してください。";
  const email = str("email").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) errors.email = "メールアドレスの形式を確認してください。";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, postal, prefecture: prefecture as Prefecture, city, building, phone, email } };
}

export function formatPostal(postal: string): string {
  const d = digits(postal);
  return d.length === 7 ? `${d.slice(0, 3)}-${d.slice(3)}` : postal;
}
