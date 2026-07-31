import type { Metadata } from "next";
import { StoreLocator } from "@/components/stores/StoreLocator";
import { stores } from "@/lib/storesData";

// 구 tiby.me/stores(볼트 배포 SPA)를 쇼핑몰 자체 페이지로 이관 —
// netlify.toml 의 /stores 프록시는 제거됨. 매장 데이터는 lib/storesData.ts.
export const metadata: Metadata = {
  title: "店舗一覧 | Tiby — Hair Perfume",
  description: "TIBYヘアパフュームが買える全国のドン・キホーテ店舗マップ。お近くの店舗を検索できます。",
  openGraph: {
    title: "TIBY ヘアパフューム | 店舗一覧",
    description: "全国のドン・キホーテで販売中",
  },
};

export default function StoresPage() {
  return (
    <div className="t-page t-static-page">
      <div className="t-tool-inner t-tool-inner--wide">
        <div className="t-tool-head">
          <div className="t-eyebrow">Store locator</div>
          <h1 className="t-h2-jp">TIBYが買える店舗</h1>
          <p className="t-tool-lead">
            全国のドン・キホーテ {stores.length}店舗で販売中。オンラインなら、このままtiby.shopでも。
          </p>
        </div>
        <StoreLocator />
      </div>
    </div>
  );
}
