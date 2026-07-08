import type { Metadata } from "next";
import Link from "next/link";
import { isTodo, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ — Tiby",
  description: `${siteConfig.brandName} ヘアパフュームに関するお問い合わせはこちら。`,
};

export default function ContactPage() {
  const email = siteConfig.customerSupportEmail;
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner t-contact">
        <div className="t-static-head">
          <div className="t-eyebrow">Contact</div>
          <h1 className="t-h2-jp">お問い合わせ</h1>
          <p className="t-static-lead">
            商品・ご注文・配送・返品交換に関するお問い合わせは、下記メールアドレスまでご連絡ください。
          </p>
        </div>

        <div className="t-contact-card">
          <div className="t-contact-label">メールでのお問い合わせ</div>
          <a className="t-contact-email" href={`mailto:${email}`}>
            {email}
          </a>
          <a className="t-cta" href={`mailto:${email}?subject=${encodeURIComponent("【Tiby】お問い合わせ")}`}>
            メールを作成する
          </a>
          {!isTodo(siteConfig.businessHours) && (
            <p className="t-contact-hours">対応時間：{siteConfig.businessHours}</p>
          )}
          <p className="t-contact-note">
            ご注文に関するお問い合わせの際は、ご注文時のお名前とメールアドレスをご記載いただくと、確認がスムーズです。通常2〜3営業日以内にご返信いたします。
          </p>
        </div>

        <div className="t-contact-links">
          <Link href="/legal/tokushoho">特定商取引法に基づく表記</Link>
          <Link href="/legal/privacy">プライバシーポリシー</Link>
        </div>
      </div>
    </div>
  );
}
