"use client";

import { AI_IDEA_MAX_CHARS } from "lib/ai-design/constants";

const TIPS = [
  {
    id: "exact-text",
    text: "Изпиши текста от полето „Точен текст върху картичката“ четливо и с правилен правопис и пунктуация. Не пропускай и не добавяй думи.",
  },
  {
    id: "white-bg",
    text: "Използвай чисто бял фон.",
  },
  {
    id: "no-frame",
    text: "Не добавяй рамки около дизайна.",
  },
] as const;

type Props = {
  idea: string;
  onIdeaChange: (next: string) => void;
};

function tipIsInIdea(idea: string, tip: string) {
  return idea.includes(tip);
}

function removeTipFromIdea(idea: string, tip: string) {
  return idea
    .replace(tip, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function appendTipToIdea(idea: string, tip: string) {
  const base = idea.trim();
  const next = base ? `${base}\n\n${tip}` : tip;
  return next.slice(0, AI_IDEA_MAX_CHARS);
}

export function AiPromptTips({ idea, onIdeaChange }: Props) {
  const toggleTip = (tip: string) => {
    if (tipIsInIdea(idea, tip)) {
      onIdeaChange(removeTipFromIdea(idea, tip));
      return;
    }
    onIdeaChange(appendTipToIdea(idea, tip));
  };

  return (
    <div className="rounded-xl border border-paper-border bg-paper-accent-bg/50 p-3.5 sm:p-4">
      <p className="text-sm font-semibold text-paper-heading">
        Съвети за по-добър резултат
      </p>
      <p className="mt-1 text-xs text-paper-muted">
        Кликни върху подсказка, за да я добавиш към идеята си. Кликни отново, за
        да я махнеш.
      </p>
      <ul className="mt-3 space-y-2.5">
        {TIPS.map((tip) => {
          const added = tipIsInIdea(idea, tip.text);
          return (
            <li key={tip.id}>
              <button
                type="button"
                onClick={() => toggleTip(tip.text)}
                aria-pressed={added}
                className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition ${
                  added
                    ? "border-paper-green bg-paper-green/10 ring-1 ring-paper-green"
                    : "border-paper-border/80 bg-white/80 hover:border-paper-green/50 hover:bg-white"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    added
                      ? "bg-paper-green text-white"
                      : "border border-paper-border text-paper-muted"
                  }`}
                  aria-hidden
                >
                  {added ? "✓" : "+"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs leading-relaxed text-paper-text sm:text-sm">
                    {tip.text}
                  </span>
                  <span
                    className={`mt-1.5 inline-block text-[11px] font-medium ${
                      added ? "text-paper-green" : "text-paper-muted"
                    }`}
                  >
                    {added ? "Добавено към идеята" : "Добави към идеята"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
