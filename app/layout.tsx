import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { siteConfig } from "@/lib/site";

// Fonts (Jost · Montserrat · Noto Serif/Sans JP) are loaded via the design-system
// @import in globals.css — see TIBY Design System colors_and_type.css §4.2.

export const metadata: Metadata = {
  title: "Tiby — Hair Perfume（ヘアパフューム）",
  description: `${siteConfig.masterCopy} Tiby Hair Perfume ¥999（税抜）／税込 ¥1,099 — 公式オンラインストア・全国ドン・キホーテにて発売中。`,
  openGraph: {
    title: "Tiby — Hair Perfume",
    description: "すれ違った瞬間の、ズルい残り香。¥999（税抜）／税込 ¥1,099",
    url: siteConfig.siteUrl,
    siteName: "Tiby",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@tiby_japan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
