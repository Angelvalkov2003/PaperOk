import Image from "next/image";
import Link from "next/link";

export function AiHeroBanner() {
  return (
    <Link
      href="/ai-design"
      className="group relative mt-8 flex items-stretch overflow-hidden rounded-2xl border border-paper-border/80 bg-[#F3F0E6] shadow-[var(--paper-shadow)] transition hover:-translate-y-0.5 hover:border-paper-green/40 hover:shadow-[var(--paper-shadow-lg)]"
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center py-5 pl-5 pr-2 sm:py-6 sm:pl-6 sm:pr-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-paper-green sm:text-xs">
          ✨ Готово · Ползвай сега
        </p>
        <h2 className="mt-2 font-heading text-xl font-semibold leading-tight text-paper-heading sm:text-2xl">
          Твоята идея. Твоята картичка.
        </h2>
        <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-paper-muted sm:max-w-xs">
          Опиши повода и посланието — AI ще ти помогне с дизайна.
        </p>
        <span className="btn-primary mt-4 inline-flex w-fit items-center gap-1.5 px-4 py-2.5 text-sm group-hover:bg-paper-green-hover">
          Създай картичка с AI
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>

      <div className="relative flex w-[42%] min-w-[8.5rem] max-w-[12.5rem] shrink-0 items-end justify-center sm:w-[44%] sm:min-w-[10rem] sm:max-w-[14rem]">
        <Image
          src="/aihero.png"
          alt="PaperOK AI помощник"
          width={280}
          height={360}
          className="h-auto w-full max-h-[12.5rem] object-contain object-bottom sm:max-h-[15rem]"
          sizes="(max-width: 640px) 42vw, 200px"
          priority={false}
        />
      </div>
    </Link>
  );
}
