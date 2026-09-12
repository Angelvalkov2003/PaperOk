"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { CartItem } from "lib/types";

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate,
}: {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: (
    itemId: string,
    updateType: "plus" | "minus" | "delete",
  ) => void;
}) {
  const minQuantity = Math.max(1, item.minQuantity || 1);
  const disableMinus = type === "minus" && item.quantity <= minQuantity;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disableMinus) return;
    optimisticUpdate(item.id, type);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disableMinus}
      aria-label={
        type === "plus" ? "Увеличи количество" : "Намали количество"
      }
      className={clsx(
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-paper-border hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40",
        {
          "ml-auto": type === "minus",
        },
      )}
    >
      {type === "plus" ? (
        <PlusIcon className="h-4 w-4" />
      ) : (
        <MinusIcon className="h-4 w-4" />
      )}
    </button>
  );
}
