import type { Metadata } from "next";
import { privacyPolicy } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー — Tiby",
  description: `${siteConfig.brandName}（${siteConfig.companyLegalName}）のプライバシーポリシーです。`,
};

export default function PrivacyPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner">
        <div className="t-static-head">
          <div className="t-eyebrow">Legal</div>
          <h1 className="t-h2-jp">プライバシーポリシー</h1>
          <p className="t-static-lead">
            {siteConfig.companyLegalName}
            は、お客様の個人情報を以下の方針に基づき適切に取り扱います。
          </p>
        </div>

        <div className="t-policy">
          {privacyPolicy.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <p className="t-static-updated">最終更新日：2026年7月8日</p>
      </div>
    </div>
  );
}
