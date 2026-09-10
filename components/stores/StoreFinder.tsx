"use client";

// 店舗一覧 — 지도 하나(지구본)에 검색·현재지 찾기를 얹은 단일 섹션 (2026-09-10 대표 지시 "지도 두 개 겹치지 말 것").
// 옛 Leaflet 지도(StoreLocator)는 제거. 데스크톱·WebGL = 3D 지구본(클라 전용 지연 로드) — 검색 결과 클릭이 지구본을
// 그 매장으로 날린다. 모바일·데이터절약·WebGL 없음 = 정적 SVG(가벼움) — 결과는 Google Maps 링크로 연다.
// 판매·재고 데이터 없음(공개 사이트).
import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { StoreGlobeStatic } from "./StoreGlobeStatic";
import type { GlobeApi } from "./StoreGlobe";
import { stores, type Store } from "@/lib/storesData";

const StoreGlobe = dynamic(() => import("./StoreGlobe").then((m) => m.StoreGlobe), { ssr: false });

let cached3D: boolean | null = null;
const subscribeNoop = () => () => {};
function canUse3D(): boolean {
  if (cached3D != null) return cached3D;
  cached3D = compute3D();
  return cached3D;
}
function compute3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < 768) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) return false; } catch { return false; }
  return true;
}

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const gmapHref = (s: Store) => `https://maps.google.com/?q=${encodeURIComponent(s.full_name)}`;
// 검색 정규화 — 전각/반각·공백·「ドン・キホーテ」접두 유무에 흔들리지 않게
const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[\s・･]/g, "");

type Row = Store & { distance?: number };

export function StoreFinder() {
  // 서버 스냅샷 = false(정적 SVG), 클라 = 기기 판정 — set-state-in-effect 없이 hydration 안전
  const use3D = useSyncExternalStore(subscribeNoop, canUse3D, () => false);
  const [ready, setReady] = useState(false);
  const apiRef = useRef<GlobeApi | null>(null);
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState<Row[]>([]);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const matches = useMemo<Row[]>(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return stores.filter((s) => norm(s.full_name).includes(q)).slice(0, 8);
  }, [query]);
  const rows: Row[] = query.trim() ? matches : nearby;
  const heading = query.trim()
    ? (matches.length ? `該当する店舗（${matches.length}件${matches.length === 8 ? "以上" : ""}）` : "該当する店舗が見つかりません")
    : nearby.length ? `お近くの店舗（${nearby.length}件）` : null;

  const onQuery = (v: string) => {
    setQuery(v); setNearby([]); setActiveId(null); setNotice(null);
    const q = norm(v.trim());
    const ids = q ? stores.filter((s) => norm(s.full_name).includes(q)).map((s) => s.id) : null;
    apiRef.current?.highlight(ids && ids.length ? ids : null, { fit: !!ids && ids.length <= 40 });
  };

  const pick = (s: Row) => {
    setActiveId(s.id);
    if (apiRef.current) apiRef.current.focus(s);
    else window.open(gmapHref(s), "_blank", "noopener,noreferrer");   // 정적(모바일) = Google Maps
  };

  const locate = () => {
    if (!("geolocation" in navigator)) { setNotice("お使いのブラウザは位置情報に対応していません。"); return; }
    setLocating(true); setNotice(null); setQuery(""); setActiveId(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const near = stores.map((s) => ({ ...s, distance: distanceKm(lat, lng, s.lat, s.lng) })).sort((a, b) => a.distance - b.distance).slice(0, 5);
        setNearby(near); setLocating(false);
        apiRef.current?.showUser(lng, lat);
        apiRef.current?.highlight(near.map((s) => s.id));
      },
      () => { setLocating(false); setNotice("位置情報を取得できませんでした。ブラウザの設定をご確認ください。"); },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <section className="t-stores-hero" aria-label="店舗マップ">
      <div className="t-stores-hero-media">
        <StoreGlobeStatic className={`t-globe-static${use3D && ready ? " is-hidden" : ""}`} />
        {use3D && <StoreGlobe onReady={() => setReady(true)} onApi={(api) => { apiRef.current = api; }} />}
      </div>
      <div className="t-stores-hero-copy">
        <div className="t-eyebrow" style={{ color: "#F7B7C9" }}>Store locator</div>
        <h1 className="t-h2-jp" style={{ color: "#fff" }}>TIBYが買える店舗</h1>
        <p className="t-tool-lead" style={{ color: "rgba(255,255,255,0.78)" }}>
          全国のドン・キホーテ <strong style={{ color: "#fff" }}>{stores.length}店舗</strong>で販売中。店舗名で検索するか、現在地から近い店舗を探せます。
        </p>
        <div className="t-stores-finder">
          <div className="t-stores-bar">
            <input type="search" className="t-tool-input" placeholder="店舗名で検索（例：渋谷）" value={query} onChange={(e) => onQuery(e.target.value)} aria-label="店舗名で検索" />
            <button type="button" className="t-cta" onClick={locate} disabled={locating}>{locating ? "取得中..." : "現在地から探す"}</button>
          </div>
          {notice && <p className="t-stores-notice" role="status">{notice}</p>}
          {heading && (
            <div className="t-stores-results" role="list">
              <div className="t-stores-results-head">{heading}</div>
              {rows.map((s) => (
                <div key={s.id} role="listitem" className={`t-stores-row${activeId === s.id ? " is-active" : ""}`}>
                  <button type="button" className="t-stores-row-main" onClick={() => pick(s)}>
                    <span className="t-stores-row-name">{s.full_name}</span>
                    {s.distance != null && <span className="t-stores-row-dist">約 {s.distance.toFixed(1)} km</span>}
                  </button>
                  <a href={gmapHref(s)} target="_blank" rel="noopener noreferrer" className="t-stores-row-link">Google Maps →</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
