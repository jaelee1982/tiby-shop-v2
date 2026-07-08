"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";

// After returning from KOMOJU hosted checkout, empty the local cart.
export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
