// 店舗マップ 3D 스타일 설정 — ops lib/config/map.ts 와 동일 원칙 (OpenFreeMap 무키·무제한, 전부 실패 시 내장 일본 윤곽).
// 공개 사이트라 API 키가 있는 공급자는 쓰지 않는다. 공급자 교체는 이 파일 한 곳.
import type { StyleSpecification } from "maplibre-gl";
import japanOutline from "./japan-outline.json";

export const MAP_STYLE_URLS = [
  "https://tiles.openfreemap.org/styles/dark",
  "https://tiles.openfreemap.org/styles/positron",
];

export const PINK = "#ED8CA5";
export const GLOBE_START = { center: [150, 22] as [number, number], zoom: 1.35 };
export const JAPAN_VIEW = { center: [137.8, 36.6] as [number, number], zoom: 4.95, pitch: 42, bearing: -6 };

export const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: { japan: { type: "geojson", data: japanOutline as GeoJSON.FeatureCollection } },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#101626" } },
    { id: "japan-fill", type: "fill", source: "japan", paint: { "fill-color": "#1c2540", "fill-opacity": 0.95 } },
    { id: "japan-line", type: "line", source: "japan", paint: { "line-color": "#3b4a72", "line-width": 1 } },
  ],
};

/** 스타일 URL 을 전부 동시에 받아보고(각 2.5초 제한) 우선순위대로 첫 성공을 쓴다. 전부 실패 = 내장 윤곽. */
export async function pickStyle(): Promise<{ style: string | StyleSpecification; fallback: boolean }> {
  const tryUrl = async (url: string): Promise<StyleSpecification | null> => {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 2500);
      const r = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      if (!r.ok) return null;
      const j = await r.json();
      return j && j.version === 8 ? (j as StyleSpecification) : null;
    } catch { return null; }
  };
  const results = await Promise.all(MAP_STYLE_URLS.map(tryUrl));
  const hit = results.find((j) => j);
  return hit ? { style: hit, fallback: false } : { style: FALLBACK_STYLE, fallback: true };
}
