"use client";

import { AI_STYLES, type AiStyleId } from "lib/ai-design/constants";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  value: AiStyleId[];
  onChange: (next: AiStyleId[]) => void;
};

export function AiStylePicker({ value, onChange }: Props) {
  const [openInfoId, setOpenInfoId] = useState<AiStyleId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (!openInfoId) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpenInfoId(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenInfoId(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openInfoId]);

  const selectStyle = (id: AiStyleId) => {
    onChange(value.includes(id) ? [] : [id]);
  };

  return (
    <div ref={rootRef}>
      <p className="mb-1 text-sm font-medium text-paper-heading">
        Избери стил{" "}
        <span className="font-normal text-paper-muted">(по желание)</span>
      </p>
      <p className="mb-3 text-xs leading-relaxed text-paper-muted">
        Стилът насочва визията на AI. На компютър посочи или фокусирай стил за
        описание; на телефон докосни „i“.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {AI_STYLES.map((style) => {
          const selected = value.includes(style.id);
          const infoOpen = openInfoId === style.id;
          const panelId = `${baseId}-${style.id}-info`;

          return (
            <div
              key={style.id}
              className={`group relative rounded-xl border transition ${
                selected
                  ? "border-paper-green bg-paper-green/10 ring-1 ring-paper-green"
                  : "border-paper-border bg-white hover:border-paper-green/50"
              }`}
            >
              <div className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => selectStyle(style.id)}
                  aria-pressed={selected}
                  aria-describedby={panelId}
                  className="min-w-0 flex-1 rounded-xl px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-paper-green/40"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-paper-heading">
                    {selected ? (
                      <span className="text-paper-green" aria-hidden>
                        ✓
                      </span>
                    ) : null}
                    {style.label}
                  </span>
                </button>

                <button
                  type="button"
                  className="mt-2 mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-paper-border text-xs font-semibold italic text-paper-muted transition hover:border-paper-green hover:text-paper-green md:hidden"
                  aria-label={`Информация за стил ${style.label}`}
                  aria-expanded={infoOpen}
                  aria-controls={panelId}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenInfoId((cur) =>
                      cur === style.id ? null : style.id,
                    );
                  }}
                >
                  i
                </button>
              </div>

              {/* Desktop: show on hover / keyboard focus */}
              <div
                id={panelId}
                role="tooltip"
                className="pointer-events-none absolute left-0 right-0 top-[calc(100%-0.25rem)] z-20 hidden rounded-xl border border-paper-border bg-[#FBF9F2] px-3 py-2.5 text-xs leading-relaxed text-paper-text opacity-0 shadow-[var(--paper-shadow)] md:group-hover:block md:group-hover:opacity-100 md:group-focus-within:block md:group-focus-within:opacity-100"
              >
                {style.summary}
              </div>

              {/* Mobile: expandable after tapping i */}
              {infoOpen ? (
                <div className="border-t border-paper-border/80 px-3 py-2.5 text-xs leading-relaxed text-paper-text md:hidden">
                  {style.summary}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
