import { notFound } from "next/navigation";
import { products, getProduct } from "@/lib/products";
import type { Metadata } from "next";
import { compactPrice, type SingleItemId } from "@/lib/commerce";
import { ProductPageClient } from "./ProductPageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const description = `${product.tagline.replace("\n", " ")} 公式オンラインストア価格：${compactPrice(slug as SingleItemId)}。`;
  return {
    title: `${product.name} — TIBY Hair Perfume`,
    description,
    openGraph: {
      title: `${product.name} — TIBY`,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return <ProductPageClient slug={slug} />;
}
