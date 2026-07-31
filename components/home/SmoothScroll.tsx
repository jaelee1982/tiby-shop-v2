"use client";

// Lenis 스무스 스크롤 — 시네마틱 스크럽 연출용 관성 스크롤.
// 네이티브 스크롤 값을 보간하므로 framer-motion useScroll 과 그대로 호환.
import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";

export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [reduce]);

  return null;
}
