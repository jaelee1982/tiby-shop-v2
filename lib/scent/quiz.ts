// 香り診断 5문항 — 구 tiby.me src/pages/QuizPage.tsx 이식 (문항·스코어 동일).

export interface QuizOption {
  text: string;
  score: { love: number; hug: number; kiss: number };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "どんなシーンで使いたいですか？",
    options: [
      { text: "デートや特別な日", score: { love: 3, hug: 0, kiss: 2 } },
      { text: "毎日のリラックスタイム", score: { love: 0, hug: 3, kiss: 0 } },
      { text: "夜のお出かけ", score: { love: 1, hug: 0, kiss: 3 } },
      { text: "オフィスや日常使い", score: { love: 1, hug: 3, kiss: 0 } },
    ],
  },
  {
    id: 2,
    question: "好きな香りの系統は？",
    options: [
      { text: "フローラル（花の香り）", score: { love: 3, hug: 1, kiss: 1 } },
      { text: "シトラス（柑橘系）", score: { love: 0, hug: 3, kiss: 1 } },
      { text: "フルーティー（果実系）", score: { love: 1, hug: 1, kiss: 3 } },
      { text: "ムスク（深みのある香り）", score: { love: 2, hug: 0, kiss: 3 } },
    ],
  },
  {
    id: 3,
    question: "香りの強さはどのくらいがお好み？",
    options: [
      { text: "ふんわり優しく香る", score: { love: 1, hug: 3, kiss: 0 } },
      { text: "しっかり香りを感じたい", score: { love: 2, hug: 0, kiss: 3 } },
      { text: "程よい強さ", score: { love: 3, hug: 2, kiss: 2 } },
    ],
  },
  {
    id: 4,
    question: "あなたが目指したいイメージは？",
    options: [
      { text: "ロマンティックで女性らしい", score: { love: 3, hug: 0, kiss: 1 } },
      { text: "ナチュラルで清潔感がある", score: { love: 0, hug: 3, kiss: 0 } },
      { text: "セクシーで魅力的", score: { love: 1, hug: 0, kiss: 3 } },
      { text: "上品で洗練された", score: { love: 2, hug: 2, kiss: 1 } },
    ],
  },
  {
    id: 5,
    question: "一日のうちいつ使いたい？",
    options: [
      { text: "朝から夕方まで", score: { love: 1, hug: 3, kiss: 0 } },
      { text: "夕方から夜にかけて", score: { love: 2, hug: 0, kiss: 3 } },
      { text: "いつでも", score: { love: 2, hug: 2, kiss: 1 } },
    ],
  },
];

export const quizReasons: Record<string, string> = {
  love: "あなたは特別な日や大切な人との時間を求める、ロマンティックな香りがお好みです。デートやディナーで華やかに輝きたいあなたにぴったりの甘く女性らしい香りです。",
  hug: "あなたは日常に寄り添う、優しくナチュラルな香りがお好みです。リラックスタイムやオフィスで心地よく過ごしたいあなたに、清潔感のある爽やかな香りでふんわり包み込みます。",
  kiss: "あなたは夜のお出かけやパーティーで印象的に香りたい、セクシーで魅力的な香りがお好みです。周りと差をつけたいあなたに、記憶に残る特別な香りをお届けします。",
};
