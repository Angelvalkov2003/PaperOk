"use client";

import type { PriceTier, QuantityPricing } from "lib/types";
import {
  createEmptyPriceTier,
  emptyQuantityPricing,
  formatPriceTierLabel,
  normalizeQuantityPricing,
} from "lib/quantity-pricing";
import { AdminIntegerInput, AdminPriceInput } from "./admin-price-input";
import { FieldHint } from "./field-hint";

type Props = {
  value?: Partial<QuantityPricing> | null;
  onChange: (next: QuantityPricing) => void;
  compact?: boolean;
  title?: string;
};

export function QuantityPricingEditor({
  value,
  onChange,
  compact = false,
  title = "Минимално количество и ценови диапазони",
}: Props) {
  const pricing = normalizeQuantityPricing(value ?? emptyQuantityPricing());

  const setPricing = (patch: Partial<QuantityPricing>) => {
    onChange(normalizeQuantityPricing({ ...pricing, ...patch }));
  };

  const setTiers = (tiers: PriceTier[]) => {
    setPricing({ priceTiers: tiers });
  };

  const patchTier = (index: number, patch: Partial<PriceTier>) => {
    setTiers(
      pricing.priceTiers.map((tier, i) =>
        i === index ? { ...tier, ...patch } : tier,
      ),
    );
  };

  const addTier = () => {
    const last = pricing.priceTiers[pricing.priceTiers.length - 1];
    const nextMin = last
      ? (last.maxQty != null ? last.maxQty + 1 : last.minQty + 1)
      : Math.max(1, pricing.minQuantityEnabled ? pricing.minQuantity : 1);
    setTiers([...pricing.priceTiers, createEmptyPriceTier(nextMin)]);
  };

  const removeTier = (index: number) => {
    setTiers(pricing.priceTiers.filter((_, i) => i !== index));
  };

  return (
    <div
      className={
        compact
          ? "space-y-3 rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          : "space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
      }
    >
      {!compact && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <FieldHint example="20–49 бр. → 5,50 € · 500+ бр. → по запитване">
            Минималното количество и ценовите диапазони са независими — може да
            включите само едното, и двете, или нито едно.
          </FieldHint>
        </div>
      )}

      <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={pricing.minQuantityEnabled}
          onChange={(e) =>
            setPricing({ minQuantityEnabled: e.target.checked })
          }
          className="mt-0.5 rounded border-gray-300"
        />
        <span>Минимално количество за поръчка</span>
      </label>

      {pricing.minQuantityEnabled && (
        <div className={compact ? "max-w-[10rem]" : "max-w-xs"}>
          <label className="mb-1 block text-xs text-gray-500">
            Минимум (бр.)
          </label>
          <AdminIntegerInput
            min={1}
            value={pricing.minQuantity}
            onValueChange={(minQuantity) =>
              setPricing({ minQuantity: minQuantity ?? 1 })
            }
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      )}

      <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={pricing.priceTiersEnabled}
          onChange={(e) =>
            setPricing({ priceTiersEnabled: e.target.checked })
          }
          className="mt-0.5 rounded border-gray-300"
        />
        <span>Различна цена според количеството</span>
      </label>

      {pricing.priceTiersEnabled && (
        <div className="space-y-3">
          {pricing.priceTiers.length === 0 && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Добавете поне един диапазон. Без диапазони се ползва стандартната
              цена.
            </p>
          )}

          {pricing.priceTiers.map((tier, index) => {
            const onInquiry = tier.price == null;
            return (
              <div
                key={tier.id}
                className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 bg-white p-3 sm:grid-cols-12 dark:border-gray-700 dark:bg-gray-950/40"
              >
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-gray-500">От</label>
                  <AdminIntegerInput
                    min={1}
                    value={tier.minQty}
                    onValueChange={(minQty) =>
                      patchTier(index, { minQty: minQty ?? 1 })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-gray-500">
                    До (празно = +)
                  </label>
                  <AdminIntegerInput
                    min={tier.minQty}
                    allowEmpty
                    value={tier.maxQty}
                    placeholder="∞"
                    onValueChange={(maxQty) =>
                      patchTier(index, {
                        maxQty:
                          maxQty == null
                            ? null
                            : Math.max(tier.minQty, maxQty),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs text-gray-500">
                    Цена (€/бр.)
                  </label>
                  <AdminPriceInput
                    disabled={onInquiry}
                    value={onInquiry ? null : (tier.price ?? 0)}
                    onValueChange={(price) =>
                      patchTier(index, {
                        price: Math.max(0, price ?? 0),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:disabled:bg-gray-900"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2 sm:col-span-4">
                  <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={onInquiry}
                      onChange={(e) =>
                        patchTier(index, {
                          price: e.target.checked ? null : 0,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    Цена по запитване
                  </label>
                  <p className="text-xs text-gray-400">
                    {formatPriceTierLabel(tier)}
                  </p>
                </div>
                <div className="flex items-end sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                    aria-label="Изтрий диапазон"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addTier}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            + Добави ценови диапазон
          </button>
        </div>
      )}
    </div>
  );
}
