"use client";

import { useCart } from "components/cart/cart-context";
import {
  AI_FORMATS,
  AI_IDEA_MAX_CHARS,
  AI_MAX_ATTEMPTS,
  AI_MAX_DESIGNS,
  AI_TEXT_WARN_CHARS,
  normalizeAiStyleId,
  resolveAiUnitPrice,
  type AiBackOption,
  type AiFormatId,
  type AiStyleId,
} from "lib/ai-design/constants";
import { AiPromptTips } from "components/ai-design/ai-prompt-tips";
import { AiStylePicker } from "components/ai-design/ai-style-picker";
import type { AiCartMeta, AiDesignVariant } from "lib/ai-design/types";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "paperok_ai_design_v1";
const DESIGNS_COUNT_KEY = "paperok_ai_designs_count_v1";

function newSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type Persisted = {
  sessionId: string;
  projectId?: string;
  formatId: AiFormatId;
  withFrame: boolean;
  backOption: AiBackOption;
  idea: string;
  styles: AiStyleId[];
  exactText: string;
  attemptsUsed: number;
  variants: AiDesignVariant[];
  selectedVariantId: string | null;
  faceSide: "front" | "back";
};

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

export function AiDesignStudio() {
  const { addAiDesignItem } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [formatId, setFormatId] = useState<AiFormatId>("A6");
  const [withFrame, setWithFrame] = useState(false);
  const [backOption, setBackOption] = useState<AiBackOption>("planting");
  const [idea, setIdea] = useState("");
  const [styles, setStyles] = useState<AiStyleId[]>([]);
  const [exactText, setExactText] = useState("");
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [variants, setVariants] = useState<AiDesignVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [faceSide, setFaceSide] = useState<"front" | "back">("front");
  const [generating, setGenerating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [wishOptions, setWishOptions] = useState<string[]>([]);
  const [wishHint, setWishHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [designsStarted, setDesignsStarted] = useState(1);

  const format = useMemo(
    () => AI_FORMATS.find((f) => f.id === formatId)!,
    [formatId],
  );
  const unitPrice = resolveAiUnitPrice(formatId, withFrame);
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0] || null;
  const canGenerate = attemptsUsed < AI_MAX_ATTEMPTS && !generating;
  const canStartNewDesign = designsStarted < AI_MAX_DESIGNS;
  const isCard = format.kind === "card";
  const supportsFrame = format.framedPrice != null;

  useEffect(() => {
    const saved = loadPersisted();
    let count = 1;
    try {
      count = Math.max(1, Number(localStorage.getItem(DESIGNS_COUNT_KEY)) || 1);
    } catch {
      count = 1;
    }
    setDesignsStarted(count);

    if (saved?.sessionId) {
      setSessionId(saved.sessionId);
      setProjectId(saved.projectId);
      setFormatId(saved.formatId || "A6");
      setWithFrame(Boolean(saved.withFrame));
      setBackOption(saved.backOption || "planting");
      setIdea(saved.idea || "");
      setStyles(
        Array.isArray(saved.styles)
          ? saved.styles
              .map((id) => normalizeAiStyleId(id))
              .filter((id): id is AiStyleId => Boolean(id))
              .slice(0, 1)
          : [],
      );
      setExactText(saved.exactText || "");
      setAttemptsUsed(Number(saved.attemptsUsed) || 0);
      setVariants(Array.isArray(saved.variants) ? saved.variants : []);
      setSelectedVariantId(saved.selectedVariantId || null);
      setFaceSide(saved.faceSide || "front");
    } else {
      setSessionId(newSessionId());
    }
    setHydrated(true);
  }, []);

  const startNewDesign = useCallback(
    (opts?: { keepIdea?: boolean }) => {
      if (!canStartNewDesign) {
        toast.error(
          `Достигнат е лимитът от ${AI_MAX_DESIGNS} дизайна в тази сесия.`,
        );
        return;
      }
      const nextCount = designsStarted + 1;
      setDesignsStarted(nextCount);
      try {
        localStorage.setItem(DESIGNS_COUNT_KEY, String(nextCount));
      } catch {
        /* ignore */
      }
      setSessionId(newSessionId());
      setProjectId(undefined);
      setAttemptsUsed(0);
      setVariants([]);
      setSelectedVariantId(null);
      setFaceSide("front");
      setWishOptions([]);
      setWishHint(null);
      setError(null);
      if (!opts?.keepIdea) {
        setIdea("");
        setExactText("");
        setStyles([]);
      }
      toast.success(
        `Нов дизайн (${nextCount} от ${AI_MAX_DESIGNS}). Имате пак ${AI_MAX_ATTEMPTS} опита.`,
      );
    },
    [canStartNewDesign, designsStarted],
  );

  useEffect(() => {
    if (!hydrated || !sessionId) return;
    const payload: Persisted = {
      sessionId,
      projectId,
      formatId,
      withFrame,
      backOption,
      idea,
      styles,
      exactText,
      attemptsUsed,
      variants,
      selectedVariantId,
      faceSide,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota */
    }
  }, [
    hydrated,
    sessionId,
    projectId,
    formatId,
    withFrame,
    backOption,
    idea,
    styles,
    exactText,
    attemptsUsed,
    variants,
    selectedVariantId,
    faceSide,
  ]);

  useEffect(() => {
    if (!supportsFrame && withFrame) setWithFrame(false);
    if (!isCard) setFaceSide("front");
  }, [supportsFrame, withFrame, isCard]);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setGenerating(true);
    toast.message(
      "Здравейте! Картинката ще бъде генерирана в следващите ~20 секунди. Моля, не излизайте от страницата — особено на телефон.",
      { duration: 12000 },
    );
    try {
        const res = await fetch("/api/ai-design/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            projectId,
            formatId,
            withFrame: supportsFrame ? withFrame : false,
            backOption: isCard ? backOption : null,
            idea,
            styles,
            exactText,
            attemptsUsed,
            existingVariants: variants,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Грешка при генериране");

        setProjectId(data.projectId);
        setAttemptsUsed(data.attemptsUsed);
        setVariants(data.variants || []);
        setSelectedVariantId(data.selectedVariantId || null);
        setFaceSide("front");
        if (data.warning) {
          toast.message(data.warning, { duration: 8000 });
        }
        toast.success("Дизайнът е готов");
    } catch (err: any) {
      setError(err.message || "Грешка при генериране");
      toast.error(err.message || "Грешка при генериране");
    } finally {
      setGenerating(false);
    }
  }, [
    sessionId,
    projectId,
    formatId,
    withFrame,
    supportsFrame,
    isCard,
    backOption,
    idea,
    styles,
    exactText,
  ]);

  const handleSuggest = async () => {
    setSuggesting(true);
    setWishHint(null);
    setWishOptions([]);
    try {
      const res = await fetch("/api/ai-design/suggest-wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка");
      setWishOptions(data.suggestions || []);
      setWishHint(data.hint || null);
      if (!(data.suggestions || []).length) {
        toast.message(data.hint || "Няма предложения");
      }
    } catch (err: any) {
      toast.error(err.message || "Грешка при предложение");
    } finally {
      setSuggesting(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Първо създайте и изберете вариант");
      return;
    }
    if (isCard && !backOption) {
      toast.error("Изберете гръб на картичката");
      return;
    }

    const title = withFrame
      ? `Персонален ${format.label} с бяла рамка`
      : `Персонален ${format.label}`;

    const meta: AiCartMeta = {
      kind: "ai_design",
      projectId,
      variantId: selectedVariant.id,
      formatId,
      withFrame: supportsFrame ? withFrame : false,
      backOption: isCard ? backOption : null,
      exactText: exactText || undefined,
      styles,
      idea,
      imageUrl: selectedVariant.imageUrl,
      printUrl: selectedVariant.printUrl || selectedVariant.imageUrl,
      cloudinaryPublicId: selectedVariant.cloudinaryPublicId,
    };

    addAiDesignItem({
      title,
      price: unitPrice,
      imageUrl: selectedVariant.imageUrl,
      formatId,
      withFrame: supportsFrame ? withFrame : false,
      meta,
    });
    toast.success("Добавено в количката");
    if (canStartNewDesign) {
      // Free up a fresh attempt budget for the next card
      startNewDesign({ keepIdea: false });
    }
  };

  const generateLabel =
    attemptsUsed >= AI_MAX_ATTEMPTS
      ? `Използвани са ${AI_MAX_ATTEMPTS} от ${AI_MAX_ATTEMPTS} опита`
      : attemptsUsed === 0
        ? "Създай дизайн"
        : "Създай още един вариант";

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-paper-border bg-white/70 p-8 text-center text-paper-text">
        Зареждане…
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <section className="space-y-6 rounded-2xl border border-paper-border bg-white/80 p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-paper-heading">
            Избери формат
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {AI_FORMATS.map((f) => {
              const selected = formatId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormatId(f.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-paper-green bg-paper-green/10 ring-1 ring-paper-green"
                      : "border-paper-border hover:border-paper-green/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-paper-heading">
                      {f.label}
                    </span>
                    {selected && (
                      <span className="text-paper-green">✓</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-paper-text">{f.price} €</p>
                  {f.framedPrice != null && (
                    <p className="mt-0.5 text-xs text-paper-muted">
                      с бяла рамка: {f.framedPrice} €
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          {supportsFrame && (
            <label className="mt-3 flex items-center gap-2 text-sm text-paper-text">
              <input
                type="checkbox"
                checked={withFrame}
                onChange={(e) => setWithFrame(e.target.checked)}
                className="rounded border-paper-border"
              />
              Добави бяла рамка
              {withFrame && (
                <span className="text-paper-heading">
                  · С рамка общо: {unitPrice} €
                </span>
              )}
            </label>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-heading">
            Опиши идеята си *
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value.slice(0, AI_IDEA_MAX_CHARS))}
            rows={4}
            placeholder="Повод, получател, цветове, настроение…"
            className="w-full rounded-xl border border-paper-border bg-white px-3 py-2 text-sm text-paper-heading outline-none focus:border-paper-green"
          />
          <p className="mt-1 text-xs text-paper-muted">
            {idea.length}/{AI_IDEA_MAX_CHARS}
          </p>
        </div>

        <AiPromptTips
          idea={idea}
          onIdeaChange={(next) => setIdea(next.slice(0, AI_IDEA_MAX_CHARS))}
        />

        <AiStylePicker value={styles} onChange={setStyles} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-heading">
            Точен текст върху картичката
          </label>
          <p className="mb-2 text-xs text-paper-muted">
            Текстът се рисува от AI директно в изображението — прегледът и
            файлът за печат изглеждат еднакво. Ако промените текста, генерирайте
            нов вариант.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={exactText}
              onChange={(e) => setExactText(e.target.value)}
              placeholder="Честит рожден ден, мамо!"
              className="min-w-0 flex-1 rounded-xl border border-paper-border bg-white px-3 py-2 text-sm outline-none focus:border-paper-green"
            />
            <button
              type="button"
              onClick={handleSuggest}
              disabled={suggesting}
              className="rounded-xl border border-paper-border px-3 py-2 text-sm text-paper-heading hover:bg-paper-accent-bg disabled:opacity-60"
            >
              {suggesting ? "…" : "Предложи ми пожелание"}
            </button>
          </div>
          {exactText.length > AI_TEXT_WARN_CHARS && (
            <p className="mt-1 text-xs text-amber-700">
              Текстът е дълъг — може да е по-труден за четене при печат.
            </p>
          )}
          {wishHint && (
            <p className="mt-1 text-xs text-paper-muted">{wishHint}</p>
          )}
          {wishOptions.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {wishOptions.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setExactText(w)}
                  className="rounded-lg border border-paper-border px-3 py-2 text-left text-sm hover:border-paper-green"
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>

        {isCard && (
          <div>
            <p className="mb-2 text-sm font-medium text-paper-heading">Гръб</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["planting", "Инструкция за засаждане"],
                  ["blank", "Празен гръб"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBackOption(id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    backOption === id
                      ? "border-paper-green bg-paper-green/10 text-paper-heading"
                      : "border-paper-border"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl bg-paper-accent-bg/60 px-3 py-2 text-sm text-paper-text">
          Дизайн {designsStarted} от {AI_MAX_DESIGNS}. За този дизайн:{" "}
          {attemptsUsed} от {AI_MAX_ATTEMPTS} опита. След добавяне в количката
          или с „Нов дизайн“ започвате следваща картичка с нови 3 опита.
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {generating && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-paper-green/40 bg-paper-green/10 px-4 py-3 text-sm text-paper-heading"
          >
            <p className="font-medium">Здравейте!</p>
            <p className="mt-1 text-paper-text">
              Картинката ще бъде генерирана в следващите ~20 секунди. Моля, не
              излизайте от страницата и не заключвайте телефона — ако смените
              приложението, процесът може да се прекъсне.
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!canGenerate || idea.trim().length < 5}
          onClick={handleGenerate}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? "Генериране… (~20 сек.)" : generateLabel}
        </button>

        <button
          type="button"
          disabled={!canStartNewDesign || generating}
          onClick={() => startNewDesign()}
          className="w-full rounded-xl border border-paper-border px-3 py-2.5 text-sm font-medium text-paper-heading hover:bg-paper-accent-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canStartNewDesign
            ? "Нов дизайн (нови 3 опита)"
            : `Лимит ${AI_MAX_DESIGNS} дизайна`}
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-paper-border bg-white/80 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-paper-heading">
            Преглед на {isCard ? "картичката" : "постера"}
          </h2>
          {isCard && (
            <div className="flex gap-1 rounded-full border border-paper-border p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setFaceSide("front")}
                className={`rounded-full px-3 py-1 ${
                  faceSide === "front" ? "bg-paper-green text-white" : ""
                }`}
              >
                Лице
              </button>
              <button
                type="button"
                disabled={backOption === "blank"}
                onClick={() => setFaceSide("back")}
                className={`rounded-full px-3 py-1 disabled:opacity-40 ${
                  faceSide === "back" ? "bg-paper-green text-white" : ""
                }`}
                title={
                  backOption === "blank" ? "Гърбът е празен" : "Гръб"
                }
              >
                {backOption === "blank" ? "Гърбът е празен" : "Гръб"}
              </button>
            </div>
          )}
        </div>

        <div
          className={`relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-xl border border-paper-border bg-[#f3efe6] ${
            withFrame && supportsFrame ? "p-4 ring-8 ring-white" : ""
          }`}
        >
          {faceSide === "back" && isCard ? (
            backOption === "planting" ? (
              <Image
                src="/backside.png"
                alt="Гръб — инструкция за засаждане"
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 420px"
                priority={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <p className="text-sm text-paper-muted">Гърбът е празен</p>
              </div>
            )
          ) : selectedVariant ? (
            <Image
              src={selectedVariant.previewUrl || selectedVariant.imageUrl}
              alt="AI дизайн"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 420px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-paper-muted">
              Тук ще видите своя дизайн
            </div>
          )}
        </div>

        {variants.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {variants.map((v, i) => {
              const on = v.id === selectedVariant?.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setFaceSide("front");
                  }}
                  className={`relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                    on ? "border-paper-green" : "border-paper-border"
                  }`}
                >
                  <Image
                    src={v.previewUrl || v.imageUrl}
                    alt={`Вариант ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-paper-muted">
          Предварителният преглед е ориентировъчен. При печат са възможни леки
          разлики в нюансите заради естествените влакна на хартията.
        </p>

        <div className="rounded-xl border border-paper-border bg-paper-section/40 px-3 py-2 text-sm text-paper-text">
          {format.label}
          {withFrame && supportsFrame ? " · с бяла рамка" : ""} · {unitPrice} €
          {isCard
            ? ` · ${backOption === "planting" ? "инструкция на гърба" : "празен гръб"}`
            : ""}
        </div>

        <button
          type="button"
          disabled={!selectedVariant}
          onClick={handleAddToCart}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          Добави избрания дизайн в количката
        </button>
      </section>
    </div>
  );
}
