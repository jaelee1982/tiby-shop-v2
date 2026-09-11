// Eximbay 통지·복귀 공통: 파라미터 파싱 → 주문 조회 → 조회 API 재검증 → paid 처리(+쿠폰 확정). 멱등(이미 paid 면 통과).
import { eximbayVerify, parseCallback } from "@/lib/payments/eximbay";
import { supabaseService } from "@/lib/supabase/server";

export async function readParams(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (ct.includes("form")) { const fd = await request.formData(); return Object.fromEntries(Array.from(fd.entries()).map(([k, v]) => [k, String(v)])); }
  const u = new URL(request.url); return Object.fromEntries(u.searchParams.entries());
}

export async function settle(params: Record<string, unknown>): Promise<{ ok: boolean; orderId: string; status: "paid" | "failed" | "unknown" }> {
  const cb = parseCallback(params);
  const sb = supabaseService();
  if (!sb || !cb.orderId) return { ok: false, orderId: cb.orderId, status: "unknown" };
  const { data: order } = await sb.from("orders").select("order_id,total_jpy,status,coupon_id").eq("order_id", cb.orderId).maybeSingle();
  if (!order) return { ok: false, orderId: cb.orderId, status: "unknown" };
  if (order.status === "paid") return { ok: true, orderId: cb.orderId, status: "paid" };
  if (cb.rescode && cb.rescode !== "0000") {
    await sb.from("orders").update({ status: "failed", raw: params }).eq("order_id", cb.orderId);
    if (order.coupon_id) await sb.rpc("coupon_release", { p_order_id: cb.orderId });
    return { ok: false, orderId: cb.orderId, status: "failed" };
  }
  const v = await eximbayVerify(cb.transactionId, cb.orderId, order.total_jpy);
  if (!v.ok) return { ok: false, orderId: cb.orderId, status: "unknown" };
  await sb.from("orders").update({ status: "paid", paid_at: new Date().toISOString(), provider_txn_id: cb.transactionId || null, raw: { callback: params, verify: v.raw ?? null } }).eq("order_id", cb.orderId);
  if (order.coupon_id) await sb.rpc("coupon_redeem", { p_order_id: cb.orderId });
  return { ok: true, orderId: cb.orderId, status: "paid" };
}
