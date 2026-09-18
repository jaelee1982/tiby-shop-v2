"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Eximbay 결제창 호출 페이지.
// 2026-09-18 실측(SDK 소스 디코딩): 공식 javascriptSDK.js 의 EXIMBAY.request_pay 는 내부에서 jQuery `$.ajax` 로
//   POST {SDK origin}/v1/payments (JSON, fgkey+파라미터) → 응답 { url, display_type, ...form fields } → 숨은 <form method=post action=url> 에
//   응답 필드를 hidden input 으로 넣고(+ param3=OPENAPI) ostype=M 이면 같은 창에서 submit, display_type=P 면 팝업(popOpen) target 으로 submit.
//   tiby.shop 에는 jQuery 가 없어 request_pay 가 ReferenceError → 결제창이 열리지 않았음. → 같은 동작을 fetch 로 직접 구현(SDK 미사용).
type Ready = { orderId: string; fgkey: string; params: Record<string, unknown>; sdkUrl: string };
export const PAY_KEY = "tiby_pay_ready";

async function openEximbay(ready: Ready): Promise<void> {
  const apiBase = new URL(ready.sdkUrl).origin; // https://api-test.eximbay.com | https://api.eximbay.com
  const res = await fetch(`${apiBase}/v1/payments`, { method: "POST", headers: { "Content-Type": "application/json; UTF-8;" }, body: JSON.stringify({ fgkey: ready.fgkey, ...ready.params }) });
  const data = (await res.json().catch(() => null)) as Record<string, string> | null;
  if (!res.ok || !data) throw new Error(`payments ${res.status}${data ? ` · ${JSON.stringify(data).slice(0, 160)}` : ""}`);
  if (!data.url) throw new Error(`no url in response · ${(data.rescode ?? "")} ${(data.resmsg ?? "")}`.trim());
  document.getElementById("eximPaymentsForm")?.parentElement?.remove();
  const wrap = document.createElement("div");
  const form = document.createElement("form");
  form.id = "eximPaymentsForm"; form.name = "eximPaymentsForm"; form.method = "post"; form.action = data.url;
  for (const [k, v] of Object.entries(data)) {
    if (k === "display_type" || k === "url") continue;
    const inp = document.createElement("input"); inp.type = "hidden"; inp.name = k; inp.value = String(v ?? ""); form.appendChild(inp);
  }
  const p3 = document.createElement("input"); p3.type = "hidden"; p3.name = "param3"; p3.value = "OPENAPI"; form.appendChild(p3);
  wrap.appendChild(form); document.body.appendChild(wrap);
  const ostype = data.ostype ?? (ready.params.settings as { ostype?: string } | undefined)?.ostype;
  const displayType = data.display_type ?? (ready.params.settings as { display_type?: string } | undefined)?.display_type ?? "P";
  if (ostype === "M" || displayType === "R") { form.submit(); return; }
  // PC 팝업 — 차단되면 같은 창으로 폴백(결제 후 return_url 로 복귀)
  const w = 500, h = 600, left = Math.max(0, document.body.clientWidth / 2 - w / 2 + window.screenLeft), top = Math.max(0, screen.availHeight / 2 - h / 2);
  const pop = window.open("", "popOpen", `width=${w},height=${h}, left=${left}, top=${top}, toolbars=no, resizable=yes, scrollbars=yes, titlebar=yes, status=no`);
  if (pop) form.target = "popOpen";
  form.submit();
}

export function PayClient() {
  const [state, setState] = useState<"loading" | "opening" | "missing" | "failed">("loading");
  const [detail, setDetail] = useState<string | null>(null); // 실패 사유 — 개통 초기 진단용(비밀값 없음)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const later = (st: "missing" | "failed", d?: string) => queueMicrotask(() => { setState(st); if (d) setDetail(d); });
    if (q.get("result")) { later("failed", `gateway result=${q.get("result")}`); return; }
    const order = q.get("order") || "";
    let cancelled = false;
    const go = (ready: Ready) => {
      if (cancelled) return;
      setState("opening");
      openEximbay(ready).catch((e: unknown) => { if (!cancelled) { setState("failed"); setDetail((e as Error)?.message ?? String(e)); } });
    };
    let ready: Ready | null = null;
    try { ready = JSON.parse(sessionStorage.getItem(PAY_KEY) || "null"); } catch { ready = null; }
    if (ready && ready.orderId === order) go(ready);
    else {
      // 저장소에 없으면(도메인 이동·저장소 차단·새 탭) 서버 보관본으로 되찾기
      fetch(`/api/checkout/pay-info?order=${encodeURIComponent(order)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: Ready | null) => { if (d?.fgkey) go(d); else later("missing"); })
        .catch(() => later("missing"));
    }
    return () => { cancelled = true; };
  }, []);
  return (
    <div>
      <h1 className="t-h2-jp">{state === "failed" ? "お支払いが完了しませんでした" : "お支払いへ進みます"}</h1>
      <p className="t-static-lead">
        {state === "loading" && "決済画面を準備しています..."}
        {state === "opening" && "決済画面へ移動しています。画面が切り替わらない場合は、ポップアップのブロックを解除してからページを再読み込みしてください。"}
        {state === "missing" && "決済情報が見つかりません。カートからもう一度お手続きください。"}
        {state === "failed" && "決済がキャンセルされたか、エラーが発生しました。カートからもう一度お試しください。クーポンは自動的に元に戻ります。"}
        {detail && <><br /><small className="t-co-error-detail">{detail}</small></>}
      </p>
      <div className="t-complete-actions"><Link className="t-cta" href="/">トップに戻る</Link></div>
    </div>
  );
}
