"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

const steps = [
  {
    num: "STEP 01",
    title: "Shake",
    desc: "使用前に軽く振ってください。香りの成分が均一になり、より立体的な香り立ちに。",
  },
  {
    num: "STEP 02",
    title: "Spray",
    desc: "髪から20cmほど離して、2〜3プッシュ。毛先を中心にふんわりと纏わせます。",
  },
  {
    num: "STEP 03",
    title: "Style",
    desc: "髪を軽く揺らして香りを馴染ませて。動くたびに、ふわっと残るズルい残り香。",
    final: true,
  },
];

export function HowToUse() {
  return (
    <section className="py-20 md:py-[140px] px-6 md:px-12 bg-bg">
      <ScrollReveal>
        <div className="max-w-[1200px] mx-auto mb-14 md:mb-20">
          <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
            How to Use
          </p>
          <h2
            className="font-serif font-light tracking-tight"
            style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
          >
            ふわっと香る、
            <br />
            3つのステップ。
          </h2>
        </div>
      </ScrollReveal>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 border-t border-cream-faint">
        {steps.map((step, i) => (
          <ScrollReveal key={step.num} delay={i * 0.15}>
            <div
              className={`p-8 md:p-10 md:border-r border-cream-faint relative ${
                i === steps.length - 1 ? "md:border-r-0" : ""
              }`}
            >
              <span className="font-serif text-[11px] tracking-[4px] text-cream/40 block mb-6">
                {step.num}
              </span>
              <h3 className="font-serif font-light text-[28px] tracking-tight leading-[1.2] mb-3.5">
                {step.title}
              </h3>
              <p className="font-jp text-xs leading-[2] text-cream-dim">
                {step.desc}
              </p>
              {step.final && (
                <div className="absolute left-0 right-0 -bottom-px h-[3px] bg-gradient-to-r from-love via-hug to-kiss" />
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
