// KOMOJU 브리지 — Eximbay 키가 아직 없고 KOMOJU_SECRET_KEY 만 있을 때 기존 hosted checkout 유지(결제 공백 방지).
// 대표 결정(2026-09-10) = Eximbay 전환. Eximbay env 등록 후 KOMOJU_SECRET_KEY 를 지우면 이 경로는 자연 소멸.
// 쿠폰은 이 경로에서 사용 불가(웹훅 없음 → 확정/해제 불가).
const KOMOJU_API_URL = process.env.KOMOJU_API_URL || "https://komoju.com/api/v1";
export const komojuAvailable = () => !!process.env.KOMOJU_SECRET_KEY;
export async function komojuSession(orderId: string, amountJpy: number, items: unknown, origin: string): Promise<string> {
  const res = await fetch(`${KOMOJU_API_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${process.env.KOMOJU_SECRET_KEY}:`).toString("base64")}` },
    body: JSON.stringify({ amount: amountJpy, currency: "JPY", default_locale: "ja", external_order_num: orderId, return_url: `${origin}/checkout/complete?order=${orderId}`, metadata: { order_num: orderId, items: JSON.stringify(items) } }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.session_url) { console.error("KOMOJU session error:", res.status, JSON.stringify(data).slice(0, 300)); throw new Error("komoju_failed"); }
  return data.session_url as string;
}
