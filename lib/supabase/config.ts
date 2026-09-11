// tiby.shop 소비자 DB (Supabase 프로젝트 "tiby-shop", 도쿄 — ops DB 와 별개). 2026-09-10 신설.
// anon 키는 공개 전제(RLS + RPC 만 노출) — 환경변수로 덮어쓸 수 있다. service_role 키는 서버 전용(NEXT_PUBLIC 금지).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bkcmekmpgbetuicnjawy.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrY21la21wZ2JldHVpY25qYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNjEzMjcsImV4cCI6MjEwNDYzNzMyN30.1kljAELOlb_WER-wOT8hHGtmWqggNkF0Y8y2-WWrupI";
