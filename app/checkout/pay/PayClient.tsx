"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Ready = { orderId: string; fgkey: string; params: Record<string, unknown>; sdkUrl: string };
declare global { interface Window { EXIMBAY?: { request_pay: (p: Record<string, unknown>) => void } } }
export const PAY_KEY = "tiby_pay_ready";

export function PayClient() {
  const [state, setState] = useState<"loading" | "opening" | "missing" | "failed">("loading");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const later = (st: "missing" | "failed") => queueMicrotask(() => setState(st));   // 효과 본문 동기 setState 회피(lint)
    if (q.get("result")) { later("failed"); return; }
    const order = q.get("order") || "";
    let cancelled = false;
    let script: HTMLScriptElement | null = null;
    const open = (ready: Ready) => {
      if (cancelled) return;
      script = document.createElement("script"); script.src = ready.sdkUrl; script.async = true;
      script.onload = () => { setState("opening"); try { window.EXIMBAY?.request_pay({ fgkey: ready.fgkey, ...ready.params }); } catch { setState("failed"); } };
      script.onerror = () => setState("failed");
      document.body.appendChild(script);
    };
    let ready: Ready | null = null;
    try { ready = JSON.parse(sessionStorage.getItem(PAY_KEY) || "null"); } catch { ready = null; }
    if (ready && ready.orderId === order) { open(ready); }
    else {
      // 저장소에 없으면(다른 도메인으로 이동·저장소 차단·새 탭) 서버 보관본으로 되찾기
      fetch(`/api/checkout/pay-info?order=${encodeURIComponent(order)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: Ready | null) => { if (d?.fgkey) open(d); else later("missing"); })
        .catch(() => later("missing"));
    }
    return () => { cancelled = true; script?.remove(); };
  }, []);
  return (
    <div>
      <h1 className="t-h2-jp">{state === "failed" ? "お支払いが完了しませんでした" : "お支払いへ進みます"}</h1>
      <p className="t-static-lead">
        {state === "loading" && "決済画面を準備しています..."}
        {state === "opening" && "決済画面が開かない場合は、ポップアップのブロックを解除してからページを再読み込みしてください。"}
        {state === "missing" && "決済情報が見つかりません。カートからもう一度お手続きください。"}
        {state === "failed" && "決済がキャンセルされたか、エラーが発生しました。カートからもう一度お試しください。クーポンは自動的に元に戻ります。"}
      </p>
      <div className="t-complete-actions"><Link className="t-cta" href="/">トップに戻る</Link></div>
    </div>
  );
}
