// Cart store — module-level external store consumed via useSyncExternalStore.
// Persists to localStorage and follows changes from other tabs. Lines hold only
// { id, qty }; prices always resolve through lib/commerce.ts (and are
// re-validated server-side at checkout).
import { getCatalogItem, type CartLine, type CatalogItemId } from "@/lib/commerce";

const STORAGE_KEY = "tiby-cart-v1";
const EMPTY: CartLine[] = [];
const MAX_QTY = 99;

let lines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // storage unavailable (private mode etc.) — cart still works in-memory
  }
}

function parseLines(raw: string | null): CartLine[] {
  try {
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).id === "string" &&
        getCatalogItem((l as CartLine).id) !== undefined &&
        Number.isInteger((l as CartLine).qty) &&
        (l as CartLine).qty > 0 &&
        (l as CartLine).qty <= MAX_QTY,
    );
    return valid.length ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function hydrateOnce() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const stored = parseLines(window.localStorage.getItem(STORAGE_KEY));
  if (stored !== EMPTY) {
    lines = stored;
    emit();
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    lines = parseLines(e.newValue);
    emit();
  });
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  hydrateOnce();
  return () => listeners.delete(listener);
}

export function getCartSnapshot(): CartLine[] {
  return lines;
}

export function getCartServerSnapshot(): CartLine[] {
  return EMPTY;
}

function setLines(next: CartLine[]) {
  lines = next;
  persist();
  emit();
}

export function cartAdd(id: CatalogItemId, qty = 1) {
  const existing = lines.find((l) => l.id === id);
  setLines(
    existing
      ? lines.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l))
      : [...lines, { id, qty: Math.min(qty, MAX_QTY) }],
  );
}

export function cartSetQty(id: CatalogItemId, qty: number) {
  setLines(
    qty <= 0
      ? lines.filter((l) => l.id !== id)
      : lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)),
  );
}

export function cartRemove(id: CatalogItemId) {
  setLines(lines.filter((l) => l.id !== id));
}

export function cartClear() {
  // Always persist, even before hydration — clearing must beat a later
  // hydrateOnce() restoring stale storage (checkout-complete mounts child-first).
  setLines(EMPTY);
}
