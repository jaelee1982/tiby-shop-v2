// TIBY Quest 에셋 반입 — lib/questAssets.json 의 원본 URL(Higgsfield CDN, 1024px PNG ~1MB) → public/quest/<key>.webp (모바일용 축소).
// 사용: node scripts/fetch-quest-assets.mjs [--force] [--from-png]   (GitHub Actions quest-assets.yml 이 실행·커밋 — 세션 프록시는 CDN 차단)
//   --from-png : 이미 내려받은 public/quest/<key>.png 가 있으면 그걸 변환(다운로드 생략)
// 크기: 스프라이트 최대 640px(화면 표시 ≤140css px ×3배 = 420px 로 충분), 배경 플레이트(plate*/shelf/share_bg) 최대 1200px,
// 온보딩 960px, 스프라이트 시트(sheet_*, frames/ar 필수)는 높이 240 + 칸 폭 정수 보정. WebP q82.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const args = process.argv.slice(2);
const force = args.includes('--force'), fromPng = args.includes('--from-png');
const manifest = JSON.parse(fs.readFileSync('lib/questAssets.json', 'utf8'));
const outDir = 'public/quest';
fs.mkdirSync(outDir, { recursive: true });
let changed = 0;
for (const [key, a] of Object.entries(manifest.assets)) {
  const dest = path.join(outDir, `${key}.webp`);
  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) { console.log('skip', key); continue; }
  let buf;
  const pngPath = path.join(outDir, `${key}.png`);
  if (fromPng && fs.existsSync(pngPath)) buf = fs.readFileSync(pngPath);
  else {
    const r = await fetch(a.url);
    if (!r.ok) throw new Error(`${key}: ${r.status} ${a.url}`);
    buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000 || !(buf[0] === 0x89 && buf[1] === 0x50)) throw new Error(`${key}: not a PNG (${buf.length} bytes)`);
  }
  let out;
  if (a.frames) {
    // 스프라이트 시트: 높이 240 으로 축소하되 칸 폭이 정수가 되도록 전체 폭을 frames 배수로 맞춘다(steps() 애니메이션 정렬).
    const meta = await sharp(buf).metadata();
    const H = 240, cellW = Math.round((meta.width / a.frames) * (H / meta.height));
    out = await sharp(buf).resize({ width: cellW * a.frames, height: H, fit: 'fill' }).webp({ quality: 84, alphaQuality: 92 }).toBuffer();
  } else {
    const max = /^(plate|shelf|share_bg)/.test(key) ? 1200 : /^onboarding_/.test(key) ? 960 : 640;
    out = await sharp(buf).resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }).toBuffer();
  }
  fs.writeFileSync(dest, out); changed++;
  console.log('saved', key, `${buf.length} → ${out.length} bytes`);
}
console.log(changed ? `${changed} file(s) written` : 'no change');
