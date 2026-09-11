"use client";
// 브라우저용 Supabase 클라이언트 (anon 키, 세션은 localStorage). 서버 컴포넌트에서 import 금지.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;
export function supabaseBrowser(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}
