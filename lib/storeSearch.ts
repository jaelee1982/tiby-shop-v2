// 매장 검색 공용 — 店舗一覧(StoreFinder)·TIBY Quest 가 같은 규칙으로 찾는다.
import type { Store } from "@/lib/storesData";
import { STORE_SEARCH_EN } from "@/lib/storeSearchEn";

// 검색 정규화 — 전각/반각·공백·「ドン・キホーテ」접두 유무에 흔들리지 않게
export const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[\s・･'\-]/g, "");
// 일본어(매장명) 또는 영어/로마자(별칭: shibuya, shinjuku …) 어느 쪽이든 부분일치 (대표 지시 2026-09-10)
export const matchesQuery = (s: Store, q: string) => {
  if (!q) return false;
  if (norm(s.full_name).includes(q)) return true;
  const en = STORE_SEARCH_EN[s.code];
  return !!en && norm(en).includes(q);
};
// "MEGAドン・キホーテ 渋谷本店" → "渋谷本店" (스탬프·씬 라벨용 짧은 이름)
export const shortName = (full: string) => full.replace(/^(MEGA|驚安堂|ドン・キホーテ|ピカソ|ドンキ)?\s*(ドン・キホーテ)?\s*/u, "").trim() || full;
