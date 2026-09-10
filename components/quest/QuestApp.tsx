"use client";

// TIBY Quest — 돈키 매장을 찾아가 GPS 체크인 → 스탬프 (Phase 2 화면, 설계 = giant-ops docs/TIBY_QUEST_DESIGN.md).
// 원칙: 매장별 사람 입력 0 — 씬은 템플릿 1종(역 → 길 → 돈키 건물)에 매장명·역명만 끼운다. data-slot 자리에 Higgsfield
// 에셋(대표 승인 후)을 얹는다. 스탬프는 端末 localStorage(Phase 3 에서 별도 Supabase 로 이관). 판매·재고 데이터 없음.
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { stores, type Store } from "@/lib/storesData";
import { matchesQuery, norm, shortName } from "@/lib/storeSearch";
import {
  BOOK_KEY, CHECKIN_RADIUS_M, HOME_HINT_KEY, MILESTONES, ONBOARDING, ONBOARD_KEY, SHEETS, addStamp, bookStats, emptyBook, evaluateCheckin,
  loadBook, nearestStores, plateFor, prefName, prefOf, routeLine, saveBook, shareText, uncollectedNearby, walkProgress,
  type GeoFix, type SheetKey, type StampBook,
} from "@/lib/quest";
import { STORE_STATIONS } from "@/lib/storeStations";

// ── 스탬프帳 외부 스토어 (useSyncExternalStore — 서버 스냅샷=빈 帳, 클라=localStorage. set-state-in-effect 없이 hydration 안전)
const listeners = new Set<() => void>();
const SERVER_BOOK = emptyBook();
let cache: { raw: string | null; book: StampBook } | null = null;
const readRaw = () => { try { return window.localStorage.getItem(BOOK_KEY); } catch { return null; } };
function getBook(): StampBook {
  const raw = readRaw();
  if (!cache || cache.raw !== raw) cache = { raw, book: loadBook({ getItem: () => raw }) };
  return cache.book;
}
function subscribe(cb: () => void) {
  listeners.add(cb); window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
}
function commitBook(book: StampBook) {
  let storage: Storage | null = null; try { storage = window.localStorage; } catch { /* 비공개 모드 등 */ }
  saveBook(book, storage);
  if (!storage) cache = { raw: null, book };   // 저장 불가여도 이 세션 안에서는 유지
  listeners.forEach((l) => l());
}

// 端末 플래그(온보딩 봤음·홈 힌트 닫음) — 같은 외부 스토어 패턴. 서버 스냅샷 = "봤음"(서버에선 안 그림 → hydration 안전).
const flagListeners = new Set<() => void>();
const readFlag = (k: string) => { try { return window.localStorage.getItem(k) === "1"; } catch { return true; } };
const subscribeFlags = (cb: () => void) => { flagListeners.add(cb); return () => { flagListeners.delete(cb); }; };
function setFlag(k: string) { try { window.localStorage.setItem(k, "1"); } catch { /* 저장 불가 */ } flagListeners.forEach((l) => l()); }
const subscribeNoop = () => () => {};
const getHour = () => new Date().getHours();

type Row = Store & { distance_m?: number };
type Check = { kind: "idle" | "checking" | "ok" | "far" | "inaccurate" | "denied" | "unsupported"; distance_m?: number };

const getPosition = () => new Promise<GeoFix>((resolve, reject) => {
  if (!("geolocation" in navigator)) { reject(new Error("unsupported")); return; }
  navigator.geolocation.getCurrentPosition(
    (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
    (e) => reject(e), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  );
});
const dirHref = (s: Store, drive: boolean) => `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=${drive ? "transit" : "walking"}`;
const fmtDate = (iso: string) => { const d = new Date(iso); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`; };
const fmtDist = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);
// 에셋 스프라이트 — public/quest/<key>.webp (lib/questAssets.json 원본 → quest-assets.yml 이 반입·축소). 로드 성공은 상태로
// 부모에 알린다(has-<key> 클래스 → CSS 임시 그림 숨김). ⚠️ classList 직접 조작은 React 가 className 을 다시 쓰면 지워진다(2026-09-10 사고).
type AssetKey = string;   // = lib/questAssets.json 키 (plate*/station/building/walker/hero/taxi/pin/stamp/badge/badge_n/icon_*/shelf/share_bg/onboarding_n/sheet_*)
function Sprite({ k, className, onLoaded, style }: { k: AssetKey; className: string; onLoaded?: (k: AssetKey) => void; style?: CSSProperties }) {
  // 장식용 소형 스프라이트(투명 WebP) — next/image 최적화 대상 아님. 없으면 스스로 숨는다(fail-soft).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/quest/${k}.webp`} alt="" className={className} style={style} draggable={false} data-asset={k} onLoad={() => onLoaded?.(k)} onError={(e) => { e.currentTarget.style.display = "none"; }} />;
}
/** 스프라이트 시트 애니메이션 — 가로 1행 시트를 background 로 깔고 steps(frames, jump-none) 로 칸을 넘긴다(칸 폭 = 요소 폭, aspect-ratio 로 고정).
    이미지 로드는 Image() 프리로드로 감지해 부모에 알림(로드 전엔 정지 스프라이트가 대신 보인다). */
function AnimSprite({ k, className, style, onLoaded }: { k: SheetKey; className: string; style?: CSSProperties; onLoaded: (k: AssetKey) => void }) {
  const spec = SHEETS[k];
  useEffect(() => {
    let alive = true; const img = new Image();
    img.onload = () => { if (alive) onLoaded(k); };
    img.src = `/quest/${k}.webp`;
    return () => { alive = false; };
  }, [k, onLoaded]);
  return <div className={`t-quest-anim ${className}${spec.once ? " is-once" : ""}`} data-asset={k} aria-hidden="true"
    style={{ ...style, "--frames": spec.frames, "--ar": spec.ar, "--dur": `${spec.dur}s`, backgroundImage: `url(/quest/${k}.webp)` } as CSSProperties} />;
}
const loadImg = (src: string) => new Promise<HTMLImageElement | null>((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
/** 공유 카드 합성 (1080×1350) — 배경 share_bg(없으면 그라데이션) + 매장명·스탬프 수·칭호. 서버 없음, 전부 端末 canvas. */
async function composeShareCard(storeName: string, pref: string, count: number, title: string | null, dateText: string): Promise<Blob | null> {
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d"); if (!ctx) return null;
  const bg = await loadImg("/quest/share_bg.webp");
  if (bg) { const s = Math.max(W / bg.width, H / bg.height); ctx.drawImage(bg, (W - bg.width * s) / 2, (H - bg.height * s) / 2, bg.width * s, bg.height * s); }
  else { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#F9D9E3"); g.addColorStop(1, "#ED8CA5"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  const px = 72, py = 760, pw = W - px * 2, ph = 470;
  ctx.fillStyle = "rgba(255,255,255,0.94)"; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 36); ctx.fill();
  const stamp = await loadImg("/quest/stamp.webp");
  if (stamp) { ctx.save(); ctx.globalAlpha = 0.9; ctx.translate(W - px - 150, py + 130); ctx.rotate(-0.2); ctx.drawImage(stamp, -110, -110, 220, 220); ctx.restore(); }
  ctx.fillStyle = "#ED8CA5"; ctx.font = "800 30px system-ui, sans-serif"; ctx.fillText("TIBY QUEST", px + 56, py + 84);
  ctx.fillStyle = "#1A1A1A"; ctx.font = "800 60px system-ui, sans-serif"; ctx.fillText(storeName.length > 9 ? storeName.slice(0, 9) + "…" : storeName, px + 56, py + 168);
  ctx.fillStyle = "#555"; ctx.font = "600 34px system-ui, sans-serif"; ctx.fillText(`ドン・キホーテ${pref ? ` · ${pref}` : ""}`, px + 56, py + 224);
  ctx.fillStyle = "#1A1A1A"; ctx.font = "800 96px system-ui, sans-serif"; ctx.fillText(`${count}`, px + 56, py + 350);
  ctx.font = "700 34px system-ui, sans-serif"; ctx.fillText("スタンプ", px + 56 + ctx.measureText(`${count}`).width * 2.8 + 8, py + 350);
  if (title) { ctx.fillStyle = "#B5485F"; ctx.font = "700 34px system-ui, sans-serif"; ctx.fillText(`称号「${title}」`, px + 56, py + 410); }
  ctx.fillStyle = "#777"; ctx.font = "600 26px system-ui, sans-serif"; ctx.fillText(`${dateText} · tiby.shop/quest`, px + 56, py + 448);
  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}

export function QuestApp() {
  const book = useSyncExternalStore(subscribe, getBook, () => SERVER_BOOK);
  const stats = useMemo(() => bookStats(book), [book]);
  const onboarded = useSyncExternalStore(subscribeFlags, () => readFlag(ONBOARD_KEY), () => true);
  const homeHintDone = useSyncExternalStore(subscribeFlags, () => readFlag(HOME_HINT_KEY), () => true);
  const hour = useSyncExternalStore(subscribeNoop, getHour, () => 12);
  const [tab, setTab] = useState<"quest" | "book">("quest");
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [check, setCheck] = useState<Check>({ kind: "idle" });
  const [justStamped, setJustStamped] = useState<string | null>(null);
  const [slide, setSlide] = useState(0);
  const [share, setShare] = useState<{ url: string; busy: boolean } | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [loadedAssets, setLoadedAssets] = useState<Set<AssetKey>>(() => new Set());
  const markLoaded = useCallback((k: AssetKey) => setLoadedAssets((prev) => (prev.has(k) ? prev : new Set(prev).add(k))), []);
  // 씬 클래스: plate_* 는 전부 has-plate(임시 하늘/땅 숨김), 시트는 개별(has-sheet_walk …)
  const hasCls = Array.from(loadedAssets).map((k) => ` has-${k.startsWith("plate") ? "plate" : k}`).join("");

  const matches = useMemo<Row[]>(() => { const q = norm(query.trim()); return q ? stores.filter((s) => matchesQuery(s, q)).slice(0, 8) : []; }, [query]);
  const rows = query.trim() ? matches : nearby;
  const heading = query.trim()
    ? (matches.length ? `該当する店舗（${matches.length}件${matches.length === 8 ? "以上" : ""}）` : "該当する店舗が見つかりません")
    : nearby.length ? "お近くのクエスト" : null;

  useEffect(() => { if (selected && cardRef.current) cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, [selected]);
  useEffect(() => () => { if (share?.url) URL.revokeObjectURL(share.url); }, [share]);

  const select = (s: Row) => { setSelected(s); setCheck({ kind: "idle" }); setJustStamped(null); setTab("quest"); };

  const locate = async () => {
    setLocating(true); setNotice(null); setQuery("");
    try {
      const fix = await getPosition();
      setNearby(nearestStores(stores, fix.lat, fix.lng, 5));
    } catch (e) {
      setNotice((e as Error)?.message === "unsupported" ? "お使いのブラウザは位置情報に対応していません。" : "位置情報を取得できませんでした。ブラウザの設定をご確認ください。");
    } finally { setLocating(false); }
  };

  const checkin = async () => {
    if (!selected) return;
    if (book.stamps[selected.code]) { setCheck({ kind: "ok", distance_m: 0 }); return; }
    setCheck({ kind: "checking" });
    try {
      const fix = await getPosition();
      const r = evaluateCheckin(selected, fix);
      if (r.ok) {
        const { book: next, added } = addStamp(book, selected.code);
        if (added) { commitBook(next); setJustStamped(selected.code); }
        setCheck({ kind: "ok", distance_m: r.distance_m });
      } else setCheck({ kind: r.reason, distance_m: r.distance_m });
    } catch (e) {
      const err = e as { code?: number; message?: string };
      setCheck({ kind: err?.message === "unsupported" ? "unsupported" : err?.code === 1 ? "denied" : "inaccurate" });
    }
  };

  /** 공유 — Web Share(파일) 가능하면 시트, 아니면 카드 이미지를 화면에 띄워 長押し保存 */
  const shareCard = async (store: Store | null) => {
    setShare({ url: "", busy: true });
    const title = stats.reached.length ? stats.reached[stats.reached.length - 1].label : null;
    const blob = await composeShareCard(store ? shortName(store.full_name) : "TIBY Quest", store ? prefName(prefOf(store.code)) : "", stats.count, title, fmtDate(new Date().toISOString()));
    if (!blob) { setShare(null); return; }
    const file = new File([blob], "tiby-quest.png", { type: "image/png" });
    const text = shareText(stats, store ? shortName(store.full_name) : undefined);
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try { await nav.share({ files: [file], text }); setShare(null); return; } catch { /* 취소 → 폴백 */ }
    }
    setShare({ url: URL.createObjectURL(blob), busy: false });
  };

  const uncollected = uncollectedNearby(nearby, book, 3);

  return (
    <div className="t-quest">
      {!onboarded && (
        <div className="t-quest-onboard" role="dialog" aria-modal="true" aria-label="TIBY Questの遊び方">
          <div className="t-quest-onboard-card">
            <Sprite k={ONBOARDING[slide].k} className="t-quest-onboard-img" />
            <div className="t-quest-onboard-body">
              <div className="t-quest-onboard-dots" aria-hidden="true">{ONBOARDING.map((_, i) => <i key={i} className={i === slide ? "is-on" : ""} />)}</div>
              <h2>{ONBOARDING[slide].title}</h2>
              <p>{ONBOARDING[slide].text}</p>
              <div className="t-quest-onboard-actions">
                <button type="button" className="t-cta-ghost" onClick={() => setFlag(ONBOARD_KEY)}>スキップ</button>
                {slide < ONBOARDING.length - 1
                  ? <button type="button" className="t-cta" onClick={() => setSlide(slide + 1)}>次へ</button>
                  : <button type="button" className="t-cta" onClick={() => setFlag(ONBOARD_KEY)} data-testid="onboard-start">はじめる</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="t-quest-head">
        <div className="t-eyebrow">TIBY Quest</div>
        <h1 className="t-h2-jp">TIBYを探しに行こう</h1>
        <p className="t-tool-lead">全国のドン・キホーテ {stores.length}店舗にTIBYが置いてあります。最寄り駅から歩いて、店舗の前でチェックイン。スタンプを集めて称号をゲット。</p>
        <dl className="t-quest-stats" aria-label="進捗">
          <div><dt>スタンプ</dt><dd data-testid="stamp-count">{stats.count}</dd></div>
          <div><dt>都道府県</dt><dd>{stats.prefs.length}</dd></div>
          <div><dt>次の称号</dt><dd className="is-text">{stats.next ? `「${stats.next.label}」まであと${stats.next.remain}` : "コンプリート！"}</dd></div>
        </dl>
      </div>

      <div className="t-quest-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "quest"} className={tab === "quest" ? "is-on" : ""} onClick={() => setTab("quest")}><Sprite k="icon_compass" className="t-quest-ico" />クエスト</button>
        <button type="button" role="tab" aria-selected={tab === "book"} className={tab === "book" ? "is-on" : ""} onClick={() => setTab("book")}><Sprite k="icon_book" className="t-quest-ico" />スタンプ帳{stats.count ? `（${stats.count}）` : ""}</button>
      </div>

      {tab === "quest" && (
        <section aria-label="クエストを探す">
          <div className="t-quest-bar">
            <input type="search" className="t-tool-input" placeholder="店舗名で検索（例：渋谷 / shibuya）" value={query} onChange={(e) => { setQuery(e.target.value); setNotice(null); }} aria-label="店舗名で検索" />
            <button type="button" className="t-cta" onClick={locate} disabled={locating}>{locating ? "取得中..." : "現在地から探す"}</button>
          </div>
          {notice && <p className="t-quest-notice" role="status">{notice}</p>}
          {heading && (
            <div className="t-quest-list" role="list">
              <div className="t-quest-list-head">{heading}</div>
              {rows.map((s) => {
                const r = routeLine(s.code); const done = !!book.stamps[s.code];
                return (
                  <button key={s.id} type="button" role="listitem" className={`t-quest-item${selected?.id === s.id ? " is-active" : ""}${done ? " is-done" : ""}`} onClick={() => select(s)}>
                    <span className="t-quest-item-text">
                      <span className="t-quest-item-name">{s.full_name}</span>
                      {r && <span className="t-quest-item-route">{r.drive ? "🚕" : "🚶"} {r.text}</span>}
                    </span>
                    <span className="t-quest-item-side">
                      {s.distance_m != null && <span className="t-quest-item-dist">約 {fmtDist(s.distance_m)}</span>}
                      {done && <span className="t-quest-item-done">✓ 済</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {!heading && !notice && <p className="t-quest-hint">「現在地から探す」で近くの店舗が出ます。検索でも選べます。</p>}

          {selected && (() => {
            const r = routeLine(selected.code); const drive = !!r?.drive; const stamped = book.stamps[selected.code];
            const pref = prefName(prefOf(selected.code));
            const plateKey = plateFor(prefOf(selected.code), hour);
            // 캐릭터 = 실제 GPS 진행도. 체크인 시도로 거리를 알면 그 자리에 서서 대기(idle), 모르면 길을 따라 자동 걷기(walk).
            const placed = check.kind === "far" && check.distance_m != null && !stamped;
            const progress = placed ? walkProgress(check.distance_m!, STORE_STATIONS[selected.code]?.dist_m ?? 0) : 0;
            const sheetKey: SheetKey = stamped ? "sheet_celebrate" : drive ? "sheet_taxi" : placed ? "sheet_idle" : "sheet_walk";
            const sheetReady = loadedAssets.has(sheetKey);
            const staticKey = stamped ? "hero" : drive ? "taxi" : "walker";
            const posStyle: CSSProperties | undefined = placed ? { left: `${22 + 44 * progress}%` } : undefined;
            const title = stats.reached.length ? stats.reached[stats.reached.length - 1].label : null;
            return (
              <section className="t-quest-card" ref={cardRef} aria-label={`${selected.full_name} のクエスト`}>
                {/* 템플릿 씬 — 매장별 데이터 없음. 역명·매장명·지역 플레이트(都道府県→8지역, 関東 밤=야경)만 바뀐다. 에셋 = public/quest/*.webp
                    (Higgsfield, 대표 승인 스타일 2026-09-10). 이미지가 없으면 onError 로 숨겨져 CSS 임시 그림이 보인다 — fail-soft. */}
                <div className={`t-quest-scene${drive ? " is-drive" : ""}${stamped ? " is-done" : ""}${placed ? " is-placed" : ""}${sheetReady ? " is-anim" : ""}${hasCls}`} data-scene="template" data-plate={plateKey} aria-hidden="true">
                  <div className="t-quest-sky" data-slot="backdrop" />
                  <div className="t-quest-ground" data-slot="street" />
                  <Sprite key={plateKey} k={plateKey} className="t-quest-plate" onLoaded={markLoaded} />
                  <div className="t-quest-station" data-slot="station"><span className="t-quest-station-sign">{r?.station ?? "駅"}駅</span></div>
                  <Sprite k="station" className="t-quest-sp t-quest-sp-station" onLoaded={markLoaded} />
                  <span className="t-quest-sp-label t-quest-sp-label-station">{r?.station ?? "駅"}駅</span>
                  <div className="t-quest-path"><i /><i /><i /><i /><i /><i /></div>
                  <div className="t-quest-walker" data-slot="character" style={posStyle}>{drive ? "🚕" : "🚶‍♀️"}</div>
                  {!sheetReady && <Sprite k={staticKey} className={`t-quest-sp t-quest-sp-walker${stamped ? " is-hero" : ""}`} style={posStyle} onLoaded={markLoaded} />}
                  <AnimSprite key={sheetKey} k={sheetKey} className={`t-quest-sp-walker${stamped ? " is-hero" : ""}`} style={posStyle} onLoaded={markLoaded} />
                  <div className="t-quest-building" data-slot="building">
                    <span className="t-quest-building-sign">ドン・キホーテ</span>
                    <span className="t-quest-building-name">{shortName(selected.full_name)}</span>
                    <span className="t-quest-building-tiby">TIBY</span>
                  </div>
                  <Sprite k="building" className="t-quest-sp t-quest-sp-building" onLoaded={markLoaded} />
                  <span className="t-quest-sp-label t-quest-sp-label-building">{shortName(selected.full_name)}</span>
                  {stamped && <div className="t-quest-scene-stamp">GOT IT!</div>}
                  {stamped && <Sprite k="stamp" className="t-quest-sp t-quest-sp-stamp" onLoaded={markLoaded} />}
                </div>
                <div className="t-quest-card-body">
                  <h2 className="t-quest-card-title">{selected.full_name}</h2>
                  <p className="t-quest-card-route">{r ? r.text : "経路情報なし"}{pref ? ` · ${pref}` : ""} · 売場はコスメコーナー</p>
                  {placed && <p className="t-quest-progress-line" data-testid="progress">🚶 駅から店舗まで {Math.round(progress * 100)}% — あと約 {fmtDist(check.distance_m ?? 0)}</p>}
                  <div className="t-quest-actions">
                    <a className="t-cta-ghost" href={dirHref(selected, drive)} target="_blank" rel="noopener noreferrer">道順を開く（Google Maps）</a>
                    <button type="button" className={`t-cta${stamped ? " t-cta-added" : ""}`} onClick={checkin} disabled={check.kind === "checking" || !!stamped} data-testid="checkin">
                      {!stamped && <Sprite k="icon_target" className="t-quest-ico is-light" />}
                      {stamped ? `スタンプ済み ${fmtDate(stamped.at)}` : check.kind === "checking" ? "位置を確認中..." : check.kind === "far" ? "もう一度チェックイン" : "店舗の前でチェックイン"}
                    </button>
                    {stamped && <button type="button" className="t-cta-ghost" onClick={() => shareCard(selected)} disabled={!!share?.busy} data-testid="share">{share?.busy ? "作成中..." : "スタンプをシェア"}</button>}
                  </div>
                  <p className={`t-quest-status${check.kind === "ok" ? " is-ok" : check.kind === "idle" || check.kind === "checking" ? "" : " is-ng"}`} role="status" data-testid="status">
                    {check.kind === "ok" && (justStamped === selected.code ? `スタンプGET！ ${stats.next ? `「${stats.next.label}」まであと${stats.next.remain}` : "コンプリート！"}${justStamped === selected.code && stats.reached.some((m) => m.n === stats.count) ? ` 称号「${title}」獲得！` : ""}` : "この店舗はスタンプ済みです。")}
                    {check.kind === "far" && `あと約 ${fmtDist(Math.max(0, (check.distance_m ?? 0) - CHECKIN_RADIUS_M))} — 店舗から${CHECKIN_RADIUS_M}m以内でチェックインしてください。`}
                    {check.kind === "inaccurate" && "位置情報の精度が低いようです。屋外や入口付近でもう一度お試しください。"}
                    {check.kind === "denied" && "位置情報の利用が許可されていません。ブラウザの設定で許可してください。"}
                    {check.kind === "unsupported" && "お使いのブラウザは位置情報に対応していません。"}
                  </p>
                  {stamped && (
                    <div className="t-quest-shelf" data-testid="shelf">
                      <Sprite k="shelf" className="t-quest-shelf-img" />
                      <p>店内ではコスメコーナーへ。TIBYのヘアパフューム3種（LOVE / HUG / KISS ME ME）を探してみて。</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}
        </section>
      )}

      {tab === "book" && (
        <section className="t-quest-book" aria-label="スタンプ帳">
          <div className="t-quest-milestones">
            {MILESTONES.map((m) => (
              <div key={m.n} className={`t-quest-ms${stats.count >= m.n ? " is-on" : ""}${loadedAssets.has(`badge_${m.n}`) ? " has-badge" : ""}`} title={`${m.n}店舗`}>
                <Sprite k={`badge_${m.n}`} className="t-quest-ms-img" onLoaded={markLoaded} />
                <span className="t-quest-ms-n">{m.n}</span><span className="t-quest-ms-label">{m.label}</span>
              </div>
            ))}
          </div>
          {stats.next && (
            <div className="t-quest-progress" aria-label="次の称号まで">
              <div className="t-quest-progress-bar" style={{ width: `${Math.min(100, Math.round((stats.count / stats.next.n) * 100))}%` }} />
            </div>
          )}
          {stats.prefs.length > 0 && (
            <div className="t-quest-prefs">{stats.prefs.map((p) => <span key={p} className="t-quest-pref"><Sprite k="badge" className="t-quest-pref-img" />{prefName(p)}</span>)}</div>
          )}
          <div className="t-quest-next" data-testid="uncollected">
            <div className="t-quest-list-head">近くの未収集スタンプ</div>
            {nearby.length === 0
              ? <button type="button" className="t-cta-ghost" onClick={locate} disabled={locating}>{locating ? "取得中..." : "現在地から探す"}</button>
              : uncollected.length === 0
                ? <p className="t-quest-hint">近くの店舗はすべてスタンプ済み。少し足をのばしてみよう。</p>
                : uncollected.map((s) => {
                  const r = routeLine(s.code);
                  return (
                    <button key={s.id} type="button" className="t-quest-item" onClick={() => select(s)}>
                      <span className="t-quest-item-text"><span className="t-quest-item-name">{s.full_name}</span>{r && <span className="t-quest-item-route">{r.drive ? "🚕" : "🚶"} {r.text}</span>}</span>
                      <span className="t-quest-item-side">{s.distance_m != null && <span className="t-quest-item-dist">約 {fmtDist(s.distance_m)}</span>}<span className="t-quest-item-go">行く →</span></span>
                    </button>
                  );
                })}
          </div>
          {stats.count === 0 ? (
            <p className="t-quest-hint">まだスタンプがありません。「クエスト」から近くの店舗を探してチェックインしよう。</p>
          ) : (
            <>
              <div className="t-quest-grid">
                {Object.entries(book.stamps).sort((a, b) => b[1].at.localeCompare(a[1].at)).map(([code, v]) => {
                  const s = stores.find((x) => x.code === code);
                  return (
                    <div key={code} className={`t-quest-stamp${justStamped === code ? " is-new" : ""}`}>
                      <Sprite k="stamp" className="t-quest-stamp-img" />
                      <span className="t-quest-stamp-name">{s ? shortName(s.full_name) : code}</span>
                      <span className="t-quest-stamp-meta">{prefName(prefOf(code))}<br />{fmtDate(v.at)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="t-quest-actions"><button type="button" className="t-cta-ghost" onClick={() => shareCard(null)} disabled={!!share?.busy}>{share?.busy ? "作成中..." : "スタンプ帳をシェア"}</button></div>
              {!homeHintDone && (
                <div className="t-quest-callout" role="note" data-testid="home-hint">
                  <p><b>ホーム画面に追加すると次回すぐ開けます。</b><br />iPhone：共有ボタン → 「ホーム画面に追加」／Android：メニュー → 「ホーム画面に追加」</p>
                  <button type="button" className="t-quest-callout-x" onClick={() => setFlag(HOME_HINT_KEY)} aria-label="閉じる">×</button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {share && !share.busy && (
        <div className="t-quest-onboard" role="dialog" aria-modal="true" aria-label="シェア画像">
          <div className="t-quest-onboard-card is-share">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={share.url} alt="TIBY Quest シェア画像" className="t-quest-share-img" />
            <div className="t-quest-onboard-body">
              <p>画像を長押しして保存・シェアできます。</p>
              <div className="t-quest-onboard-actions"><button type="button" className="t-cta" onClick={() => setShare(null)}>閉じる</button></div>
            </div>
          </div>
        </div>
      )}

      <p className="t-quest-note">位置情報はチェックイン判定にのみ使用し、スタンプはこの端末内にだけ保存されます（サーバーには送信しません）。</p>
    </div>
  );
}
