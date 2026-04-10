"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const CDN = "https://cdn.shopify.com/s/files/1/0948/3173/9160/files";

const scenes = [
  {
    image: `${CDN}/Tiby_tokyo_subway_kiss_meme.png`,
    title: "すれ違う瞬間",
    category: "Commute",
    color: "#A99FCC",
    position: "center",
  },
  {
    image: `${CDN}/tiby_cafe_hug_meme_lunch_after.png`,
    title: "ひとりの午後",
    category: "Daily",
    color: "#6DBFBA",
    position: "center top",
  },
  {
    image: `${CDN}/kiss_me_me_restaurant.jpg`,
    title: "特別な夜",
    category: "Night Out",
    color: "#A99FCC",
    position: "center",
  },
  {
    image: `${CDN}/love-me-me-scene-weekend.png`,
    title: "お出かけの日",
    category: "Weekend",
    color: "#F0906E",
    position: "center top",
  },
];

export function SceneGallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5 bg-bg">
      {scenes.map((scene, i) => (
        <motion.div
          key={scene.category}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="relative overflow-hidden aspect-[3/4] group"
        >
          <Image
            src={scene.image}
            alt={scene.title}
            fill
            className="object-cover saturate-[0.7] group-hover:saturate-100 group-hover:scale-105 transition-all duration-700"
            style={{ objectPosition: scene.position }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/75 to-transparent">
            <span className="font-serif text-lg font-light italic text-cream/90 block mb-1">
              {scene.title}
            </span>
            <span className="flex items-center gap-2 text-[10px] tracking-[4px] uppercase text-cream/55">
              <i
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: scene.color }}
              />
              {scene.category}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
