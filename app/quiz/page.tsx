import type { Metadata } from "next";
import { QuizFlow } from "@/components/scent/QuizFlow";

// 구 tiby.me/quiz(볼트 SPA)를 자체 페이지로 이관 — netlify.toml 프록시 제거됨.
export const metadata: Metadata = {
  title: "香り診断 | Tiby — Hair Perfume",
  description:
    "5つの質問で、あなたにぴったりのTIBYヘアパフュームがわかる香り診断。LOVE・HUG・KISS ME ME から運命の香りを。",
  openGraph: {
    title: "TIBY 香り診断",
    description: "5つの質問で、わたしにぴったりの香りがわかる。",
  },
};

export default function QuizPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-tool-inner" style={{ maxWidth: 720 }}>
        <div className="t-tool-head">
          <div className="t-eyebrow">Scent quiz</div>
          <h1 className="t-h2-jp">香り診断</h1>
          <p className="t-tool-lead">
            5つの質問に答えるだけで、あなたにぴったりのTIBYがわかります。
          </p>
        </div>
        <QuizFlow />
      </div>
    </div>
  );
}
