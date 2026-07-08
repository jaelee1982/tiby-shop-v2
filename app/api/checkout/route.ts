import { NextResponse } from "next/server";
import { cartTotal, getCatalogItem, taxIncluded, type CartLine } from "@/lib/commerce";
import { siteConfig } from "@/lib/site";

// Creates a KOMOJU hosted-checkout session and returns its redirect URL.
// The client only sends { id, qty } lines; amounts are recomputed here from
// lib/commerce.ts so the charged total can never be tampered with.
//
// Required env: KOMOJU_SECRET_KEY (sk_...) — from the KOMOJU merchant dashboard.
// Optional env: KOMOJU_API_URL (defaults to https://komoju.com/api/v1),
//               NEXT_PUBLIC_SITE_URL (return_url base; falls back to request origin).

const KOMOJU_API_URL = process.env.KOMOJU_API_URL || "https://komoju.com/api/v1";

type CheckoutBody = { lines?: unknown; email?: unknown };

function sanitizeLines(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) return null;
  const lines: CartLine[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) return null;
    const { id, qty } = raw as { id?: unknown; qty?: unknown };
    if (typeof id !== "string" || !getCatalogItem(id)) return null;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 99) return null;
    lines.push({ id: id as CartLine["id"], qty });
  }
  return lines;
}

export async function POST(request: Request) {
  const secretKey = process.env.KOMOJU_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "オンライン決済は現在準備中です。恐れ入りますが、しばらくお待ちください。" },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const lines = sanitizeLines(body.lines);
  if (!lines) {
    return NextResponse.json({ error: "カートの内容が不正です。" }, { status: 400 });
  }

  const amount = cartTotal(lines);
  if (amount <= 0) {
    return NextResponse.json({ error: "カートが空です。" }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin || siteConfig.siteUrl;
  const orderNum = `tiby-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const items = lines.map((l) => {
    const item = getCatalogItem(l.id)!;
    return { sku: item.sku, name: item.name, qty: l.qty, unit_price_tax_in: taxIncluded(item.price) };
  });

  try {
    const res = await fetch(`${KOMOJU_API_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount,
        currency: "JPY",
        default_locale: "ja",
        external_order_num: orderNum,
        return_url: `${origin}/checkout/complete`,
        metadata: {
          order_num: orderNum,
          items: JSON.stringify(items),
        },
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.session_url) {
      console.error("KOMOJU session error:", res.status, JSON.stringify(data));
      return NextResponse.json(
        { error: "決済セッションを作成できませんでした。時間をおいて再度お試しください。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ redirectUrl: data.session_url, sessionId: data.id });
  } catch (e) {
    console.error("KOMOJU request failed:", e);
    return NextResponse.json(
      { error: "決済サービスに接続できませんでした。時間をおいて再度お試しください。" },
      { status: 502 },
    );
  }
}
