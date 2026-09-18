import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = { title: "ご注文手続き — Tiby", robots: { index: false, follow: false } };

// 결제 전 페이지: 配送先 → お支払い方法 → 注文内容(送料・クーポン) 확인 → POST /api/checkout → Eximbay(/checkout/pay).
// 카트 드로어의 「レジに進む」가 여기로 온다. 금액은 화면 미리보기일 뿐, 청구액은 서버(lib/commerce + lib/shipping)가 재계산.
export default function CheckoutPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner t-checkout-inner">
        <div className="t-static-head">
          <div className="t-eyebrow">Checkout</div>
          <h1 className="t-h2-jp">ご注文手続き</h1>
        </div>
        <CheckoutClient />
      </div>
    </div>
  );
}
