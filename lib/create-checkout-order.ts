import { createOrder as createOrderInDb } from "lib/supabase/orders";
import {
  validateCartPrices,
  type CartPriceCheckItem,
} from "lib/supabase/validate-cart";
import { isStripeEnabled } from "lib/stripe";
import {
  calculateShipping,
  estimateParcelWeight,
  isSpeedyConfigured,
} from "lib/speedy";
import type { CreateOrderData } from "lib/supabase/orders";
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from "lib/validation";
import {
  checkoutError,
  serializeUnknownError,
  type CheckoutErrorReport,
} from "lib/checkout-diagnostics";

export type CreateOrderResult =
  | { ok: true; id: string; step: "done" }
  | CheckoutErrorReport;

export async function createCheckoutOrder(
  data: CreateOrderData,
  cartItems?: CartPriceCheckItem[],
): Promise<CreateOrderResult> {
  try {
    if (!data.customer_name?.trim()) {
      return checkoutError("validate_fields", VALIDATION_MESSAGES.required, {
        hint: "Попълнете име и фамилия.",
      });
    }
    if (!isValidEmail(data.customer_email || "")) {
      return checkoutError("validate_fields", VALIDATION_MESSAGES.email, {
        hint: "Проверете имейла.",
      });
    }
    if (!isValidPhone(data.customer_phone || "")) {
      return checkoutError("validate_fields", VALIDATION_MESSAGES.phone, {
        hint: "Проверете телефона (български формат).",
      });
    }

    if (data.payment_method === "card" && !isStripeEnabled()) {
      return checkoutError(
        "stripe_config",
        "Плащането с карта не е налично. Липсва STRIPE_SECRET_KEY.",
        {
          hint: "Добавете STRIPE_SECRET_KEY в Vercel → Settings → Environment Variables.",
          details: { stripeSecretPresent: false },
        },
      );
    }

    if (!data.shipping_method || data.shipping_site_id == null) {
      return checkoutError(
        "validate_fields",
        "Моля, изберете начин на доставка със Speedy",
      );
    }

    if (!isSpeedyConfigured()) {
      return checkoutError(
        "speedy_config",
        "Доставката със Speedy временно не е налична",
        {
          hint: "Добавете SPEEDY_USERNAME и SPEEDY_PASSWORD в Vercel env.",
          details: {
            usernamePresent: Boolean(process.env.SPEEDY_USERNAME?.trim()),
            passwordPresent: Boolean(process.env.SPEEDY_PASSWORD?.trim()),
          },
        },
      );
    }

    let productsSubtotal = data.products_subtotal ?? 0;

    if (cartItems && cartItems.length > 0) {
      try {
        const validation = await validateCartPrices(cartItems);
        if (!validation.valid) {
          return checkoutError(
            "validate_cart",
            validation.error || "Невалидна количка",
            {
              hint: "Обновете количката — цените или наличността може да са се променили.",
              details: { itemCount: cartItems.length },
            },
          );
        }
        productsSubtotal = validation.total ?? productsSubtotal;
      } catch (error) {
        return checkoutError(
          "validate_cart",
          "Грешка при проверка на количката срещу базата данни.",
          {
            hint: "Проверете SUPABASE_SERVICE_ROLE_KEY и дали продуктите съществуват.",
            details: serializeUnknownError(error),
          },
        );
      }
    }

    const itemCount =
      cartItems?.reduce((sum, i) => sum + i.quantity, 0) ||
      data.products.reduce((sum, p) => sum + p.quantity, 0) ||
      1;

    const needsOffice =
      data.shipping_method === "office" || data.shipping_method === "apt";
    if (needsOffice && !data.shipping_office_id) {
      return checkoutError(
        "validate_fields",
        "Моля, изберете офис или автомат на Speedy",
      );
    }

    let calc;
    try {
      calc = await calculateShipping({
        siteId: data.shipping_site_id,
        officeId: needsOffice ? data.shipping_office_id : undefined,
        weightKg: estimateParcelWeight(itemCount),
      });
    } catch (error) {
      return checkoutError(
        "speedy_calculate",
        error instanceof Error
          ? error.message
          : "Неуспешно изчисление на доставка от Speedy",
        {
          hint:
            data.shipping_method === "address"
              ? "Адресната доставка към Speedy може да изисква по-точен адрес (улица/номер). Опитайте офис/автомат за тест."
              : "Проверете Speedy credentials и дали офисът/градът са валидни.",
          details: {
            ...serializeUnknownError(error),
            shipping_method: data.shipping_method,
            shipping_site_id: data.shipping_site_id,
            shipping_office_id: data.shipping_office_id ?? null,
            weightKg: estimateParcelWeight(itemCount),
          },
        },
      );
    }

    const shippingPrice = calc.priceTotal;
    const expectedTotal = productsSubtotal + shippingPrice;

    if (Math.abs(expectedTotal - data.total_price) > 0.05) {
      return checkoutError(
        "speedy_calculate",
        "Цената на доставката се е променила. Моля, опреснете и опитайте отново.",
        {
          details: {
            clientTotal: data.total_price,
            expectedTotal,
            productsSubtotal,
            shippingPrice,
          },
        },
      );
    }

    try {
      const order = await createOrderInDb({
        ...data,
        products_subtotal: productsSubtotal,
        shipping_price: shippingPrice,
        total_price: expectedTotal,
        shipping_deadline: calc.deliveryDeadline || data.shipping_deadline,
      });

      return { ok: true, id: String(order.id), step: "done" };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Грешка при записване на поръчката";
      const needsMigration =
        message.includes("next_migration") ||
        message.includes("payment_status") ||
        message.includes("orders_status");

      return checkoutError("db_insert", message, {
        hint: needsMigration
          ? "Изпълнете next_migration.sql в Supabase SQL Editor за production базата."
          : "Проверете SUPABASE_SERVICE_ROLE_KEY и схемата на таблицата orders.",
        details: serializeUnknownError(error),
      });
    }
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    return checkoutError(
      "unknown",
      error instanceof Error
        ? error.message
        : "Грешка при създаване на поръчката",
      {
        details: serializeUnknownError(error),
      },
    );
  }
}
