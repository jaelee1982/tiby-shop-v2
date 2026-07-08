"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

// Sticky glass nav — TIBY Design System (ui_kits/pdp/app.jsx · Nav)
export function Navbar() {
  const { count, open } = useCart();
  return (
    <nav className="t-nav">
      <div className="t-nav-inner">
        <Link className="t-wordmark" href="/">
          <span>Tiby</span>
        </Link>
        <div className="t-nav-links">
          <Link href="/#story">Story</Link>
          <Link href="/products/love-me-me">Products</Link>
          <a href="https://tiby.me/layering" target="_blank" rel="noopener noreferrer">Layering</a>
          <a href="https://tiby.me/stores" target="_blank" rel="noopener noreferrer">Store</a>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="t-nav-right">
          <button className="t-icon-btn t-cart-btn" aria-label={`カートを開く（${count}点）`} onClick={open}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && <span className="t-cart-badge">{count > 9 ? "9+" : count}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
