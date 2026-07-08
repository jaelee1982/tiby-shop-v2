"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import type { CatalogItemId } from "@/lib/commerce";

// Primary purchase CTA with a brief "added" confirmation state.
export function AddToCartButton({
  id,
  qty = 1,
  label = "カートに入れる",
  className = "t-cta",
}: {
  id: CatalogItemId;
  qty?: number;
  label?: string;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleClick() {
    add(id, qty);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button className={`${className} ${added ? "t-cta-added" : ""}`} onClick={handleClick}>
      {added ? "カートに追加しました ✓" : label}
    </button>
  );
}
