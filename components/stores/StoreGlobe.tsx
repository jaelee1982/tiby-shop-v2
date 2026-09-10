"use client";

// 3D 지구본 — 회전하는 지구에서 일본으로 날아 들어와 227개 매장이 북→남으로 점등한다 (God's Eye Phase 2).
// 원칙: 판매·재고·상태 데이터 없음 — 핑크 1색. 핀 클릭 = 매장명 + Google Maps 링크.
// 엔진 MapLibre GL(무키). 타일 실패 시 내장 일본 윤곽. prefers-reduced-motion 이면 회전·비행 생략.
// 이 지구본이 페이지의 유일한 지도다(2026-09-10 대표 지시 — 옛 Leaflet 지도 제거). 검색·현재지 결과는
// onApi 로 받은 핸들(focus/highlight)로 이 지도 위에서 보여준다.
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MLMap, Popup as MLPopup } from "maplibre-gl";
import { stores, type Store } from "@/lib/storesData";
import { pickStyle, PINK, GLOBE_START, JAPAN_VIEW } from "@/lib/mapStyle";

const SRC = "stores";
const gmapHref = (name: string) => `https://maps.google.com/?q=${encodeURIComponent(name)}`;

/** 검색·현재지 UI 가 지구본을 조작하는 핸들. */
export interface GlobeApi {
  /** 매장 하나로 날아가 팝업을 연다. */
  focus: (store: Store) => void;
  /** 강조할 매장 id 목록(나머지는 흐리게) + 그 범위로 화면 맞춤. null = 전체 복원. */
  highlight: (ids: number[] | null, opts?: { fit?: boolean }) => void;
  /** 현재 위치 표시(핑크와 구분되는 흰 점) + 그 주변으로 이동. */
  showUser: (lng: number, lat: number) => void;
}

export function StoreGlobe({ onReady, onApi }: { onReady?: () => void; onApi?: (api: GlobeApi) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const popupRef = useRef<MLPopup | null>(null);
  const [fallback, setFallback] = useState(false);
  const onReadyRef = useRef(onReady); onReadyRef.current = onReady;   // 콜백 identity 가 바뀌어도 지도를 다시 만들지 않는다
  const onApiRef = useRef(onApi); onApiRef.current = onApi;

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    (async () => {
      if (!el.current || mapRef.current) return;
      const gl = (await import("maplibre-gl")).default;
      const { style, fallback: fb } = await pickStyle();
      if (cancelled || !el.current) return;
      setFallback(fb);
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const map = new gl.Map({
        container: el.current, style, center: reduced ? JAPAN_VIEW.center : GLOBE_START.center,
        zoom: reduced ? JAPAN_VIEW.zoom : GLOBE_START.zoom, pitch: reduced ? JAPAN_VIEW.pitch : 0,
        attributionControl: false, maxPitch: 60, scrollZoom: false, dragRotate: false,
      });
      mapRef.current = map;
      map.addControl(new gl.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new gl.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => {
        try { (map as unknown as { setProjection?: (p: { type: string }) => void }).setProjection?.({ type: "globe" }); } catch { /* 구버전 */ }
        const empty = { type: "FeatureCollection" as const, features: [] };
        map.addSource(SRC, { type: "geojson", data: empty, promoteId: "id" });
        map.addSource("user", { type: "geojson", data: empty });
        const dimOpacity = (full: number) => ["case", ["boolean", ["get", "dim"], false], full * 0.22, full] as unknown as number;
        map.addLayer({ id: "pt-glow", type: "circle", source: SRC, paint: {
          "circle-color": PINK, "circle-opacity": dimOpacity(0.35), "circle-blur": 1,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 9, 9, 22],
        } });
        map.addLayer({ id: "pt", type: "circle", source: SRC, paint: {
          "circle-color": PINK, "circle-opacity": dimOpacity(1), "circle-stroke-color": "#fff", "circle-stroke-opacity": dimOpacity(1), "circle-stroke-width": 1.2,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3.5, 9, 7],
        } });
        map.addLayer({ id: "user-glow", type: "circle", source: "user", paint: { "circle-color": "#fff", "circle-opacity": 0.3, "circle-blur": 1, "circle-radius": 18 } });
        map.addLayer({ id: "user", type: "circle", source: "user", paint: { "circle-color": "#fff", "circle-stroke-color": "#1A1A1A", "circle-stroke-width": 2, "circle-radius": 6 } });

        const openPopup = (name: string, lngLat: [number, number]) => {
          popupRef.current?.remove();
          popupRef.current = new gl.Popup({ offset: 10, closeButton: false, className: "t-globe-popup" })
            .setLngLat(lngLat)
            .setHTML(`<strong style="display:block;margin-bottom:6px;color:#1A1A1A;font-size:13px">${name}</strong><a href="${gmapHref(name)}" target="_blank" rel="noopener noreferrer" style="color:${PINK};text-decoration:none;font-size:12.5px">Google Mapsで開く →</a>`)
            .addTo(map);
        };
        map.on("mouseenter", "pt", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "pt", () => { map.getCanvas().style.cursor = ""; });
        map.on("click", "pt", (e) => {
          const f = e.features?.[0]; if (!f) return;
          openPopup(String(f.properties?.name || ""), (f.geometry as GeoJSON.Point).coordinates as [number, number]);
        });
        map.on("click", (e) => {   // 빈 곳 클릭 = 팝업 닫기
          if (!map.queryRenderedFeatures(e.point, { layers: ["pt"] }).length) popupRef.current?.remove();
        });

        // 데이터 렌더 — 강조 집합(dim 플래그)을 반영해 전체를 다시 그린다.
        let highlightIds: Set<number> | null = null;
        const feature = (s: Store) => ({ type: "Feature" as const, id: s.id, geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] }, properties: { id: s.id, name: s.full_name, dim: highlightIds ? !highlightIds.has(s.id) : false } });
        const setData = (list: Store[]) => (map.getSource(SRC) as { setData: (d: unknown) => void } | undefined)?.setData({ type: "FeatureCollection", features: list.map(feature) });
        let introDone = false;

        // 북→남 점등 (0.9초). 위도 내림차순으로 잘라 넣는다.
        const sorted = [...stores].sort((a, b) => b.lat - a.lat);
        const light = () => {
          const t0 = performance.now();
          const step = () => {
            if (introDone) return;
            const k = Math.min(1, (performance.now() - t0) / 900);
            setData(sorted.slice(0, Math.round(k * sorted.length)));
            if (k < 1) raf = requestAnimationFrame(step); else { introDone = true; onReadyRef.current?.(); }
          };
          raf = requestAnimationFrame(step);
        };

        // 사용자가 검색·현재지 등으로 지도를 쓰기 시작하면 인트로를 즉시 끝낸다(전체 점등).
        let flown = reduced;
        const skipIntro = () => {
          flown = true;
          if (introDone) return;
          introDone = true; cancelAnimationFrame(raf); map.stop(); setData(stores); onReadyRef.current?.();
        };

        const api: GlobeApi = {
          focus: (s) => {
            skipIntro();
            map.flyTo({ center: [s.lng, s.lat], zoom: 10.5, pitch: 30, duration: 1300, essential: true });
            map.once("moveend", () => openPopup(s.full_name, [s.lng, s.lat]));
          },
          highlight: (ids, opts) => {
            skipIntro(); popupRef.current?.remove();
            highlightIds = ids ? new Set(ids) : null; setData(stores);
            if (!ids) { map.flyTo({ ...JAPAN_VIEW, duration: 1000, essential: true }); return; }
            const hit = stores.filter((s) => highlightIds!.has(s.id));
            if (!hit.length || opts?.fit === false) return;
            if (hit.length === 1) { api.focus(hit[0]); return; }
            const lngs = hit.map((s) => s.lng), lats = hit.map((s) => s.lat);
            map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: { top: 80, bottom: 80, left: 420, right: 80 }, maxZoom: 10, pitch: 30, duration: 1200, essential: true });
          },
          showUser: (lng, lat) => {
            skipIntro();
            (map.getSource("user") as { setData: (d: unknown) => void } | undefined)?.setData({ type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: {} }] });
          },
        };
        onApiRef.current?.(api);

        if (reduced) { light(); return; }
        // 천천히 도는 지구 → 1.4초 뒤 일본으로 비행 → 도착 후 점등. 사용자가 만지면 즉시 비행.
        const fly = () => { if (flown) return; flown = true; map.stop(); map.flyTo({ ...JAPAN_VIEW, duration: 2600, essential: true }); map.once("moveend", () => { if (!introDone) light(); }); };
        const spin = () => { if (flown) return; map.easeTo({ center: [((map.getCenter().lng + 8) % 360), GLOBE_START.center[1]], duration: 1200, easing: (t) => t }); };
        map.on("moveend", () => { if (!flown) spin(); });
        spin();
        setTimeout(fly, 1400);
        map.once("mousedown", fly); map.once("touchstart", fly); map.once("wheel", fly);
      });
    })();
    return () => { cancelled = true; cancelAnimationFrame(raf); popupRef.current?.remove(); mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return (
    <div className="t-globe">
      {/* 인라인 크기 = maplibre-gl.css 의 .maplibregl-map{position:relative} 가 이겨도 높이 0 이 되지 않게 (2026-09-10 사고) */}
      <div ref={el} className="t-globe-canvas" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      {fallback && <span className="t-globe-note">地図タイルを読み込めないため、輪郭のみ表示しています</span>}
    </div>
  );
}
