"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Ready = { orderId: string; fgkey: string; params: Record<string, unknown>; sdkUrl: string };
declare global { interface Window { EXIMBAY?: { request_pay: (p: Record<string, unknown>) => void } } }
export const PAY_KEY = "tiby_pay_ready";

export function PayClient() {
  const [state, setState] = useState<"loading" | "opening" | "missing" | "failed">("loading");
  const [detail, setDetail] = useState<string | null>(null); // 실패 사유(SDK 로드 실패 / request_pay 예외 / 게이트웨이 result) — 개통 초기 진단용
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const later = (st: "missing" | "failed") => queueMicrotask(() => setState(st));   // 효과 본문 동기 setState 회피(lint)
    if (q.get("result")) { later("failed"); queueMicrotask(() => setDetail(`gateway result=${q.get("result")}`)); return; }
    const order = q.get("order") || "";
    let cancelled = false;
    let script: HTMLScriptElement | null = null;
    const open = (ready: Ready) => {
      if (cancelled) return;
      script = document.createElement("script"); script.src = ready.sdkUrl; script.async = true;
      script.onload = () => {
        setState("opening");
        if (!window.EXIMBAY?.request_pay) { setState("failed"); setDetail("SDK loaded but EXIMBAY.request_pay missing"); return; }
        try { window.EXIMBAY.request_pay({ fgkey: ready.fgkey, ...ready.params }); }
        catch (e) { setState("failed"); setDetail(`request_pay threw: ${(e as Error)?.message ?? String(e)}`); }
      };
      script.onerror = () => { setState("failed"); setDetail(`SDK load failed: ${ready.sdkUrl}`); };
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
        {detail && <><br /><small className="t-co-error-detail">{detail}</small></>}
      </p>
      <div className="t-complete-actions"><Link className="t-cta" href="/">トップに戻る</Link></div>
    </div>
  );
}
