"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProductCard } from "./ProductCard";
import { products } from "@/lib/products";

export function Collection() {
  return (
    <section id="shop" className="bg-surface py-20 md:py-[120px] px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-14 md:mb-[72px] border-b border-cream-faint pb-8">
            <div>
              <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
                Collection
              </p>
              <h2
                className="font-serif font-light tracking-[1px]"
                style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
              >
                3つの香り、
                <br />
                3つの自分。
              </h2>
            </div>
            <p className="font-jp text-[11px] tracking-[1.5px] text-cream-dim max-w-[240px] md:text-right leading-[1.8] mt-4 md:mt-0">
              香水ほどキメすぎない、
              <br />
              髪から自然に香るヘアミスト。
            </p>
          </div>
        </ScrollReveal>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
          {products.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
