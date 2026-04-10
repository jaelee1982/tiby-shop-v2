import { notFound } from "next/navigation";
import { products, getProduct } from "@/lib/products";
import type { Metadata } from "next";
import { ProductPageClient } from "./ProductPageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — TIBY Hair Perfume`,
    description: product.tagline.replace("\n", " "),
    openGraph: {
      title: `${product.name} — TIBY`,
      description: product.tagline.replace("\n", " "),
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const otherProducts = products.filter((p) => p.slug !== slug);

  return <ProductPageClient product={product} otherProducts={otherProducts} />;
}
