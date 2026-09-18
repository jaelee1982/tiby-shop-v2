import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

// /checkout/pay 폴백: sessionStorage 에 fgkey 가 없을 때(다른 도메인·탭·저장소 차단) 서버에 보관한 ready 응답을 돌려준다.
// 주문번호(tiby-YYYYMMDD-랜덤 10hex)만으로 조회 — fgkey 는 그 주문 결제창을 여는 1회성 키일 뿐 금전 이동 권한이 아님.
// 미결제(created) 주문만, 생성 후 1시간 이내만 응답.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const order = new URL(request.url).searchParams.get("order") || "";
  if (!/^tiby-\d{8}-[0-9a-f]{10}$/.test(order)) return NextResponse.json({ error: "bad_order" }, { status: 400 });
  const sb = supabaseService();
  if (!sb) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  const { data } = await sb.from("orders").select("order_id,status,created_at,raw").eq("order_id", order).maybeSingle();
  const ready = (data?.raw as { ready?: { fgkey: string; params: Record<string, unknown>; sdkUrl: string } } | null)?.ready;
  if (!data || data.status !== "created" || !ready?.fgkey) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (Date.now() - new Date(data.created_at).getTime() > 60 * 60 * 1000) return NextResponse.json({ error: "expired" }, { status: 410 });
  return NextResponse.json({ orderId: order, fgkey: ready.fgkey, params: ready.params, sdkUrl: ready.sdkUrl }, { headers: { "Cache-Control": "no-store" } });
}
