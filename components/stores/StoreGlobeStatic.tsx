// 가벼운 정적 버전 — 모바일·데이터 절약·WebGL 없음·3D 로딩 전 자리표시. SVG 한 장(일본 윤곽 + 핑크 점 227).
// 판매 데이터 없음. 서버 컴포넌트에서도 렌더 가능(브라우저 API 미사용).
import { stores } from "@/lib/storesData";
import japanOutline from "@/lib/japan-outline.json";

const W = 900, H = 640;
// 일본 전체 bbox (경도 128~146, 위도 30~46) → SVG 좌표. 위도는 메르카토르 근사 대신 단순 선형 + 살짝 보정.
const LNG = [128.5, 146.5], LAT = [30.2, 45.8];
const px = (lng: number) => ((lng - LNG[0]) / (LNG[1] - LNG[0])) * W;
const py = (lat: number) => H - ((lat - LAT[0]) / (LAT[1] - LAT[0])) * H;

function ringsToPath(coords: number[][][]): string {
  return coords.map((ring) => ring.map(([lng, lat], i) => `${i ? "L" : "M"}${px(lng).toFixed(1)} ${py(lat).toFixed(1)}`).join(" ") + "Z").join(" ");
}

export function StoreGlobeStatic({ className }: { className?: string }) {
  const geom = (japanOutline as GeoJSON.FeatureCollection).features[0].geometry;
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : geom.type === "Polygon" ? [geom.coordinates] : [];
  const path = polys.map((p) => ringsToPath(p as number[][][])).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`全国のドン・キホーテ ${stores.length}店舗`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="sg-glow" r="0.5"><stop offset="0" stopColor="#ED8CA5" stopOpacity="0.9" /><stop offset="1" stopColor="#ED8CA5" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#101626" />
      <path d={path} fill="#1c2540" stroke="#3b4a72" strokeWidth="1" />
      {stores.map((s) => (
        <g key={s.id}>
          <circle cx={px(s.lng)} cy={py(s.lat)} r="9" fill="url(#sg-glow)" />
          <circle cx={px(s.lng)} cy={py(s.lat)} r="3" fill="#ED8CA5" stroke="#fff" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  );
}
