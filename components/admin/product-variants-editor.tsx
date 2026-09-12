"use client";

import type { ProductSizeVariant, QuantityPricing } from "lib/types";
import {
  emptyQuantityPricing,
  normalizeProductSizeVariant,
  normalizeQuantityPricing,
} from "lib/quantity-pricing";
import { AdminPriceInput } from "./admin-price-input";
import { QuantityPricingEditor } from "./quantity-pricing-editor";

const PRESET_SIZES = [
  "140 × 200 mm",
  "100 × 143 mm",
  "70 × 100 mm",
  "A3",
  "A4",
  "A5",
  "A6",
];

function newVariantId() {
  return crypto.randomUUID();
}

function defaultVariant(
  name: string,
  basePrice: string,
  enabled = true,
): ProductSizeVariant {
  return normalizeProductSizeVariant({
    id: newVariantId(),
    name,
    price: parseFloat(basePrice) || 0,
    description: "",
    enabled,
    ...emptyQuantityPricing(),
  });
}

interface ProductVariantsEditorProps {
  variants: ProductSizeVariant[];
  basePrice: string;
  onChange: (variants: ProductSizeVariant[]) => void;
}

export function ProductVariantsEditor({
  variants,
  basePrice,
  onChange,
}: ProductVariantsEditorProps) {
  const enabledVariants = variants.filter((v) => v.enabled);

  const togglePreset = (name: string) => {
    const existing = variants.find((v) => v.name === name);
    if (existing) {
      onChange(
        variants.map((v) =>
          v.name === name ? { ...v, enabled: !v.enabled } : v,
        ),
      );
    } else {
      onChange([...variants, defaultVariant(name, basePrice, true)]);
    }
  };

  const updateVariant = (
    id: string,
    field: keyof ProductSizeVariant,
    value: string | boolean | number,
  ) => {
    onChange(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const updateVariantPricing = (id: string, pricing: QuantityPricing) => {
    onChange(
      variants.map((v) =>
        v.id === id
          ? normalizeProductSizeVariant({ ...v, ...pricing })
          : v,
      ),
    );
  };

  const addCustomVariant = () => {
    onChange([...variants, defaultVariant("", basePrice, true)]);
  };

  const removeVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Размери (варианти)
        </label>
        <p className="mb-3 text-xs text-gray-500">
          Активирай размери с тикчета. Всеки размер има собствена цена, минимум
          и ценови диапазони. Ако няма активни размери, се ползват настройките
          на продукта.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map((size) => {
            const variant = variants.find((v) => v.name === size);
            const isEnabled = variant?.enabled ?? false;
            return (
              <button
                key={size}
                type="button"
                onClick={() => togglePreset(size)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isEnabled
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {enabledVariants.length > 0 && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Активни размери
          </h4>
          {enabledVariants.map((variant) => (
            <div
              key={variant.id}
              className="space-y-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <label className="text-xs text-gray-500">Име</label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(variant.id, "name", e.target.value)
                    }
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                    placeholder="A5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">
                    Стандартна цена (€)
                  </label>
                  <AdminPriceInput
                    value={variant.price}
                    onValueChange={(price) =>
                      updateVariant(variant.id, "price", price ?? 0)
                    }
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Кратко описание</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={variant.description || ""}
                      onChange={(e) =>
                        updateVariant(variant.id, "description", e.target.value)
                      }
                      className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                      placeholder="148×210 мм"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="px-2 text-sm text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <QuantityPricingEditor
                compact
                title={`Количество и цени — ${variant.name || "вариант"}`}
                value={normalizeQuantityPricing(variant)}
                onChange={(pricing) =>
                  updateVariantPricing(variant.id, pricing)
                }
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addCustomVariant}
        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        + Добави персонализиран размер
      </button>
    </div>
  );
}
