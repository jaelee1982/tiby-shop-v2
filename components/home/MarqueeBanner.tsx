"use client";

import { Marquee } from "@/components/ui/Marquee";

export function MarqueeBanner() {
  return (
    <div className="py-5 bg-bg border-y border-cream-faint">
      <Marquee
        items={[
          "すれ違った瞬間の、ズルい残り香",
          "Hair Perfume",
          "全国ドン・キホーテ219店舗",
          "¥999 — 30ml",
          "近づいたとき、気づいてほしい香り",
          "TIBY",
        ]}
        speed={20}
      />
    </div>
  );
}
