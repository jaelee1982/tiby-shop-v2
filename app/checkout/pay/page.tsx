import type { Metadata } from "next";
import { PayClient } from "./PayClient";
export const metadata: Metadata = { title: "お支払い — Tiby", robots: { index: false } };
// Eximbay SDK 호출 페이지 — /api/checkout 응답(fgkey·params·sdkUrl)을 sessionStorage 로 받아 request_pay 실행. 실패/취소 복귀 시 안내.
export default function PayPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-static-inner t-complete"><PayClient /></div>
    </div>
  );
}
