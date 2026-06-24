"use client";

import { Storefront } from "@/components/home/Storefront";
import { SLUG_TO_SKU } from "@/lib/skus";

// The PDP and the storefront share one design-system layout; the product route
// just opens it with the requested SKU pre-selected.
export function ProductPageClient({ slug }: { slug: string }) {
  return <Storefront initialSku={SLUG_TO_SKU[slug] ?? "love"} />;
}
