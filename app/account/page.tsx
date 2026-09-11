import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = { title: "マイページ — Tiby", robots: { index: false, follow: false } };

// 회원 마이페이지: 로그인(이메일 OTP) / 내 쿠폰 / 퀘스트 스탬프 수. 프리런치 — 내비 미노출(퀘스트·카트에서 진입).
export default function AccountPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner">
        <div className="t-static-head">
          <div className="t-eyebrow">Members</div>
          <h1 className="t-h2-jp">マイページ</h1>
        </div>
        <AccountView />
      </div>
    </div>
  );
}
