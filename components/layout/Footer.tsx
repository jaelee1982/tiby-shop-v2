import Link from "next/link";

// Footer — TIBY Design System (ui_kits/pdp/app.jsx · Footer), Soft Ivory.
export function Footer() {
  return (
    <footer className="t-foot">
      <div className="t-foot-inner">
        <div className="t-foot-brand">
          <div className="t-foot-logo">Tiby</div>
          <p>香りが決めすぎるけど、これはズルい。</p>
        </div>
        <div className="t-foot-col">
          <h4>Products</h4>
          <Link href="/products/love-me-me">LOVE ME ME</Link>
          <Link href="/products/hug-me-me">HUG ME ME</Link>
          <Link href="/products/kiss-me-me">KISS ME ME</Link>
          <Link href="/">3本セット</Link>
        </div>
        <div className="t-foot-col">
          <h4>Brand</h4>
          <Link href="/#story">Story</Link>
          <a href="https://tiby.me/layering" target="_blank" rel="noopener noreferrer">Layering Guide</a>
          <a href="https://tiby.me/stores" target="_blank" rel="noopener noreferrer">Store Locator</a>
          <a href="#">特定商取引法</a>
          <a href="#">プライバシーポリシー</a>
        </div>
        <div className="t-foot-col">
          <h4>Follow</h4>
          <a href="https://www.instagram.com/tibyjapan/" target="_blank" rel="noopener noreferrer">@tibyjapan</a>
          <a href="https://x.com/tiby_japan" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          <a href="https://tiby.shop">tiby.shop</a>
        </div>
      </div>
      <div className="t-foot-legal">© 2026 Giant Korea Co., Ltd. · タイビー · #Tiby #タイビー</div>
    </footer>
  );
}
