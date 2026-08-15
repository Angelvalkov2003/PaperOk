"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { SUPPORT_PHONE } from "lib/constants";
import { useState } from "react";

export function ErrorPopup({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-paper-heading/40 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="app-error-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-paper-border bg-paper-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Затвори"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-paper-muted transition-colors hover:bg-paper-section hover:text-paper-heading"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <h2
          id="app-error-title"
          className="font-heading pr-10 text-xl font-semibold text-paper-heading"
        >
          Възникна грешка
        </h2>

        <pre className="mt-3 max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-paper-bg p-3 text-left text-xs leading-relaxed text-paper-heading sm:text-sm">
          {message}
        </pre>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyReport}
            className="rounded-md border border-paper-border bg-paper-white px-3 py-1.5 text-sm text-paper-heading transition-colors hover:bg-paper-section"
          >
            {copied ? "Копирано" : "Копирай репорта"}
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-paper-text">
          Моля свържете се с{" "}
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="font-medium text-paper-green underline hover:text-paper-green-hover"
          >
            {SUPPORT_PHONE}
          </a>{" "}
          за да съобщите за проблема.
        </p>
      </div>
    </div>
  );
}
