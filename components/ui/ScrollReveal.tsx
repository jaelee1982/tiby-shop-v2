"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/animations";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: fadeUp.hidden,
        visible: {
          ...((typeof fadeUp.visible === "object" && fadeUp.visible) || {}),
          transition: {
            duration: 0.8,
            ease: [0.23, 1, 0.32, 1],
            delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
