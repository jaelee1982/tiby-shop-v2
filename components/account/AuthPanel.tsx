"use client";
// tiby.shop 회원 — 이메일 OTP(6자리 코드) 로그인/가입 한 폼. 비밀번호 없음. 세션 = Supabase Auth(localStorage).
// 사용처: /account, /quest 쿠폰 수령, 카트 쿠폰 입력. onDone 은 로그인 완료 시.
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";

export function useSession(): { session: Session | null; ready: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sb = supabaseBrowser();
    let alive = true;
    sb.auth.getSession().then(({ data }) => { if (alive) { setSession(data.session); setReady(true); } });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => { if (alive) setSession(s); });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return { session, ready };
}

export function AuthPanel({ compact, onDone, reason }: { compact?: boolean; onDone?: () => void; reason?: string }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);

  const sendCode = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setError("メールアドレスの形式を確認してください。"); return; }
    if (!agree) { setError("利用規約とプライバシーポリシーへの同意が必要です。"); return; }
    setBusy(true); setError(null);
    // 기본 메일 템플릿은 매직링크만 담는다 → 링크 클릭으로도 로그인되게 emailRedirectTo 지정. 6자리 코드는 템플릿에 {{ .Token }} 추가 시 동작.
    const { error: err } = await supabaseBrowser().auth.signInWithOtp({ email: e, options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}${window.location.pathname}` } });
    setBusy(false);
    if (err) { setError(err.message.includes("rate") ? "送信回数の上限に達しました。しばらくしてからお試しください。" : "コードを送信できませんでした。時間をおいて再度お試しください。"); return; }
    setStep("code");
  };
  const verify = async () => {
    const c = code.replace(/\D/g, "");
    if (c.length < 6) { setError("メールに届いた6桁のコードを入力してください。"); return; }
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().auth.verifyOtp({ email: email.trim().toLowerCase(), token: c, type: "email" });
    setBusy(false);
    if (err) { setError("コードが正しくないか、期限切れです。もう一度お試しください。"); return; }
    onDone?.();
  };

  return (
    <div className={`t-auth${compact ? " is-compact" : ""}`} data-testid="auth-panel">
      {reason && <p className="t-auth-reason">{reason}</p>}
      {step === "email" ? (
        <>
          <label className="t-auth-label" htmlFor="auth-email">メールアドレス</label>
          <input id="auth-email" type="email" inputMode="email" autoComplete="email" className="t-tool-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendCode()} />
          <label className="t-auth-agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> <span><a href="/legal/terms" target="_blank" rel="noopener noreferrer">利用規約</a>・<a href="/legal/privacy" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>に同意する</span></label>
          <button type="button" className="t-cta" onClick={sendCode} disabled={busy} data-testid="auth-send">{busy ? "送信中..." : "コードを送る（登録 / ログイン）"}</button>
          <p className="t-auth-hint">パスワードは不要です。入力したメールアドレスにログイン用のメールが届きます。初めての方はこれで会員登録が完了します。</p>
        </>
      ) : (
        <>
          <p className="t-auth-sent"><b>{email}</b> にメールを送りました。メール内のリンクを開くか、記載の6桁コードを入力してください。</p>
          <label className="t-auth-label" htmlFor="auth-code">6桁のコード</label>
          <input id="auth-code" inputMode="numeric" autoComplete="one-time-code" className="t-tool-input t-auth-code" placeholder="123456" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && verify()} />
          <button type="button" className="t-cta" onClick={verify} disabled={busy} data-testid="auth-verify">{busy ? "確認中..." : "ログイン"}</button>
          <button type="button" className="t-link-quiet t-auth-back" onClick={() => { setStep("email"); setCode(""); setError(null); }}>メールアドレスを変更する</button>
        </>
      )}
      {error && <p className="t-auth-error" role="alert">{error}</p>}
    </div>
  );
}

export function SignOutButton({ className = "t-link-quiet" }: { className?: string }) {
  return <button type="button" className={className} onClick={() => supabaseBrowser().auth.signOut()}>ログアウト</button>;
}
