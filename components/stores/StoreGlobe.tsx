"use client";

// 3D 지구본 — 회전하는 지구에서 일본으로 날아 들어와 227개 매장이 북→남으로 점등한다 (God's Eye Phase 2).
// 원칙: 판매·재고·상태 데이터 없음 — 핑크 1색. 핀 클릭 = 매장명 + Google Maps 링크.
// 엔진 MapLibre GL(무키). 타일 실패 시 내장 일본 윤곽. prefers-reduced-motion 이면 회전·비행 생략.
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MLMap } from "maplibre-gl";
import { stores } from "@/lib/storesData";
import { pickStyle, PINK, GLOBE_START, JAPAN_VIEW } from "@/lib/mapStyle";

const SRC = "stores";
const gmapHref = (name: string) => `https://maps.google.com/?q=${encodeURIComponent(name)}`;

export function StoreGlobe({ onReady }: { onReady?: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [fallback, setFallback] = useState(false);
  const onReadyRef = useRef(onReady); onReadyRef.current = onReady;   // 콜백 identity 가 바뀌어도 지도를 다시 만들지 않는다

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
        map.addSource(SRC, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "pt-glow", type: "circle", source: SRC, paint: {
          "circle-color": PINK, "circle-opacity": 0.35, "circle-blur": 1,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 9, 9, 22],
        } });
        map.addLayer({ id: "pt", type: "circle", source: SRC, paint: {
          "circle-color": PINK, "circle-stroke-color": "#fff", "circle-stroke-width": 1.2,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3.5, 9, 7],
        } });
        map.on("mouseenter", "pt", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "pt", () => { map.getCanvas().style.cursor = ""; });
        map.on("click", "pt", (e) => {
          const f = e.features?.[0]; if (!f) return;
          const name = String(f.properties?.name || "");
          new gl.Popup({ offset: 10, closeButton: false, className: "t-globe-popup" })
            .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
            .setHTML(`<strong style="display:block;margin-bottom:6px;color:#1A1A1A;font-size:13px">${name}</strong><a href="${gmapHref(name)}" target="_blank" rel="noopener noreferrer" style="color:${PINK};text-decoration:none;font-size:12.5px">Google Mapsで開く →</a>`)
            .addTo(map);
        });

        // 북→남 점등 (0.9초). 위도 내림차순으로 잘라 넣는다.
        const sorted = [...stores].sort((a, b) => b.lat - a.lat);
        const feature = (s: typeof stores[number]) => ({ type: "Feature" as const, geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] }, properties: { name: s.full_name } });
        const light = () => {
          const t0 = performance.now();
          const step = () => {
            const k = Math.min(1, (performance.now() - t0) / 900);
            const n = Math.round(k * sorted.length);
            (map.getSource(SRC) as { setData: (d: unknown) => void } | undefined)?.setData({ type: "FeatureCollection", features: sorted.slice(0, n).map(feature) });
            if (k < 1) raf = requestAnimationFrame(step); else onReadyRef.current?.();
          };
          raf = requestAnimationFrame(step);
        };

        if (reduced) { light(); return; }
        // 천천히 도는 지구 → 1.4초 뒤 일본으로 비행 → 도착 후 점등. 사용자가 만지면 즉시 비행.
        let flown = false;
        const fly = () => { if (flown) return; flown = true; map.stop(); map.flyTo({ ...JAPAN_VIEW, duration: 2600, essential: true }); map.once("moveend", light); };
        const spin = () => { if (flown) return; map.easeTo({ center: [((map.getCenter().lng + 8) % 360), GLOBE_START.center[1]], duration: 1200, easing: (t) => t }); };
        map.on("moveend", () => { if (!flown) spin(); });
        spin();
        setTimeout(fly, 1400);
        map.once("mousedown", fly); map.once("touchstart", fly); map.once("wheel", fly);
      });
    })();
    return () => { cancelled = true; cancelAnimationFrame(raf); mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return (
    <div className="t-globe">
      <div ref={el} className="t-globe-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      {fallback && <span className="t-globe-note">地図タイルを読み込めないため、輪郭のみ表示しています</span>}
    </div>
  );
}
