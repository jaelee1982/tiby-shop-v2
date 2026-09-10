import type { Metadata } from "next";
import { QuestApp } from "@/components/quest/QuestApp";

// TIBY Quest — 돈키 매장 찾아가기 게임 (Phase 2 화면). 프리런치: 내비 미노출·검색 미등록(robots noindex) — 대표 에셋 승인·보상 확정 후 공개.
export const metadata: Metadata = {
  title: "TIBY Quest | Tiby — Hair Perfume",
  description: "全国のドン・キホーテでTIBYを探そう。最寄り駅から歩いて、店舗の前でチェックイン。スタンプを集めて称号をゲット。",
  robots: { index: false, follow: false },
};

export default function QuestPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-tool-inner" style={{ maxWidth: 760 }}>
        <QuestApp />
      </div>
    </div>
  );
}
