"use client";

// TIBY tiby.shop — Product/Storefront page, ported from the TIBY Design System
// (ui_kits/pdp/app.jsx). Single-SKU hero with a live switcher that recolors the
// page, a 3-act cross-sell, fragrance timeline, how-to and a bundle peak.
import { useState } from "react";
import { SKUS, SKU_ORDER, type SkuId } from "@/lib/skus";

/* ---------- inline icons (lucide paths) ---------- */
function Icon({ name }: { name: "sparkles" | "heart" | "droplets" | "flower-2" }) {
  const paths: Record<string, React.ReactNode> = {
    sparkles: (
      <>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
        <path d="M20 3v4" />
        <path d="M22 5h-4" />
        <path d="M4 17v2" />
        <path d="M5 18H3" />
      </>
    ),
    heart: (
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    ),
    droplets: (
      <>
        <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 4.24 7 2c-.29 2.24-1.14 4.13-2.29 5.06S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
        <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
      </>
    ),
    "flower-2": (
      <>
        <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
        <circle cx="12" cy="8" r="2" />
        <path d="M12 10v12" />
        <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z" />
        <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function BottleImg({ sku, style }: { sku: { front: string; name: string }; style?: React.CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="t-bottle-img" src={sku.front} alt={sku.name} style={style} />;
}

function Hero({ skuId, setSkuId }: { skuId: SkuId; setSkuId: (id: SkuId) => void }) {
  const sku = SKUS[skuId];
  return (
    <section
      className="t-hero"
      style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${sku.accent} 10%, #FBF7F2) 0%, #FBF7F2 60%, #F6F1EC 100%)` }}
    >
      <div className="t-hero-grid">
        <div className="t-hero-media">
          <div className="t-hero-halo" style={{ background: `radial-gradient(circle at 50% 55%, color-mix(in oklab, ${sku.accent} 22%, #fff) 0%, transparent 65%)` }} />
          <BottleImg sku={sku} />
        </div>
        <div className="t-hero-copy">
          <div className="t-breadcrumb">Hair Perfume · {sku.act.split(" · ")[0]}</div>
          <h1 className="t-hero-jp">{sku.jp}</h1>
          <div className="t-hero-latin">{sku.name}</div>
          <p className="t-hero-master">香りが決めすぎるけど、これはズルい。</p>
          <div className="t-family">{sku.family}</div>

          <div className="t-sku-switch">
            {SKU_ORDER.map((id) => (
              <button
                key={id}
                className={`t-sku-pill ${id === skuId ? "on" : ""}`}
                style={{ ["--pill" as string]: SKUS[id].body }}
                onClick={() => setSkuId(id)}
              >
                <span className="t-sku-dot" style={{ background: SKUS[id].body }} />
                {SKUS[id].name}
              </button>
            ))}
          </div>

          <div className="t-price-row">
            <div className="t-price-box">
              <div className="t-price">¥999<span>税抜</span></div>
              <div className="t-price-tax">税込 ¥1,099</div>
            </div>
            <button className="t-cta">カートに入れる</button>
          </div>
          <div className="t-trust">
            <span>SNSで話題 ✨</span>
            <span>·</span>
            <span>ドンキ限定取扱</span>
            <span>·</span>
            <span>#韓国コスメ</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryArc({ skuId, setSkuId }: { skuId: SkuId; setSkuId: (id: SkuId) => void }) {
  return (
    <section className="t-story">
      <div className="t-section-head">
        <div className="t-eyebrow">The three-act story</div>
        <h2 className="t-h2-jp">ときめき · 温もり · 情熱。<br />3つの香りで、毎日が変わる。</h2>
      </div>
      <div className="t-arc-row">
        {SKU_ORDER.map((id, i) => {
          const s = SKUS[id];
          return (
            <button key={id} className={`t-arc-card ${id === skuId ? "on" : ""}`} onClick={() => setSkuId(id)}>
              <div className="t-arc-swatch" style={{ background: `color-mix(in oklab, ${s.accent} 55%, ${s.body})` }}>
                <span className="t-arc-act">Act {i + 1}</span>
                <BottleImg sku={s} />
              </div>
              <div className="t-arc-meta">
                <div className="t-arc-name">{s.name}</div>
                <div className="t-arc-jp">{s.jp}</div>
                <div className="t-arc-family">{s.family}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FragrancePyramid({ skuId }: { skuId: SkuId }) {
  const sku = SKUS[skuId];
  return (
    <section className="t-pyramid" style={{ background: `color-mix(in oklab, ${sku.body} 10%, #F9F3F5)` }}>
      <div className="t-section-head">
        <div className="t-eyebrow" style={{ color: sku.accent }}>Fragrance timeline · {sku.name}</div>
        <h2 className="t-h2-jp">{sku.copy}</h2>
      </div>
      <div className="t-timeline">
        {sku.timeline.map((s, i) => (
          <div key={i} className="t-tl-step">
            <div className="t-tl-tag" style={{ background: sku.accent }}>{s.t}</div>
            <div className="t-tl-copy">{s.jp}</div>
            {i < 2 && <div className="t-tl-rail" />}
          </div>
        ))}
      </div>
      <div className="t-pyramid-foot">
        <span>6種の植物エキス配合</span>
        <span>·</span>
        <span>香水のように、ずっと残る</span>
        <span>·</span>
        <span>ベタつかない軽い使い心地</span>
      </div>
    </section>
  );
}

function HowToUse() {
  const scenes = [
    { title: "お出かけ前", body: "毛先に1〜2プッシュ。歩くたびに香りがついてくる。", icon: "sparkles" as const },
    { title: "デート前", body: "さっとひと吹き。すれ違う瞬間が変わる。", icon: "heart" as const },
    { title: "日中リフレッシュ", body: "香水より気軽に、一日中香りをキープ。", icon: "droplets" as const },
    { title: "スタイリング後", body: "ドライヤー後の毛先に。ツヤも香りも仕上げて。", icon: "flower-2" as const },
  ];
  return (
    <section className="t-howto">
      <div className="t-section-head">
        <div className="t-eyebrow">How to wear</div>
        <h2 className="t-h2-jp">髪が動くたびに、いい匂い。</h2>
      </div>
      <div className="t-howto-grid">
        {scenes.map((s, i) => (
          <div key={i} className="t-howto-card">
            <Icon name={s.icon} />
            <div className="t-howto-title">{s.title}</div>
            <div className="t-howto-body">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Bundle() {
  return (
    <section className="t-bundle">
      <div className="t-bundle-inner">
        <div className="t-bundle-copy">
          <div className="t-eyebrow" style={{ color: "#fff", opacity: 0.7 }}>3本セット</div>
          <h2 className="t-h2-jp" style={{ color: "#fff" }}>デートにLOVE、<br />おうちにHUG、<br />夜遊びにKISS。</h2>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15, marginTop: 12, maxWidth: 360 }}>
            3本で、毎日選べる楽しさ。友だちに1本、自分に2本。
          </p>
          <div className="t-bundle-price">
            <span className="t-bundle-strike">¥2,997</span>
            <span className="t-bundle-now">¥2,700<small>税込</small></span>
          </div>
          <button className="t-cta t-cta-light">セットで買う</button>
        </div>
        <div className="t-bundle-art">
          <BottleImg sku={SKUS.love} style={{ transform: "translateY(18px) rotate(-6deg)" }} />
          <BottleImg sku={SKUS.hug} style={{ transform: "translateY(-8px) scale(1.05)", zIndex: 2 }} />
          <BottleImg sku={SKUS.kiss} style={{ transform: "translateY(14px) rotate(6deg)" }} />
        </div>
      </div>
    </section>
  );
}

export function Storefront({ initialSku = "love" }: { initialSku?: SkuId }) {
  const [skuId, setSkuId] = useState<SkuId>(initialSku);
  return (
    <div className="t-page">
      <Hero skuId={skuId} setSkuId={setSkuId} />
      <StoryArc skuId={skuId} setSkuId={setSkuId} />
      <FragrancePyramid skuId={skuId} />
      <HowToUse />
      <Bundle />
    </div>
  );
}
