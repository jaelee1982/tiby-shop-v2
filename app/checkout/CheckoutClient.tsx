"use client";

// 注文手続き — 配送先フォーム + お支払い方法 + 注文内容サマリー(送料・クーポン) → /api/checkout.
// 응답: mock → redirectUrl / test·live → fgkey 를 sessionStorage 에 두고 /checkout/pay 에서 Eximbay SDK 호출.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { formatJpy, getCatalogItem, taxIncluded } from "@/lib/commerce";
import { applyCoupon, COUPON_TABLE } from "@/lib/quest";
import { PAYMENT_METHODS, PREFECTURES, convenienceEnabled, shippingFee, validateShipping, type PaymentMethod, type ShippingAddress } from "@/lib/shipping";
import { useSession } from "@/components/account/AuthPanel";
import { PAY_KEY } from "@/app/checkout/pay/PayClient";

type Form = Record<keyof ShippingAddress, string>;
const EMPTY_FORM: Form = { name: "", postal: "", prefecture: "", city: "", building: "", phone: "", email: "" };
const FORM_KEY = "tiby_checkout_form_v1"; // 배송지는 端末 localStorage 에만(재입력 방지) — 서버 저장은 주문 시.

export function CheckoutClient() {
  const { lines, total: subtotal, open: openCart } = useCart();
  const { session } = useSession();
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [coupon, setCoupon] = useState("");
  const [couponOn, setCouponOn] = useState<{ code: string; jpy: number } | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const conveniOn = convenienceEnabled(); // NEXT_PUBLIC_* 는 빌드 시 인라인 — 서버/클라 동일값

  useEffect(() => {
    let saved: Partial<Form> | null = null;
    try { saved = JSON.parse(localStorage.getItem(FORM_KEY) || "null"); } catch { saved = null; }
    queueMicrotask(() => {
      if (saved && typeof saved === "object") setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(saved!).filter(([k, v]) => k in EMPTY_FORM && typeof v === "string")) }));
      setHydrated(true);
    });
  }, []);
  // 로그인 회원의 메일은 입력 전까지 자동 채움(효과 아님 — 렌더 시 파생).
  const emailValue = form.email || session?.user.email || "";

  const fee = useMemo(() => shippingFee(form.prefecture || null), [form.prefecture]);
  const preview = couponOn ? applyCoupon(subtotal, couponOn.jpy) : { discount: 0, total: subtotal };
  const grand = preview.total + fee;

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => { const next = { ...f, [k]: v }; try { localStorage.setItem(FORM_KEY, JSON.stringify(next)); } catch { /* 저장 불가 */ } return next; });
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function applyCouponCode() {
    const c = coupon.trim().toUpperCase();
    if (!/^TIBY-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)) { setError("クーポンコードの形式を確認してください。"); return; }
    setError(null);
    setCouponOn({ code: c, jpy: COUPON_TABLE[0].jpy });
  }

  async function submit() {
    setError(null);
    setErrorDetail(null);
    const v = validateShipping({ ...form, email: emailValue });
    if (!v.ok) { setErrors(v.errors); setError("入力内容をご確認ください。"); document.querySelector<HTMLElement>(".t-co-field.is-error input, .t-co-field.is-error select")?.focus(); return; }
    if (!agree) { setError("利用規約・返品ポリシーへの同意が必要です。"); return; }
    setBusy(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const res = await fetch("/api/checkout", {
        method: "POST", headers,
        body: JSON.stringify({ lines, shipping: v.value, paymentMethod: method, coupon: couponOn?.code || undefined, email: v.value.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "決済ページへ進めませんでした。時間をおいて再度お試しください。");
        setErrorDetail(typeof data.detail === "string" ? data.detail : null);
        setBusy(false);
        return;
      }
      if (data.fgkey) {
        try { sessionStorage.setItem(PAY_KEY, JSON.stringify({ orderId: data.orderId, fgkey: data.fgkey, params: data.params, sdkUrl: data.sdkUrl })); } catch { /* pay 페이지가 안내 */ }
      }
      window.location.href = data.redirectUrl;
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
      setBusy(false);
    }
  }

  if (hydrated && lines.length === 0) {
    return (
      <div className="t-co-empty">
        <p>カートは空です。</p>
        <Link className="t-cta t-cta-sm" href="/">商品を見る</Link>
      </div>
    );
  }

  const field = (k: keyof ShippingAddress, label: string, input: React.ReactNode, hint?: string) => (
    <div className={`t-co-field ${errors[k] ? "is-error" : ""}`}>
      <label htmlFor={`co-${k}`}>{label}{k !== "building" && <span className="t-co-req">必須</span>}</label>
      {input}
      {errors[k] ? <p className="t-co-error" role="alert">{errors[k]}</p> : hint ? <p className="t-co-hint">{hint}</p> : null}
    </div>
  );

  return (
    <div className="t-checkout">
      <div className="t-co-main">
        <section className="t-co-section" aria-labelledby="co-ship">
          <h2 id="co-ship" className="t-co-title"><span>1</span>配送先</h2>
          {field("name", "お名前", <input id="co-name" className="t-co-input" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="山田 花子" />)}
          {field("postal", "郵便番号", <input id="co-postal" className="t-co-input t-co-input-short" inputMode="numeric" autoComplete="postal-code" value={form.postal} onChange={(e) => set("postal", e.target.value)} placeholder="1500001" />, "ハイフンなし7桁")}
          {field("prefecture", "都道府県", (
            <select id="co-prefecture" className="t-co-input t-co-select" autoComplete="address-level1" value={form.prefecture} onChange={(e) => set("prefecture", e.target.value)}>
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          ))}
          {field("city", "市区町村・番地", <input id="co-city" className="t-co-input" autoComplete="address-level2 street-address" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="渋谷区神宮前1-2-3" />)}
          {field("building", "建物名・部屋番号", <input id="co-building" className="t-co-input" value={form.building} onChange={(e) => set("building", e.target.value)} placeholder="〇〇マンション 101" />)}
          {field("phone", "電話番号", <input id="co-phone" className="t-co-input t-co-input-short" inputMode="tel" autoComplete="tel-national" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09012345678" />, "ハイフンなし・配送時のご連絡に使用します")}
          {field("email", "メールアドレス", <input id="co-email" className="t-co-input" type="email" inputMode="email" autoComplete="email" value={emailValue} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />, "ご注文確認メールをお送りします")}
        </section>

        <section className="t-co-section" aria-labelledby="co-pay">
          <h2 id="co-pay" className="t-co-title"><span>2</span>お支払い方法</h2>
          <div className="t-co-methods" role="radiogroup" aria-labelledby="co-pay">
            {PAYMENT_METHODS.map((m) => {
              const disabled = m.id === "convenience" && !conveniOn;
              return (
                <label key={m.id} className={`t-co-method ${method === m.id ? "is-on" : ""} ${disabled ? "is-disabled" : ""}`} aria-disabled={disabled}>
                  <input type="radio" name="pay" value={m.id} checked={method === m.id} disabled={disabled} onChange={() => setMethod(m.id)} />
                  <span className="t-co-method-body"><b>{m.label}{disabled && <em className="t-co-soon">近日対応予定</em>}</b><small>{disabled ? "現在お手続き中です。ご利用開始までしばらくお待ちください。" : m.note}</small></span>
                </label>
              );
            })}
          </div>
          <p className="t-co-hint">お支払いは決済代行サービス Eximbay の安全な決済画面で行います。カード番号等が当社に保存されることはありません。</p>
        </section>
      </div>

      <aside className="t-co-summary" aria-labelledby="co-sum">
        <h2 id="co-sum" className="t-co-title"><span>3</span>注文内容</h2>
        <ul className="t-co-lines">
          {lines.map((line) => {
            const item = getCatalogItem(line.id);
            if (!item) return null;
            return (
              <li key={line.id} className="t-co-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} />
                <div className="t-co-line-info">
                  <div className="t-co-line-name">{item.name}</div>
                  <div className="t-co-line-sub">{item.nameJa} · {item.volume} × {line.qty}</div>
                </div>
                <div className="t-co-line-price">{formatJpy(taxIncluded(item.price) * line.qty)}</div>
              </li>
            );
          })}
        </ul>
        <button type="button" className="t-link-quiet t-co-edit" onClick={openCart}>カートを編集する</button>

        <div className="t-co-coupon">
          <input aria-label="クーポンコード" placeholder="クーポンコード（TIBY-XXXX-XXXX）" value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponOn(null); }} disabled={!session} />
          <button type="button" onClick={applyCouponCode} disabled={!session || !coupon.trim()}>適用</button>
        </div>
        <p className="t-co-hint">{session ? "TIBY Questのクーポンはお会計時に自動で金額が確定します。" : <>クーポンのご利用には<Link href="/account">ログイン</Link>が必要です。</>}</p>

        <dl className="t-co-totals">
          <div><dt>小計（税込）</dt><dd>{formatJpy(subtotal)}</dd></div>
          {couponOn && <div className="is-discount"><dt>クーポン {couponOn.code}</dt><dd>−{formatJpy(preview.discount)}</dd></div>}
          <div><dt>送料{form.prefecture ? `（${form.prefecture}）` : ""}</dt><dd>{formatJpy(fee)}</dd></div>
          <div className="is-grand"><dt>お支払い合計</dt><dd>{formatJpy(grand)}</dd></div>
        </dl>
        <p className="t-co-hint">送料：全国一律 ¥350（北海道・沖縄 ¥400）。ご注文後1〜2営業日以内に日本国内の倉庫より発送します。</p>

        <label className="t-co-agree">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span><Link href="/legal/terms" target="_blank" rel="noopener noreferrer">利用規約</Link>・<Link href="/legal/policy" target="_blank" rel="noopener noreferrer">キャンセル・返品・交換・配送ポリシー</Link>・<Link href="/legal/privacy" target="_blank" rel="noopener noreferrer">プライバシーポリシー</Link>に同意する</span>
        </label>
        {error && <p className="t-cart-error" role="alert">{error}{errorDetail && <><br /><small className="t-co-error-detail">{errorDetail}</small></>}</p>}
        <button type="button" className="t-cta t-cta-block" onClick={submit} disabled={busy} data-testid="checkout-submit">
          {busy ? "決済画面へ移動中…" : `${formatJpy(grand)} を支払う`}
        </button>
        <p className="t-cart-secure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          Eximbayによる安全な決済 · <Link href="/legal/tokushoho">特定商取引法に基づく表記</Link>
        </p>
      </aside>
    </div>
  );
}
