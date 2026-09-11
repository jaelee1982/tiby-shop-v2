import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ClearCartOnMount } from "./ClearCartOnMount";

export const metadata: Metadata = {
  title: "ご注文ありがとうございます — Tiby",
  robots: { index: false },
};

// Eximbay return → /api/payments/eximbay/return 이 검증 후 여기로 (?order=). mock 모드는 바로 이동.
export default function CheckoutCompletePage() {
  return (
    <div className="t-page t-static-page">
      <ClearCartOnMount />
      <div className="t-static-inner t-complete">
        <div className="t-complete-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="t-h2-jp">ご注文ありがとうございます</h1>
        <p className="t-static-lead">
          お支払いの確認ができ次第、ご注文の確認メールをお送りいたします。
          <br />
          メールが届かない場合は、お手数ですが{" "}
          <a href={`mailto:${siteConfig.customerSupportEmail}`}>{siteConfig.customerSupportEmail}</a>{" "}
          までご連絡ください。
        </p>
        <div className="t-complete-actions">
          <Link className="t-cta" href="/">
            トップに戻る
          </Link>
          <Link className="t-link-quiet" href="/contact">
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  );
}
