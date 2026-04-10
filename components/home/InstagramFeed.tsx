"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Post = {
  id: string;
  caption: string;
  mediaType: string;
  imageUrl: string | null;
  permalink: string;
  timestamp: string;
  likes: number;
};

export function InstagramFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) {
          setPosts(data.posts.filter((p: Post) => p.imageUrl));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-[120px] px-6 md:px-12 bg-surface">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-[11px] tracking-[5px] uppercase text-cream/35">
            Loading Instagram...
          </p>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  return (
    <section className="py-20 md:py-[120px] px-6 md:px-12 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 md:mb-16">
            <div>
              <p className="text-[11px] tracking-[5px] uppercase text-cream/35 mb-4">
                Instagram
              </p>
              <h2
                className="font-serif font-light tracking-tight"
                style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
              >
                @tibyjapan
              </h2>
            </div>
            <a
              href="https://www.instagram.com/tibyjapan/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 md:mt-0 text-xs tracking-[2px] text-cream-dim hover:text-love transition-colors group"
            >
              Follow on Instagram
              <span className="inline-block ml-1 transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {posts.slice(0, 8).map((post, i) => (
            <motion.a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative aspect-square overflow-hidden group"
            >
              <Image
                src={post.imageUrl!}
                alt={post.caption || "Instagram post"}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
                unoptimized
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                <span className="text-cream text-sm mb-1">♥ {post.likes}</span>
                <p className="font-jp text-[10px] text-cream/70 px-4 text-center line-clamp-2">
                  {post.caption}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
