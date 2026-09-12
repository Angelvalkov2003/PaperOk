import { createServiceClient } from "./service";
import type { ProductSizeVariant } from "lib/types";
import {
  getEffectiveQuantityPricing,
  getMinOrderQuantity,
  normalizeProductSizeVariant,
  resolveUnitPrice,
} from "lib/quantity-pricing";

export type CartPriceCheckItem = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  title: string;
};

type ProductRow = {
  id: string;
  title: string;
  price: number;
  available: boolean;
  variants: unknown;
  min_quantity_enabled?: boolean;
  min_quantity?: number;
  price_tiers_enabled?: boolean;
  price_tiers?: unknown;
};

async function fetchProductForPriceCheck(
  productId: string,
): Promise<ProductRow | null> {
  const supabase = createServiceClient();

  const full = await supabase
    .from("products")
    .select(
      "id, title, price, available, variants, min_quantity_enabled, min_quantity, price_tiers_enabled, price_tiers",
    )
    .eq("id", productId)
    .single();

  if (!full.error && full.data) {
    return full.data as ProductRow;
  }

  const legacy = await supabase
    .from("products")
    .select("id, title, price, available, variants")
    .eq("id", productId)
    .single();

  if (legacy.error || !legacy.data) return null;

  return {
    ...(legacy.data as ProductRow),
    min_quantity_enabled: false,
    min_quantity: 1,
    price_tiers_enabled: false,
    price_tiers: [],
  };
}

export async function validateCartPrices(
  items: CartPriceCheckItem[],
): Promise<{ valid: boolean; error?: string; total?: number }> {
  let total = 0;

  for (const item of items) {
    const product = await fetchProductForPriceCheck(item.productId);

    if (!product) {
      return { valid: false, error: `Продуктът не е намерен: ${item.title}` };
    }

    if (!product.available) {
      return { valid: false, error: `${product.title} вече не е наличен` };
    }

    const variants: ProductSizeVariant[] = Array.isArray(product.variants)
      ? product.variants.map((v) =>
          normalizeProductSizeVariant(v as ProductSizeVariant),
        )
      : [];
    const enabledVariants = variants.filter((v) => v.enabled);

    let selectedVariant: ProductSizeVariant | null = null;
    let basePrice = Number(product.price);

    if (enabledVariants.length > 0) {
      selectedVariant =
        enabledVariants.find((v) => v.id === item.variantId) || null;
      if (!selectedVariant) {
        return {
          valid: false,
          error: `Невалиден размер за ${product.title}`,
        };
      }
      basePrice = Number(selectedVariant.price);
    }

    const pricing = getEffectiveQuantityPricing(
      {
        minQuantityEnabled: Boolean(product.min_quantity_enabled),
        minQuantity: Number(product.min_quantity) || 1,
        priceTiersEnabled: Boolean(product.price_tiers_enabled),
        priceTiers: Array.isArray(product.price_tiers)
          ? product.price_tiers
          : [],
        variants,
      },
      selectedVariant,
    );

    const minQty = getMinOrderQuantity(pricing);
    if (item.quantity < minQty) {
      return {
        valid: false,
        error: `Минималното количество за ${product.title} е ${minQty} бр.`,
      };
    }

    const resolved = resolveUnitPrice(basePrice, pricing, item.quantity);
    if (resolved.onInquiry || resolved.unitPrice == null) {
      return {
        valid: false,
        error: `${product.title}: за това количество цената е по запитване`,
      };
    }

    if (Math.abs(resolved.unitPrice - item.price) > 0.01) {
      return {
        valid: false,
        error: `Цената на ${product.title} е променена. Моля, обновете количката.`,
      };
    }

    total += resolved.unitPrice * item.quantity;
  }

  return { valid: true, total };
}
