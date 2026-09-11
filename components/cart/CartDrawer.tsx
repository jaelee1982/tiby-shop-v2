"use client";

// Slide-in cart drawer — line items, quantity steppers, tax-included total, TIBY Quest coupon,
// and the Eximbay checkout hand-off (POST /api/checkout → mock: redirect / test·live: /checkout/pay runs the SDK).
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { formatJpy, getCatalogItem, taxIncluded } from "@/lib/commerce";
import { applyCoupon, COUPON_TABLE } from "@/lib/quest";
import { useSession } from "@/components/account/AuthPanel";
import { PAY_KEY } from "@/app/checkout/pay/PayClient";

export function CartDrawer() {
  const { lines, total, isOpen, close, setQty, remove } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponOn, setCouponOn] = useState<{ code: string; jpy: number } | null>(null);
  const { session } = useSession();
  // 쿠폰 금액은 코드 형식으로 미리 알 수 없으므로(서버가 예약 시 확정) 표시는 회원 쿠폰 표의 최대치가 아니라 "適用" 후 서버 응답 기준.
  const preview = couponOn ? applyCoupon(total, couponOn.jpy) : { discount: 0, total };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  async function checkout() {
    setCheckingOut(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ lines, coupon: couponOn?.code || coupon.trim() || undefined, email: session?.user.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "決済ページへ進めませんでした。時間をおいて再度お試しください。");
        setCheckingOut(false);
        return;
      }
      if (data.fgkey) {
        try { sessionStorage.setItem(PAY_KEY, JSON.stringify({ orderId: data.orderId, fgkey: data.fgkey, params: data.params, sdkUrl: data.sdkUrl })); } catch { /* 저장 불가면 pay 페이지가 안내 */ }
      }
      window.location.href = data.redirectUrl;
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
      setCheckingOut(false);
    }
  }

  return (
    <div className={`t-cart-root ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="t-cart-scrim" onClick={close} />
      <aside
        className="t-cart-panel"
        role="dialog"
        aria-modal="true"
        aria-label="ショッピングカート"
      >
        <div className="t-cart-head">
          <h2>カート</h2>
          <button className="t-icon-btn" aria-label="カートを閉じる" onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="t-cart-empty">
            <p>カートは空です。</p>
            <Link className="t-cta t-cta-sm" href="/" onClick={close}>
              商品を見る
            </Link>
          </div>
        ) : (
          <>
            <ul className="t-cart-lines">
              {lines.map((line) => {
                const item = getCatalogItem(line.id);
                if (!item) return null;
                return (
                  <li key={line.id} className="t-cart-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} />
                    <div className="t-cart-line-info">
                      <div className="t-cart-line-name">{item.name}</div>
                      <div className="t-cart-line-sub">
                        {item.nameJa} · {item.volume}
                      </div>
                      <div className="t-cart-line-price">
                        {formatJpy(taxIncluded(item.price))}
                        <span>税込（税抜 {formatJpy(item.price)}）</span>
                      </div>
                      <div className="t-cart-line-actions">
                        <div className="t-qty">
                          <button aria-label="数量を減らす" onClick={() => setQty(line.id, line.qty - 1)}>−</button>
                          <span aria-live="polite">{line.qty}</span>
                          <button aria-label="数量を増やす" onClick={() => setQty(line.id, line.qty + 1)}>＋</button>
                        </div>
                        <button className="t-cart-remove" onClick={() => remove(line.id)}>
                          削除
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="t-cart-foot">
              <div className="t-cart-total">
                <span>合計（税込）</span>
                <strong>{formatJpy(total)}</strong>
              </div>
              {couponOn && <div className="t-cart-discount"><span>クーポン {couponOn.code}</span><span>−{formatJpy(preview.discount)} → {formatJpy(preview.total)}</span></div>}
              <div className="t-cart-coupon">
                <input aria-label="クーポンコード" placeholder="クーポンコード（TIBY-XXXX-XXXX）" value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponOn(null); }} disabled={!session} data-testid="coupon-input" />
                <button type="button" onClick={() => { const c = coupon.trim().toUpperCase(); if (!/^TIBY-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)) { setError("クーポンコードの形式を確認してください。"); return; } setError(null); setCouponOn({ code: c, jpy: COUPON_TABLE[0].jpy }); }} disabled={!session || !coupon.trim()}>適用</button>
              </div>
              <p className="t-cart-coupon-hint">{session ? "TIBY Questのクーポンはお会計時に自動で金額が確定します。" : <>クーポンのご利用には<Link href="/account" onClick={close}>ログイン</Link>が必要です。</>}</p>
              <p className="t-cart-note">送料は決済画面でご確認いただけます。</p>
              {error && (
                <p className="t-cart-error" role="alert">
                  {error}
                </p>
              )}
              <button className="t-cta t-cta-block" onClick={checkout} disabled={checkingOut}>
                {checkingOut ? "決済ページへ移動中…" : "レジに進む"}
              </button>
              <p className="t-cart-secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Eximbayによる安全な決済
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
