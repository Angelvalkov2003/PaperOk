"use client";

import { useState } from "react";
import clsx from "clsx";
import { Caveat } from "next/font/google";

const script = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: ["600"],
  display: "swap",
});

export function CategoryDescription({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-1.5 lg:hidden">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={clsx(
              script.className,
              "text-right text-[1.35rem] leading-none text-paper-green transition-colors hover:text-paper-green-hover",
            )}
          >
            Научи повече за категорията
          </button>
        </div>
        <div
          className={clsx(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <p className="mt-2 text-base leading-relaxed text-paper-heading">
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
