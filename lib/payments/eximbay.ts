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
const QUERY_PATH = "/v1/payments"; // + /{transaction_id}

export type ReadyInput = {
  orderId: string; amountJpy: number; email?: string; buyerName?: string; lang?: "JP" | "EN" | "KR";
  products: { name: string; quantity: number; unitPrice: number }[]; origin: string;
};
export type ReadyParams = Record<string, unknown>;

export function buildReadyParams(i: ReadyInput): ReadyParams {
  return {
    payment: { transaction_type: "PAYMENT", order_id: i.orderId, currency: "JPY", amount: String(i.amountJpy), lang: i.lang ?? "JP" },
    merchant: { mid: process.env.EXIMBAY_MID ?? "", shop: "tiby.shop" },
    buyer: { name: i.buyerName || "Guest", email: i.email || "" },
    url: { return_url: `${i.origin}/api/payments/eximbay/return`, status_url: `${i.origin}/api/payments/eximbay/status` },
    settings: { display_type: "P", autoclose: "Y", issuer_country: "JP", ostype: "P", call_from_app: "N" },
    product: i.products.map((p) => ({ name: p.name.slice(0, 100), quantity: String(p.quantity), unit_price: String(p.unitPrice), link: `${i.origin}/` })),
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
  if (!res.ok || !fgkey) { console.error("Eximbay ready failed", res.status, JSON.stringify(raw).slice(0, 500)); throw new Error("eximbay_ready_failed"); }
  return { mode, fgkey, params, sdkUrl: `${EXIMBAY_BASE[mode]}/v1/javascriptSDK.js`, raw };
}

/** 결제 결과 재검증 — 통지 파라미터를 믿지 않고 조회 API 로 확인. 성공(rescode 0000 & 금액·주문 일치)만 true. */
export async function eximbayVerify(transactionId: string, orderId: string, amountJpy: number): Promise<{ ok: boolean; raw?: unknown }> {
  const mode = eximbayMode();
  if (mode === "mock") return { ok: true };
  const res = await fetch(`${EXIMBAY_BASE[mode]}${QUERY_PATH}/${encodeURIComponent(transactionId)}`, { headers: { Authorization: authHeader() }, cache: "no-store" });
  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const payment = (raw.payment ?? raw) as Record<string, unknown>;
  const ok = res.ok && String(raw.rescode ?? payment.rescode ?? "") === "0000"
    && String(payment.order_id ?? raw.order_id ?? "") === orderId
    && Number(payment.amount ?? raw.amount ?? -1) === amountJpy;
  if (!ok) console.error("Eximbay verify mismatch", res.status, JSON.stringify(raw).slice(0, 500));
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
