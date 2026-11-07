"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  variant: "mobile" | "desktop";
  onNavigate?: () => void;
};

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2.5l1.15 4.35L17.5 8l-4.35 1.15L12 13.5l-1.15-4.35L6.5 8l4.35-1.15L12 2.5z"
        fill="currentColor"
      />
      <path
        d="M18.5 13.2l.55 2.05 2.05.55-2.05.55-.55 2.05-.55-2.05-2.05-.55 2.05-.55.55-2.05z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M5.8 14.5l.4 1.5 1.5.4-1.5.4-.4 1.5-.4-1.5-1.5-.4 1.5-.4.4-1.5z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

export function AiNavCta({ variant, onNavigate }: Props) {
  if (variant === "desktop") {
    return (
      <Link
        href="/ai-design"
        prefetch={true}
        className="ai-nav-cta-pulse group relative hidden items-center gap-2 rounded-full border border-paper-border/90 bg-[#F3F0E6] py-1 pl-1.5 pr-3 shadow-sm transition hover:-translate-y-0.5 hover:border-paper-green/45 hover:shadow-md lg:inline-flex"
        aria-label="Създай картичка с AI"
      >
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/70 ring-1 ring-paper-border/70">
          <Image
            src="/aihero.png"
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="36px"
          />
        </span>
        <span className="min-w-0 text-left leading-tight">
          <span className="block text-[13px] font-semibold text-paper-heading">
            Създай с AI
          </span>
          <span className="block text-[10px] font-medium text-paper-muted">
            Пробвай сега
          </span>
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-green text-white transition group-hover:bg-paper-green-hover">
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h9.69L10.22 6.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/ai-design"
      prefetch={true}
      onClick={onNavigate}
      className="ai-nav-cta-pulse group relative mb-5 flex items-center gap-3 overflow-visible rounded-[1.35rem] border border-paper-border/90 bg-[#F3F0E6] py-3 pl-3.5 pr-3 shadow-sm transition hover:border-paper-green/40 hover:shadow-md"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-green/12 text-paper-green">
        <SparkleIcon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1 text-left leading-tight">
        <span className="block text-[15px] font-semibold text-paper-heading">
          Създай картичка с AI
        </span>
        <span className="mt-0.5 block text-xs text-paper-muted">
          Твоята идея оживява
        </span>
      </span>

      <span className="relative -my-1 h-14 w-12 shrink-0">
        <Image
          src="/aihero.png"
          alt=""
          fill
          className="object-contain object-bottom drop-shadow-sm"
          sizes="48px"
        />
      </span>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-green text-white shadow-sm transition group-hover:bg-paper-green-hover">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h9.69L10.22 6.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Link>
  );
}
