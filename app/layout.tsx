import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Fonts (Jost · Montserrat · Noto Serif/Sans JP) are loaded via the design-system
// @import in globals.css — see TIBY Design System colors_and_type.css §4.2.

export const metadata: Metadata = {
  title: "Tiby — Hair Perfume",
  description:
    "香りが決めすぎるけど、これはズルい。Tiby Hair Perfume ¥999（税込）— 全国ドン・キホーテにて発売中。",
  openGraph: {
    title: "Tiby — Hair Perfume",
    description: "すれ違った瞬間の、ズルい残り香。¥999（税込）",
    url: "https://tiby.shop",
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
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
