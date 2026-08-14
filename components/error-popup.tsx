"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { SUPPORT_PHONE } from "lib/constants";

export function ErrorPopup({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-paper-heading/40 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="app-error-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-paper-border bg-paper-white p-6 shadow-lg"
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

        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-paper-heading">
          {message}
        </p>

        <p className="mt-5 text-sm leading-relaxed text-paper-text">
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
