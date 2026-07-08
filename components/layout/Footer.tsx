import Link from "next/link";
import { siteConfig } from "@/lib/site";

// Footer — TIBY Design System (ui_kits/pdp/app.jsx · Footer), Soft Ivory.
export function Footer() {
  return (
    <footer className="t-foot">
      <div className="t-foot-inner">
        <div className="t-foot-brand">
          <div className="t-foot-logo">Tiby</div>
          <p>{siteConfig.masterCopy}</p>
          <p className="t-foot-cat">Hair Perfume / ヘアパフューム · 30ml · ¥999（税抜）／税込 ¥1,099</p>
        </div>
        <div className="t-foot-col">
          <h4>Products</h4>
          <Link href="/products/love-me-me">LOVE ME ME</Link>
          <Link href="/products/hug-me-me">HUG ME ME</Link>
          <Link href="/products/kiss-me-me">KISS ME ME</Link>
          <Link href="/#bundle">3本セット</Link>
        </div>
        <div className="t-foot-col">
          <h4>Brand</h4>
          <Link href="/#story">Story</Link>
          <a href="https://tiby.me/layering" target="_blank" rel="noopener noreferrer">Layering Guide</a>
          <a href="https://tiby.me/stores" target="_blank" rel="noopener noreferrer">Store Locator</a>
          <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={siteConfig.x} target="_blank" rel="noopener noreferrer">X (Twitter)</a>
        </div>
        <div className="t-foot-col">
          <h4>Support</h4>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/legal/tokushoho">特定商取引法に基づく表記</Link>
          <Link href="/legal/privacy">プライバシーポリシー</Link>
          <a href={`mailto:${siteConfig.customerSupportEmail}`}>{siteConfig.customerSupportEmail}</a>
        </div>
      </div>
      <div className="t-foot-legal">
        © 2026 {siteConfig.companyLegalName} · {siteConfig.brandNameJa} · #Tiby #タイビー
      </div>
    </footer>
  );
}
