"use client";

// 店舗マップ — 구 tiby.me/stores(볼트 SPA) 이식판. 데이터=lib/storesData.ts,
// 지도=Leaflet+OSM (react-leaflet 미사용 — React 19 호환 이슈 회피, SSR 없음).
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { stores, type Store } from "@/lib/storesData";

interface StoreWithDistance extends Store {
  distance: number;
}

const pinSvg = (accent: boolean) =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30"><path fill="${accent ? "#ED8CA5" : "#F4A0A0"}"${accent ? ' stroke="#FFF" stroke-width="1.5"' : ""} d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18C24 5.373 18.627 0 12 0z"/><circle cx="12" cy="11" r="4" fill="white"/></svg>`
  );

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const gmapHref = (s: Store) => `https://maps.google.com/?q=${encodeURIComponent(s.full_name)}`;

export function StoreLocator() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState<StoreWithDistance[]>([]);

  // 지도 초기화 (클라이언트 전용)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      const map = L.map(mapEl.current).setView([36.2, 138.2], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // 마커 렌더 — 검색어/근처매장 변경 시 갱신
  useEffect(() => {
    if (!mapReady) return;
    (async () => {
      const L = (await import("leaflet")).default;
      const layer = layerRef.current;
      if (!layer) return;
      layer.clearLayers();
      const q = query.trim().toLowerCase();
      const filtered = q ? stores.filter((s) => s.full_name.toLowerCase().includes(q)) : stores;
      for (const s of filtered) {
        const isNear = nearby.some((n) => n.id === s.id);
        const icon = L.icon({
          iconUrl: pinSvg(isNear),
          iconSize: isNear ? [32, 40] : [24, 30],
          iconAnchor: isNear ? [16, 40] : [12, 30],
          popupAnchor: [0, isNear ? -40 : -30],
        });
        L.marker([s.lat, s.lng], { icon })
          .bindPopup(
            `<div style="padding:4px 2px"><strong style="display:block;margin-bottom:6px;color:#1A1A1A">${s.full_name}</strong>` +
              `<a href="${gmapHref(s)}" target="_blank" rel="noopener noreferrer" style="color:#ED8CA5;text-decoration:none;font-size:0.9rem">Google Mapsで開く →</a></div>`
          )
          .addTo(layer);
      }
    })();
  }, [mapReady, query, nearby]);

  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("お使いのブラウザは位置情報に対応していません。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const near = stores
          .map((s) => ({ ...s, distance: distanceKm(loc.lat, loc.lng, s.lat, s.lng) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3);
        setNearby(near);
        mapRef.current?.setView([loc.lat, loc.lng], 12);
      },
      () => alert("位置情報の取得に失敗しました。ブラウザの設定を確認してください。")
    );
  };

  return (
    <div className="t-page" style={{ background: "var(--tiby-bg)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="t-eyebrow">Store Locator</div>
          <h1 className="t-h2-jp" style={{ marginBottom: 10 }}>
            TIBYが買える店舗
          </h1>
          <p style={{ color: "var(--fg-2)", fontSize: "1.05rem" }}>
            全国のドン・キホーテ {stores.length}店舗で販売中
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <input
            type="text"
            placeholder="店舗名で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: "1 1 260px",
              padding: "14px 22px",
              border: "1px solid var(--tiby-line)",
              borderRadius: 999,
              background: "#fff",
              color: "var(--fg-1)",
              outline: "none",
              fontSize: 15,
            }}
          />
          <button type="button" className="t-cta" onClick={handleGetLocation}>
            現在地から探す
          </button>
        </div>

        {nearby.length > 0 && (
          <div
            style={{
              marginBottom: 28,
              padding: 24,
              background: "#fff",
              borderRadius: 16,
              border: "1px solid var(--tiby-line)",
            }}
          >
            <h2 style={{ marginBottom: 14, color: "var(--fg-1)", fontSize: "1.05rem", fontWeight: 700 }}>
              お近くの店舗（{nearby.length}件）
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nearby.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    background: "var(--tiby-bg)",
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <p style={{ color: "var(--fg-1)", margin: 0 }}>{s.full_name}</p>
                    <p style={{ color: "var(--fg-3)", fontSize: "0.9rem", margin: 0 }}>
                      約 {s.distance.toFixed(1)} km
                    </p>
                  </div>
                  <a
                    href={gmapHref(s)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="t-cta-ghost"
                    style={{ padding: "8px 18px", fontSize: 13, whiteSpace: "nowrap" }}
                  >
                    地図を開く
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          ref={mapEl}
          style={{
            height: "65vh",
            minHeight: 420,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid var(--tiby-line)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        />
      </div>
    </div>
  );
}
