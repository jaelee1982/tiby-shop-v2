"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhereToBuy() {
  return (
    <section id="stores" className="py-20 md:py-[120px] px-6 md:px-12 bg-bg text-center">
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
          <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-2">
            Where to Buy
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div
            className="font-serif font-light leading-[0.85] tracking-[-8px] bg-gradient-to-b from-cream/95 to-cream/15 bg-clip-text text-transparent my-10"
            style={{ fontSize: "clamp(140px, 22vw, 340px)" }}
          >
            219
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="text-[11px] tracking-[5px] uppercase text-cream/40 mb-14">
            Don Quijote Stores Nationwide
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2
            className="font-serif font-light tracking-tight mb-4"
            style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
          >
            どこで買えるの？
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="font-jp text-sm text-cream-dim mb-16">
            全国のドン・キホーテとオンラインで販売中。
          </p>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px] mx-auto mb-16">
          <ScrollReveal delay={0.15}>
            <div className="border border-cream-faint p-8 md:p-10 text-left hover:border-cream/15 transition-colors">
              <div className="text-3xl mb-4">🏪</div>
              <h3 className="font-serif text-xl font-light mb-3 tracking-wide">
                ドン・キホーテ
              </h3>
              <p className="font-jp text-xs text-cream-dim leading-[2] mb-5">
                全国219店舗にてお取り扱い中。
                <br />
                実際に手に取って試せます。
                <br />
                コスメ・ヘアケアコーナーをご確認ください。
              </p>
              <a
                href="https://tiby.me/stores"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[2px] text-cream-dim hover:text-cream transition-colors"
              >
                店舗を探す →
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="border border-cream-faint p-8 md:p-10 text-left hover:border-cream/15 transition-colors">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="font-serif text-xl font-light mb-3 tracking-wide">
                オンライン購入
              </h3>
              <p className="font-jp text-xs text-cream-dim leading-[2] mb-5">
                このページから直接ご注文いただけます。
                <br />
                クレジットカード決済対応。
                <br />
                全国送料一律・最短翌日お届け。
              </p>
              <a
                href="#shop"
                className="text-xs tracking-[2px] text-cream-dim hover:text-cream transition-colors"
              >
                商品を選ぶ →
              </a>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <a
            href="https://tiby.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs tracking-[2px] text-cream-dim border border-cream-faint px-10 py-4 hover:border-cream/30 hover:text-cream transition-all"
          >
            ✦ &nbsp; 自分に合う香りを診断する
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
