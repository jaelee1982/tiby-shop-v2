"use client";

// Act 0 — 시네마틱 오프닝 (2026-07-31 사장 지시 "다 뒤집어").
// 거대 TIBY 워드마크 뒤에서 보틀이 떠오르고, 스크롤을 내리면 타이포가
// 확대·소멸하며 마스터카피가 스크럽으로 드러난다. 핀 260vh.
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { SKUS } from "@/lib/skus";
import { siteConfig } from "@/lib/site";

const SPRING = { stiffness: 220, damping: 36, mass: 0.6 };
const LETTERS = ["T", "I", "B", "Y"];

export function CinematicHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, SPRING);

  // 워드마크: 확대되며 소멸 (카메라가 글자를 뚫고 들어가는 느낌)
  const markScale = useTransform(p, [0, 0.42], [1, 1.6]);
  const markOp = useTransform(p, [0.16, 0.4], [1, 0]);
  // 보틀: 살짝 떠오르다 → 위로 빠지며 퇴장
  const bottleY = useTransform(p, [0, 0.3, 0.55], ["0vh", "-4vh", "-46vh"]);
  const bottleScale = useTransform(p, [0, 0.42, 0.55], [1, 1.06, 0.7]);
  const bottleOp = useTransform(p, [0.45, 0.58], [1, 0]);
  // 마스터카피: 타이포가 사라진 자리에 등장 → 유지 → 페이드
  const copyOp = useTransform(p, [0.5, 0.62, 0.88, 1], [0, 1, 1, 0]);
  const copyY = useTransform(p, [0.5, 0.62], [30, 0]);
  // 배경 글로우 호흡
  const glowOp = useTransform(p, [0, 0.5, 1], [0.9, 0.6, 0.2]);
  // 스크롤 큐
  const cueOp = useTransform(p, [0, 0.08], [1, 0]);

  if (reduce) {
    return (
      <section className="t-cine t-cine--static">
        <div className="t-cine-sticky">
          <div className="t-cine-glow" />
          <div className="t-cine-mark" aria-hidden="true">TIBY</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="t-cine-bottle" src={SKUS.love.front} alt="TIBY ヘアパフューム" />
          <p className="t-cine-cat">HAIR PERFUME — ヘアパフューム</p>
        </div>
      </section>
    );
  }

  return (
    <section className="t-cine" ref={ref} aria-label="TIBY">
      <div className="t-cine-sticky">
        <motion.div className="t-cine-glow" style={{ opacity: glowOp }} />

        {/* 거대 워드마크 — 글자별 스태거 등장(로드 시), 스크롤로 확대·소멸 */}
        <motion.div className="t-cine-mark" style={{ scale: markScale, opacity: markOp }} aria-hidden="true">
          {LETTERS.map((ch, i) => (
            <motion.span
              key={ch + i}
              initial={{ opacity: 0, y: "0.35em" }}
              animate={{ opacity: 1, y: "0em" }}
              transition={{ delay: 0.12 + i * 0.08, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.div>

        {/* 보틀 — 워드마크 앞으로 떠오름 */}
        <motion.img
          className="t-cine-bottle"
          src={SKUS.love.front}
          alt="TIBY ヘアパフューム LOVE ME ME"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ y: bottleY, scale: bottleScale, opacity: bottleOp }}
        />

        <motion.p
          className="t-cine-cat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{ opacity: markOp }}
        >
          HAIR PERFUME — ヘアパフューム
        </motion.p>

        {/* 마스터카피 스크럽 리빌 */}
        <motion.h1 className="t-cine-copy" style={{ opacity: copyOp, y: copyY }}>
          {siteConfig.masterCopy}
        </motion.h1>

        <motion.div className="t-cine-cue" style={{ opacity: cueOp }} aria-hidden="true">
          <i />
          <span>scroll</span>
        </motion.div>
      </div>
    </section>
  );
}
