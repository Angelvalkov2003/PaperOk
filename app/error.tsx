"use client";

import { useEffect } from "react";
import { formatAppError, useErrorPopup } from "components/error-popup-provider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { showError } = useErrorPopup();

  useEffect(() => {
    showError(error);
  }, [error, showError]);

  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col rounded-lg border border-paper-border bg-paper-white p-8 md:p-12">
      <h2 className="font-heading text-xl font-bold text-paper-heading">
        Възникна проблем
      </h2>
      <p className="my-2 whitespace-pre-wrap text-paper-text">
        {formatAppError(error)}
      </p>
      <button
        className="mx-auto mt-4 flex w-full items-center justify-center rounded-full bg-paper-green p-4 tracking-wide text-white hover:opacity-90"
        onClick={() => reset()}
      >
        Опитай отново
      </button>
    </div>
  );
}
