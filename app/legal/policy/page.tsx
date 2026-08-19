import type { Metadata } from "next";
import { shopPolicy } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "キャンセル・返品・交換・配送ポリシー — Tiby",
  description: `${siteConfig.brandName}（${siteConfig.companyLegalName}）公式オンラインストアのキャンセル・返品・交換・配送ポリシーです。`,
};

export default function ShopPolicyPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner">
        <div className="t-static-head">
          <div className="t-eyebrow">Legal</div>
          <h1 className="t-h2-jp">キャンセル・返品・交換・配送ポリシー</h1>
          <p className="t-static-lead">
            {siteConfig.brandName}
            公式オンラインストアでは、お客様に安心してお買い物をお楽しみいただけるよう、以下のポリシーを定めております。
          </p>
        </div>

        <div className="t-policy">
          {shopPolicy.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <p className="t-static-updated">最終更新日：2026年8月19日</p>
      </div>
    </div>
  );
}
