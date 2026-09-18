// tiby.shop 소비자 DB (Supabase 프로젝트 "tiby-shop" ref bkcmekmpgbetuicnjawy, 도쿄 — ops DB 와 별개). 2026-09-10 신설.
// ⚠️ 2026-09-18 사고: Netlify 의 옛 NEXT_PUBLIC_SUPABASE_URL 이 다른 프로젝트(uufkbm…)를 가리켜 결제 API 가
//   "Invalid API key"(service_role 키는 맞는데 URL 이 남의 프로젝트) 로 막혔음 → 프로젝트를 코드에 고정, env 로 덮어쓰지 않는다.
//   프로젝트를 바꿔야 하면 이 파일 두 줄만 수정. anon 키는 공개 전제(RLS + RPC 만 노출). service_role 키는 서버 전용 env.
export const SUPABASE_PROJECT_REF = "bkcmekmpgbetuicnjawy";
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrY21la21wZ2JldHVpY25qYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNjEzMjcsImV4cCI6MjEwNDYzNzMyN30.1kljAELOlb_WER-wOT8hHGtmWqggNkF0Y8y2-WWrupI";
