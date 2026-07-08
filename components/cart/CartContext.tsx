"use client";

// Cart context — subscribes to the external cart store (hydration-safe via
// useSyncExternalStore) and adds drawer open/close UI state.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { cartCount, cartTotal, type CartLine, type CatalogItemId } from "@/lib/commerce";
import {
  cartAdd,
  cartClear,
  cartRemove,
  cartSetQty,
  getCartServerSnapshot,
  getCartSnapshot,
  subscribeCart,
} from "@/components/cart/cartStore";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (id: CatalogItemId, qty?: number) => void;
  setQty: (id: CatalogItemId, qty: number) => void;
  remove: (id: CatalogItemId) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const add = useCallback((id: CatalogItemId, qty = 1) => {
    cartAdd(id, qty);
    setIsOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: cartCount(lines),
      total: cartTotal(lines),
      isOpen,
      open,
      close,
      add,
      setQty: cartSetQty,
      remove: cartRemove,
      clear: cartClear,
    }),
    [lines, isOpen, open, close, add],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
