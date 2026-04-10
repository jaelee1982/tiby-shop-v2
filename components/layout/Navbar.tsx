"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { href: "/#shop", label: "Shop" },
  { href: "/#about", label: "About" },
  { href: "https://tiby.me/stores", label: "Stores", external: true },
  { href: "https://tiby.me", label: "Quiz", external: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-500 ${
        scrolled
          ? "bg-bg/85 backdrop-blur-xl border-b border-cream-faint"
          : "mix-blend-difference"
      }`}
    >
      <Link
        href="/"
        className="font-serif font-light text-[22px] tracking-[6px] text-cream no-underline"
      >
        Tiby
      </Link>

      <ul className="hidden md:flex gap-9 list-none">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] tracking-[2.5px] uppercase text-cream-dim hover:text-cream transition-colors duration-300"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[11px] tracking-[2.5px] uppercase text-cream-dim hover:text-cream transition-colors duration-300"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
