import Link from "next/link";
import { getProduct } from "@/lib/products";
import { SKUS, SLUG_TO_SKU, SKU_ORDER } from "@/lib/skus";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { CatalogItemId } from "@/lib/commerce";

// Rich product detail page — existing content (lib/products.ts) re-skinned in the
// TIBY Design System tone. Hero · problem · fragrance notes · scenes · reviews · cross-sell.
export function ProductPageClient({ slug }: { slug: string }) {
  const product = getProduct(slug);
  const skuId = SLUG_TO_SKU[slug] ?? "love";
  const sku = SKUS[skuId];
  if (!product) return null;

  const accent = sku.cap; // deeper, readable accent
  const others = SKU_ORDER.filter((id) => id !== skuId);
  const noteStages: { stage: string; list: string; desc: string }[] = [
    { stage: "Top", list: product.notes.top, desc: product.notesDesc.top },
    { stage: "Middle", list: product.notes.mid, desc: product.notesDesc.mid },
    { stage: "Base", list: product.notes.base, desc: product.notesDesc.base },
  ];

  return (
    <div className="t-page">
      {/* ── HERO ── */}
      <section
        className="t-hero"
        style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${sku.accent} 12%, #FBF7F2) 0%, #FBF7F2 60%, #F6F1EC 100%)` }}
      >
        <div className="t-hero-grid">
          <div className="t-hero-media">
            <div className="t-hero-halo" style={{ background: `radial-gradient(circle at 50% 55%, color-mix(in oklab, ${sku.accent} 24%, #fff) 0%, transparent 65%)` }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="t-bottle-img" src={product.image} alt={product.name} />
          </div>
          <div className="t-hero-copy">
            <div className="t-breadcrumb">Hair Perfume · {sku.act.split(" · ")[0]}</div>
            <h1 className="t-hero-jp">{sku.jp}</h1>
            <div className="t-hero-latin">{product.name}</div>
            <p className="t-pdp-tagline">{product.tagline}</p>
            <div className="t-family">{product.profile}</div>

            <div className="t-price-row" style={{ marginTop: 24 }}>
              <div className="t-price-box">
                <div className="t-price">¥999<span>税込</span></div>
                <div className="t-price-tax">Hair Perfume · 30ml</div>
              </div>
              <AddToCartButton id={slug as CatalogItemId} />
            </div>
            <div className="t-trust">
              <span>SNSで話題 ✨</span><span>·</span><span>全国のドン・キホーテでも取扱中</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="t-pdp-section">
        <div className="t-section-head">
          <div className="t-eyebrow" style={{ color: accent }}>Why hair perfume</div>
          <h2 className="t-h2-jp">髪が一番、ニオイをまとう場所。</h2>
        </div>
        <div className="t-pdp-problems">
          {product.problems.map((p, i) => (
            <div key={i} className="t-pdp-problem">
              <span className="em">{p.em}</span>
              <span className="tx">{p.text}</span>
            </div>
          ))}
        </div>
        <p className="t-pdp-concept">{product.concept}</p>
      </section>

      {/* ── FRAGRANCE NOTES ── */}
      <section style={{ background: `color-mix(in oklab, ${sku.body} 12%, #F9F3F5)` }}>
        <div className="t-pdp-section">
          <div className="t-section-head">
            <div className="t-eyebrow" style={{ color: accent }}>Scent notes · {product.name}</div>
            <h2 className="t-h2-jp">{sku.copy}</h2>
          </div>
          <div className="t-notes-row">
            {noteStages.map((n) => (
              <div key={n.stage} className="t-note-card" style={{ ["--note-accent" as string]: accent }}>
                <div className="t-note-stage">{n.stage}</div>
                <div className="t-note-list">{n.list}</div>
                <div className="t-note-desc">{n.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVERY SCENE ── */}
      <section className="t-pdp-section">
        <div className="t-section-head">
          <div className="t-eyebrow" style={{ color: accent }}>Every scene</div>
          <h2 className="t-h2-jp">毎日の、いろんな瞬間に。</h2>
        </div>
        <div className="t-scenes-grid">
          {product.scenes.map((s, i) => (
            <div key={i} className="t-scene-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.title} />
              <div className="t-scene-overlay">
                <div className="t-scene-cat">{s.category}</div>
                <div className="t-scene-title">{s.title}</div>
                <div className="t-scene-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ background: "#FFF8F4" }}>
        <div className="t-pdp-section">
          <div className="t-section-head">
            <div className="t-eyebrow" style={{ color: accent }}>Real voices</div>
            <h2 className="t-h2-jp">みんなの、ズルい体験。</h2>
          </div>
          <div className="t-reviews-grid">
            {product.reviews.map((r, i) => (
              <div key={i} className="t-review-card">
                <div className="t-review-stars">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                <div className="t-review-text">{r.text}</div>
                <div className="t-review-author">{r.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CROSS-SELL ── */}
      <section className="t-pdp-section">
        <div className="t-section-head">
          <div className="t-eyebrow" style={{ color: accent }}>Discover more</div>
          <h2 className="t-h2-jp">ほかの香りも、試してみる？</h2>
        </div>
        <div className="t-arc-row" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 720, margin: "0 auto" }}>
          {others.map((id) => {
            const s = SKUS[id];
            return (
              <Link key={id} className="t-arc-card" href={`/products/${s.slug}`}>
                <div className="t-arc-swatch" style={{ background: `color-mix(in oklab, ${s.accent} 55%, ${s.body})` }}>
                  <span className="t-arc-act">Act {SKU_ORDER.indexOf(id) + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="t-bottle-img" src={s.front} alt={s.name} />
                </div>
                <div className="t-arc-meta">
                  <div className="t-arc-name">{s.name}</div>
                  <div className="t-arc-jp">{s.jp}</div>
                  <div className="t-arc-family">{s.family}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="t-sticky-buy">
        <div className="t-sticky-buy-info">
          <div className="t-sticky-buy-name">{product.name}</div>
          <div className="t-sticky-buy-price">¥999（税込）</div>
        </div>
        <AddToCartButton id={slug as CatalogItemId} className="t-cta t-cta-sm" />
      </div>
    </div>
  );
}
