"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function CategoryDescription({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-xl border border-paper-border-strong/70 bg-paper-surface-muted/50 px-4 py-3 text-left text-sm font-medium text-paper-heading transition-colors hover:border-paper-green/40"
        >
          <span>Описание</span>
          <ChevronDownIcon
            className={clsx(
              "h-5 w-5 shrink-0 text-paper-muted transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
        <div
          className={clsx(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <p className="mt-2 rounded-xl border border-paper-border-strong/60 bg-paper-surface-muted/35 px-4 py-3 text-sm leading-relaxed text-paper-text">
              {text}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-2 hidden text-base text-paper-text sm:mt-3 sm:text-lg lg:block">
        {text}
      </p>
    </>
  );
}
