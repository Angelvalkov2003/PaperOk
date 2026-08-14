"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
  bump = false,
}: {
  className?: string;
  quantity?: number;
  bump?: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative flex h-10 w-10 items-center justify-center rounded-full text-paper-text transition-colors hover:bg-paper-surface-muted hover:text-paper-green",
        bump && "animate-cart-bump",
      )}
    >
      <ShoppingCartIcon
        className={clsx(
          "h-5 w-5 transition-all ease-in-out",
          bump && "text-paper-green",
          className,
        )}
      />

      {quantity ? (
        <div
          key={quantity}
          className={clsx(
            "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-paper-green px-0.5 text-[10px] font-medium text-white",
            bump && "animate-cart-badge-pop",
          )}
        >
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
