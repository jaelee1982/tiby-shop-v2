"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const colorMap: Record<string, string> = {
    love: "border-t-love",
    hug: "border-t-hug",
    kiss: "border-t-kiss",
  };

  const accentMap: Record<string, string> = {
    love: "text-love",
    hug: "text-hug",
    kiss: "text-kiss",
  };

  const btnMap: Record<string, string> = {
    love: "border-love text-love hover:bg-love hover:text-bg",
    hug: "border-hug text-hug hover:bg-hug hover:text-bg",
    kiss: "border-kiss text-kiss hover:bg-kiss hover:text-bg",
  };

  const numMap: Record<string, string> = {
    love: "text-love/[0.18]",
    hug: "text-hug/[0.18]",
    kiss: "text-kiss/[0.18]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      className={`relative p-8 md:p-10 lg:p-14 border-t-[3px] ${colorMap[product.color]} group cursor-pointer transition-transform duration-500`}
      whileHover={{ y: -4 }}
      style={{
        background: "transparent",
      }}
    >
      {/* Hover gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${product.colorDim}, transparent 70%)`,
        }}
      />

      {/* Number */}
      <span
        className={`absolute top-8 right-8 font-serif text-[72px] font-light leading-none ${numMap[product.color]}`}
      >
        {product.number}
      </span>

      {/* Product image */}
      <div className="relative h-[320px] md:h-[420px] mb-8">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.03] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_32px_48px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Info */}
      <span className={`text-[9px] tracking-[3px] uppercase ${accentMap[product.color]} mb-5 block`}>
        {product.name.replace("ME ME", "Me Me")}
      </span>

      <h3 className="font-serif font-light text-4xl tracking-[2px] leading-[1.1] mb-3">
        {product.name.split(" ").slice(0, 1)}
        <br />
        ME ME
      </h3>

      <p className="font-jp text-xs text-cream-dim leading-[1.8] mb-10 whitespace-pre-line">
        {product.tagline}
      </p>

      {/* Notes */}
      <div className="mb-10 border-t border-cream-faint pt-6 space-y-2">
        {(["top", "mid", "base"] as const).map((key) => (
          <div key={key} className="flex gap-3 items-baseline">
            <span className="text-[8px] tracking-[2px] uppercase text-cream/25 w-9 shrink-0">
              {key === "base" ? "Last" : key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
            <span className="text-[11px] tracking-[0.5px] text-cream-dim">
              {product.notes[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-serif text-[28px] font-light tracking-[1px]">
            ¥999
          </span>
          <span className="block text-[13px] tracking-[1px] text-cream-dim mt-0.5 font-sans">
            30ml · 税込
          </span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className={`text-[10px] tracking-[2.5px] uppercase px-7 py-3.5 border transition-all duration-300 ${btnMap[product.color]}`}
        >
          詳細を見る →
        </Link>
      </div>
    </motion.div>
  );
}
