// Eximbay 결제 어댑터 (2026-09-10 대표 결정: KOMOJU → Eximbay). 서버 전용 — API 키는 Netlify 환경변수.
//
// 환경변수: EXIMBAY_MID(가맹점 ID) · EXIMBAY_API_KEY(API 키) · EXIMBAY_MODE = "test"(기본, api-test.eximbay.com) | "live" | "mock"
//           NEXT_PUBLIC_SITE_URL(콜백 URL 기준). mock = 게이트웨이 없이 완료 페이지로 이동(개발·하네스용, live 에선 무시).
// 흐름(Eximbay API v2 — Hosted/SDK): ① 서버 POST /v1/payments/ready(Basic auth) → fgkey ② 브라우저가 javascriptSDK.js 로
//   EXIMBAY.request_pay({fgkey, ...같은 파라미터}) ③ 결제 후 status_url(서버 통지)·return_url(브라우저 복귀) ④ 서버는 통지를
//   그대로 믿지 않고 조회 API 로 재검증 후 주문 paid 처리.
// ⚠️ 세션 프록시가 developer.eximbay.com 을 차단해 필드명은 기억 기반 — 가맹점 테스트 계정으로 첫 결제 시 응답 로그로 확인·조정.
//   조정 지점은 이 파일 하나(READY_PATH/QUERY_PATH/build*).
import { createHash } from "node:crypto";

export type EximbayMode = "test" | "live" | "mock";
export const eximbayMode = (): EximbayMode => {
  const m = (process.env.EXIMBAY_MODE || "test").toLowerCase();
  return m === "live" || m === "mock" ? m : "test";
};
export const EXIMBAY_BASE: Record<Exclude<EximbayMode, "mock">, string> = { test: "https://api-test.eximbay.com", live: "https://api.eximbay.com" };
const READY_PATH = "/v1/payments/ready";
const VERIFY_PATH = "/v1/payments/verify"; // 문서(2026-09-18 실측): status_url/return_url 로 받은 쿼리스트링 원문을 {data} 로 POST → rescode 0000 = 위변조 없음

export type ReadyInput = {
  orderId: string; amountJpy: number; email?: string; buyerName?: string; buyerPhone?: string; lang?: "JP" | "EN" | "KR"; mobile?: boolean;
  products: { name: string; quantity: number; unitPrice: number }[]; origin: string;
};

/** Eximbay 문서(2026-09-18 실측): product 배열은 최대 3개. 넘치면 4번째부터 한 줄로 합산(수량 1·단가=합계). */
export function capProducts(list: { name: string; quantity: number; unitPrice: number }[]): { name: string; quantity: number; unitPrice: number }[] {
  if (list.length <= 3) return list;
  const head = list.slice(0, 2);
  const rest = list.slice(2);
  const total = rest.reduce((s, p) => s + p.unitPrice * p.quantity, 0);
  return [...head, { name: `${rest[0].name} ほか${rest.length}点`, quantity: 1, unitPrice: total }];
}
export type ReadyParams = Record<string, unknown>;

export function buildReadyParams(i: ReadyInput): ReadyParams {
  return {
    payment: { transaction_type: "PAYMENT", order_id: i.orderId, currency: "JPY", amount: String(i.amountJpy), lang: i.lang ?? "JP" },
    merchant: { mid: process.env.EXIMBAY_MID ?? "", shop: "tiby.shop" },
    buyer: { name: i.buyerName || "Guest", email: i.email || "", ...(i.buyerPhone ? { phone_number: i.buyerPhone } : {}) },
    url: { return_url: `${i.origin}/api/payments/eximbay/return`, status_url: `${i.origin}/api/payments/eximbay/status` },
    settings: { display_type: "P", autoclose: "Y", issuer_country: "JP", ostype: i.mobile ? "M" : "P", call_from_app: "N" },
    product: capProducts(i.products).map((p) => ({ name: p.name.slice(0, 100), quantity: String(p.quantity), unit_price: String(p.unitPrice), link: `${i.origin}/` })),
  };
}

const authHeader = () => `Basic ${Buffer.from(`${process.env.EXIMBAY_API_KEY ?? ""}:`).toString("base64")}`;

/** ready 호출 → { fgkey, params, sdkUrl }. mock 모드는 fgkey 없이 완료 URL 만. */
export async function eximbayReady(i: ReadyInput): Promise<{ mode: EximbayMode; fgkey?: string; params?: ReadyParams; sdkUrl?: string; raw?: unknown }> {
  const mode = eximbayMode();
  if (mode === "mock") return { mode };
  if (!process.env.EXIMBAY_MID || !process.env.EXIMBAY_API_KEY) throw new Error("eximbay_not_configured");
  const params = buildReadyParams(i);
  const res = await fetch(`${EXIMBAY_BASE[mode]}${READY_PATH}`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: authHeader() }, body: JSON.stringify(params), cache: "no-store",
  });
  const raw = await res.json().catch(() => ({}));
  const fgkey = (raw as { fgkey?: string }).fgkey;
  if (!res.ok || !fgkey) {
    console.error("Eximbay ready failed", res.status, JSON.stringify(raw).slice(0, 500));
    const r = raw as { rescode?: string; resmsg?: string; message?: string; error?: string };
    const err = new Error("eximbay_ready_failed") as Error & { detail?: string };
    err.detail = `HTTP ${res.status}${r.rescode ? ` · ${r.rescode}` : ""}${r.resmsg || r.message || r.error ? ` · ${r.resmsg || r.message || r.error}` : ""}`;
    throw err;
  }
  return { mode, fgkey, params, sdkUrl: `${EXIMBAY_BASE[mode]}/v1/javascriptSDK.js`, raw };
}

/** 결제 결과 재검증 — 통지 파라미터를 믿지 않고 Eximbay 검증 API(/v1/payments/verify, data=쿼리스트링 원문)로 fgkey 무결성을 확인.
 *  성공(검증 rescode 0000 & 콜백 rescode 0000 & 주문·금액 일치)만 true. */
export async function eximbayVerify(callback: Record<string, unknown>, orderId: string, amountJpy: number): Promise<{ ok: boolean; raw?: unknown }> {
  const mode = eximbayMode();
  if (mode === "mock") return { ok: true };
  const cb = parseCallback(callback);
  const data = new URLSearchParams(Object.entries(callback).map(([k, v]) => [k, String(v ?? "")])).toString();
  const res = await fetch(`${EXIMBAY_BASE[mode]}${VERIFY_PATH}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: authHeader() }, body: JSON.stringify({ data }), cache: "no-store" });
  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const ok = res.ok && String(raw.rescode ?? "") === "0000" && cb.rescode === "0000" && cb.orderId === orderId && cb.amount === amountJpy;
  if (!ok) console.error("Eximbay verify mismatch", res.status, JSON.stringify(raw).slice(0, 300), { cbRescode: cb.rescode, cbOrder: cb.orderId, cbAmount: cb.amount, orderId, amountJpy });
  return { ok, raw };
}

/** 통지/복귀 폼(POST x-www-form-urlencoded 또는 JSON)에서 공통 필드 추출 (필드명 대소문자 무시) */
export function parseCallback(obj: Record<string, unknown>): { rescode: string; orderId: string; transactionId: string; amount: number } {
  const get = (k: string) => { const key = Object.keys(obj).find((x) => x.toLowerCase() === k); return key ? String(obj[key] ?? "") : ""; };
  return { rescode: get("rescode"), orderId: get("order_id") || get("ref"), transactionId: get("transaction_id") || get("transid"), amount: Number(get("amount") || get("amt") || 0) };
}

/** 주문번호: tiby-YYYYMMDD-랜덤 (Eximbay order_id ≤ 40자 영숫자·하이픈) */
export function newOrderId(now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `tiby-${d}-${createHash("sha256").update(`${now.getTime()}-${Math.random()}`).digest("hex").slice(0, 10)}`;
}
