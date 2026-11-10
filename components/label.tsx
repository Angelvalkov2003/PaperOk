import clsx from "clsx";
import SalePrice from "./sale-price";

const Label = ({
  title,
  amount,
  compareAtAmount,
  currencyCode,
  position = "bottom",
}: {
  title: string;
  amount: string;
  compareAtAmount?: string;
  currencyCode: string;
  position?: "bottom" | "center";
}) => {
  return (
    <div
      className={clsx(
        "absolute bottom-0 left-0 flex w-full px-3 pb-3 @container/label sm:px-4 sm:pb-4",
        {
          "lg:px-20 lg:pb-[35%]": position === "center",
        },
      )}
    >
      <div className="flex max-w-full items-center gap-1.5 rounded-full border border-paper-border/60 bg-white/75 p-1 text-xs font-semibold text-paper-heading backdrop-blur-md">
        <h3 className="min-w-0 flex-1 truncate px-2 leading-none tracking-tight">
          {title}
        </h3>
        <div className="flex h-7 flex-none items-center justify-center rounded-full bg-paper-section px-2.5">
          <SalePrice
            amount={amount}
            compareAtAmount={compareAtAmount}
            currencyCode={currencyCode}
            size="compact"
          />
        </div>
      </div>
    </div>
  );
};

export default Label;
