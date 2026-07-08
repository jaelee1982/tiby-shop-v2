"use client";

// Interactive brand intro — scroll-driven choreography (framer-motion):
// a giant "T" splits open, the scent ingredients held inside it fall into
// the bottle, then the brand lockup + CTA reveal. Reduced-motion users get
// the final composition without the sequence.
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { SKUS } from "@/lib/skus";
import { siteConfig } from "@/lib/site";

type Drop = {
  label: string;
  color: string;
  x0: string; // scatter position inside the T (vw/vh)
  y0: string;
  d: number; // stagger offset (progress units)
};

const DROPS: Drop[] = [
  { label: "ピーチ", color: "#FBBFD0", x0: "-14vw", y0: "-22vh", d: 0.0 },
  { label: "ベルガモット", color: "#F6D9A8", x0: "11vw", y0: "-24vh", d: 0.03 },
  { label: "ローズ", color: "#ED8CA5", x0: "-6vw", y0: "-15vh", d: 0.06 },
  { label: "バニラ", color: "#EDD9B4", x0: "14vw", y0: "-17vh", d: 0.1 },
  { label: "ジャスミン", color: "#E7EBD8", x0: "5vw", y0: "-9vh", d: 0.13 },
  { label: "アップル", color: "#E8B4BE", x0: "-11vw", y0: "-6vh", d: 0.16 },
  { label: "ムスク", color: "#A89CC8", x0: "1vw", y0: "-28vh", d: 0.2 },
];

function NoteDrop({ drop, progress }: { drop: Drop; progress: MotionValue<number> }) {
  // appear while the T opens, then fall into the bottle mouth and dissolve
  const t0 = 0.14 + drop.d;
  const t1 = 0.6 + drop.d;
  const x = useTransform(progress, [t0, t1], [drop.x0, "0vw"]);
  const y = useTransform(progress, [t0, t1], [drop.y0, "-4vh"]);
  const scale = useTransform(progress, [t0, t1 - 0.08, t1], [1, 0.78, 0.3]);
  const opacity = useTransform(progress, [t0 - 0.05, t0, t1 - 0.05, t1], [0, 1, 1, 0]);
  return (
    <motion.div
      className="t-drop"
      style={{
        x,
        y,
        scale,
        opacity,
        background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, ${drop.color} 68%)`,
      }}
    >
      <span>{drop.label}</span>
    </motion.div>
  );
}

export function HeroIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // spring-smoothed progress: keeps every derived value on the JS animation
  // loop (native ScrollTimeline promotion freezes opacity in some engines)
  // and gives the choreography a soft, premium settle
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 36, mass: 0.6 });

  // T halves split apart and drift away
  const tLeftX = useTransform(p, [0.06, 0.42], ["0vw", "-24vw"]);
  const tRightX = useTransform(p, [0.06, 0.42], ["0vw", "24vw"]);
  const tLeftRot = useTransform(p, [0.06, 0.42], [0, -7]);
  const tRightRot = useTransform(p, [0.06, 0.42], [0, 7]);
  const tOpacity = useTransform(p, [0.4, 0.58], [1, 0]);

  // bottle rises in to catch the notes
  const bottleY = useTransform(p, [0.14, 0.42], ["22vh", "-2vh"]);
  const bottleOpacity = useTransform(p, [0.14, 0.32], [0, 1]);
  const haloOpacity = useTransform(p, [0.2, 0.65], [0, 1]);

  // brand lockup reveal
  const lockY = useTransform(p, [0.76, 0.92], [28, 0]);
  const lockOpacity = useTransform(p, [0.76, 0.92], [0, 1]);
  const cueOpacity = useTransform(p, [0, 0.08], [1, 0]);

  if (reduce) {
    // static final frame for prefers-reduced-motion
    return (
      <section className="t-intro t-intro-static">
        <div className="t-intro-sticky">
          <div className="t-intro-halo" style={{ opacity: 0.9 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="t-intro-bottle" src={SKUS.love.front} alt="TIBY Hair Perfume" style={{ transform: "translate(-50%, calc(-50% - 2vh))" }} />
          <div className="t-intro-lockup" style={{ opacity: 1 }}>
            <IntroLockup />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="t-intro" ref={ref} aria-label="TIBY brand intro">
      <div className="t-intro-sticky">
        <motion.div className="t-intro-halo" style={{ opacity: haloOpacity }} />

        {/* the T, split in two halves */}
        <motion.span
          className="t-intro-t"
          aria-hidden="true"
          style={{ x: tLeftX, rotate: tLeftRot, opacity: tOpacity, clipPath: "inset(0 50% 0 0)" }}
        >
          T
        </motion.span>
        <motion.span
          className="t-intro-t"
          aria-hidden="true"
          style={{ x: tRightX, rotate: tRightRot, opacity: tOpacity, clipPath: "inset(0 0 0 50%)" }}
        >
          T
        </motion.span>

        {/* scent ingredients falling into the bottle */}
        {DROPS.map((d) => (
          <NoteDrop key={d.label} drop={d} progress={p} />
        ))}

        {/* the bottle that catches them */}
        <motion.img
          className="t-intro-bottle"
          src={SKUS.love.front}
          alt="TIBY Hair Perfume — LOVE ME ME"
          style={{ y: bottleY, opacity: bottleOpacity }}
        />

        {/* final brand lockup (x re-centers: motion transform replaces the CSS one) */}
        <motion.div className="t-intro-lockup" style={{ x: "-50%", y: lockY, opacity: lockOpacity }}>
          <IntroLockup />
        </motion.div>

        <motion.div className="t-scroll-cue" style={{ opacity: cueOpacity }}>
          <span>Scroll</span>
          <i />
        </motion.div>
      </div>
    </section>
  );
}

function IntroLockup() {
  return (
    <>
      <div className="t-intro-eyebrow">Hair Perfume / ヘアパフューム</div>
      <h1 className="t-intro-copy">{siteConfig.masterCopy}</h1>
      <p className="t-intro-sub">
        髪のための香水。すれ違う瞬間に残る、ズルい残り香。
        <br />
        30ml · ¥999（税込）
      </p>
      <a className="t-cta" href="#shop">
        香りを選ぶ
      </a>
    </>
  );
}
