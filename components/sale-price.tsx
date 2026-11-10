import clsx from "clsx";
import Price from "components/price";
import { formatDiscountPercent, getSaleMeta } from "lib/sale-price";
import type { ReactNode } from "react";

type Size = "compact" | "default" | "large";

type Props = {
  amount: string;
  compareAtAmount?: string | null;
  currencyCode?: string;
  size?: Size;
  suffix?: ReactNode;
  className?: string;
};

export default function SalePrice({
  amount,
  compareAtAmount,
  currencyCode = "EUR",
  size = "default",
  suffix,
  className,
}: Props) {
  const sale = getSaleMeta(amount, compareAtAmount);

  if (!sale) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-x-1.5 leading-none",
          size === "large" && "text-2xl font-semibold",
          size === "default" && "text-lg font-medium",
          size === "compact" && "text-[11px] font-semibold",
          className,
        )}
      >
        <Price
          amount={amount}
          currencyCode={currencyCode}
          showCurrencyCode={size !== "compact"}
          className="leading-none"
        />
        {suffix}
      </span>
    );
  }

  if (size === "large") {
    return (
      <span
        className={clsx(
          "inline-flex w-full max-w-md flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-paper-green/25 bg-paper-green/10 px-4 py-3.5",
          className,
        )}
      >
        <span className="relative inline-block text-xl font-medium text-paper-muted sm:text-2xl">
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-1/2 h-[2.5px] -translate-y-1/2 bg-paper-muted"
          />
          <Price
            amount={sale.compareAt.toFixed(2)}
            currencyCode={currencyCode}
          />
        </span>
        <span className="text-3xl font-semibold tracking-tight text-paper-green sm:text-4xl">
          <Price
            amount={sale.price.toFixed(2)}
            currencyCode={currencyCode}
          />
        </span>
        {suffix}
      </span>
    );
  }

  if (size === "compact") {
    return (
      <span
        className={clsx(
          "inline-flex h-full items-center justify-center gap-1.5 leading-none",
          className,
        )}
      >
        <Price
          amount={sale.compareAt.toFixed(2)}
          currencyCode={currencyCode}
          showCurrencyCode={false}
          className="text-[10px] font-medium text-paper-muted line-through decoration-paper-muted/80"
        />
        <Price
          amount={sale.price.toFixed(2)}
          currencyCode={currencyCode}
          showCurrencyCode={false}
          className="text-[11px] font-semibold text-paper-green"
        />
        {suffix}
      </span>
    );
  }

  return (
    <span
      className={clsx("inline-flex flex-wrap items-center gap-2", className)}
    >
      <span className="whitespace-nowrap text-sm text-paper-muted line-through decoration-paper-muted/80">
        <Price
          amount={sale.compareAt.toFixed(2)}
          currencyCode={currencyCode}
        />
      </span>

      <span className="whitespace-nowrap text-lg font-semibold text-paper-green">
        <Price amount={sale.price.toFixed(2)} currencyCode={currencyCode} />
      </span>

      <span
        className="inline-flex items-center rounded-full bg-paper-green px-2 py-0.5 text-[11px] font-semibold text-white"
        aria-label={`Намаление ${formatDiscountPercent(sale.percent)}`}
      >
        {formatDiscountPercent(sale.percent)}
      </span>

      {suffix}
    </span>
  );
}
