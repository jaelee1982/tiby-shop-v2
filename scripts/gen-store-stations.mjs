// 매장별 최근접역 생성기 — 사용: node scripts/gen-store-stations.mjs (scripts/data/stations.json = piuccio/open-data-jp-railway-stations 스냅샷).
// lib/storeStations.ts 를 이 스크립트가 직접 다시 쓴다(마지막 블록). 매장 데이터가 바뀌면(화요일 자동 발행 후) 다시 실행.
import fs from 'node:fs';
// 역 데이터 스냅샷은 git 에 넣지 않는다(5.8MB) — 없으면 GitHub 원본에서 내려받는다.
const SRC = 'https://raw.githubusercontent.com/piuccio/open-data-jp-railway-stations/master/stations.json';
const CACHE = 'scripts/data/stations.json';
if (!fs.existsSync(CACHE)) { fs.mkdirSync('scripts/data', { recursive: true }); const r = await fetch(SRC); if (!r.ok) throw new Error('stations.json download failed ' + r.status); fs.writeFileSync(CACHE, await r.text()); }
const groups = JSON.parse(fs.readFileSync(CACHE,'utf8'));
// 그룹(역) 단위 대표 좌표 = 소속 노선 역들의 평균, 노선 목록 수집(표시용 — 이름 있는 line_code 만, 'JR-East.Nambu'→'JR Nambu')
const stations = groups.map(g => {
  const pts = g.stations.filter(s => s.lat && s.lon);
  if (!pts.length) return null;
  const lat = pts.reduce((a,s)=>a+s.lat,0)/pts.length, lon = pts.reduce((a,s)=>a+s.lon,0)/pts.length;
  const lines = [...new Set(pts.map(s => s.line_code || s.ekidata_line_id))];
  return { name: g.name_kanji, romaji: g.name_romaji || '', lat, lon, lines, pref: pts[0].prefecture };
}).filter(Boolean);
const src = fs.readFileSync('lib/storesData.ts','utf8');
const stores = [...src.matchAll(/"id":(\d+),"code":"([^"]*)","full_name":"([^"]+)","lat":([\d.]+),"lng":([\d.]+)/g)].map(m=>({id:+m[1],code:m[2],name:m[3],lat:+m[4],lng:+m[5]}));
const R=6371000, rad=d=>d*Math.PI/180;
const dist=(a,b,c,d)=>{const x=Math.sin(rad(c-a)/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(rad(d-b)/2)**2;return 2*R*Math.asin(Math.sqrt(x));};
const out = stores.map(s => {
  let best=null; for (const st of stations){ const d=dist(s.lat,s.lng,st.lat,st.lon); if(!best||d<best.d) best={...st,d}; }
  const walk = Math.max(1, Math.round(best.d*1.3/80));   // 직선거리×1.3(도로 우회) ÷ 80m/분
  return { code:s.code, name:s.name, station:best.name, station_romaji:best.romaji, dist_m:Math.round(best.d), walk_min:walk, lines:best.lines.filter(l => !/^\d+$/.test(l)).map(l => l.replace(/^JR-[A-Za-z]+/, 'JR').replace(/\./g, ' ')).slice(0,2), pref: String(best.pref || '').padStart(2, '0') };
});
console.log('stations', stations.length, 'stores', stores.length);
const far = out.filter(o=>o.dist_m>2000); console.log('2km 초과(차량권)', far.length, far.slice(0,8).map(o=>`${o.name}:${o.station} ${o.dist_m}m`).join(' | '));
console.log(out.filter(o=>/渋谷本店|新宿店|道頓堀店$|中洲店|環七梅島/.test(o.name)).map(o=>`${o.name} → ${o.station}(${o.station_romaji}) ${o.dist_m}m 도보${o.walk_min}분 ${o.lines.join(',')}`).join('\n'));
const buckets = {'≤500m':0,'≤1km':0,'≤2km':0,'>2km':0}; for(const o of out){ buckets[o.dist_m<=500?'≤500m':o.dist_m<=1000?'≤1km':o.dist_m<=2000?'≤2km':'>2km']++; } console.log(buckets);

// ── lib/storeStations.ts 갱신 — 점포코드 순서 고정(diff 안정). pref = 최근접역의 都道府県 JIS 코드(01~47, Quest 배지용).
const entries = out.map(o => `"${o.code}":${JSON.stringify({ station:o.station, dist_m:o.dist_m, walk_min:o.walk_min, lines:o.lines, pref:o.pref })}`).join(',');
const header = `// 매장별 최근접역 — 점포코드 → { station(역명), dist_m(직선거리), walk_min(도보 추정: 직선×1.3÷80m/분), lines, pref(都道府県 JIS 코드) }.
// 자동 생성(2026-09-10): 공개 역 데이터(ekidata 기반, piuccio/open-data-jp-railway-stations) × storesData 좌표 최근접 계산.
// 사람 입력 0. 매장이 바뀌면 \`node scripts/gen-store-stations.mjs\` 로 재생성 — 손수정 금지. 2km 초과 = 차량권(walk_min 은 참고용).
// pref 는 최근접역 소재 현(매장 자체 현과 경계에서 드물게 다를 수 있음 — 배지 용도라 허용).
export interface StoreStation { station: string; dist_m: number; walk_min: number; lines: string[]; pref: string }
export const STORE_STATIONS: Record<string, StoreStation> = {`;
fs.writeFileSync('lib/storeStations.ts', header + entries + '};\n');
console.log('wrote lib/storeStations.ts', out.length);
