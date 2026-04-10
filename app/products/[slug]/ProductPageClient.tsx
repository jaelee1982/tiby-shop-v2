"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function ProductPageClient({
  product,
  otherProducts,
}: {
  product: Product;
  otherProducts: Product[];
}) {
  return (
    <div className="bg-bg">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${product.colorDim}, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[10px] tracking-[4px] uppercase text-cream-dim mb-6"
          >
            Hair Perfume — {product.number}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative w-48 h-80 md:w-64 md:h-[420px] mb-8"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              priority
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-serif font-light text-5xl md:text-7xl tracking-[4px] mb-3"
          >
            {product.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="font-jp text-sm text-cream-dim leading-relaxed whitespace-pre-line"
          >
            {product.tagline}
          </motion.p>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Images */}
          <ScrollReveal>
            <div className="relative aspect-[3/4] bg-surface rounded-sm overflow-hidden">
              <Image
                src={product.heroImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </ScrollReveal>

          {/* Info */}
          <div className="md:sticky md:top-32 md:self-start">
            <ScrollReveal>
              <p className="font-jp text-xs text-cream/40 mb-2">
                {product.nameJa}
              </p>
              <h2 className="font-serif font-light text-4xl tracking-[2px] mb-2">
                {product.name}
              </h2>
              <p className="text-[11px] tracking-[2px] text-cream-dim mb-8">
                {product.profile}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-serif text-3xl font-light">¥999</span>
                <span className="text-sm text-cream-dim">30ml · 税込</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p className="font-jp text-sm text-cream-dim leading-[2] mb-10 italic">
                {product.concept}
              </p>
            </ScrollReveal>

            {/* Fragrance Notes */}
            <ScrollReveal delay={0.2}>
              <div className="border-t border-cream-faint pt-6 mb-10 space-y-3">
                {(["top", "mid", "base"] as const).map((key) => (
                  <div key={key} className="flex gap-4 items-baseline">
                    <span className="text-[9px] tracking-[2px] uppercase text-cream/30 w-10 shrink-0">
                      {key === "base" ? "Base" : key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="text-sm tracking-wide text-cream-dim">
                      {product.notes[key]}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="space-y-3">
                <a
                  href="https://tiby.me/stores"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-[11px] tracking-[2px] uppercase py-4 border transition-all duration-300"
                  style={{
                    borderColor: product.colorHex,
                    color: product.colorHex,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = product.colorHex;
                    e.currentTarget.style.color = "#0a0a0a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = product.colorHex;
                  }}
                >
                  Find in Don Quijote →
                </a>
                <a
                  href="https://tiby.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-[11px] tracking-[2px] uppercase py-4 border border-cream-faint text-cream-dim hover:border-cream/20 hover:text-cream transition-all duration-300"
                >
                  香り診断を試す
                </a>
              </div>
            </ScrollReveal>

            {/* Metadata */}
            <ScrollReveal delay={0.3}>
              <div className="mt-10 pt-6 border-t border-cream-faint space-y-1.5">
                {[
                  ["Volume", "30ml / 1.01 FL.OZ."],
                  ["Type", "Hair Perfume"],
                  ["Origin", "Made in Korea"],
                  ["Seller", "ONEMAKE Co., Ltd."],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-[11px]">
                    <span className="text-cream/30">{label}</span>
                    <span className="text-cream-dim">{value}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 overflow-hidden border-t border-cream-faint">
        <ScrollReveal>
          <p className="text-[11px] tracking-[5px] uppercase text-cream/35 text-center mb-10">
            Reviews
          </p>
        </ScrollReveal>
        <div
          className="flex gap-6 whitespace-nowrap"
          style={{
            animation: "marquee 30s linear infinite",
            maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {[...product.reviews, ...product.reviews].map((review, i) => (
            <div
              key={i}
              className="inline-block w-[300px] shrink-0 border border-cream-faint p-6 whitespace-normal"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.stars }).map((_, j) => (
                  <span key={j} className="text-love text-sm">★</span>
                ))}
              </div>
              <p className="font-jp text-xs text-cream-dim leading-[1.8] mb-4">
                {review.text}
              </p>
              <span className="text-[10px] tracking-[1px] text-cream/30">
                — {review.author}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Other Products */}
      <section className="py-20 px-6 md:px-12 border-t border-cream-faint">
        <ScrollReveal>
          <p className="text-[11px] tracking-[5px] uppercase text-cream/35 text-center mb-12">
            Other Fragrances
          </p>
        </ScrollReveal>
        <div className="max-w-[800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherProducts.map((p) => (
            <ScrollReveal key={p.slug}>
              <Link
                href={`/products/${p.slug}`}
                className="group block border border-cream-faint p-8 hover:border-cream/15 transition-all"
              >
                <div className="relative h-48 mb-6">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-light tracking-[2px] mb-1">
                  {p.name}
                </h3>
                <p className="font-jp text-xs text-cream-dim">
                  {p.notes.top.split(" · ").slice(0, 2).join(" · ")}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
