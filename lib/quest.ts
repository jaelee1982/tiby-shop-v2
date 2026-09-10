// TIBY Quest — 순수 로직 (UI·저장소와 분리, tsx 로 단위검증). 설계 = giant-ops docs/TIBY_QUEST_DESIGN.md.
// 원칙: 매장별 사람 입력 0 — 여기서 쓰는 데이터는 storesData(좌표)·storeStations(역·現) 뿐.
// 체크인 = GPS 반경만(사진·구매 증빙 없음). 스탬프 = 매장 1개 1회. 보상 규칙(방문/구매 조건)은 대표 결정 대기 — MILESTONES 문구만.
import type { Store } from "@/lib/storesData";
import { STORE_STATIONS } from "@/lib/storeStations";

export const CHECKIN_RADIUS_M = 150;
/** 이보다 부정확한 위치는 판정 보류(실내 GPS 등) — 반경 밖이면 '再取得' 안내 */
export const GPS_MAX_ACCURACY_M = 300;
export const BOOK_KEY = "tiby_quest_book_v1";

export interface GeoFix { lat: number; lng: number; accuracy?: number }
export type CheckinResult =
  | { ok: true; distance_m: number }
  | { ok: false; reason: "far" | "inaccurate"; distance_m: number };

const R = 6371000, rad = (d: number) => (d * Math.PI) / 180;
export function distanceM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const x = Math.sin(rad(bLat - aLat) / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** 체크인 판정 — 반경 안이면 OK. 반경 밖 + 정확도 나쁨 = 위치 재취득 유도(멀리 있다고 단정하지 않음). */
export function evaluateCheckin(store: Pick<Store, "lat" | "lng">, fix: GeoFix): CheckinResult {
  const d = Math.round(distanceM(fix.lat, fix.lng, store.lat, store.lng));
  if (d <= CHECKIN_RADIUS_M) return { ok: true, distance_m: d };
  if ((fix.accuracy ?? 0) > GPS_MAX_ACCURACY_M) return { ok: false, reason: "inaccurate", distance_m: d };
  return { ok: false, reason: "far", distance_m: d };
}

export function nearestStores<T extends Pick<Store, "lat" | "lng">>(list: T[], lat: number, lng: number, n = 5): (T & { distance_m: number })[] {
  return list.map((s) => ({ ...s, distance_m: Math.round(distanceM(lat, lng, s.lat, s.lng)) })).sort((a, b) => a.distance_m - b.distance_m).slice(0, n);
}

// ── 스탬프 帳 (Phase 2 = 端末 localStorage, Phase 3 에서 별도 Supabase 로 이관 — 형식은 그대로 옮길 수 있게 단순하게)
export interface StampBook { v: 1; stamps: Record<string, { at: string }> }
export const emptyBook = (): StampBook => ({ v: 1, stamps: {} });

export function loadBook(storage: Pick<Storage, "getItem"> | null | undefined): StampBook {
  try {
    const raw = storage?.getItem(BOOK_KEY); if (!raw) return emptyBook();
    const b = JSON.parse(raw) as Partial<StampBook>;
    if (!b || b.v !== 1 || typeof b.stamps !== "object" || !b.stamps) return emptyBook();
    return { v: 1, stamps: b.stamps };
  } catch { return emptyBook(); }
}
export function saveBook(book: StampBook, storage: Pick<Storage, "setItem"> | null | undefined): boolean {
  try { storage?.setItem(BOOK_KEY, JSON.stringify(book)); return true; } catch { return false; }
}
/** 매장당 1회 — 이미 있으면 added=false(날짜 유지). */
export function addStamp(book: StampBook, code: string, at = new Date().toISOString()): { book: StampBook; added: boolean } {
  if (book.stamps[code]) return { book, added: false };
  return { book: { v: 1, stamps: { ...book.stamps, [code]: { at } } }, added: true };
}

/** 칭호 — 개수 기준. 특전(쿠폰 등)은 대표 결정 후 여기에 붙인다(景品表示法 확인 필요 — 설계 §4). */
export const MILESTONES: { n: number; label: string }[] = [
  { n: 1, label: "はじめの一歩" },
  { n: 3, label: "ドンキ探検家" },
  { n: 5, label: "TIBYハンター" },
  { n: 10, label: "パフュームマスター" },
  { n: 20, label: "全国行脚" },
];

export const PREF_NAMES: Record<string, string> = {
  "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県", "05": "秋田県", "06": "山形県", "07": "福島県", "08": "茨城県", "09": "栃木県", "10": "群馬県",
  "11": "埼玉県", "12": "千葉県", "13": "東京都", "14": "神奈川県", "15": "新潟県", "16": "富山県", "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
  "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県", "25": "滋賀県", "26": "京都府", "27": "大阪府", "28": "兵庫県", "29": "奈良県", "30": "和歌山県",
  "31": "鳥取県", "32": "島根県", "33": "岡山県", "34": "広島県", "35": "山口県", "36": "徳島県", "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
  "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県", "45": "宮崎県", "46": "鹿児島県", "47": "沖縄県",
};
export const prefOf = (code: string): string | null => STORE_STATIONS[code]?.pref ?? null;
export const prefName = (pref: string | null) => (pref && PREF_NAMES[pref]) || "";

export interface BookStats {
  count: number;
  prefs: string[];                                   // 방문한 都道府県 코드(정렬)
  reached: { n: number; label: string }[];           // 달성한 칭호
  next: { n: number; label: string; remain: number } | null;
}
export function bookStats(book: StampBook): BookStats {
  const codes = Object.keys(book.stamps);
  const prefs = Array.from(new Set(codes.map(prefOf).filter((p): p is string => !!p))).sort();
  const reached = MILESTONES.filter((m) => codes.length >= m.n);
  const nx = MILESTONES.find((m) => codes.length < m.n);
  return { count: codes.length, prefs, reached, next: nx ? { ...nx, remain: nx.n - codes.length } : null };
}

/** 역→매장 안내 한 줄 (店舗一覧 stationLine 과 같은 문구 규칙) */
export function routeLine(code: string): { station: string; text: string; drive: boolean } | null {
  const st = STORE_STATIONS[code]; if (!st) return null;
  const drive = st.dist_m > 2000;
  return { station: st.station, drive, text: drive ? `車で（最寄り ${st.station}駅 ${(st.dist_m / 1000).toFixed(1)}km）` : `${st.station}駅から徒歩${st.walk_min}分` };
}

// ── 에셋 팩 v2 (2026-09-10) — 지역 플레이트·스프라이트 시트·칭호 배지. 키 = lib/questAssets.json.
/** 都道府県 JIS 코드 → 배경 플레이트 키. 関東(+山梨)=기본 'plate'(도쿄), 밤(18~05시)엔 関東만 야경 플레이트(1종만 제작). */
export function plateFor(pref: string | null, hour?: number): string {
  const p = Number(pref ?? 0);
  if (!p) return "plate";
  if (p === 1) return "plate_hokkaido";
  if (p <= 7) return "plate_tohoku";
  if (p <= 14 || p === 19) return hour != null && isNight(hour) ? "plate_tokyo_night" : "plate";
  if (p <= 23) return "plate_nagoya";
  if (p === 26) return "plate_kyoto";
  if (p <= 30) return "plate_osaka";
  if (p <= 39) return "plate_hiroshima";
  if (p <= 46) return "plate_fukuoka";
  return "plate_okinawa";
}
export const isNight = (hour: number) => hour >= 18 || hour < 5;

/** 스프라이트 시트 규격 — 값은 questAssets.json 의 frames/ar 와 동일해야 한다(tsx 검증). dur=1루프 초, once=1회 재생 후 마지막 프레임 유지 */
export const SHEETS = {
  sheet_walk:      { frames: 12, ar: 204 / 360, dur: 0.55, once: false },
  sheet_idle:      { frames: 8,  ar: 203 / 360, dur: 1.4,  once: false },
  sheet_celebrate: { frames: 12, ar: 198 / 360, dur: 1.6,  once: true },
  sheet_taxi:      { frames: 8,  ar: 674 / 360, dur: 0.9,  once: false },
} as const;
export type SheetKey = keyof typeof SHEETS;

/** 현재 위치→매장 거리로 씬 안 캐릭터 진행도(0=역, 1=매장 앞). 역보다 멀면 0. */
export function walkProgress(distToStore_m: number, stationDist_m: number): number {
  if (!(stationDist_m > 0)) return 0;
  return Math.max(0, Math.min(1, 1 - distToStore_m / stationDist_m));
}

/** 근처 매장 중 아직 스탬프 없는 곳 (스탬프帳 탭 "近くの未収集") */
export function uncollectedNearby<T extends { code: string }>(nearby: T[], book: StampBook, n = 3): T[] {
  return nearby.filter((s) => !book.stamps[s.code]).slice(0, n);
}

export const ONBOARD_KEY = "tiby_quest_onboarded_v1";
export const HOME_HINT_KEY = "tiby_quest_home_hint_v1";
export const ONBOARDING = [
  { k: "onboarding_1", title: "最寄り駅から歩こう", text: "全国のドン・キホーテ227店舗にTIBYがあります。駅から店舗までの道のりがクエストです。" },
  { k: "onboarding_2", title: "店舗の前でチェックイン", text: "店舗から150m以内に着いたら「チェックイン」。位置情報は判定にだけ使います。" },
  { k: "onboarding_3", title: "スタンプを集めて称号ゲット", text: "1店舗1スタンプ。3・5・10・20店舗で称号が変わります。都道府県バッジも集まります。" },
] as const;

/** 공유 문구 (Web Share API text) */
export function shareText(stats: BookStats, storeShort?: string): string {
  const title = stats.reached.length ? stats.reached[stats.reached.length - 1].label : null;
  return `${storeShort ? `ドン・キホーテ${storeShort}でTIBYをGET！` : "TIBY Quest"} スタンプ${stats.count}個${title ? `・称号「${title}」` : ""} #TIBYQuest`;
}
