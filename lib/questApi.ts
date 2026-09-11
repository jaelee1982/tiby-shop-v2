"use client";
// TIBY Quest 서버 호출 — Supabase RPC(anon 키). 테이블 직접 접근 없음: quest_checkin / quest_stamps / quest_claim_coupon / quest_my_status.
import { supabaseBrowser } from "@/lib/supabase/client";
import type { GeoFix } from "@/lib/quest";

export type ServerCheckin = { ok: true; distance_m: number; count: number; reason?: "already" } | { ok: false; reason: string; distance_m?: number };
export type CouponRow = { code: string; amount_jpy: number; milestone: number; status: string; expires_at: string; issued_at?: string };
export type MyStatus = { ok: true; count: number; coupons: CouponRow[] } | { ok: false; reason: string };

export async function serverCheckin(device: string, storeCode: string, fix: GeoFix): Promise<ServerCheckin> {
  const { data, error } = await supabaseBrowser().rpc("quest_checkin", { p_device: device, p_store: storeCode, p_lat: fix.lat, p_lng: fix.lng, p_accuracy: fix.accuracy ?? null });
  if (error) throw error;
  return data as ServerCheckin;
}
export async function serverStamps(device: string): Promise<{ store_code: string; at: string }[]> {
  const { data, error } = await supabaseBrowser().rpc("quest_stamps", { p_device: device });
  if (error) throw error;
  return (data as { store_code: string; at: string }[]) ?? [];
}
export async function claimCoupon(device: string, milestone: number): Promise<{ ok: true; existing: boolean; count: number; coupon: CouponRow } | { ok: false; reason: string; count?: number }> {
  const { data, error } = await supabaseBrowser().rpc("quest_claim_coupon", { p_device: device, p_milestone: milestone });
  if (error) throw error;
  return data;
}
export async function myStatus(): Promise<MyStatus> {
  const { data, error } = await supabaseBrowser().rpc("quest_my_status");
  if (error) throw error;
  return data as MyStatus;
}
