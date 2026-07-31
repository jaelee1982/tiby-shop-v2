import type { Metadata } from "next";
import { LayeringLab } from "@/components/scent/LayeringLab";

// 구 tiby.me/layering(볼트 SPA)를 자체 페이지로 이관 — netlify.toml 프록시 제거됨.
export const metadata: Metadata = {
  title: "レイヤリング診断 | Tiby — Hair Perfume",
  description:
    "お手持ちの香水を入力すると、TIBYヘアパフュームとの相性とレイヤリングの方法がわかります。",
  openGraph: {
    title: "TIBY レイヤリング診断",
    description: "お手持ちの香水 × TIBY の相性をチェック。",
  },
};

export default function LayeringPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-tool-inner">
        <div className="t-tool-head">
          <div className="t-eyebrow">Layering lab</div>
          <h1 className="t-h2-jp">レイヤリング診断</h1>
          <p className="t-tool-lead">
            お手持ちの香水を入力して、TIBYとの相性をチェック。いつもの香水に重ねるだけで、あなただけの香りに。
          </p>
        </div>
        <LayeringLab />
      </div>
    </div>
  );
}
