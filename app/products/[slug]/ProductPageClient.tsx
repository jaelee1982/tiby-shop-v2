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
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 md:px-12">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 60% 50%, ${product.colorDim}, transparent 60%)`,
          }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[10px] tracking-[4px] uppercase text-cream-dim block mb-6"
            >
              TIBY — {product.name}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="font-serif font-light italic leading-[1.2] mb-6"
              style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
            >
              {product.heroHook}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-jp text-sm text-cream-dim leading-[2] whitespace-pre-line"
            >
              {product.heroSub}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative h-[400px] md:h-[500px]"
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
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-[1000px] mx-auto">
          <ScrollReveal>
            <div className="mb-14">
              <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
                The Problem
              </p>
              <h2
                className="font-serif font-light"
                style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
              >
                こんな経験、
                <br />
                <em className="italic" style={{ color: product.colorHex }}>
                  ありませんか？
                </em>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.problems.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="border border-cream-faint p-6 md:p-8">
                  <span className="text-2xl mb-4 block">💭</span>
                  <p className="font-jp text-xs text-cream-dim leading-[2]">
                    <span style={{ color: product.colorHex }}>{p.em}</span>
                    <br />
                    {p.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE SOLUTION ── */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-bg">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={product.heroImage}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-6 left-6 bg-bg/80 backdrop-blur-sm px-4 py-3 border border-cream-faint">
                <div className="font-serif text-2xl font-light" style={{ color: product.colorHex }}>
                  6
                </div>
                <div className="text-[9px] tracking-[2px] uppercase text-cream-dim">
                  Plant Extracts
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div>
              <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
                The Solution
              </p>
              <h2
                className="font-serif font-light mb-8"
                style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
              >
                だから、
                <br />
                <em className="italic" style={{ color: product.colorHex }}>
                  ヘア専用の
                </em>
                <br />
                香りが必要。
              </h2>
              <p className="font-jp text-sm text-cream-dim leading-[2]">
                TIBYは髪のために設計された香水ミスト。
                <br /><br />
                アルコールベースで軽くまとわりつかない処方に、6種の植物エキスを配合。
                <br /><br />
                顔から15〜25cm離してスプレーするだけで、動くたびにふわりと漂うやさしい残り香。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PRODUCT DETAIL ── */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Images — mood + front + side */}
          <ScrollReveal>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 relative aspect-[3/2] overflow-hidden">
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden" style={{ background: product.colorDim }}>
                <Image
                  src={product.image}
                  alt={`${product.name} front`}
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="relative aspect-square overflow-hidden" style={{ background: product.colorDim }}>
                <Image
                  src={product.imageSide}
                  alt={`${product.name} side`}
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Product Info */}
          <div className="md:sticky md:top-32 md:self-start">
            <ScrollReveal>
              <p className="font-jp text-xs text-cream/40 mb-2">
                {product.nameJa}
              </p>
              <h2 className="font-serif font-light text-4xl tracking-[2px] mb-2">
                {product.name}
              </h2>
              <p className="text-sm text-cream-dim mb-6">
                ¥999 <span className="text-cream/40">税込 / 30ml</span>
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="font-jp text-sm text-cream-dim leading-[2] italic mb-10">
                {product.concept}
              </p>
            </ScrollReveal>

            {/* Fragrance Notes — 3 column cards */}
            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-3 gap-3 mb-10">
                {(["top", "mid", "base"] as const).map((key) => (
                  <div
                    key={key}
                    className="border border-cream-faint p-4 text-center"
                  >
                    <span className="text-[9px] tracking-[2px] uppercase text-cream/30 block mb-3">
                      {key === "base" ? "Base Note" : `${key.charAt(0).toUpperCase() + key.slice(1)} Note`}
                    </span>
                    <div className="text-[11px] text-cream-dim leading-[2]">
                      {product.notes[key].split(" · ").map((note, i) => (
                        <span key={i} className="block">{note}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="space-y-3 mb-8">
                <a
                  href="https://tiby.me/stores"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-[11px] tracking-[2px] uppercase py-4 transition-all duration-300"
                  style={{
                    background: product.colorHex,
                    color: "#0a0a0a",
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
                  🌸 あなたに合う香りを診断する
                </a>
              </div>
            </ScrollReveal>

            {/* Metadata */}
            <ScrollReveal delay={0.25}>
              <div className="pt-6 border-t border-cream-faint space-y-1.5">
                {[
                  ["内容量", "30ml / 1.01 FL.OZ."],
                  ["フレグランス系統", product.profile.toUpperCase()],
                  ["原産国", "韓国製"],
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

      {/* ── WHY TIBY ── */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-bg">
        <div className="max-w-[1000px] mx-auto">
          <ScrollReveal>
            <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
              Why TIBY
            </p>
            <h2
              className="font-serif font-light mb-14"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              香水との
              <br />
              <em className="italic" style={{ color: product.colorHex }}>
                ちがい。
              </em>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                title: "ヘア専用処方",
                body: "通常の香水と異なり、髪への密着を考えたアルコールベース処方。重さや油分がなく、さらりとした使い心地。",
              },
              {
                num: "02",
                title: "6種の植物エキス",
                body: "ラベンダー・フリージア・カミツレなど6種の天然植物エキスを配合。髪をやさしく包み込みます。",
              },
              {
                num: "03",
                title: "¥999 の気軽さ",
                body: "毎日使えるプライスで、3本揃えて気分やシーンで使い分けも。ドン・キホーテ全国219店舗で購入可能。",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.num} delay={i * 0.1}>
                <div className="border border-cream-faint p-8">
                  <span
                    className="font-serif text-3xl font-light block mb-4"
                    style={{ color: product.colorHex, opacity: 0.4 }}
                  >
                    {item.num}
                  </span>
                  <h3 className="font-serif text-lg font-light mb-3">
                    {item.title}
                  </h3>
                  <p className="font-jp text-xs text-cream-dim leading-[2]">
                    {item.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVERY SCENE ── */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
              Every Scene
            </p>
            <h2
              className="font-serif font-light mb-14"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              どんな日も、
              <br />
              <em className="italic" style={{ color: product.colorHex }}>
                あなたらしく。
              </em>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {product.scenes.map((scene, i) => (
              <ScrollReveal key={scene.category} delay={i * 0.08}>
                <div className="relative aspect-[3/4] overflow-hidden group">
                  <Image
                    src={scene.image}
                    alt={scene.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="font-serif text-lg font-light italic text-cream/90 block mb-1">
                      {scene.title}
                    </span>
                    <span className="font-jp text-[10px] text-cream/50">
                      {scene.sub}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS MARQUEE ── */}
      <section className="py-16 overflow-hidden border-t border-cream-faint bg-bg">
        <ScrollReveal>
          <div className="px-6 md:px-12 max-w-[1000px] mx-auto mb-10">
            <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
              Real Reviews
            </p>
            <h2
              className="font-serif font-light"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              使った人の、
              <em className="italic" style={{ color: product.colorHex }}>
                声。
              </em>
            </h2>
          </div>
        </ScrollReveal>
        <div
          className="flex gap-6 whitespace-nowrap"
          style={{
            animation: "marquee 30s linear infinite",
            maskImage:
              "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {[...product.reviews, ...product.reviews].map((review, i) => (
            <div
              key={i}
              className="inline-block w-[320px] shrink-0 border border-cream-faint p-6 whitespace-normal"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.stars }).map((_, j) => (
                  <span key={j} style={{ color: product.colorHex }} className="text-sm">
                    ★
                  </span>
                ))}
                {Array.from({ length: 5 - review.stars }).map((_, j) => (
                  <span key={j} className="text-cream/20 text-sm">★</span>
                ))}
              </div>
              <p className="font-jp text-xs text-cream-dim leading-[1.8] mb-4">
                {review.text}
              </p>
              <span className="text-[10px] tracking-[1px] text-cream/30">
                {review.author}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── INGREDIENTS ── */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-[800px] mx-auto">
          <ScrollReveal>
            <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
              Ingredients
            </p>
            <h2
              className="font-serif font-light mb-12"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              成分<em className="italic" style={{ color: product.colorHex }}>情報</em>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mb-8">
              <h3 className="text-xs tracking-[2px] text-cream/40 mb-3">
                植物エキス成分
              </h3>
              <div className="flex flex-wrap gap-2">
                {["ラベンダー花エキス", "タイマツバナ葉エキス", "セイヨウハッカ葉エキス", "フリージアエキス", "カミツレ花エキス", "ローズマリー葉エキス"].map((ing) => (
                  <span
                    key={ing}
                    className="text-[11px] px-3 py-1.5 border border-cream-faint text-cream-dim"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mb-8">
              <h3 className="text-xs tracking-[2px] text-cream/40 mb-3">
                フレグランス特有成分
              </h3>
              <div className="flex flex-wrap gap-2">
                {["シトロネロール", "リモネン", "ゲラニオール", "リナロール"].map((ing) => (
                  <span
                    key={ing}
                    className="text-[11px] px-3 py-1.5 border border-cream-faint text-cream-dim"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="font-jp text-[10px] text-cream/25 leading-[2] mb-6">
              全成分：エタノール、水、ＤＰＧ、クエン酸トリエチル、メトキシケイヒ酸エチルヘキシル、ＢＧ、ラベンダー花エキス、タイマツバナ葉エキス、セイヨウハッカ葉エキス、フリージアエキス、カミツレ花エキス、ローズマリー葉エキス、１，２－ヘキサンジオール、エチルヘキシルグリセリン、香料、シトロネロール、リモネン、ゲラニオール、リナロール
            </p>
            <p className="font-jp text-[10px] text-cream/20 leading-[2]">
              ※ご使用前にパッチテストをおすすめします。お肌に異常が生じた場合は使用を中止し、皮膚科医にご相談ください。
              <br />
              ※顔を避けて、15～25cm離して髪にスプレーしてください。
              <br />
              ※お子様の手の届かない場所に保管してください。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-bg text-center">
        <ScrollReveal>
          <h2
            className="font-serif font-light italic mb-10"
            style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}
          >
            香水が<em style={{ color: product.colorHex }}>決めすぎるけど、</em>
            <br />
            これはズルい。
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="https://tiby.me/stores"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-[2px] uppercase px-8 py-4 transition-all duration-300"
              style={{ background: product.colorHex, color: "#0a0a0a" }}
            >
              {product.name} を購入する — ¥999
            </a>
            <a
              href="https://tiby.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-[2px] uppercase px-8 py-4 border border-cream-faint text-cream-dim hover:text-cream transition-colors"
            >
              香りを診断する
            </a>
            <a
              href="https://tiby.me/layering"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-[2px] uppercase px-8 py-4 border border-cream-faint text-cream-dim hover:text-cream transition-colors"
            >
              レイヤリングガイド
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* ── OTHER PRODUCTS ── */}
      <section className="py-20 px-6 md:px-12 border-t border-cream-faint bg-surface">
        <div className="max-w-[800px] mx-auto">
          <ScrollReveal>
            <p className="text-[11px] tracking-[5px] uppercase text-cream/35 text-center mb-4">
              Also Available
            </p>
            <h2
              className="font-serif font-light text-center mb-12"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              他の<em className="italic" style={{ color: product.colorHex }}>香り</em>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherProducts.map((p) => (
              <ScrollReveal key={p.slug}>
                <Link
                  href={`/products/${p.slug}`}
                  className="group block border border-cream-faint p-8 hover:border-cream/15 transition-all"
                  style={{
                    borderTopColor: p.colorHex,
                    borderTopWidth: "2px",
                  }}
                >
                  <div className="relative h-48 mb-6">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-light tracking-[2px] mb-2">
                    {p.name}
                  </h3>
                  <p className="font-jp text-xs text-cream-dim mb-4">
                    {p.slug === "hug-me-me"
                      ? "シトラス＆ムスク。甘くやさしく包み込まれる香り。"
                      : p.slug === "kiss-me-me"
                        ? "アップル＆フローラル。フルーティーで可憐な香り。"
                        : "ピーチ＆ローズ。すれ違う瞬間の、ズルい残り香。"}
                  </p>
                  <span
                    className="text-xs tracking-[2px] transition-colors"
                    style={{ color: p.colorHex }}
                  >
                    詳しく見る →
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY BAR ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-bg/92 backdrop-blur-xl py-3.5 px-6 md:px-10 flex items-center justify-between gap-4 border-t"
        style={{ borderTopColor: `${product.colorHex}33` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: product.colorHex }}
          />
          <span className="text-xs tracking-[3px] uppercase hidden sm:inline">
            {product.name}
          </span>
          <span className="text-xs tracking-[2px] text-cream-dim">¥999</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://tiby.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[2px] uppercase px-4 py-2.5 border border-cream/20 text-cream-dim hover:text-cream transition-colors hidden sm:inline-block"
            style={{
              borderColor: `${product.colorHex}40`,
            }}
          >
            🌸 香り診断
          </a>
          <a
            href="https://tiby.me/layering"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[2px] uppercase px-4 py-2.5 border border-cream/20 text-cream-dim hover:text-cream transition-colors hidden sm:inline-block"
          >
            ✨ レイヤリング
          </a>
          <a
            href="https://tiby.me/stores"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[3px] uppercase px-6 py-2.5 transition-all"
            style={{ background: product.colorHex, color: "#1a0a0a" }}
          >
            今すぐ購入 →
          </a>
        </div>
      </div>
    </div>
  );
}
