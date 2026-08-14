import { createServiceClient } from "./service";
import type { ProductSizeVariant } from "lib/types";

export type CartPriceCheckItem = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  title: string;
};

export async function validateCartPrices(
  items: CartPriceCheckItem[],
): Promise<{ valid: boolean; error?: string; total?: number }> {
  const supabase = createServiceClient();
  let total = 0;

  for (const item of items) {
    const { data: product, error } = await supabase
      .from("products")
      .select("id, title, price, available, variants")
      .eq("id", item.productId)
      .single();

    if (error || !product) {
      return { valid: false, error: `Продуктът не е намерен: ${item.title}` };
    }

    if (!product.available) {
      return { valid: false, error: `${product.title} вече не е наличен` };
    }

    const variants: ProductSizeVariant[] = product.variants || [];
    const enabledVariants = variants.filter((v) => v.enabled);

    let expectedPrice = Number(product.price);

    if (enabledVariants.length > 0) {
      const variant = enabledVariants.find((v) => v.id === item.variantId);
      if (!variant) {
        return {
          valid: false,
          error: `Невалиден размер за ${product.title}`,
        };
      }
      expectedPrice = Number(variant.price);
    }

    if (Math.abs(expectedPrice - item.price) > 0.01) {
      return {
        valid: false,
        error: `Цената на ${product.title} е променена. Моля, обновете количката.`,
      };
    }

    total += expectedPrice * item.quantity;
  }

  return { valid: true, total };
}
