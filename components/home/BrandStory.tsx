"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const CDN = "https://cdn.shopify.com/s/files/1/0948/3173/9160/files";

export function BrandStory() {
  return (
    <section id="about" className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
      {/* Visual */}
      <div className="relative overflow-hidden bg-dark min-h-[50vh] md:min-h-0">
        <Image
          src={`${CDN}/tiby_lovememe_hairperfume_12_hero.jpg`}
          alt="TIBY"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-bg/30 via-transparent to-bg/50" />
      </div>

      {/* Content */}
      <div className="px-8 py-16 md:px-[72px] md:py-20 flex flex-col justify-center bg-surface">
        <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-6">
          Brand Story
        </p>

        <ScrollReveal>
          <blockquote className="font-serif font-light italic leading-[1.5] mb-10" style={{ fontSize: "clamp(28px, 2.5vw, 42px)" }}>
            &ldquo;香水ほどキメすぎたくない日も、
            <br />
            <em className="italic text-love">&ldquo;なんか今日、髪いい匂い&rdquo;</em>
            <br />
            って思わせたい。&rdquo;
          </blockquote>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="font-jp text-[13px] leading-[2] text-cream-dim mb-12">
            TIBYは、さりげなく香りたいすべての人のために生まれたヘアパフューム。
            <br />
            強すぎず、弱すぎない——ちょうどいい香りが、あなたの日常に溶け込む。
            <br />
            <br />
            動くたびにふわっと広がり、近づいたときだけ気づく。
            <br />
            それが、TIBYのズルい秘密。
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <a
            href="https://tiby.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-[2px] text-cream-dim hover:text-cream transition-colors group"
          >
            香り診断を試す
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
