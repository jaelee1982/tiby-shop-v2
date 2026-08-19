import type { Metadata } from "next";
import { termsOfService } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "利用規約 — Tiby",
  description: `${siteConfig.brandName}（${siteConfig.companyLegalName}）公式オンラインストアの利用規約です。`,
};

export default function TermsPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner">
        <div className="t-static-head">
          <div className="t-eyebrow">Legal</div>
          <h1 className="t-h2-jp">利用規約</h1>
          <p className="t-static-lead">
            本サイトをご利用いただくことにより、本規約に同意したものとみなされます。
          </p>
        </div>

        <div className="t-policy">
          {termsOfService.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <p className="t-static-updated">制定日：2026年8月19日</p>
      </div>
    </div>
  );
}
