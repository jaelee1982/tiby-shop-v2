export type Product = {
  slug: string;
  name: string;
  nameJa: string;
  number: string;
  color: string;
  colorHex: string;
  colorDim: string;
  tagline: string;
  concept: string;
  profile: string;
  notes: {
    top: string;
    mid: string;
    base: string;
  };
  image: string;
  imageSide: string;
  heroImage: string;
  scenes: { image: string; title: string; category: string }[];
  reviews: { text: string; author: string; stars: number }[];
};

const CDN = "https://cdn.shopify.com/s/files/1/0948/3173/9160/files";

export const products: Product[] = [
  {
    slug: "love-me-me",
    name: "LOVE ME ME",
    nameJa: "ラブ ミーミー",
    number: "01",
    color: "love",
    colorHex: "#F0906E",
    colorDim: "rgba(240,144,110,0.15)",
    tagline: "近づいたとき、気づいてほしい香り。\nすれ違った瞬間の、ズルい残り香。",
    concept:
      "ビターオレンジのきらめきから、ジャスミン・ピーチ・ローズのロマンティックなブーケへ。アンバーのやさしい余韻が長く漂います。",
    profile: "Fresh Floral Musk Amber",
    notes: {
      top: "Bergamot · Orange · Peach",
      mid: "Orchid · Rose · Jasmine",
      base: "Musk · Amber",
    },
    image: `${CDN}/LOVE_ME_ME_pink_front1_1.png`,
    imageSide: `${CDN}/LOVE_ME_ME_pink_side_2.png`,
    heroImage: `${CDN}/tiby_lovememe_hairperfume_03_hero.jpg`,
    scenes: [
      {
        image: `${CDN}/love-me-me-scene-weekend.png`,
        title: "お出かけの日",
        category: "Weekend",
      },
      {
        image: `${CDN}/love-me-me-scene-date_1.png`,
        title: "デートの日",
        category: "Date",
      },
    ],
    reviews: [
      {
        text: "髪を揺らすたびにふわっと香って、友達に「いい匂い！」って言われました。",
        author: "Mika, 22",
        stars: 5,
      },
      {
        text: "香水は苦手だけど、これはちょうどいい。毎日使ってます。",
        author: "Yui, 19",
        stars: 5,
      },
      {
        text: "ピーチとローズの組み合わせが最高。リピ確定！",
        author: "Hana, 25",
        stars: 4,
      },
    ],
  },
  {
    slug: "hug-me-me",
    name: "HUG ME ME",
    nameJa: "ハグ ミーミー",
    number: "02",
    color: "hug",
    colorHex: "#6DBFBA",
    colorDim: "rgba(109,191,186,0.15)",
    tagline: "抱きしめたくなる、やさしい温もり。\nバニラ＆ムスクの甘い余韻。",
    concept:
      "ココナッツとバニラの甘く温かい香り。肌に寄り添い、柔らかく香ります。",
    profile: "Citrus Floral Vanilla",
    notes: {
      top: "Lemon · Tangerine",
      mid: "Orchid · Lily of the Valley",
      base: "Musk · Sandalwood · Vanilla",
    },
    image: `${CDN}/LOVE_ME_ME_Green_front1_3.png`,
    imageSide: `${CDN}/LOVE_ME_ME_Green_side_1.png`,
    heroImage: `${CDN}/tiby_hugmeme_hairperfume_07_hero.jpg`,
    scenes: [
      {
        image: `${CDN}/tiby_cafe_hug_meme_lunch_after.png`,
        title: "ひとりの午後",
        category: "Daily",
      },
      {
        image: `${CDN}/tiby_hugmeme_hairperfume_10_hero.jpg`,
        title: "おやすみ前",
        category: "Night",
      },
    ],
    reviews: [
      {
        text: "バニラの香りが甘すぎず、ちょうどいい。おやすみ前に使ってます。",
        author: "Rina, 21",
        stars: 5,
      },
      {
        text: "彼に「いい匂い」って言われた！リピートします。",
        author: "Saki, 23",
        stars: 5,
      },
      {
        text: "柔らかい香りで一日中癒されます。お気に入り。",
        author: "Nao, 20",
        stars: 4,
      },
    ],
  },
  {
    slug: "kiss-me-me",
    name: "KISS ME ME",
    nameJa: "キス ミーミー",
    number: "03",
    color: "kiss",
    colorHex: "#A99FCC",
    colorDim: "rgba(169,159,204,0.15)",
    tagline: "すれ違う瞬間に残る、\nフルーティーで可憐な香り。",
    concept:
      "フルーティーだけど甘すぎなくて、大人っぽい。デートに最適。",
    profile: "Fruity Floral",
    notes: {
      top: "Apple · Raspberry",
      mid: "Orchid · Gardenia · Freesia",
      base: "Musk · Amber · Wood",
    },
    image: `${CDN}/LOVE_ME_ME_purple_front1_1.png`,
    imageSide: `${CDN}/LOVE_ME_ME_purple_side_1.png`,
    heroImage: `${CDN}/tiby_kissmeme_hairperfume_03_hero.jpg`,
    scenes: [
      {
        image: `${CDN}/kiss_me_me_restaurant.jpg`,
        title: "特別な夜",
        category: "Night Out",
      },
      {
        image: `${CDN}/tiby_date__at_night_kiss_meme.png`,
        title: "デートの夜",
        category: "Date",
      },
    ],
    reviews: [
      {
        text: "フルーティーで爽やか！通学中にさりげなく香る感じが好き。",
        author: "Aoi, 18",
        stars: 5,
      },
      {
        text: "デートの前にいつもつけてます。褒められ率が高い！",
        author: "Mei, 24",
        stars: 5,
      },
      {
        text: "アップルとラズベリーの香りが新鮮。他にない香り。",
        author: "Kana, 22",
        stars: 4,
      },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
