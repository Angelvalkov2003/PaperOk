"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ErrorPopup } from "components/error-popup";

type ErrorPopupContextValue = {
  showError: (error: unknown) => void;
};

const ErrorPopupContext = createContext<ErrorPopupContextValue | null>(null);

export function formatAppError(error: unknown): string {
  if (error == null || error === "") {
    return "Възникна неочаквана грешка.";
  }

  if (typeof error === "string") {
    return normalizeHiddenServerError(error);
  }

  if (error instanceof Error) {
    const digest =
      "digest" in error && typeof error.digest === "string"
        ? error.digest
        : undefined;
    const parts = [normalizeHiddenServerError(error.message)];
    if (digest) parts.push(`Код: ${digest}`);
    return parts.filter(Boolean).join("\n");
  }

  try {
    return normalizeHiddenServerError(JSON.stringify(error));
  } catch {
    return "Възникна неочаквана грешка.";
  }
}

function normalizeHiddenServerError(message: string): string {
  const raw = message.trim();
  if (
    raw.includes("Server Components render") ||
    raw.includes("digest property")
  ) {
    return `Грешка при обработка на заявката.\n${raw}`;
  }
  return raw || "Възникна неочаквана грешка.";
}

function shouldIgnoreGlobalError(message: string): boolean {
  const text = message.toLowerCase();
  return (
    text.includes("resizeobserver") ||
    text.includes("script error") ||
    text.includes("chrome-extension://") ||
    text.includes("moz-extension://")
  );
}

export function ErrorPopupProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showError = useCallback((error: unknown) => {
    setMessage(formatAppError(error));
  }, []);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const text = event.error
        ? formatAppError(event.error)
        : event.message || "";
      if (!text || shouldIgnoreGlobalError(text)) return;
      setMessage(text);
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const text = formatAppError(event.reason);
      if (!text || shouldIgnoreGlobalError(text)) return;
      setMessage(text);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  const value = useMemo(() => ({ showError }), [showError]);

  return (
    <ErrorPopupContext.Provider value={value}>
      {children}
      <ErrorPopup
        open={!!message}
        message={message || ""}
        onClose={() => setMessage(null)}
      />
    </ErrorPopupContext.Provider>
  );
}

export function useErrorPopup() {
  const ctx = useContext(ErrorPopupContext);
  if (!ctx) {
    return {
      showError: (error: unknown) => {
        console.error(error);
      },
    };
  }
  return ctx;
}
