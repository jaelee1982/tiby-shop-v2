// tiby.shop — legal page content (特定商取引法に基づく表記 / プライバシーポリシー).
// All owner-editable business facts live in lib/site.ts — edit them there.
// Rows whose value starts with「TODO:」render with a visible highlight until filled in.
import { siteConfig } from "@/lib/site";

export type TokushohoRow = { label: string; value: string; note?: string };

export const tokushoho: TokushohoRow[] = [
  { label: "販売業者", value: siteConfig.companyLegalName },
  { label: "運営統括責任者", value: siteConfig.operatorName },
  { label: "所在地", value: siteConfig.address },
  {
    label: "電話番号",
    value: siteConfig.phone,
    note: "お電話でのお問い合わせは受け付けておりません。お問い合わせはメールにてお願いいたします。",
  },
  { label: "メールアドレス", value: siteConfig.contactEmail },
  {
    label: "販売価格",
    value:
      "各商品ページに表示された価格（税込）に基づきます。ヘアパフューム各種 ¥999（税込）／ 3本セット ¥2,700（税込）",
  },
  {
    label: "商品代金以外の必要料金",
    value: "別途配送料がかかります。配送料はご注文手続き画面にてご確認いただけます。",
  },
  {
    label: "支払方法",
    value:
      "クレジットカード決済ほか、決済代行サービス KOMOJU が提供する各種決済方法をご利用いただけます。",
  },
  {
    label: "支払時期",
    value:
      "前払いとなります。クレジットカード決済：ご注文時にお支払いが確定します。その他の決済方法：各決済サービスの定めに基づきます。",
  },
  {
    label: "商品の引渡時期",
    value: siteConfig.shippingPolicy,
  },
  {
    label: "返品・交換・キャンセルについて",
    value: siteConfig.returnPolicy,
  },
  {
    label: "不良品について",
    value:
      "初期不良の場合、ご購入から7日以内にメールにてご連絡ください。確認のうえ、交換等の対応をさせていただきます。",
  },
  {
    label: "申込みの有効期限",
    value:
      "前払いのため、お支払いの確認をもってご注文確定となります。コンビニ決済等の支払期限は、各決済サービスの定めに基づきます。",
  },
  { label: "販売数量", value: "1点からご購入いただけます。" },
  { label: "お問い合わせ対応時間", value: siteConfig.businessHours },
  {
    label: "その他",
    value:
      "お客様のご事情（長期不在・住所不明等）による再配達は、着払いにて対応させていただきます。",
  },
];

export type PolicySection = { heading: string; body: string[] };

export const privacyPolicy: PolicySection[] = [
  {
    heading: "1. 個人情報の取得",
    body: [
      `${siteConfig.companyLegalName}（以下「当社」）は、当サイトにおける商品のご注文・お問い合わせの際に、氏名、住所、電話番号、メールアドレス等の個人情報を取得します。`,
    ],
  },
  {
    heading: "2. 利用目的",
    body: [
      "取得した個人情報は、以下の目的で利用します。",
      "・ご注文いただいた商品の発送およびご連絡",
      "・お問い合わせへの対応",
      "・法令に基づく対応",
    ],
  },
  {
    heading: "3. 第三者提供",
    body: [
      "当社は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供しません。ただし、商品の配送業務および決済業務（決済代行サービス KOMOJU 等）の遂行に必要な範囲で、業務委託先に提供することがあります。",
    ],
  },
  {
    heading: "4. 決済情報について",
    body: [
      "クレジットカード番号等の決済情報は、決済代行サービス KOMOJU（株式会社DEGICA）により安全に処理され、当社のサーバーには保存されません。",
    ],
  },
  {
    heading: "5. 安全管理",
    body: [
      "当社は、個人情報の漏えい、滅失またはき損の防止のために、必要かつ適切な安全管理措置を講じます。",
    ],
  },
  {
    heading: "6. 開示・訂正・削除",
    body: [
      `ご本人からの個人情報の開示・訂正・削除のご請求には、本人確認のうえ速やかに対応します。お問い合わせは ${siteConfig.contactEmail} までご連絡ください。`,
    ],
  },
  {
    heading: "7. 改定",
    body: [
      "本ポリシーの内容は、法令の改正等に応じて予告なく変更することがあります。変更後の内容は当ページに掲載した時点で効力を生じます。",
    ],
  },
];
