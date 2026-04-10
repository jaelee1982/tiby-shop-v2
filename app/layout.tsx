import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-sans",
  display: "swap",
});

const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TIBY — Hair Perfume",
  description:
    "香水が決めすぎるけど、これはズルい。TIBY Hair Perfume ¥999 — 30ml. 全国ドン・キホーテ219店舗にて発売中。",
  openGraph: {
    title: "TIBY — Hair Perfume",
    description: "すれ違った瞬間の、ズルい残り香。¥999 · 30ml",
    url: "https://tiby.shop",
    siteName: "TIBY",
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
    <html
      lang="ja"
      className={`${cormorant.variable} ${josefin.variable} ${zenMaru.variable}`}
    >
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
