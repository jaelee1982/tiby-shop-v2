import { NextResponse } from "next/server";
import { readParams, settle } from "../_lib";
// Eximbay return_url (브라우저 복귀, 보통 POST). 재검증 후 완료 페이지로 리다이렉트 — 결과는 쿼리로만 전달(민감정보 없음).
export async function POST(request: Request) {
  const params = await readParams(request);
  const r = await settle(params);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const dest = r.status === "paid" ? `/checkout/complete?order=${encodeURIComponent(r.orderId)}` : `/checkout/pay?order=${encodeURIComponent(r.orderId)}&result=${r.status}`;
  return NextResponse.redirect(`${origin}${dest}`, 303);
}
export const GET = POST;
