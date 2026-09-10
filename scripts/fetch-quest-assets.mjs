// TIBY Quest 에셋 내려받기 — lib/questAssets.json 의 원본 URL(Higgsfield CDN) → public/quest/<key>.png 로 저장.
// 사용: node scripts/fetch-quest-assets.mjs   (GitHub Actions quest-assets.yml 이 실행·커밋. 세션 프록시는 CDN 차단이라 여기서 못 받는다.)
// 이미 같은 크기의 파일이 있으면 건너뛴다. 매니페스트의 URL 이 바뀌면 다시 받는다(--force).
import fs from 'node:fs';
import path from 'node:path';
const force = process.argv.includes('--force');
const manifest = JSON.parse(fs.readFileSync('lib/questAssets.json', 'utf8'));
const outDir = 'public/quest';
fs.mkdirSync(outDir, { recursive: true });
let changed = 0;
for (const [key, a] of Object.entries(manifest.assets)) {
  const dest = path.join(outDir, `${key}.png`);
  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) { console.log('skip', key); continue; }
  const r = await fetch(a.url);
  if (!r.ok) throw new Error(`${key}: ${r.status} ${a.url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000 || !(buf[0] === 0x89 && buf[1] === 0x50)) throw new Error(`${key}: not a PNG (${buf.length} bytes)`);
  fs.writeFileSync(dest, buf); changed++;
  console.log('saved', key, buf.length, 'bytes');
}
console.log(changed ? `${changed} file(s) written` : 'no change');
