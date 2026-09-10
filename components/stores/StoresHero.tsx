"use client";

// 店舗一覧 히어로 — 데스크톱·WebGL·데이터절약 아님 → 3D 지구본(클라 전용 지연 로드), 그 외 → 정적 SVG(가벼움).
// 모바일에선 가볍게(대표 지시 2026-09-10): 폰은 WebGL 을 아예 싣지 않는다. 3D 로딩 중에도 정적 SVG 가 먼저 보인다.
import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { StoreGlobeStatic } from "./StoreGlobeStatic";
import { stores } from "@/lib/storesData";

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

export function StoresHero() {
  // 서버 스냅샷 = false(정적 SVG), 클라 = 기기 판정 — set-state-in-effect 없이 hydration 안전
  const use3D = useSyncExternalStore(subscribeNoop, canUse3D, () => false);
  const [ready, setReady] = useState(false);

  return (
    <section className="t-stores-hero" aria-label="店舗マップ">
      <div className="t-stores-hero-media">
        <StoreGlobeStatic className={`t-globe-static${use3D && ready ? " is-hidden" : ""}`} />
        {use3D && <StoreGlobe onReady={() => setReady(true)} />}
      </div>
      <div className="t-stores-hero-copy">
        <div className="t-eyebrow" style={{ color: "#F7B7C9" }}>Store locator</div>
        <h1 className="t-h2-jp" style={{ color: "#fff" }}>TIBYが買える店舗</h1>
        <p className="t-tool-lead" style={{ color: "rgba(255,255,255,0.78)" }}>
          全国のドン・キホーテ <strong style={{ color: "#fff" }}>{stores.length}店舗</strong>で販売中。ピンをタップすると地図が開きます。
        </p>
      </div>
    </section>
  );
}
