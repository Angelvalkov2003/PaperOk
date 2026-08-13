"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Form from "next/form";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type SearchProps = {
  compact?: boolean;
  autoFocus?: boolean;
  onClose?: () => void;
};

/** iOS Safari auto-zooms focused inputs below 16px — keep mobile at text-base. */
const INPUT_TEXT_CLASS = "text-base md:text-sm";

function blurActiveElement() {
  const el = document.activeElement;
  if (el instanceof HTMLElement) {
    el.blur();
  }
}

export default function Search({ compact, autoFocus, onClose }: SearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    blurActiveElement();
  }, [pathname]);

  const handleSubmit = () => {
    blurActiveElement();
    onClose?.();
  };

  if (compact) {
    return (
      <Form
        action="/search"
        onSubmit={handleSubmit}
        className={clsx(
          "relative max-w-full shrink-0",
          onClose ? "w-full" : "w-52 lg:w-60 xl:w-72",
        )}
      >
        <input
          key={searchParams?.get("q")}
          type="search"
          name="q"
          placeholder="Търсене..."
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus || !!onClose}
          defaultValue={searchParams?.get("q") || ""}
          className={clsx(
            "w-full rounded-full border border-paper-border bg-paper-white py-2 pl-3 pr-9 text-paper-heading placeholder:text-paper-muted focus:border-paper-green focus:outline-none xl:pl-4 xl:pr-10",
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            INPUT_TEXT_CLASS,
          )}
        />
        <button
          type="submit"
          aria-label="Търси"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper-green"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </button>
      </Form>
    );
  }

  return (
    <Form
      action="/search"
      onSubmit={handleSubmit}
      className="relative w-full max-w-[550px] lg:w-80 xl:w-full"
    >
      <input
        key={searchParams?.get("q")}
        type="search"
        name="q"
        placeholder="Търсене на продукти..."
        autoComplete="off"
        enterKeyHint="search"
        defaultValue={searchParams?.get("q") || ""}
        className={clsx(
          "w-full rounded-lg border border-paper-border bg-paper-white px-4 py-2 text-paper-heading placeholder:text-paper-muted focus:border-paper-green focus:outline-none",
          "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
          INPUT_TEXT_CLASS,
        )}
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4 w-4 text-paper-muted" />
      </div>
    </Form>
  );
}

export function SearchSkeleton({ compact }: { compact?: boolean }) {
  return (
    <form
      className={`relative ${
        compact
          ? "w-full max-w-full shrink-0"
          : "w-full max-w-[550px] lg:w-80 xl:w-full"
      }`}
    >
      <input
        placeholder={compact ? "Търсене..." : "Търсене на продукти..."}
        disabled
        className={`w-full border border-paper-border bg-paper-white text-paper-heading placeholder:text-paper-muted ${
          compact
            ? `rounded-full py-2 pl-3 pr-9 xl:pl-4 xl:pr-10 ${INPUT_TEXT_CLASS}`
            : `rounded-lg px-4 py-2 ${INPUT_TEXT_CLASS}`
        }`}
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4 w-4 text-paper-muted" />
      </div>
    </form>
  );
}
