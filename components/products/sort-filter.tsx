"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarsArrowUpIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { AnchoredPortal } from "components/ui/anchored-portal";

type SortOption =
  | "position"
  | "price-asc"
  | "price-desc"
  | "discount-desc"
  | "name-asc"
  | "newest";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "position", label: "По позиция" },
  { value: "price-asc", label: "Цена: Възходяща" },
  { value: "price-desc", label: "Цена: Низходяща" },
  { value: "discount-desc", label: "Най-голямо намаление" },
  { value: "name-asc", label: "Азбучен ред" },
  { value: "newest", label: "Най-нови" },
];

export function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOption) || "position";
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    sortOptions.find((opt) => opt.value === currentSort)?.label || "По позиция";

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "position") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Сортиране: ${currentLabel}`}
        title={currentLabel}
        className={clsx(
          "paper-dropdown-trigger paper-dropdown-trigger-compact",
          isOpen && "is-open",
        )}
      >
        <div className="flex items-center gap-2">
          <BarsArrowUpIcon className="h-5 w-5 text-paper-muted" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </div>
        <ChevronDownIcon
          className={`hidden h-4 w-4 text-paper-muted transition-transform duration-200 sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnchoredPortal
        open={isOpen}
        anchorRef={triggerRef}
        panelRef={panelRef}
        align="right"
        minWidth={220}
        maxWidth={280}
        className="paper-dropdown-panel overflow-hidden"
      >
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSortChange(option.value)}
            className={clsx(
              "paper-dropdown-item",
              currentSort === option.value && "is-active",
            )}
          >
            <span>{option.label}</span>
            {currentSort === option.value && (
              <CheckIcon className="h-4 w-4 text-paper-green" />
            )}
          </button>
        ))}
      </AnchoredPortal>
    </div>
  );
}
