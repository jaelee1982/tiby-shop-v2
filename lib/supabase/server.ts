// 서버(API 라우트) 전용 Supabase 클라이언트 — service_role 키(Netlify 환경변수 SUPABASE_SERVICE_ROLE_KEY). RLS 우회.
// 미설정이면 null — 호출부는 503 으로 명확히 실패(anon 폴백 금지).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export function supabaseService(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
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
