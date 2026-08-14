"use server";

import { createOrder as createOrderInDb } from "lib/supabase/orders";
import { validateCartPrices } from "lib/supabase/validate-cart";
import { isStripeEnabled } from "lib/stripe";
import {
  calculateShipping,
  estimateParcelWeight,
  isSpeedyConfigured,
} from "lib/speedy";
import type { CreateOrderData } from "lib/supabase/orders";
import type { CartPriceCheckItem } from "lib/supabase/validate-cart";
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from "lib/validation";

export type CreateOrderResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createOrder(
  data: CreateOrderData,
  cartItems?: CartPriceCheckItem[],
): Promise<CreateOrderResult> {
  try {
    if (!data.customer_name?.trim()) {
      return { ok: false, error: VALIDATION_MESSAGES.required };
    }
    if (!isValidEmail(data.customer_email || "")) {
      return { ok: false, error: VALIDATION_MESSAGES.email };
    }
    if (!isValidPhone(data.customer_phone || "")) {
      return { ok: false, error: VALIDATION_MESSAGES.phone };
    }

    if (data.payment_method === "card" && !isStripeEnabled()) {
      return { ok: false, error: "Плащането с карта не е налично. Липсва STRIPE_SECRET_KEY." };
    }

    if (!data.shipping_method || data.shipping_site_id == null) {
      return { ok: false, error: "Моля, изберете начин на доставка със Speedy" };
    }

    if (!isSpeedyConfigured()) {
      return { ok: false, error: "Доставката със Speedy временно не е налична" };
    }

    let productsSubtotal = data.products_subtotal ?? 0;

    if (cartItems && cartItems.length > 0) {
      const validation = await validateCartPrices(cartItems);
      if (!validation.valid) {
        return { ok: false, error: validation.error || "Невалидна количка" };
      }
      productsSubtotal = validation.total ?? productsSubtotal;
    }

    const itemCount =
      cartItems?.reduce((sum, i) => sum + i.quantity, 0) ||
      data.products.reduce((sum, p) => sum + p.quantity, 0) ||
      1;

    const needsOffice =
      data.shipping_method === "office" || data.shipping_method === "apt";
    if (needsOffice && !data.shipping_office_id) {
      return { ok: false, error: "Моля, изберете офис или автомат на Speedy" };
    }

    const calc = await calculateShipping({
      siteId: data.shipping_site_id,
      officeId: needsOffice ? data.shipping_office_id : undefined,
      weightKg: estimateParcelWeight(itemCount),
    });

    const shippingPrice = calc.priceTotal;
    const expectedTotal = productsSubtotal + shippingPrice;

    if (Math.abs(expectedTotal - data.total_price) > 0.05) {
      return {
        ok: false,
        error:
          "Цената на доставката се е променила. Моля, опреснете и опитайте отново.",
      };
    }

    const order = await createOrderInDb({
      ...data,
      products_subtotal: productsSubtotal,
      shipping_price: shippingPrice,
      total_price: expectedTotal,
      shipping_deadline: calc.deliveryDeadline || data.shipping_deadline,
    });

    return { ok: true, id: String(order.id) };
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Грешка при създаване на поръчката";
    return { ok: false, error: message };
  }
}
