import { NextResponse } from "next/server";
import { readParams, settle } from "../_lib";
// Eximbay status_url (서버→서버 통지). 재검증 후 paid. 응답 본문은 게이트웨이가 요구하는 "OK" 텍스트.
export async function POST(request: Request) {
  const params = await readParams(request);
  const r = await settle(params);
  return new NextResponse(r.status === "paid" || r.status === "failed" ? "OK" : "RETRY", { status: r.status === "unknown" ? 202 : 200, headers: { "Content-Type": "text/plain" } });
}
export const GET = POST;
