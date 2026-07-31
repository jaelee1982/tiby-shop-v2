"use client";

// レイヤリング診断 — 구 tiby.me /layering 이식·리디자인.
// 향수 DB 검색 → 분석 → TIBY 레이어링 추천. 로직=lib/scent/analyzer.ts (동일).
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import perfumeDb from "@/lib/scent/perfume_db.json";
import {
  analyzePerfume,
  getStarRating,
  recommendLayering,
  type Perfume,
} from "@/lib/scent/analyzer";

export function LayeringLab() {
  const perfumes = perfumeDb as Perfume[];
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Perfume | null>(null);
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (term.length < 2) return [];
    const q = term.toLowerCase();
    return perfumes
      .filter(
        (p) =>
          p.search_key.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [term, perfumes]);

  const analysis = selected ? analyzePerfume(selected) : null;
  const recs = selected ? recommendLayering(selected) : [];
  const best = recs[0];
  const second = recs[1];

  const pick = (p: Perfume) => {
    setSelected(p);
    setTerm(`${p.brand} ${p.name}`);
    setOpen(false);
  };

  return (
    <div>
      <div className="t-lay-searchwrap">
        <input
          type="text"
          className="t-tool-input"
          value={term}
          placeholder="香水の名前を入力してください（例: Chanel No 5）"
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            if (selected) setSelected(null);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && suggestions.length > 0 && (
          <div className="t-lay-sugg">
            {suggestions.map((p, i) => (
              <button key={`${p.brand}-${p.name}-${i}`} type="button" onMouseDown={() => pick(p)}>
                <p className="b">
                  {p.brand} — {p.name}
                </p>
                <p className="f">{p.main_family}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selected && (
        <div className="t-tool-card" style={{ textAlign: "center", padding: "56px 24px" }}>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--fg-2)", margin: 0 }}>
            お手持ちの香水を検索すると、
            <br />
            TIBYとの相性とレイヤリングの方法がわかります。
          </p>
        </div>
      )}

      {selected && analysis && best && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div className="t-tool-card">
            <div className="t-eyebrow" style={{ color: "var(--fg-3)" }}>
              Your perfume
            </div>
            <h2 style={{ fontFamily: "var(--font-display-jp)", fontSize: 20, margin: "0 0 4px", color: "var(--tiby-ink)" }}>
              {selected.brand} {selected.name}
            </h2>
            <p style={{ fontSize: 13, color: "var(--fg-3)", margin: "0 0 16px" }}>{selected.main_family}</p>
            <p style={{ fontSize: 14, lineHeight: 2, color: "var(--fg-2)", margin: 0 }}>
              {analysis.personality}
              {analysis.intensityDescription}。
            </p>
          </div>

          <div className="t-result-hero" style={{ background: best.product.soft, textAlign: "center" }}>
            <div className="t-result-eyebrow" style={{ color: best.product.accent }}>
              Best layering
            </div>
            <span
              className="t-lay-score"
              style={{ background: "#fff", border: `1px solid ${best.product.accent}`, color: best.product.accent }}
            >
              相性 {getStarRating(best.score)}（{best.score.toFixed(1)} / 5.0）
            </span>
            <h2 className="t-result-name" style={{ fontSize: "clamp(30px, 6vw, 44px)" }}>
              {best.product.nameEn}
            </h2>
            <p className="t-result-namejp">
              {best.product.nameJa} — {best.product.description}
            </p>
            <p className="t-result-cat">ヘアパフューム 30ml</p>
            <p className="t-result-reason">{best.reason}。</p>

            <div className="t-tool-card" style={{ textAlign: "left", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-display-jp)", fontSize: 15, margin: "0 0 16px", color: "var(--tiby-ink)" }}>
                レイヤリングの方法
              </h3>
              <div className="t-lay-steps">
                {best.howTo.map((step) => (
                  <div key={step} className="t-lay-step">
                    <i style={{ background: best.product.accent }} />
                    <p>{step}</p>
                  </div>
                ))}
              </div>
              {best.tips.length > 0 && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {best.tips.map((tip) => (
                    <p key={tip} className="t-lay-tip">
                      {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="t-result-actions">
              <Link href={`/products/${best.product.slug}`} className="t-cta">
                この香りを見る
              </Link>
            </div>
            <p className="t-result-price">¥999（税抜）／税込 ¥1,099</p>
          </div>

          {second && (
            <div className="t-tool-card t-lay-second">
              <div>
                <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-3)", fontFamily: "var(--font-body-latin)", fontWeight: 700, margin: "0 0 6px" }}>
                  2nd match
                </p>
                <p style={{ fontFamily: "var(--font-display-latin)", fontWeight: 800, fontSize: 17, color: "var(--tiby-ink)", margin: "0 0 2px" }}>
                  {second.product.nameEn}
                </p>
                <p style={{ fontSize: 12.5, color: "var(--fg-2)", margin: 0 }}>
                  相性 {getStarRating(second.score)}（{second.score.toFixed(1)} / 5.0）
                </p>
              </div>
              <Link href={`/products/${second.product.slug}`} className="t-cta-ghost" style={{ whiteSpace: "nowrap" }}>
                見てみる
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
