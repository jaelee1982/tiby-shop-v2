"use client";

// SKU 필름 릴 — 스크롤 스크럽으로 LOVE → HUG → KISS 가 프레임처럼 전환되는
// 핀 고정 섹션 (구 3등분 카드 StoryArc 대체). 배경색·보틀·카피가 동시에 모핑.
import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SKUS, SKU_ORDER, type SkuId } from "@/lib/skus";

const SPRING = { stiffness: 220, damping: 36, mass: 0.6 };
const ACTS = ["ときめき", "温もり", "情熱"];
// 릴 전용 디스플레이 컬러 — SKU accent 중 밝은 값(HUG 베이지 등)은 대형
// 타이포/CTA 에서 대비가 부족해, 채도·명도를 낮춘 브랜드 톤으로 별도 매핑.
const REEL_COLOR: Record<SkuId, string> = {
  love: "#E8788A",
  hug: "#2F9D96",
  kiss: "#8E7CC0",
};

function segmentWindow(i: number, n: number): [number, number, number, number] {
  // i번째 SKU 가 완전히 보이는 스크럽 구간 (양끝 크로스페이드)
  const seg = 1 / n;
  const start = i * seg;
  const end = start + seg;
  const fade = seg * 0.28;
  return [
    i === 0 ? 0 : start,
    i === 0 ? 0 : start + fade,
    i === n - 1 ? 1 : end - fade,
    i === n - 1 ? 1 : end,
  ];
}

function ReelSlide({ p, id, index }: { p: MotionValue<number>; id: SkuId; index: number }) {
  const sku = SKUS[id];
  const [a, b, c, d] = segmentWindow(index, SKU_ORDER.length);
  const op = useTransform(p, [a, b, c, d], [index === 0 ? 1 : 0, 1, 1, index === SKU_ORDER.length - 1 ? 1 : 0]);
  const y = useTransform(p, [a, b], [index === 0 ? 0 : 46, 0]);
  const rot = useTransform(p, [a, d], [index === 0 ? 0 : 5, index === SKU_ORDER.length - 1 ? 0 : -5]);
  return (
    <>
      {/* 배경 틴트 레이어 */}
      <motion.div className="t-reel-tint" style={{ opacity: op, background: `color-mix(in oklab, ${REEL_COLOR[id]} 10%, var(--tiby-bg))` }} />
      {/* 보틀 */}
      <motion.img
        className="t-reel-bottle"
        src={sku.front}
        alt={`${sku.name} ボトル`}
        style={{ opacity: op, y, rotate: rot }}
      />
      {/* 카피 */}
      <motion.div className="t-reel-copy" style={{ opacity: op }}>
        <div className="t-reel-count">
          {String(index + 1).padStart(2, "0")} <em>/ 03</em> — Act {index + 1} · {ACTS[index]}
        </div>
        <div className="t-reel-name" style={{ color: REEL_COLOR[id] }}>{sku.name}</div>
        <div className="t-reel-jp">{sku.jp}</div>
        <p className="t-reel-family">{sku.family}</p>
      </motion.div>
    </>
  );
}

export function SkuReel() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, SPRING);
  const [active, setActive] = useState<SkuId>("love");

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(SKU_ORDER.length - 1, Math.floor(v * SKU_ORDER.length));
    if (SKU_ORDER[idx] !== active) setActive(SKU_ORDER[idx]);
  });

  if (reduce) {
    return (
      <section className="t-reel-static">
        {SKU_ORDER.map((id, i) => {
          const sku = SKUS[id];
          return (
            <Link key={id} href={`/products/${sku.slug}`} className="t-reel-static-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sku.front} alt={sku.name} />
              <div>
                <div className="t-reel-count">0{i + 1} — {ACTS[i]}</div>
                <div className="t-reel-name" style={{ color: REEL_COLOR[id] }}>{sku.name}</div>
                <p className="t-reel-family">{sku.family}</p>
              </div>
            </Link>
          );
        })}
      </section>
    );
  }

  const activeSku = SKUS[active];

  return (
    <section className="t-reel" ref={ref} aria-label="3つの香り">
      <div className="t-reel-sticky">
        {SKU_ORDER.map((id, i) => (
          <ReelSlide key={id} p={p} id={id} index={i} />
        ))}

        {/* 진행 인디케이터 + 활성 SKU CTA (스크럽과 동기화) */}
        <div className="t-reel-rail" aria-hidden="true">
          {SKU_ORDER.map((id) => (
            <i key={id} className={id === active ? "on" : ""} style={{ background: id === active ? REEL_COLOR[id] : undefined }} />
          ))}
        </div>
        <div className="t-reel-cta">
          <Link href={`/products/${activeSku.slug}`} className="t-cta" style={{ background: REEL_COLOR[active] }}>
            {activeSku.name} を見る
          </Link>
        </div>
      </div>
    </section>
  );
}
