"use server";

import { createCheckoutOrder } from "lib/create-checkout-order";
import type { CreateOrderData } from "lib/supabase/orders";
import type { CartPriceCheckItem } from "lib/supabase/validate-cart";

/** @deprecated Prefer POST /api/checkout/create-order — kept for compatibility. */
export async function createOrder(
  data: CreateOrderData,
  cartItems?: CartPriceCheckItem[],
) {
  return createCheckoutOrder(data, cartItems);
}
