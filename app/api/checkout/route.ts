import { NextResponse } from "next/server";
import { cartTotal, getCatalogItem, taxIncluded, type CartLine } from "@/lib/commerce";
import { applyCoupon } from "@/lib/quest";
import { convenienceEnabled, isPaymentMethod, shippingFee, validateShipping, type PaymentMethod, type ShippingAddress } from "@/lib/shipping";
import { siteConfig } from "@/lib/site";
import { describeServiceKey, supabaseService, userIdFromRequest } from "@/lib/supabase/server";
import { eximbayMode, eximbayReady, newOrderId } from "@/lib/payments/eximbay";
import { komojuAvailable, komojuSession } from "@/lib/payments/komoju";

// 결제 시작 (Eximbay). 클라이언트(/checkout)는 { lines:[{id,qty}], shipping:{…}, paymentMethod, coupon? } + (쿠폰 시) Authorization: Bearer <supabase access_token>.
// 금액은 lib/commerce.ts(상품) + lib/shipping.ts(송료) 로 서버 재계산, 쿠폰은 DB(coupon_reserve — 본인 소유·active·미만료)로 예약 후 할인 반영.
// 응답: mock → { redirectUrl } / test·live → { fgkey, params, sdkUrl, orderId } (브라우저가 /checkout/pay 에서 SDK 호출).
// 필요 env: SUPABASE_SERVICE_ROLE_KEY(주문·쿠폰 기록), EXIMBAY_MID/EXIMBAY_API_KEY(mock 외), NEXT_PUBLIC_SITE_URL.

type CheckoutBody = { lines?: unknown; email?: unknown; coupon?: unknown; shipping?: unknown; paymentMethod?: unknown };
const NOT_READY = "オンライン決済は、決済代行会社（Eximbay）の加盟店審査完了後にご利用いただけます。現在は審査中のため、お支払い画面を開くことができません。恐れ入りますが、しばらくお待ちください。";

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

/** 배송지·결제수단 컬럼이 아직 없는 DB(구 스키마)면 그 컬럼만 빼고 재시도 — 주문 기록은 반드시 남긴다(fail-soft). */
const OPTIONAL_COLUMNS = ["shipping", "shipping_jpy", "payment_method"] as const;
function isMissingColumn(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return err.code === "42703" || err.code === "PGRST204" || /column|schema cache/i.test(err.message ?? "");
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 }); }
  const lines = sanitizeLines(body.lines);
  if (!lines) return NextResponse.json({ error: "カートの内容が不正です。" }, { status: 400 });
  const subtotal = cartTotal(lines);
  if (subtotal <= 0) return NextResponse.json({ error: "カートが空です。" }, { status: 400 });

  // 配送先 — /checkout 폼 필수. (구 카트 직결 호출은 shipping 없이 오므로 400 으로 명확히 거절)
  const shippingResult = validateShipping(typeof body.shipping === "object" && body.shipping !== null ? (body.shipping as Record<string, unknown>) : {});
  if (!shippingResult.ok) return NextResponse.json({ error: "配送先の入力内容をご確認ください。", fields: shippingResult.errors }, { status: 400 });
  const shipping: ShippingAddress = shippingResult.value;
  const requested: PaymentMethod = isPaymentMethod(body.paymentMethod) ? body.paymentMethod : "card";
  const paymentMethod: PaymentMethod = requested === "convenience" && !convenienceEnabled() ? "card" : requested;
  const email = shipping.email;
  const couponCode = typeof body.coupon === "string" ? body.coupon.trim().toUpperCase() : "";
  const shippingJpy = shippingFee(shipping.prefecture);

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin || siteConfig.siteUrl;
  const orderId = newOrderId();
  const eximbayConfigured = eximbayMode() === "mock" || (!!process.env.EXIMBAY_MID && !!process.env.EXIMBAY_API_KEY);

  // 브리지: Eximbay 미설정 + KOMOJU 키 有 → 기존 KOMOJU(쿠폰 불가). Eximbay env 등록 시 자동으로 아래 본경로.
  if (!eximbayConfigured && komojuAvailable()) {
    if (couponCode) return NextResponse.json({ error: "クーポンのご利用は現在準備中です。コードを外してお進みください。" }, { status: 400 });
    try {
      const items = lines.map((l) => { const item = getCatalogItem(l.id)!; return { sku: item.sku, name: item.name, qty: l.qty, unit_price_tax_in: taxIncluded(item.price) }; });
      items.push({ sku: "SHIPPING", name: "送料", qty: 1, unit_price_tax_in: shippingJpy });
      return NextResponse.json({ orderId, mode: "komoju", redirectUrl: await komojuSession(orderId, subtotal + shippingJpy, items, origin) });
    } catch { return NextResponse.json({ error: "決済セッションを作成できませんでした。時間をおいて再度お試しください。" }, { status: 502 }); }
  }

  // 게이트웨이 미설정은 주문을 만들기 전에 판정 — 결제 못 하는 주문 행을 남기지 않는다.
  // detail = 어떤 설정이 비었는지(변수 이름만, 값 없음) — 화면 작은 글씨로 노출해 배포·env 문제를 즉시 구분.
  if (!eximbayConfigured) {
    const missing = [!process.env.EXIMBAY_MID && "EXIMBAY_MID", !process.env.EXIMBAY_API_KEY && "EXIMBAY_API_KEY"].filter(Boolean).join(", ");
    console.error("checkout: eximbay not configured", missing);
    return NextResponse.json({ error: NOT_READY, reason: "eximbay_not_configured", detail: `config: ${missing || "EXIMBAY_*"} 未設定 (mode=${eximbayMode()})` }, { status: 503 });
  }
  const sb = supabaseService();
  if (!sb) { console.error("checkout: SUPABASE_SERVICE_ROLE_KEY missing"); return NextResponse.json({ error: NOT_READY, reason: "db_not_configured", detail: "config: SUPABASE_SERVICE_ROLE_KEY 未設定" }, { status: 503 }); }

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
  const total = subtotal - discount + shippingJpy; // 청구액 = 상품(税込) − クーポン + 送料
  const items = lines.map((l) => { const item = getCatalogItem(l.id)!; return { sku: item.sku, name: item.name, qty: l.qty, unit_price_tax_in: taxIncluded(item.price) }; });

  const baseRow = { order_id: orderId, user_id: userId, email, lines: items, subtotal_jpy: subtotal, discount_jpy: discount, total_jpy: total, coupon_id: couponId, status: "created" };
  const fullRow: Record<string, unknown> = { ...baseRow, shipping, shipping_jpy: shippingJpy, payment_method: paymentMethod };
  let { error: insErr } = await sb.from("orders").insert(fullRow);
  if (insErr && isMissingColumn(insErr)) {
    console.warn("orders: shipping columns missing — inserting legacy row (run migration 20260918_orders_shipping)", insErr.message);
    for (const c of OPTIONAL_COLUMNS) delete fullRow[c];
    // 배송지는 raw 에라도 남긴다 — 발송 정보를 잃지 않는다.
    ({ error: insErr } = await sb.from("orders").insert({ ...fullRow, raw: { shipping, shipping_jpy: shippingJpy, payment_method: paymentMethod } }));
  }
  if (insErr) {
    console.error("order insert failed", insErr.code, insErr.message);
    if (couponId) await sb.rpc("coupon_release", { p_order_id: orderId });
    // detail = PostgREST 오류 코드·메시지(비밀값 없음) — 키 오류(Invalid API key/permission denied)와 스키마 오류를 화면에서 구분.
    const keyHint = /invalid api key|jwt|permission denied|row-level security/i.test(insErr.message ?? "") ? ` · ${describeServiceKey()}` : "";
    return NextResponse.json({ error: "注文を作成できませんでした。時間をおいて再度お試しください。", detail: `db: ${insErr.code ?? ""} ${insErr.message ?? ""}`.trim().slice(0, 200) + keyHint }, { status: 502 });
  }

  try {
    const products = items.map((i) => ({ name: i.name, quantity: i.qty, unitPrice: i.unit_price_tax_in }));
    products.push({ name: "送料", quantity: 1, unitPrice: shippingJpy });
    const ready = await eximbayReady({ orderId, amountJpy: total, email, buyerName: shipping.name, products, origin });
    if (ready.mode === "mock") return NextResponse.json({ orderId, mode: "mock", redirectUrl: `${origin}/checkout/complete?order=${orderId}&mock=1` });
    return NextResponse.json({ orderId, mode: ready.mode, fgkey: ready.fgkey, params: ready.params, sdkUrl: ready.sdkUrl, redirectUrl: `${origin}/checkout/pay?order=${orderId}` });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("Eximbay ready error:", msg);
    if (couponId) await sb.rpc("coupon_release", { p_order_id: orderId });
    await sb.from("orders").update({ status: "failed", raw: { error: msg, detail: (e as Error & { detail?: string }).detail ?? null } }).eq("order_id", orderId);
    // 게이트웨이 응답 코드·메시지는 화면에 작은 글씨로 노출(개통 초기 필드명 확인용 — 비밀값 없음). 원문은 orders.raw 에 남아 있음.
    const detail = (e as Error & { detail?: string }).detail;
    return NextResponse.json({ error: msg === "eximbay_not_configured" ? NOT_READY : "決済セッションを作成できませんでした。時間をおいて再度お試しください。", detail }, { status: msg === "eximbay_not_configured" ? 503 : 502 });
  }
}
