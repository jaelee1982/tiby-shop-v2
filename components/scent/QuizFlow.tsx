"use client";

// 香り診断 — 구 tiby.me /quiz + /result 를 한 흐름으로 이식·리디자인.
// 로직(문항·스코어)은 lib/scent/quiz.ts 그대로, 결과 CTA 는 자체 상품 페이지.
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { quizQuestions, quizReasons } from "@/lib/scent/quiz";
import { getProductById, tibyProducts } from "@/lib/scent/products";

type Scores = { love: number; hug: number; kiss: number };
const ZERO: Scores = { love: 0, hug: 0, kiss: 0 };

const SHARE_URL = "https://tiby.shop/quiz";
const SHARE_TEXT = "TIBYヘアパフューム 香り診断 — わたしにぴったりの香りはどれ？";

export function QuizFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const question = quizQuestions[step];

  const handleNext = () => {
    if (selected === null) return;
    const nextAnswers = [...answers.slice(0, step), selected];
    setAnswers(nextAnswers);

    if (step < quizQuestions.length - 1) {
      setStep(step + 1);
      setSelected(nextAnswers[step + 1] ?? null);
    } else {
      const totals = nextAnswers.reduce<Scores>((acc, optIdx, qIdx) => {
        const s = quizQuestions[qIdx].options[optIdx].score;
        return { love: acc.love + s.love, hug: acc.hug + s.hug, kiss: acc.kiss + s.kiss };
      }, ZERO);
      const winner = (Object.entries(totals) as [keyof Scores, number][]).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];
      setResultId(winner);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(step - 1);
    setSelected(answers[step - 1] ?? null);
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setResultId(null);
    setCopied(false);
  };

  const product = getProductById(resultId ?? undefined);

  if (product) {
    const runnersUp = tibyProducts.filter((p) => p.id !== product.id);
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="t-result-hero" style={{ background: product.soft }}>
          <div className="t-result-eyebrow" style={{ color: product.accent }}>
            Your scent match
          </div>
          <h2 className="t-result-name">{product.nameEn}</h2>
          <p className="t-result-namejp">{product.nameJa} — {product.description}</p>
          <p className="t-result-cat">ヘアパフューム 30ml ・ おすすめシーン: {product.scene}</p>

          <p className="t-result-reason">{quizReasons[product.id]}</p>

          <div className="t-result-notes">
            <div className="t-result-note">
              <h4>Top</h4>
              <p>{product.notes.top.join(" / ")}</p>
            </div>
            <div className="t-result-note">
              <h4>Middle</h4>
              <p>{product.notes.mid.join(" / ")}</p>
            </div>
            <div className="t-result-note">
              <h4>Base</h4>
              <p>{product.notes.base.join(" / ")}</p>
            </div>
          </div>

          <div className="t-result-actions">
            <Link href={`/products/${product.slug}`} className="t-cta">
              この香りを見る
            </Link>
            <button type="button" className="t-cta-ghost" onClick={restart}>
              もう一度診断する
            </button>
          </div>
          <p className="t-result-price">¥999（税抜）／税込 ¥1,099</p>

          <div className="t-result-share">
            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(SHARE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LINEでシェア
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Xでシェア
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(SHARE_URL).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            >
              {copied ? "コピーしました" : "リンクをコピー"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 13, color: "var(--fg-3)", margin: "0 0 12px" }}>ほかの2つの香りも見る</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {runnersUp.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="t-sku-pill">
                <span style={{ width: 10, height: 10, borderRadius: 999, background: p.accent }} />
                {p.nameEn}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="t-quiz-progress" role="progressbar" aria-valuemin={1} aria-valuemax={quizQuestions.length} aria-valuenow={step + 1}>
        {quizQuestions.map((q, i) => (
          <i key={q.id} className={i <= step ? "on" : ""} />
        ))}
      </div>
      <div className="t-quiz-count">
        Q{step + 1} / {quizQuestions.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="t-quiz-q">{question.question}</h2>
          <div className="t-quiz-opts">
            {question.options.map((opt, i) => (
              <motion.button
                key={opt.text}
                type="button"
                className={`t-quiz-opt${selected === i ? " on" : ""}`}
                onClick={() => setSelected(i)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.25 }}
              >
                <span className="t-quiz-dot">
                  <i />
                </span>
                {opt.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="t-quiz-nav">
        <button type="button" className="t-quiz-backlink" onClick={handleBack} disabled={step === 0} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
          ← 前の質問へ
        </button>
        <button type="button" className="t-cta" onClick={handleNext} disabled={selected === null} style={{ opacity: selected === null ? 0.4 : 1 }}>
          {step === quizQuestions.length - 1 ? "結果を見る" : "次へ"}
        </button>
      </div>
    </div>
  );
}
