import {
  AI_MAX_ATTEMPTS,
  AI_MAX_DESIGNS,
} from "lib/ai-design/constants";
import Image from "next/image";

export function AiDesignBanner() {
  return (
    <section
      aria-labelledby="ai-design-banner-title"
      className="relative mb-8 overflow-hidden rounded-2xl bg-[#5F7A48] shadow-[var(--paper-shadow)]"
    >
      {/* Soft depth + right-side texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,#4F6940_0%,#5F7A48_42%,#6B8752_72%,#738F58_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 h-[140%] w-[55%] -translate-y-1/2 rounded-full bg-[#6E8A55]/35 blur-2xl"
      />

      {/* Decorative flourishes behind the mascot */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[48%] text-[#C5D9A8]/35 sm:block"
        viewBox="0 0 320 180"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M40 150c40-30 70-70 55-110"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M90 160c55-20 95-55 110-105"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M20 70c25 8 48 5 70-12"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M210 28l3.2 8.2 8.8 1.2-6.8 5.8 2.2 8.6-7.4-4.6-7.4 4.6 2.2-8.6-6.8-5.8 8.8-1.2z"
          fill="currentColor"
        />
        <path
          d="M268 78l2.4 6.2 6.6.9-5.1 4.4 1.6 6.4-5.5-3.4-5.5 3.4 1.6-6.4-5.1-4.4 6.6-.9z"
          fill="currentColor"
        />
        <path
          d="M240 130l2 5.2 5.5.8-4.3 3.6 1.4 5.4-4.6-2.9-4.6 2.9 1.4-5.4-4.3-3.6 5.5-.8z"
          fill="currentColor"
        />
      </svg>

      <div className="relative z-10 flex min-h-[9.5rem] items-stretch sm:min-h-[10.5rem]">
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#F6F1E4] px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.06em] text-[#4A4338] uppercase sm:text-xs">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C45C4A]"
            />
            Новости от клуба
          </span>

          <h1
            id="ai-design-banner-title"
            className="mt-3 font-heading text-[1.65rem] leading-[1.15] font-semibold text-white sm:text-3xl lg:text-[2.15rem]"
          >
            Създай своя дизайн с{" "}
            <span className="relative -top-0.5 inline-flex items-center rounded-md bg-[#E8C86A] px-2 py-0.5 align-middle text-[0.72em] font-bold tracking-wide text-[#2F2A22] sm:px-2.5">
              AI
            </span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
            Картичка или постер, създадени по твоя идея.
          </p>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-white/70 sm:text-sm">
            До {AI_MAX_ATTEMPTS} варианта за всеки дизайн и до {AI_MAX_DESIGNS}{" "}
            отделни дизайна в рамките на една сесия.
          </p>
        </div>

        <div className="relative flex w-[36%] min-w-[7.5rem] max-w-[13rem] shrink-0 items-end justify-center sm:w-[40%] sm:min-w-[10rem] sm:max-w-[15rem] lg:max-w-[16.5rem]">
          <Image
            src="/aihero.png"
            alt="PaperOK AI помощник"
            width={320}
            height={400}
            priority
            className="h-auto w-full max-h-[9.25rem] object-contain object-bottom drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)] sm:max-h-[11rem] lg:max-h-[12rem]"
            sizes="(max-width: 640px) 36vw, 220px"
          />
        </div>
      </div>
    </section>
  );
}
