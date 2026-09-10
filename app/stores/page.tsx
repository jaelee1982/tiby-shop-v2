import type { Metadata } from "next";
import { StoreLocator } from "@/components/stores/StoreLocator";
import { StoresHero } from "@/components/stores/StoresHero";

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
      <StoresHero />
      <div className="t-tool-inner t-tool-inner--wide">
        <div className="t-tool-head">
          <div className="t-eyebrow">Find a store</div>
          <h2 className="t-h2-jp">近くの店舗を探す</h2>
          <p className="t-tool-lead">
            店舗名で検索するか、現在地から近い店舗を表示します。オンラインなら、このままtiby.shopでも。
          </p>
        </div>
        <StoreLocator />
      </div>
    </div>
  );
}
