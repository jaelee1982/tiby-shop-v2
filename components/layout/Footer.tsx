import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-cream-faint">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row justify-between gap-12">
        <div>
          <div className="font-serif font-light text-2xl tracking-[6px] text-cream mb-3">
            TIBY
          </div>
          <p className="font-jp text-xs text-cream-dim leading-relaxed">
            香水が決めすぎるけど、これはズルい。
          </p>
          {/* Social Links */}
          <div className="flex gap-5 mt-6">
            <a
              href="https://www.instagram.com/tibyjapan/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-dim hover:text-love transition-colors duration-300"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://x.com/tiby_japan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-dim hover:text-cream transition-colors duration-300"
              aria-label="X (Twitter)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 md:gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] tracking-[3px] uppercase text-cream/40 mb-1">
              Shop
            </h4>
            <Link href="/products/love-me-me" className="text-xs text-cream-dim hover:text-cream transition-colors">
              LOVE ME ME
            </Link>
            <Link href="/products/hug-me-me" className="text-xs text-cream-dim hover:text-cream transition-colors">
              HUG ME ME
            </Link>
            <Link href="/products/kiss-me-me" className="text-xs text-cream-dim hover:text-cream transition-colors">
              KISS ME ME
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] tracking-[3px] uppercase text-cream/40 mb-1">
              Brand
            </h4>
            <Link href="/#about" className="text-xs text-cream-dim hover:text-cream transition-colors">
              About TIBY
            </Link>
            <a href="https://tiby.me" target="_blank" rel="noopener noreferrer" className="text-xs text-cream-dim hover:text-cream transition-colors">
              香り診断
            </a>
            <a href="https://tiby.me" target="_blank" rel="noopener noreferrer" className="text-xs text-cream-dim hover:text-cream transition-colors">
              レイヤリングラボ
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] tracking-[3px] uppercase text-cream/40 mb-1">
              Info
            </h4>
            <Link href="/#stores" className="text-xs text-cream-dim hover:text-cream transition-colors">
              店舗情報
            </Link>
            <a href="#" className="text-xs text-cream-dim hover:text-cream transition-colors">
              特定商取引法
            </a>
            <a href="#" className="text-xs text-cream-dim hover:text-cream transition-colors">
              プライバシーポリシー
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-faint px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-2 max-w-[1200px] mx-auto">
        <span className="text-[10px] tracking-[1px] text-cream/25">
          © 2026 Giant Korea Co., Ltd. All rights reserved.
        </span>
        <div className="flex gap-6">
          <a href="#" className="text-[10px] tracking-[1px] text-cream/25 hover:text-cream/50 transition-colors">
            Terms
          </a>
          <a href="#" className="text-[10px] tracking-[1px] text-cream/25 hover:text-cream/50 transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
