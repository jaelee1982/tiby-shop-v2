"use client";

import { useEffect, useRef } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function XReviews() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-20 md:py-[120px] px-6 md:px-12 bg-bg">
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 md:mb-16">
            <div>
              <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
                Reviews on X
              </p>
              <h2
                className="font-serif font-light tracking-tight"
                style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
              >
                みんなの声
              </h2>
            </div>
            <a
              href="https://x.com/tiby_japan"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 md:mt-0 text-xs tracking-[2px] text-cream-dim hover:text-cream transition-colors group"
            >
              Follow on X
              <span className="inline-block ml-1 transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div
            ref={containerRef}
            className="max-w-[550px] mx-auto [&_iframe]:rounded-lg"
            style={{
              colorScheme: "dark",
            }}
          >
            <a
              className="twitter-timeline"
              data-theme="dark"
              data-chrome="noheader nofooter noborders transparent"
              data-tweet-limit="5"
              data-width="550"
              href="https://twitter.com/tiby_japan"
            >
              Loading...
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
