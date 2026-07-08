# tiby.shop — TIBY Hair Perfume 公式オンラインストア

Next.js (App Router) + Tailwind 4 のD2Cストア。Netlifyにデプロイ。
ブランド定本は [`tiby-content-os/00-canon/`](https://github.com/jaelee1982/tiby-content-os)（¥999税抜・税込¥1,099 / タイビー / ヘアパフューム / マスターカピー）。

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 本番ビルド
npx eslint .    # lint
```

## 決済（KOMOJU）

`/api/checkout` がカート内容をサーバー側で検証し、KOMOJUのホスト型決済セッションを作成してリダイレクトします。

必要な環境変数（Netlifyの Site settings → Environment variables に設定）:

| 変数 | 必須 | 説明 |
|---|---|---|
| `KOMOJU_SECRET_KEY` | ✅ | KOMOJU管理画面の Secret Key（`sk_live_...` / テストは `sk_test_...`） |
| `KOMOJU_API_URL` | — | 既定 `https://komoju.com/api/v1`（通常変更不要） |
| `NEXT_PUBLIC_SITE_URL` | 推奨 | `https://tiby.shop`（決済後の戻りURLの生成に使用） |

キー未設定の間は、レジに進むと「オンライン決済は現在準備中です」と表示されます（サイトは壊れません）。

### 購入フローのテスト手順

1. `KOMOJU_SECRET_KEY` にテストキー（`sk_test_...`）を設定
2. トップまたは商品ページで「カートに入れる」→ 右からカートが開く
3. 「レジに進む」→ KOMOJUの決済ページへリダイレクト
4. テストカードで支払い → `/checkout/complete` に戻り、カートが空になる

## オーナーが編集するファイル

| 内容 | ファイル |
|---|---|
| 会社情報・住所・電話・営業時間・配送/返品ポリシー | `lib/site.ts`（`TODO:` を実値に置換） |
| 特商法の表・プライバシーポリシー本文 | `lib/legal.ts` |
| 価格・SKU・セット構成 | `lib/commerce.ts` |
| 商品コピー・ノート・レビュー・画像 | `lib/products.ts` / `lib/skus.ts` |

`TODO:` で始まる値はサイト上で黄色くハイライト表示されます。**特商法ページのTODOをすべて埋めてからKOMOJU審査に提出してください。**

## 主要ルート

- `/` ストアフロント（SKU切替ヒーロー・3本セット）
- `/products/[slug]` 商品詳細（love-me-me / hug-me-me / kiss-me-me）
- `/legal/tokushoho` 特定商取引法に基づく表記
- `/legal/privacy` プライバシーポリシー
- `/contact` お問い合わせ（work@giantkorea.kr）
- `/checkout/complete` 決済完了（KOMOJU return_url）
- `/api/checkout` 決済セッション作成（POST）
