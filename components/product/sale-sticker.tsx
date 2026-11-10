import { formatDiscountPercent } from "lib/sale-price";

type Props = {
  percent: number;
  /** Small corner badge for product cards in the grid. */
  compact?: boolean;
};

const PETAL_COUNT = 10;

/** Flower-shaped sale sticker (product gallery / grid cards). */
export function SaleSticker({ percent, compact = false }: Props) {
  const label = formatDiscountPercent(percent);

  if (compact) {
    return (
      <div
        className="pointer-events-none absolute left-1 top-1 z-30 sm:left-1.5 sm:top-1.5"
        aria-label={`Намаление ${label}`}
      >
        <div className="relative flex h-[3.15rem] w-[3.15rem] -rotate-[10deg] items-center justify-center sm:h-[3.4rem] sm:w-[3.4rem]">
          <svg
            aria-hidden
            viewBox="0 0 120 120"
            className="absolute inset-0 h-full w-full drop-shadow-[0_3px_8px_rgba(111,138,85,0.4)]"
          >
            {Array.from({ length: PETAL_COUNT }).map((_, i) => {
              const deg = (360 / PETAL_COUNT) * i;
              return (
                <ellipse
                  key={i}
                  cx="60"
                  cy="22"
                  rx="14"
                  ry="26"
                  fill="var(--paper-green)"
                  transform={`rotate(${deg} 60 60)`}
                />
              );
            })}
            <circle cx="60" cy="60" r="36" fill="var(--paper-green)" />
            <circle
              cx="60"
              cy="60"
              r="32.5"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
          </svg>
          <span className="relative z-10 text-[0.7rem] font-bold leading-none tracking-tight text-white sm:text-[0.75rem]">
            −{percent}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute left-1.5 top-1.5 z-30 sm:left-2.5 sm:top-2.5"
      aria-label={`Намаление ${label}`}
    >
      <div className="relative flex h-[8rem] w-[8rem] -rotate-[10deg] items-center justify-center sm:h-[9.5rem] sm:w-[9.5rem]">
        <svg
          aria-hidden
          viewBox="0 0 120 120"
          className="absolute inset-0 h-full w-full drop-shadow-[0_8px_18px_rgba(111,138,85,0.42)]"
        >
          {Array.from({ length: PETAL_COUNT }).map((_, i) => {
            const deg = (360 / PETAL_COUNT) * i;
            return (
              <ellipse
                key={i}
                cx="60"
                cy="22"
                rx="14"
                ry="26"
                fill="var(--paper-green)"
                transform={`rotate(${deg} 60 60)`}
              />
            );
          })}
          <circle cx="60" cy="60" r="36" fill="var(--paper-green)" />
          <circle
            cx="60"
            cy="60"
            r="32.5"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.75"
          />
        </svg>

        <div className="relative z-10 flex max-w-[5.4rem] flex-col items-center justify-center px-1 text-center text-white sm:max-w-[6.2rem]">
          <span className="text-[0.72rem] font-semibold uppercase leading-none tracking-wide sm:text-sm">
            Намаление
          </span>
          <span className="mt-1.5 text-xl font-bold leading-none tracking-tight sm:text-2xl">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
