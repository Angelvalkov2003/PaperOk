"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-paper-muted transition-colors hover:text-paper-green sm:mb-4"
      aria-label="Върни се назад"
    >
      <ArrowLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span className="font-medium tracking-wide">Назад</span>
    </button>
  );
}
