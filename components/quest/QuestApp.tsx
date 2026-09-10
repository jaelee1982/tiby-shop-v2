"use client";

// TIBY Quest — 돈키 매장을 찾아가 GPS 체크인 → 스탬프 (Phase 2 화면, 설계 = giant-ops docs/TIBY_QUEST_DESIGN.md).
// 원칙: 매장별 사람 입력 0 — 씬은 템플릿 1종(역 → 길 → 돈키 건물)에 매장명·역명만 끼운다. data-slot 자리에 Higgsfield
// 에셋(대표 승인 후)을 얹는다. 스탬프는 端末 localStorage(Phase 3 에서 별도 Supabase 로 이관). 판매·재고 데이터 없음.
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { stores, type Store } from "@/lib/storesData";
import { matchesQuery, norm, shortName } from "@/lib/storeSearch";
import {
  BOOK_KEY, CHECKIN_RADIUS_M, MILESTONES, addStamp, bookStats, emptyBook, evaluateCheckin, loadBook, nearestStores,
  prefName, prefOf, routeLine, saveBook, type GeoFix, type StampBook,
} from "@/lib/quest";

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
type AssetKey = "plate" | "station" | "building" | "walker" | "hero" | "taxi" | "pin" | "stamp" | "badge";   // = lib/questAssets.json 키
function Sprite({ k, className, onLoaded }: { k: AssetKey; className: string; onLoaded?: (k: AssetKey) => void }) {
  // 장식용 소형 스프라이트(투명 WebP) — next/image 최적화 대상 아님. 없으면 스스로 숨는다(fail-soft).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/quest/${k}.webp`} alt="" className={className} draggable={false} data-asset={k} onLoad={() => onLoaded?.(k)} onError={(e) => { e.currentTarget.style.display = "none"; }} />;
}

export function QuestApp() {
  const book = useSyncExternalStore(subscribe, getBook, () => SERVER_BOOK);
  const stats = useMemo(() => bookStats(book), [book]);
  const [tab, setTab] = useState<"quest" | "book">("quest");
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [check, setCheck] = useState<Check>({ kind: "idle" });
  const [justStamped, setJustStamped] = useState<string | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [loadedAssets, setLoadedAssets] = useState<Set<AssetKey>>(() => new Set());
  const markLoaded = (k: AssetKey) => setLoadedAssets((prev) => (prev.has(k) ? prev : new Set(prev).add(k)));
  const hasCls = Array.from(loadedAssets).map((k) => ` has-${k}`).join("");

  const matches = useMemo<Row[]>(() => { const q = norm(query.trim()); return q ? stores.filter((s) => matchesQuery(s, q)).slice(0, 8) : []; }, [query]);
  const rows = query.trim() ? matches : nearby;
  const heading = query.trim()
    ? (matches.length ? `該当する店舗（${matches.length}件${matches.length === 8 ? "以上" : ""}）` : "該当する店舗が見つかりません")
    : nearby.length ? "お近くのクエスト" : null;

  useEffect(() => { if (selected && cardRef.current) cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, [selected]);

  const select = (s: Row) => { setSelected(s); setCheck({ kind: "idle" }); setJustStamped(null); };

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

  return (
    <div className="t-quest">
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
        <button type="button" role="tab" aria-selected={tab === "quest"} className={tab === "quest" ? "is-on" : ""} onClick={() => setTab("quest")}>クエスト</button>
        <button type="button" role="tab" aria-selected={tab === "book"} className={tab === "book" ? "is-on" : ""} onClick={() => setTab("book")}>スタンプ帳{stats.count ? `（${stats.count}）` : ""}</button>
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
            return (
              <section className="t-quest-card" ref={cardRef} aria-label={`${selected.full_name} のクエスト`}>
                {/* 템플릿 씬 — 매장별 데이터 없음. 역명·매장명만 바뀐다. 에셋 = public/quest/*.png(Higgsfield, 대표 승인 스타일 2026-09-10).
                    이미지가 아직 없으면(반입 전) onError 로 숨겨져 아래 CSS 임시 그림이 그대로 보인다 — fail-soft. */}
                <div className={`t-quest-scene${drive ? " is-drive" : ""}${stamped ? " is-done" : ""}${hasCls}`} data-scene="template" aria-hidden="true">
                  <div className="t-quest-sky" data-slot="backdrop" />
                  <div className="t-quest-ground" data-slot="street" />
                  <Sprite k="plate" className="t-quest-plate" onLoaded={markLoaded} />
                  <div className="t-quest-station" data-slot="station"><span className="t-quest-station-sign">{r?.station ?? "駅"}駅</span></div>
                  <Sprite k="station" className="t-quest-sp t-quest-sp-station" onLoaded={markLoaded} />
                  <span className="t-quest-sp-label t-quest-sp-label-station">{r?.station ?? "駅"}駅</span>
                  <div className="t-quest-path"><i /><i /><i /><i /><i /><i /></div>
                  <div className="t-quest-walker" data-slot="character">{drive ? "🚕" : "🚶‍♀️"}</div>
                  <Sprite k={stamped ? "hero" : drive ? "taxi" : "walker"} className={`t-quest-sp t-quest-sp-walker${stamped ? " is-hero" : ""}`} onLoaded={markLoaded} />
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
                  <div className="t-quest-actions">
                    <a className="t-cta-ghost" href={dirHref(selected, drive)} target="_blank" rel="noopener noreferrer">道順を開く（Google Maps）</a>
                    <button type="button" className={`t-cta${stamped ? " t-cta-added" : ""}`} onClick={checkin} disabled={check.kind === "checking" || !!stamped} data-testid="checkin">
                      {stamped ? `スタンプ済み ${fmtDate(stamped.at)}` : check.kind === "checking" ? "位置を確認中..." : "店舗の前でチェックイン"}
                    </button>
                  </div>
                  <p className={`t-quest-status${check.kind === "ok" ? " is-ok" : check.kind === "idle" || check.kind === "checking" ? "" : " is-ng"}`} role="status" data-testid="status">
                    {check.kind === "ok" && (justStamped === selected.code ? `スタンプGET！ ${stats.next ? `「${stats.next.label}」まであと${stats.next.remain}` : "コンプリート！"}` : "この店舗はスタンプ済みです。")}
                    {check.kind === "far" && `あと約 ${fmtDist(Math.max(0, (check.distance_m ?? 0) - CHECKIN_RADIUS_M))} — 店舗から${CHECKIN_RADIUS_M}m以内でチェックインしてください。`}
                    {check.kind === "inaccurate" && "位置情報の精度が低いようです。屋外や入口付近でもう一度お試しください。"}
                    {check.kind === "denied" && "位置情報の利用が許可されていません。ブラウザの設定で許可してください。"}
                    {check.kind === "unsupported" && "お使いのブラウザは位置情報に対応していません。"}
                  </p>
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
              <div key={m.n} className={`t-quest-ms${stats.count >= m.n ? " is-on" : ""}`}>
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
          {stats.count === 0 ? (
            <p className="t-quest-hint">まだスタンプがありません。「クエスト」から近くの店舗を探してチェックインしよう。</p>
          ) : (
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
          )}
        </section>
      )}

      <p className="t-quest-note">位置情報はチェックイン判定にのみ使用し、スタンプはこの端末内にだけ保存されます（サーバーには送信しません）。</p>
    </div>
  );
}
