"use client";
// 쿠폰 표(1/3/5/10 → ¥100/200/300/500)와 회원의 수령 상태. 클릭 시 onClaim(milestone). 코드는 탭하면 복사.
import { useState } from "react";
import { couponSlots } from "@/lib/quest";
import type { CouponRow } from "@/lib/questApi";

const STATUS_JA: Record<string, string> = { active: "利用可能", reserved: "お会計中", redeemed: "使用済み", expired: "期限切れ", void: "無効" };
const fmt = (iso: string) => { const d = new Date(iso); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`; };

export function CouponList({ coupons, count, onClaim, busy }: { coupons: CouponRow[]; count: number; onClaim?: (n: number) => void; busy?: number | null }) {
  const [copied, setCopied] = useState<string | null>(null);
  const slots = couponSlots(count, coupons);
  return (
    <ul className="t-coupons" data-testid="coupon-list">
      {slots.map((s) => {
        const row = coupons.find((c) => c.milestone === s.n);
        return (
          <li key={s.n} className={`t-coupon is-${s.state}${row?.status && row.status !== "active" ? " is-used" : ""}`} data-testid={`coupon-${s.n}`}>
            <div className="t-coupon-amt">¥{s.jpy}<span>OFF</span></div>
            <div className="t-coupon-body">
              <div className="t-coupon-title">スタンプ{s.n}個</div>
              {s.state === "claimed" && row ? (
                <>
                  <button type="button" className="t-coupon-code" onClick={() => { navigator.clipboard?.writeText(row.code).then(() => setCopied(row.code)).catch(() => {}); }} title="タップでコピー">{row.code}{copied === row.code ? " ✓" : ""}</button>
                  <div className="t-coupon-meta">{STATUS_JA[row.status] ?? row.status} · {fmt(row.expires_at)}まで</div>
                </>
              ) : s.state === "claimable" ? (
                onClaim ? <button type="button" className="t-cta t-cta-sm" onClick={() => onClaim(s.n)} disabled={busy === s.n}>{busy === s.n ? "発行中..." : "クーポンを受け取る"}</button> : <div className="t-coupon-meta">受け取り可能（クエストのスタンプ帳から）</div>
              ) : (
                <div className="t-coupon-meta">あと{s.n - count}店舗</div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
