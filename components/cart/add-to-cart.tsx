"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { Product, ProductSizeVariant } from "lib/types";
import { useActionState } from "react";
import { useCart } from "./cart-context";
import Price from "components/price";
import Link from "next/link";
import {
  formatPriceTierLabel,
  getEffectiveQuantityPricing,
  getMinOrderQuantity,
  resolveUnitPrice,
} from "lib/quantity-pricing";

type ButtonState = "idle" | "adding" | "added";

function SubmitButton({
  available,
  state,
  disabledReason,
}: {
  available: boolean;
  state: ButtonState;
  disabledReason?: string | null;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-xl bg-paper-green p-4 tracking-wide text-white transition-all duration-300";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!available) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Изчерпан
      </button>
    );
  }

  if (disabledReason) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        {disabledReason}
      </button>
    );
  }

  const isBusy = state !== "idle";

  return (
    <button
      type="submit"
      disabled={isBusy}
      aria-label="Добави в количка"
      aria-busy={state === "adding"}
      className={clsx(
        buttonClasses,
        isBusy && "cursor-not-allowed",
        state === "adding" && "scale-[0.98] opacity-90",
        state === "added" && "bg-paper-green-hover scale-[1.02]",
        state === "idle" &&
          "hover:bg-paper-green-hover hover:opacity-90 active:scale-[0.98]",
      )}
    >
      <div className="absolute left-0 ml-4">
        {state === "added" ? (
          <CheckIcon className="h-5 animate-cart-check" />
        ) : state === "adding" ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <PlusIcon className="h-5" />
        )}
      </div>
      {state === "adding"
        ? "Добавяне..."
        : state === "added"
          ? "Добавено!"
          : "Добави в Количка"}
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { available, variants } = product;
  const enabledVariants = (variants || []).filter((v) => v.enabled);
  const hasVariants = enabledVariants.length > 0;

  const [selectedVariant, setSelectedVariant] =
    useState<ProductSizeVariant | null>(
      hasVariants ? enabledVariants[0]! : null,
    );
  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const pricing = useMemo(
    () => getEffectiveQuantityPricing(product, selectedVariant),
    [product, selectedVariant],
  );
  const minQty = getMinOrderQuantity(pricing);
  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const resolved = resolveUnitPrice(basePrice, pricing, quantity);
  const displayPrice = resolved.unitPrice ?? basePrice;
  const onInquiry = resolved.onInquiry;

  useEffect(() => {
    setQuantity(minQty);
  }, [selectedVariant?.id, minQty]);

  const { addCartItem } = useCart();
  const [message, formAction] = useActionState(addItem, null);

  const variantData = {
    id: selectedVariant?.id || product.id,
    title: selectedVariant?.name || product.title,
    price: displayPrice,
    available: product.available,
    selectedOptions: selectedVariant
      ? [{ name: "Размер", value: selectedVariant.name }]
      : [],
  };

  const bumpQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(minQty, prev + delta));
  };

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div>
          <label className="mb-2 block text-sm font-medium">Размер</label>
          <div className="flex flex-wrap gap-2">
            {enabledVariants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={buttonState !== "idle"}
                onClick={() => setSelectedVariant(variant)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  selectedVariant?.id === variant.id
                    ? "border-paper-green bg-paper-green text-white"
                    : "border-paper-border hover:border-paper-green",
                  buttonState !== "idle" && "pointer-events-none opacity-60",
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
          {selectedVariant?.description && (
            <p className="mt-2 text-sm text-paper-muted">
              {selectedVariant.description}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Количество</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-paper-border">
            <button
              type="button"
              aria-label="Намали количество"
              disabled={quantity <= minQty || buttonState !== "idle"}
              onClick={() => bumpQuantity(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-l-full disabled:opacity-40"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={minQty}
              value={quantity}
              disabled={buttonState !== "idle"}
              onChange={(e) => {
                const next = parseInt(e.target.value, 10);
                if (!Number.isFinite(next)) return;
                setQuantity(Math.max(minQty, next));
              }}
              className="h-10 w-16 border-x border-paper-border bg-transparent text-center text-sm outline-none"
            />
            <button
              type="button"
              aria-label="Увеличи количество"
              disabled={buttonState !== "idle"}
              onClick={() => bumpQuantity(1)}
              className="flex h-10 w-10 items-center justify-center rounded-r-full disabled:opacity-40"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          {minQty > 1 && (
            <p className="text-xs text-paper-muted">Мин. {minQty} бр.</p>
          )}
        </div>
      </div>

      {pricing.priceTiersEnabled && pricing.priceTiers.length > 0 && (
        <div className="rounded-xl border border-paper-border/80 bg-paper-section/40 p-3 text-sm">
          <p className="mb-2 font-medium text-paper-heading">Цени по количество</p>
          <ul className="space-y-1 text-paper-muted">
            {pricing.priceTiers.map((tier) => (
              <li
                key={tier.id}
                className={clsx(
                  "flex justify-between gap-3",
                  resolved.tier?.id === tier.id && "font-medium text-paper-green",
                )}
              >
                <span>{formatPriceTierLabel(tier)}</span>
                <span>
                  {tier.price == null ? (
                    "по запитване"
                  ) : (
                    <Price amount={tier.price.toString()} currencyCode="EUR" />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-1">
        {onInquiry ? (
          <p className="text-lg font-medium text-paper-heading">
            Цена по запитване
          </p>
        ) : (
          <>
            <div className="text-lg font-medium">
              <Price amount={displayPrice.toString()} currencyCode="EUR" />
              <span className="ml-1 text-sm font-normal text-paper-muted">
                / бр.
              </span>
            </div>
            <p className="text-sm text-paper-muted">
              Общо:{" "}
              <Price
                amount={(displayPrice * quantity).toFixed(2)}
                currencyCode="EUR"
              />
            </p>
          </>
        )}
      </div>

      {onInquiry ? (
        <div className="space-y-3">
          <SubmitButton
            available={available}
            state="idle"
            disabledReason="Цена по запитване"
          />
          <p className="text-sm text-paper-muted">
            За това количество пишете ни през{" "}
            <Link href="/contact" className="text-paper-green underline">
              контакти
            </Link>{" "}
            или{" "}
            <Link href="/za-biznesa" className="text-paper-green underline">
              За бизнеса
            </Link>
            .
          </p>
        </div>
      ) : (
        <form
          action={async () => {
            if (buttonState !== "idle" || onInquiry || resolved.unitPrice == null)
              return;
            setButtonState("adding");
            addCartItem(variantData, product, quantity);
            await formAction({
              productId: product.id,
              variantId: variantData.id,
              price: displayPrice,
            });
            setButtonState("added");
            window.setTimeout(() => setButtonState("idle"), 1400);
          }}
        >
          <SubmitButton available={available} state={buttonState} />
          <p aria-live="polite" className="sr-only" role="status">
            {buttonState === "added"
              ? "Продуктът е добавен в количката"
              : message}
          </p>
        </form>
      )}
    </div>
  );
}
