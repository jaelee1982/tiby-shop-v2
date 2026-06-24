"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const CDN = "https://cdn.shopify.com/s/files/1/0948/3173/9160/files";

const ticker = [
  { text: "LOVE ME ME", cls: "text-love/85" },
  { text: "HUG ME ME", cls: "text-hug/85" },
  { text: "KISS ME ME", cls: "text-kiss/85" },
];

export function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src={`${CDN}/Tiby_target.png`}
        alt=""
        fill
        className="object-cover opacity-[0.18] saturate-[0.4] brightness-[0.7]"
        priority
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 60%, rgba(244,160,160,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 75% 30%, rgba(167,139,191,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(126,200,181,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle line */}
      <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-20 bg-gradient-to-r from-transparent via-cream/[0.06] to-transparent" />

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-[10px] tracking-[4px] uppercase text-cream-dim mb-10 z-10"
      >
        Hair Perfume — ¥999
      </motion.p>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="font-serif font-light italic text-center z-10 leading-[1.15] tracking-tight max-w-[900px] px-6"
        style={{ fontSize: "clamp(28px, 5vw, 72px)" }}
      >
        <span className="block whitespace-nowrap">香水は決めすぎるけど、</span>
        <span className="block whitespace-nowrap bg-gradient-to-br from-love via-kiss to-hug bg-clip-text text-transparent">
          これはズルい。
        </span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-8 text-xs tracking-[2px] text-cream-dim z-10"
      >
        Hair Perfume — 30ml · ¥999
      </motion.p>

      {/* Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-[120px] left-0 right-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div
          className="flex gap-16 whitespace-nowrap font-serif italic text-[22px] font-light"
          style={{ animation: "marquee 28s linear infinite" }}
        >
          {[...Array(3)].flatMap((_, i) =>
            ticker.map((t, j) => (
              <span key={`${i}-${j}`} className="flex items-center gap-16">
                <span className={t.cls}>{t.text}</span>
                <span className="text-cream/25">✦</span>
              </span>
            ))
          )}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-10"
      >
        <div
          className="w-px h-12 bg-gradient-to-b from-cream/30 to-transparent"
          style={{ animation: "scroll-pulse 2s 2s infinite" }}
        />
        <span className="text-[9px] tracking-[3px] uppercase text-cream/30">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
