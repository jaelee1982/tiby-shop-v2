// 서버(API 라우트) 전용 Supabase 클라이언트 — service_role 키(Netlify 환경변수 SUPABASE_SERVICE_ROLE_KEY). RLS 우회.
// 미설정이면 null — 호출부는 503 으로 명확히 실패(anon 폴백 금지).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export function supabaseService(): SupabaseClient | null {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim(); // 붙여넣기 시 앞뒤 공백·줄바꿈 제거
  if (!key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** 서비스 키 진단(값 노출 없음): 종류(JWT role / sb_secret / sb_publishable)와 프로젝트 ref 가 이 사이트의 것인지. "Invalid API key" 원인 안내용. */
export function describeServiceKey(): string {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const expectedRef = SUPABASE_URL.replace(/^https?:\/\//, "").split(".")[0];
  if (!key) return "key: 未設定";
  if (key.startsWith("sb_secret_")) return `key: sb_secret (新形式) len=${key.length}`;
  if (key.startsWith("sb_publishable_")) return "key: sb_publishable (公開キー — service_role/secret ではない)";
  const parts = key.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as { role?: string; ref?: string };
      const refOk = payload.ref === expectedRef;
      return `key: JWT role=${payload.role ?? "?"} project=${payload.ref ?? "?"}${refOk ? "" : ` (このサイトは ${expectedRef} — 別プロジェクトのキー)`}`;
    } catch { return `key: JWT (decode failed) len=${key.length}`; }
  }
  return `key: 不明な形式 len=${key.length}`;
}
/** Authorization: Bearer <access_token> → 회원 id (검증 실패 시 null). anon 키로 getUser 하면 토큰 검증만 수행. */
export async function userIdFromRequest(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return null;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}
