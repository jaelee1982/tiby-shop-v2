"use client";

// Slide-in cart drawer — line items, quantity steppers, tax-included total, then hands off to
// /checkout (配送先・お支払い方法・クーポン・送料 → POST /api/checkout → Eximbay). 결제 호출은 이 컴포넌트에 없다.
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { formatJpy, getCatalogItem, taxIncluded } from "@/lib/commerce";
import { SHIPPING_FEE_REMOTE, SHIPPING_FEE_STANDARD } from "@/lib/shipping";

export function CartDrawer() {
  const { lines, total, isOpen, close, setQty, remove } = useCart();

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
              <p className="t-cart-note">送料 全国一律 {formatJpy(SHIPPING_FEE_STANDARD)}（北海道・沖縄 {formatJpy(SHIPPING_FEE_REMOTE)}）は次の画面で加算されます。クーポンも次の画面でご入力いただけます。</p>
              <Link className="t-cta t-cta-block" href="/checkout" onClick={close} data-testid="cart-checkout">
                レジに進む
              </Link>
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
