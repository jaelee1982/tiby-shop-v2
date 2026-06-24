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
  heroHook: string;
  heroSub: string;
  problems: { em: string; text: string }[];
  notes: {
    top: string;
    mid: string;
    base: string;
  };
  notesDesc: {
    top: string;
    mid: string;
    base: string;
  };
  image: string;
  imageSide: string;
  heroImage: string;
  scenes: { image: string; title: string; category: string; sub: string }[];
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
    tagline:
      "みずみずしいピーチと柑橘系に、華やかなフローラルとやさしいムスクが重なる上品な香り。",
    concept:
      "ビターオレンジのきらめきから、ジャスミン・ピーチ・ローズのロマンティックなブーケへ。アンバーのやさしい余韻が長く漂います。",
    profile: "Fresh Floral Musk Amber",
    heroHook: "髪のニオイ、\n誰かに気づかれて\nいませんか？",
    heroSub:
      "せっかくのコーデも、香水も。\n髪の印象ひとつで、すべてが変わる。\nTIBYは、すれ違う瞬間に残る——\nヘア専用の香りです。",
    problems: [
      {
        em: "「電車でふわっと香りが漂ったとき」",
        text: "自分の髪からとは言えなかった",
      },
      {
        em: "「普通の香水は重すぎて」",
        text: "髪につけるのをためらってしまう",
      },
      {
        em: "「夕方になると",
        text: "髪のニオイが気になって自信が持てなくなる」",
      },
    ],
    notes: {
      top: "Bergamot · Orange · Peach",
      mid: "Orchid · Rose · Jasmine · Lily",
      base: "Musk · Amber",
    },
    notesDesc: {
      top: "ピーチ、ベルガモット、オレンジを含むフレッシュな香り",
      mid: "ローズ、ジャスミン、フリージアなどのフローラルな香り",
      base: "ムスクやアンバーの温かみがある甘い香り",
    },
    image: `${CDN}/LOVE_ME_ME_pink_front1_1.png`,
    imageSide: `${CDN}/LOVE_ME_ME_pink_side_2.png`,
    heroImage: `${CDN}/tiby_lovememe_hairperfume_04_hero.jpg`,
    scenes: [
      {
        image: `${CDN}/love-me-me-scene-date_1.png`,
        title: "デートの前に",
        category: "Date",
        sub: "すれ違う瞬間の、ズルい残り香",
      },
      {
        image: `${CDN}/tiby_lovememe_hairperfume_10_usage.jpg`,
        title: "外出前の仕上げに",
        category: "Getting Ready",
        sub: "15〜25cm離してシュッと一吹き",
      },
      {
        image: `${CDN}/love-me-me-scene-campus.png`,
        title: "キャンパスでも",
        category: "Campus",
        sub: "さりげなく漂う、やさしい香り",
      },
      {
        image: `${CDN}/love-me-me-scene-weekend.png`,
        title: "お出かけの日に",
        category: "Weekend",
        sub: "鞄に入れて、いつでも使える",
      },
    ],
    reviews: [
      {
        text: "「香水は重いと感じていたけど、これは軽くてちょうどいい。朝つけると夕方までふわっと感じます」",
        author: "@yuki___ · 20代 / 東京",
        stars: 5,
      },
      {
        text: "「¥999なのに香りがしっかりしていて驚いた。ドンキで見つけてからリピートしてます」",
        author: "@hana.s · 20代 / 大阪",
        stars: 5,
      },
      {
        text: "「彼氏に『なんかいい匂いする』って言われた！髪専用って初めて使ったけど全然違う」",
        author: "@miho.__ · 20代 / 神奈川",
        stars: 4,
      },
      {
        text: "「スプレーが細かくて使いやすい。ピーチとローズの混ざり方が絶妙で毎朝のルーティンになってます」",
        author: "@rin.__ · 20代 / 愛知",
        stars: 5,
      },
      {
        text: "「3本全部買った！シーンで使い分けてます。コスパ最高すぎる」",
        author: "@saki.m · 20代 / 福岡",
        stars: 5,
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
    tagline:
      "フレッシュな柑橘系とココナッツを思わせる濃厚でエキゾチックな甘さが重なり、バニラとムスクがやさしく包み込む香り。",
    concept:
      "ココナッツとバニラの甘く温かい香り。肌に寄り添い、柔らかく香ります。",
    profile: "Citrus Floral Vanilla",
    heroHook: "やさしく包まれたい、\nそんな日の\n香り。",
    heroSub:
      "バニラとムスクが織りなす\n甘く温かな余韻。\n抱きしめたくなる、\nやさしい温もりの香り。",
    problems: [
      {
        em: "「甘い香りが好きだけど」",
        text: "香水だと強すぎて周りの目が気になる",
      },
      {
        em: "「リラックスしたい夜に」",
        text: "ちょうどいい香りが見つからない",
      },
      {
        em: "「自分だけに香る」",
        text: "やさしい甘さがほしい",
      },
    ],
    notes: {
      top: "Lemon · Tangerine",
      mid: "Orchid · Lily of the Valley",
      base: "Musk · Sandalwood · Vanilla",
    },
    notesDesc: {
      top: "レモンやタンジェリンの柑橘系の香り",
      mid: "オーキッドやクチナシのココナッツみたいな甘くて濃厚な香り",
      base: "バニラとムスクの甘く優しい香り",
    },
    image: `${CDN}/LOVE_ME_ME_Green_front1_3.png`,
    imageSide: `${CDN}/LOVE_ME_ME_Green_side_1.png`,
    heroImage: `${CDN}/tiby_hugmeme_hairperfume_07_hero.jpg`,
    scenes: [
      {
        image: `${CDN}/tiby_cafe_hug_meme_lunch_after.png`,
        title: "ひとりの午後",
        category: "Daily",
        sub: "カフェで読書。自分だけに漂う癒し",
      },
      {
        image: `${CDN}/tiby_hugmeme_hairperfume_10_hero.jpg`,
        title: "おやすみ前に",
        category: "Night",
        sub: "枕にそっと。好きな香りで眠りにつく",
      },
      {
        image: `${CDN}/tiby_hugmeme_hairperfume_08_usage.jpg`,
        title: "オフィスでも",
        category: "Office",
        sub: "さりげなく、やわらかく香る",
      },
      {
        image: `${CDN}/tiby_hugmeme_hairperfume_14_hero.jpg`,
        title: "休日のお出かけ",
        category: "Weekend",
        sub: "バニラの甘さに包まれて",
      },
    ],
    reviews: [
      {
        text: "「バニラの香りが甘すぎず、ちょうどいい。おやすみ前に使ってます」",
        author: "@rina_22 · 20代 / 東京",
        stars: 5,
      },
      {
        text: "「彼に『いい匂い』って言われた！リピートします」",
        author: "@saki.23 · 20代 / 大阪",
        stars: 5,
      },
      {
        text: "「柔らかい香りで一日中癒されます。お気に入り」",
        author: "@nao_20 · 20代 / 名古屋",
        stars: 4,
      },
      {
        text: "「サンダルウッドとバニラの組み合わせが最高。大人っぽい甘さ」",
        author: "@yumi.__ · 20代 / 横浜",
        stars: 5,
      },
      {
        text: "「3つの中で一番好き。毎日使っても飽きない」",
        author: "@mai.k · 20代 / 京都",
        stars: 5,
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
    tagline:
      "甘いフルーツの香りから、アンバーとウッディの温もりへ変化するエレガントで高級感のある香り。",
    concept:
      "フルーティーだけど甘すぎなくて、大人っぽい。デートに最適。",
    profile: "Fruity Floral",
    heroHook: "すれ違った瞬間、\n振り返らせる\n香り。",
    heroSub:
      "アップルとラズベリーの\nフルーティーな可憐さ。\nすれ違う瞬間に残る、\n記憶に刻まれる香り。",
    problems: [
      {
        em: "「フルーティーな香りが好きだけど」",
        text: "子どもっぽくなりたくない",
      },
      {
        em: "「デートの前に」",
        text: "さりげなく印象に残りたい",
      },
      {
        em: "「すれ違った瞬間に」",
        text: "振り返ってほしい",
      },
    ],
    notes: {
      top: "Apple · Raspberry",
      mid: "Orchid · Gardenia · Freesia",
      base: "Musk · Amber · Wood",
    },
    notesDesc: {
      top: "アップルやラズベリーの甘いフルーツの香り",
      mid: "シクラメンのスパイシーさとオーキッドのエレガントさを兼ね備えた高級感のある香り",
      base: "アンバーとウッディの温かみがある甘い香り",
    },
    image: `${CDN}/LOVE_ME_ME_purple_front1_1.png`,
    imageSide: `${CDN}/LOVE_ME_ME_purple_side_1.png`,
    heroImage: `${CDN}/tiby_kissmeme_hairperfume_03_hero.jpg`,
    scenes: [
      {
        image: `${CDN}/kiss_me_me_restaurant.jpg`,
        title: "特別な夜に",
        category: "Night Out",
        sub: "エレガントに漂う大人のエチケット",
      },
      {
        image: `${CDN}/tiby_date__at_night_kiss_meme.png`,
        title: "デートの夜",
        category: "Date",
        sub: "記憶に残る、魅惑的な残り香",
      },
      {
        image: `${CDN}/Tiby_tokyo_subway_kiss_meme.png`,
        title: "すれ違う瞬間",
        category: "Commute",
        sub: "エレベーターや街角で",
      },
      {
        image: `${CDN}/kiss_elevator.jpg`,
        title: "エレベーターで",
        category: "Elevator",
        sub: "ふわっと香る、ズルい残り香",
      },
    ],
    reviews: [
      {
        text: "「フルーティーで爽やか！通学中にさりげなく香る感じが好き」",
        author: "@aoi_18 · 10代 / 千葉",
        stars: 5,
      },
      {
        text: "「デートの前にいつもつけてます。褒められ率が高い！」",
        author: "@mei.24 · 20代 / 東京",
        stars: 5,
      },
      {
        text: "「アップルとラズベリーの香りが新鮮。他にない香り」",
        author: "@kana.22 · 20代 / 大阪",
        stars: 4,
      },
      {
        text: "「大人っぽいフルーティー。甘すぎないのが最高」",
        author: "@riko.__ · 20代 / 福岡",
        stars: 5,
      },
      {
        text: "「友達全員に勧めてる。この値段でこの香りはズルい」",
        author: "@moe.21 · 20代 / 神戸",
        stars: 5,
      },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
