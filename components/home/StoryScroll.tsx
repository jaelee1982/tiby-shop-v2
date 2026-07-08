"use client";

// Selling-point scroll story — four pinned chapters, one 訴求点 each:
// ① Tokyo scene: the problem (hair smell noticed at passing distance)
// ② In the bag: 9cm = credit-card height, 30ml portability (canon size anchor)
// ③ Hair moment: light but lasts to the night (morning→night scent timeline)
// ④ ¥999 tax-included reveal → shop CTA
// A floating buy pill stays visible through the story so purchase is one tap away.
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { getProduct } from "@/lib/products";
import { SKUS } from "@/lib/skus";

const love = getProduct("love-me-me")!;
const kiss = getProduct("kiss-me-me")!;
const SUBWAY_IMG = kiss.scenes[2].image; // Tokyo subway passing scene
const HAIR_IMG = love.scenes[1].image; // spray-on-hair usage scene
const BOTTLE_IMG = love.image;

const SPRING = { stiffness: 220, damping: 36, mass: 0.6 };

function useChapterProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return useSpring(scrollYProgress, SPRING);
}

/* ── ① Tokyo passing scene ─────────────────────────────────────────── */
function ChapterScene() {
  const ref = useRef<HTMLElement>(null);
  const p = useChapterProgress(ref);
  const bgScale = useTransform(p, [0, 1], [1.12, 1]);
  const line1Op = useTransform(p, [0.06, 0.18, 0.42, 0.52], [0, 1, 1, 0]);
  const line1Y = useTransform(p, [0.06, 0.18], [24, 0]);
  const line2Op = useTransform(p, [0.5, 0.62, 0.9, 1], [0, 1, 1, 0]);
  const line2Y = useTransform(p, [0.5, 0.62], [24, 0]);
  return (
    <section className="t-ch t-ch-scene" ref={ref}>
      <div className="t-ch-sticky">
        <motion.img src={SUBWAY_IMG} alt="" className="t-ch-bg" style={{ scale: bgScale }} />
        <div className="t-ch-scrim" />
        <div className="t-ch-center">
          <motion.h2 className="t-ch-line" style={{ opacity: line1Op, y: line1Y }}>
            すれ違った、その瞬間。
            <br />
            髪のニオイ、気づかれていませんか？
          </motion.h2>
          <motion.h2 className="t-ch-line" style={{ opacity: line2Op, y: line2Y }}>
            答えは、バッグの中に。
          </motion.h2>
        </div>
      </div>
    </section>
  );
}

/* ── ② 9cm — credit-card comparison ────────────────────────────────── */
function ChapterSize() {
  const ref = useRef<HTMLElement>(null);
  const p = useChapterProgress(ref);
  const cardDraw = useTransform(p, [0.08, 0.32], [0, 1]);
  const bottleOp = useTransform(p, [0.26, 0.42], [0, 1]);
  const bottleY = useTransform(p, [0.26, 0.46], [70, 0]);
  const dimOp = useTransform(p, [0.4, 0.52], [0, 1]);
  const copyOp = useTransform(p, [0.44, 0.6], [0, 1]);
  const copyY = useTransform(p, [0.44, 0.6], [28, 0]);
  return (
    <section className="t-ch t-ch-size" ref={ref}>
      <div className="t-ch-sticky">
        <div className="t-size-grid">
          <div className="t-size-stage">
            {/* credit card, true 54 × 85.6 proportion, drawn as an outline */}
            <motion.svg viewBox="0 0 54 85.6" className="t-size-card" aria-hidden="true">
              <motion.rect
                x="1.5"
                y="1.5"
                width="51"
                height="82.6"
                rx="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                style={{ pathLength: cardDraw }}
              />
              <motion.text x="27" y="46" textAnchor="middle" style={{ opacity: dimOp }}>
                CARD
              </motion.text>
            </motion.svg>
            <motion.img
              src={BOTTLE_IMG}
              alt="TIBY ヘアパフューム 30ml"
              className="t-size-bottle"
              style={{ opacity: bottleOp, y: bottleY }}
            />
            <motion.div className="t-size-dim" style={{ opacity: dimOp }} aria-hidden="true">
              <i />
              <span>9cm</span>
              <i />
            </motion.div>
          </div>
          <motion.div className="t-size-copy" style={{ opacity: copyOp, y: copyY }}>
            <div className="t-eyebrow">Fits your bag</div>
            <h2 className="t-h2-jp">
              クレジットカードと、
              <br />
              同じ高さ。
            </h2>
            <p>
              高さ9cm・30ml。ポーチにも、通勤バッグにも。
              <br />
              出先でも、シュッとひと吹き。
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── ③ hair moment — light but lasts ──────────────────────────────── */
const TIMELINE = SKUS.love.timeline; // 0 min / 30 min / to night (approved copy)

function ScentPuff({ p, delay, x }: { p: MotionValue<number>; delay: number; x: string }) {
  const op = useTransform(p, [0.3 + delay, 0.45 + delay, 0.7 + delay], [0, 0.85, 0]);
  const y = useTransform(p, [0.3 + delay, 0.7 + delay], ["0vh", "-14vh"]);
  return <motion.i className="t-puff" style={{ opacity: op, y, left: x }} aria-hidden="true" />;
}

function ChapterHair() {
  const ref = useRef<HTMLElement>(null);
  const p = useChapterProgress(ref);
  const imgScale = useTransform(p, [0, 1], [1.08, 1]);
  const copyOp = useTransform(p, [0.08, 0.2], [0, 1]);
  const dot = useTransform(p, [0.25, 0.85], ["0%", "100%"]);
  const stepOps = [
    useTransform(p, [0.2, 0.28, 0.42, 0.5], [0, 1, 1, 0.25]),
    useTransform(p, [0.42, 0.5, 0.62, 0.7], [0.25, 1, 1, 0.25]),
    useTransform(p, [0.62, 0.7, 1, 1], [0.25, 1, 1, 1]),
  ];
  return (
    <section className="t-ch t-ch-hair" ref={ref}>
      <div className="t-ch-sticky">
        <div className="t-hair-grid">
          <motion.div className="t-hair-copy" style={{ opacity: copyOp }}>
            <div className="t-eyebrow">Light, yet it stays</div>
            <h2 className="t-h2-jp">
              香水より軽く。
              <br />
              それでも、夜まで。
            </h2>
            <div className="t-hair-rail">
              <div className="t-hair-track">
                <motion.span className="t-hair-dot" style={{ left: dot }} />
              </div>
              <div className="t-hair-steps">
                {TIMELINE.map((s, i) => (
                  <motion.div key={s.t} className="t-hair-step" style={{ opacity: stepOps[i] }}>
                    <strong>{s.t}</strong>
                    <span>{s.jp}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          <div className="t-hair-media">
            <motion.img src={HAIR_IMG} alt="髪に15〜25cm離してスプレー" style={{ scale: imgScale }} />
            <ScentPuff p={p} delay={0} x="22%" />
            <ScentPuff p={p} delay={0.08} x="48%" />
            <ScentPuff p={p} delay={0.16} x="70%" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── ④ price reveal ────────────────────────────────────────────────── */
function ChapterPrice() {
  const ref = useRef<HTMLElement>(null);
  const p = useChapterProgress(ref);
  const priceScale = useTransform(p, [0.15, 0.5], [0.82, 1]);
  const priceOp = useTransform(p, [0.15, 0.4], [0, 1]);
  const subOp = useTransform(p, [0.38, 0.52], [0, 1]);
  const subY = useTransform(p, [0.38, 0.52], [22, 0]);
  return (
    <section className="t-ch t-ch-price" ref={ref}>
      <div className="t-ch-sticky">
        <div className="t-ch-center">
          <motion.div className="t-price-hero" style={{ scale: priceScale, opacity: priceOp }}>
            ¥999<span>税込</span>
          </motion.div>
          <motion.div className="t-price-sub" style={{ opacity: subOp, y: subY }}>
            <p>
              全3種、どこで買っても同じ価格。
              <br />
              まずは、あなたの香りをひとつ。
            </p>
            <a className="t-cta" href="#shop">
              香りを選ぶ
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── static fallback (prefers-reduced-motion) ──────────────────────── */
function StaticStory() {
  return (
    <div className="t-story-static">
      <section className="t-ch-scene">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SUBWAY_IMG} alt="" className="t-ch-bg" />
        <div className="t-ch-scrim" />
        <div className="t-ch-center">
          <h2 className="t-ch-line">
            すれ違った、その瞬間。
            <br />
            髪のニオイ、気づかれていませんか？
          </h2>
        </div>
      </section>
      <section className="t-static-block">
        <h2 className="t-h2-jp">クレジットカードと、同じ高さ。</h2>
        <p>高さ9cm・30ml。ポーチにも、通勤バッグにも。</p>
      </section>
      <section className="t-static-block">
        <h2 className="t-h2-jp">香水より軽く。それでも、夜まで。</h2>
        <p>{TIMELINE.map((s) => s.jp).join(" — ")}</p>
      </section>
      <section className="t-static-block">
        <div className="t-price-hero">
          ¥999<span>税込</span>
        </div>
        <a className="t-cta" href="#shop">
          香りを選ぶ
        </a>
      </section>
    </div>
  );
}

export function StoryScroll() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end center"],
  });
  const pillOp = useTransform(scrollYProgress, [0.04, 0.08, 0.96, 1], [0, 1, 1, 0]);
  const pillY = useTransform(scrollYProgress, [0.04, 0.08], [16, 0]);

  if (reduce) return <StaticStory />;

  return (
    <div ref={wrapRef} className="t-story-scroll">
      <ChapterScene />
      <ChapterSize />
      <ChapterHair />
      <ChapterPrice />
      {/* purchase stays one tap away through the whole story */}
      <motion.a className="t-buy-pill" href="#shop" style={{ opacity: pillOp, y: pillY }}>
        ¥999<i>·</i>香りを選ぶ
      </motion.a>
    </div>
  );
}
