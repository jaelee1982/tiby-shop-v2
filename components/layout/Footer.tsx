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
          <Link href="/quiz">香り診断</Link>
          <Link href="/layering">Layering Guide</Link>
          <Link href="/stores">Store Locator</Link>
          <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={siteConfig.x} target="_blank" rel="noopener noreferrer">X (Twitter)</a>
        </div>
        <div className="t-foot-col">
          <h4>Support</h4>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/legal/terms">利用規約</Link>
          <Link href="/legal/policy">キャンセル・返品・交換・配送ポリシー</Link>
          <Link href="/legal/tokushoho">特定商取引法に基づく表記</Link>
          <Link href="/legal/privacy">プライバシーポリシー</Link>
          <a href={`mailto:${siteConfig.customerSupportEmail}`}>{siteConfig.customerSupportEmail}</a>
        </div>
      </div>
      {/* 事業者情報 — 決済審査要件の5項目。常時表示だと雑然とするため折りたたみ（クリックで展開）。 */}
      <details className="t-foot-biz">
        <summary>事業者情報</summary>
        <dl>
          <div>
            <dt>商号</dt>
            <dd>{siteConfig.companyLegalName}</dd>
          </div>
          <div>
            <dt>事業者登録番号</dt>
            <dd>{siteConfig.businessRegistrationNumber}</dd>
          </div>
          <div>
            <dt>代表者名</dt>
            <dd>{siteConfig.representativeName}</dd>
          </div>
          <div>
            <dt>事業者登録証記載住所</dt>
            <dd>{siteConfig.address}</dd>
          </div>
          <div>
            <dt>代表電話番号</dt>
            <dd>{siteConfig.phone}</dd>
          </div>
        </dl>
      </details>
      <div className="t-foot-legal">
        © 2026 {siteConfig.companyLegalName} · {siteConfig.brandNameJa} · #Tiby #タイビー
      </div>
    </footer>
  );
}
