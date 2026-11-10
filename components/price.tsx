import clsx from "clsx";

const Price = ({
  amount,
  className,
  currencyCode = "EUR",
  currencyCodeClassName,
  showCurrencyCode = true,
}: {
  amount: string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
  /** When false, only the localized amount (e.g. 49,90 €) is shown. */
  showCurrencyCode?: boolean;
} & React.ComponentProps<"span">) => {
  const formatted = new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(parseFloat(amount));

  const hideCode =
    !showCurrencyCode ||
    currencyCodeClassName === "hidden" ||
    currencyCodeClassName?.includes("hidden");

  return (
    <span
      suppressHydrationWarning={true}
      className={clsx("whitespace-nowrap leading-none", className)}
    >
      {formatted}
      {!hideCode ? (
        <span className={clsx("ml-1", currencyCodeClassName)}>
          {currencyCode}
        </span>
      ) : null}
    </span>
  );
};

export default Price;
