import type { Metadata } from "next";
import { tokushoho } from "@/lib/legal";
import { isTodo, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 — Tiby",
  description: `${siteConfig.brandName}（${siteConfig.companyLegalName}）の特定商取引法に基づく表記です。`,
};

// Splits a value into text / TODO-highlight segments so unfilled placeholders
// stay clearly visible to the owner (and to payment reviewers) until replaced.
function ValueText({ value }: { value: string }) {
  const idx = value.indexOf("TODO:");
  if (idx === -1) return <>{value}</>;
  if (idx === 0) return <mark className="t-todo">{value}</mark>;
  return (
    <>
      {value.slice(0, idx)}
      <mark className="t-todo">{value.slice(idx)}</mark>
    </>
  );
}

export default function TokushohoPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner">
        <div className="t-static-head">
          <div className="t-eyebrow">Legal</div>
          <h1 className="t-h2-jp">特定商取引法に基づく表記</h1>
        </div>

        <table className="t-legal-table">
          <tbody>
            {tokushoho.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>
                  {row.label === "メールアドレス" && !isTodo(row.value) ? (
                    <a href={`mailto:${row.value}`}>{row.value}</a>
                  ) : (
                    <ValueText value={row.value} />
                  )}
                  {row.note && <p className="t-legal-note">{row.note}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="t-static-updated">最終更新日：2026年7月8日</p>
      </div>
    </div>
  );
}
