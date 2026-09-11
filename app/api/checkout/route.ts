import { NextResponse } from "next/server";
import { cartTotal, getCatalogItem, taxIncluded, type CartLine } from "@/lib/commerce";
import { applyCoupon } from "@/lib/quest";
import { siteConfig } from "@/lib/site";
import { supabaseService, userIdFromRequest } from "@/lib/supabase/server";
import { eximbayMode, eximbayReady, newOrderId } from "@/lib/payments/eximbay";
import { komojuAvailable, komojuSession } from "@/lib/payments/komoju";

// 결제 시작 (Eximbay). 클라이언트는 { lines:[{id,qty}], email?, coupon? } + (쿠폰 시) Authorization: Bearer <supabase access_token>.
// 금액은 lib/commerce.ts 로 서버 재계산, 쿠폰은 DB(coupon_reserve — 본인 소유·active·미만료)로 예약 후 할인 반영.
// 응답: mock → { redirectUrl } / test·live → { fgkey, params, sdkUrl, orderId } (브라우저가 /checkout/pay 에서 SDK 호출).
// 필요 env: SUPABASE_SERVICE_ROLE_KEY(주문·쿠폰 기록), EXIMBAY_MID/EXIMBAY_API_KEY(mock 외), NEXT_PUBLIC_SITE_URL.

type CheckoutBody = { lines?: unknown; email?: unknown; coupon?: unknown };

function sanitizeLines(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) return null;
  const lines: CartLine[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) return null;
    const { id, qty } = raw as { id?: unknown; qty?: unknown };
    if (typeof id !== "string" || !getCatalogItem(id)) return null;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 99) return null;
    lines.push({ id: id as CartLine["id"], qty });
  }
  return lines;
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 }); }
  const lines = sanitizeLines(body.lines);
  if (!lines) return NextResponse.json({ error: "カートの内容が不正です。" }, { status: 400 });
  const subtotal = cartTotal(lines);
  if (subtotal <= 0) return NextResponse.json({ error: "カートが空です。" }, { status: 400 });
  const email = typeof body.email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email) ? body.email.trim().toLowerCase() : undefined;
  const couponCode = typeof body.coupon === "string" ? body.coupon.trim().toUpperCase() : "";

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin || siteConfig.siteUrl;
  const orderId = newOrderId();
  const eximbayConfigured = eximbayMode() === "mock" || (!!process.env.EXIMBAY_MID && !!process.env.EXIMBAY_API_KEY);

  // 브리지: Eximbay 미설정 + KOMOJU 키 有 → 기존 KOMOJU(쿠폰 불가). Eximbay env 등록 시 자동으로 아래 본경로.
  if (!eximbayConfigured && komojuAvailable()) {
    if (couponCode) return NextResponse.json({ error: "クーポンのご利用は現在準備中です。コードを外してお進みください。" }, { status: 400 });
    try {
      const items = lines.map((l) => { const item = getCatalogItem(l.id)!; return { sku: item.sku, name: item.name, qty: l.qty, unit_price_tax_in: taxIncluded(item.price) }; });
      return NextResponse.json({ orderId, mode: "komoju", redirectUrl: await komojuSession(orderId, subtotal, items, origin) });
    } catch { return NextResponse.json({ error: "決済セッションを作成できませんでした。時間をおいて再度お試しください。" }, { status: 502 }); }
  }

  const sb = supabaseService();
  if (!sb) return NextResponse.json({ error: "オンライン決済は現在準備中です。恐れ入りますが、しばらくお待ちください。" }, { status: 503 });

  const userId = await userIdFromRequest(request);

  // 쿠폰 예약 (로그인 회원 본인 것만)
  let discount = 0, couponId: string | null = null;
  if (couponCode) {
    if (!userId) return NextResponse.json({ error: "クーポンのご利用にはログインが必要です。" }, { status: 401 });
    const { data, error } = await sb.rpc("coupon_reserve", { p_code: couponCode, p_user: userId, p_order_id: orderId });
    const r = (data ?? {}) as { ok?: boolean; reason?: string; coupon_id?: string; amount_jpy?: number };
    if (error || !r.ok) {
      const msg: Record<string, string> = { not_found: "クーポンコードが見つかりません。", not_owner: "このクーポンはご利用いただけません。", expired: "クーポンの有効期限が切れています。", redeemed: "このクーポンは使用済みです。", reserved: "このクーポンは別のお会計で使用中です。しばらくしてからお試しください。" };
      return NextResponse.json({ error: msg[r.reason ?? ""] ?? "クーポンを適用できませんでした。" }, { status: 400 });
    }
    couponId = r.coupon_id ?? null;
    discount = applyCoupon(subtotal, r.amount_jpy ?? 0).discount;
  }
  const total = subtotal - discount;
  const items = lines.map((l) => { const item = getCatalogItem(l.id)!; return { sku: item.sku, name: item.name, qty: l.qty, unit_price_tax_in: taxIncluded(item.price) }; });

  const { error: insErr } = await sb.from("orders").insert({ order_id: orderId, user_id: userId, email: email ?? null, lines: items, subtotal_jpy: subtotal, discount_jpy: discount, total_jpy: total, coupon_id: couponId, status: "created" });
  if (insErr) { console.error("order insert failed", insErr.message); if (couponId) await sb.rpc("coupon_release", { p_order_id: orderId }); return NextResponse.json({ error: "注文を作成できませんでした。時間をおいて再度お試しください。" }, { status: 502 }); }

  try {
    const ready = await eximbayReady({ orderId, amountJpy: total, email, products: items.map((i) => ({ name: i.name, quantity: i.qty, unitPrice: i.unit_price_tax_in })), origin });
    if (ready.mode === "mock") return NextResponse.json({ orderId, mode: "mock", redirectUrl: `${origin}/checkout/complete?order=${orderId}&mock=1` });
    return NextResponse.json({ orderId, mode: ready.mode, fgkey: ready.fgkey, params: ready.params, sdkUrl: ready.sdkUrl, redirectUrl: `${origin}/checkout/pay?order=${orderId}` });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("Eximbay ready error:", msg);
    if (couponId) await sb.rpc("coupon_release", { p_order_id: orderId });
    await sb.from("orders").update({ status: "failed", raw: { error: msg } }).eq("order_id", orderId);
    return NextResponse.json({ error: msg === "eximbay_not_configured" ? "オンライン決済は現在準備中です。恐れ入りますが、しばらくお待ちください。" : "決済セッションを作成できませんでした。時間をおいて再度お試しください。" }, { status: msg === "eximbay_not_configured" ? 503 : 502 });
  }
}
