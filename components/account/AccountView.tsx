"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthPanel, SignOutButton, useSession } from "@/components/account/AuthPanel";
import { myStatus, type CouponRow } from "@/lib/questApi";
import { CouponList } from "@/components/quest/CouponList";

export function AccountView() {
  const { session, ready } = useSession();
  const [status, setStatus] = useState<{ count: number; coupons: CouponRow[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!session) { return; }
    let alive = true;
    myStatus().then((s) => { if (alive) { if (s.ok) setStatus({ count: s.count, coupons: s.coupons }); else setErr("情報を取得できませんでした。"); } }).catch(() => { if (alive) setErr("情報を取得できませんでした。"); });
    return () => { alive = false; };
  }, [session]);
  if (!ready) return <p className="t-quest-hint">読み込み中...</p>;
  if (!session) return <AuthPanel reason="会員登録（無料）でTIBY Questのクーポンを受け取れます。" />;
  return (
    <div className="t-account">
      <p className="t-account-who"><b>{session.user.email}</b> でログイン中 · <SignOutButton /></p>
      <section className="t-account-sec">
        <h2>クーポン</h2>
        {err && <p className="t-quest-notice">{err}</p>}
        {status && <CouponList coupons={status.coupons} count={status.count} />}
        <p className="t-quest-hint">クーポンはtiby.shopのお会計（カート）でコードを入力してご利用ください。有効期限は発行から60日です。</p>
      </section>
      <section className="t-account-sec">
        <h2>TIBY Quest</h2>
        <p className="t-quest-hint">全国のドン・キホーテを巡ってスタンプを集めると、1・3・5・10店舗でクーポンがもらえます。</p>
        <Link className="t-cta-ghost" href="/quest">クエストへ</Link>
      </section>
    </div>
  );
}
