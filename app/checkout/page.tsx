"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "components/cart/cart-context";
import Price from "components/price";
import LoadingDots from "components/loading-dots";
import { CARD_PAYMENTS_ENABLED } from "lib/constants";
import { useErrorPopup } from "components/error-popup-provider";
import {
  SpeedyShippingForm,
  type SpeedyShippingSelection,
} from "components/checkout/speedy-shipping-form";
import {
  FieldError,
  FormField,
  formControlClass,
} from "components/forms/field";
import {
  type CheckoutFields,
  type FieldErrors,
  hasFieldErrors,
  validateCheckoutForm,
} from "lib/validation";

type PaymentMethod = "cash_on_delivery" | "card";

function generateIdempotencyKey() {
  return crypto.randomUUID();
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const { showError } = useErrorPopup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<CheckoutFields>>(
    {},
  );
  const [shipping, setShipping] = useState<SpeedyShippingSelection | null>(
    null,
  );
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    payment_method: "cash_on_delivery" as PaymentMethod,
    comment: "",
    privacy_policy_accepted: false,
  });

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const errorKey = key as CheckoutFields;
      if (!(errorKey in prev)) return prev;
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  };

  const handleShippingChange = (value: SpeedyShippingSelection | null) => {
    setShipping(value);
    if (value) {
      setFieldErrors((prev) => {
        if (!prev.shipping) return prev;
        const next = { ...prev };
        delete next.shipping;
        return next;
      });
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="mb-4 text-3xl font-bold text-paper-heading">
            Количката е празна
          </h1>
          <p className="mb-8 text-lg text-paper-text">
            Моля, добавете продукти в количката преди да финализирате поръчката.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="btn-primary"
          >
            Към продуктите
          </button>
        </div>
      </div>
    );
  }

  const productsSubtotal = cart.subtotal;
  const shippingPrice = shipping?.shippingPrice ?? 0;
  const grandTotal = productsSubtotal + shippingPrice;
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateCheckoutForm({
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      hasShipping: !!shipping,
      privacy_policy_accepted: formData.privacy_policy_accepted,
    });
    setFieldErrors(errors);
    if (hasFieldErrors(errors) || !shipping) {
      return;
    }

    setIsSubmitting(true);

    try {
      const products = cart.items.map((item) => {
        const row: {
          id: string;
          name: string;
          price: number;
          quantity: number;
          variant_name?: string;
        } = {
          id: item.productId,
          name: item.product.title,
          price: item.price,
          quantity: item.quantity,
        };
        if (item.variant.title && item.variant.title !== item.product.title) {
          row.variant_name = item.variant.title;
        }
        return row;
      });

      const orderPayload: Record<string, unknown> = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: shipping.customerAddressSummary,
        products,
        products_subtotal: productsSubtotal,
        total_price: grandTotal,
        payment_method: formData.payment_method,
        idempotency_key: idempotencyKeyRef.current,
        shipping_method: shipping.method,
        shipping_price: shipping.shippingPrice,
        shipping_site_id: shipping.siteId,
        shipping_site_name: shipping.siteName,
      };

      if (formData.comment.trim()) {
        orderPayload.comment = formData.comment.trim();
      }
      if (shipping.officeId != null) {
        orderPayload.shipping_office_id = shipping.officeId;
      }
      if (shipping.officeName) {
        orderPayload.shipping_office_name = shipping.officeName;
      }
      if (shipping.deliveryDeadline) {
        orderPayload.shipping_deadline = shipping.deliveryDeadline;
      }
      if (shipping.addressLine || shipping.method) {
        orderPayload.shipping_details = {
          ...(shipping.addressLine ? { addressLine: shipping.addressLine } : {}),
          method: shipping.method,
        };
      }

      const cartCheck = cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        title: item.product.title,
      }));

      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: orderPayload,
          cartItems: cartCheck,
        }),
      });

      const createPayload = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !createPayload.id) {
        const lines = [
          createPayload.error ||
            `Грешка при създаване на поръчката (HTTP ${createRes.status})`,
        ];
        if (createPayload.step) lines.push(`Стъпка: ${createPayload.step}`);
        if (createPayload.hint) lines.push(`Подсказка: ${createPayload.hint}`);
        if (createPayload.details) {
          lines.push(
            `Детайли: ${JSON.stringify(createPayload.details, null, 2)}`,
          );
        }
        if (createPayload.env) {
          lines.push(`Env: ${JSON.stringify(createPayload.env, null, 2)}`);
        }
        lines.push(`HTTP: ${createRes.status}`);
        lines.push(`Време: ${createPayload.durationMs ?? "?"} ms`);
        throw new Error(lines.join("\n\n"));
      }

      const orderId = String(createPayload.id);

      if (formData.payment_method === "card") {
        if (!CARD_PAYMENTS_ENABLED) {
          throw new Error("Плащането с карта не е налично");
        }
        const response = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            cart: {
              items: cart.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
                product: {
                  title: item.product.title,
                  image: item.product.image?.url
                    ? { url: item.product.image.url }
                    : undefined,
                },
                variant: { title: item.variant.title },
              })),
            },
            shippingPrice: shipping.shippingPrice,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            payload.error || "Грешка при създаване на сесия за плащане",
          );
        }

        if (payload.url) {
          window.location.href = payload.url;
          return;
        }

        throw new Error("Stripe не върна линк за плащане");
      } else {
        router.push(`/checkout/success?orderId=${orderId}`);
      }
    } catch (err: unknown) {
      showError(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-paper-heading">
          Финализиране на поръчката
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-lg bg-paper-white p-6 shadow"
            >
              <h2 className="mb-6 text-xl font-semibold text-paper-heading">
                Данни за поръчката
              </h2>

              <div className="space-y-4">
                <FormField
                  id="customer_name"
                  label="Име и фамилия"
                  required
                  error={fieldErrors.customer_name}
                >
                  <input
                    type="text"
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      updateField("customer_name", e.target.value)
                    }
                    aria-invalid={!!fieldErrors.customer_name}
                    className={formControlClass(!!fieldErrors.customer_name)}
                  />
                </FormField>

                <FormField
                  id="customer_email"
                  label="Имейл"
                  required
                  error={fieldErrors.customer_email}
                >
                  <input
                    type="email"
                    id="customer_email"
                    value={formData.customer_email}
                    onChange={(e) =>
                      updateField("customer_email", e.target.value)
                    }
                    aria-invalid={!!fieldErrors.customer_email}
                    className={formControlClass(!!fieldErrors.customer_email)}
                  />
                </FormField>

                <FormField
                  id="customer_phone"
                  label="Телефон"
                  required
                  error={fieldErrors.customer_phone}
                >
                  <input
                    type="tel"
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      updateField("customer_phone", e.target.value)
                    }
                    placeholder="08XXXXXXXX"
                    aria-invalid={!!fieldErrors.customer_phone}
                    className={formControlClass(!!fieldErrors.customer_phone)}
                  />
                </FormField>

                <div>
                  <SpeedyShippingForm
                    itemCount={itemCount}
                    onChange={handleShippingChange}
                  />
                  <FieldError message={fieldErrors.shipping} />
                </div>

                <FormField id="comment" label="Коментар (по избор)">
                  <textarea
                    id="comment"
                    rows={3}
                    value={formData.comment}
                    onChange={(e) => updateField("comment", e.target.value)}
                    className={formControlClass(false)}
                  />
                </FormField>

                <div>
                  <label className="mb-3 block text-sm font-medium text-paper-heading">
                    Начин на плащане *
                  </label>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center rounded-lg border border-paper-border p-4 hover:bg-paper-bg">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={
                          formData.payment_method === "cash_on_delivery"
                        }
                        onChange={(e) =>
                          updateField(
                            "payment_method",
                            e.target.value as PaymentMethod,
                          )
                        }
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-paper-heading">
                          Наложен платеж
                        </div>
                        <div className="text-sm text-paper-muted">
                          Плащане при получаване на пратката
                        </div>
                      </div>
                    </label>

                    {CARD_PAYMENTS_ENABLED ? (
                      <label className="flex cursor-pointer items-center rounded-lg border border-paper-border p-4 hover:bg-paper-bg">
                        <input
                          type="radio"
                          name="payment_method"
                          value="card"
                          checked={formData.payment_method === "card"}
                          onChange={(e) =>
                            updateField(
                              "payment_method",
                              e.target.value as PaymentMethod,
                            )
                          }
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-paper-heading">
                            Плащане с карта
                          </div>
                          <div className="text-sm text-paper-muted">
                            Сигурно плащане чрез Stripe
                          </div>
                        </div>
                      </label>
                    ) : null}
                  </div>
                </div>

                <div className="pt-4">
                  <label
                    className={`flex cursor-pointer items-start space-x-3 rounded-lg p-2 ${
                      fieldErrors.privacy_policy_accepted
                        ? "border border-red-500 bg-red-50/50"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.privacy_policy_accepted}
                      onChange={(e) =>
                        updateField(
                          "privacy_policy_accepted",
                          e.target.checked,
                        )
                      }
                      aria-invalid={!!fieldErrors.privacy_policy_accepted}
                      className="mt-1 h-4 w-4 rounded border-paper-border text-paper-green focus:ring-paper-green"
                    />
                    <span className="text-sm text-paper-heading">
                      Съгласен съм с{" "}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-paper-green underline hover:text-paper-green-hover"
                      >
                        Политиката за поверителност
                      </a>{" "}
                      и се съгласявам обработката на моите лични данни за целите
                      на поръчката. *
                    </span>
                  </label>
                  <FieldError message={fieldErrors.privacy_policy_accepted} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <LoadingDots className="bg-paper-white" />
                  ) : (
                    "Финализирай поръчката"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg bg-paper-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-paper-heading">
                Резюме на поръчката
              </h2>

              <div className="mb-6 space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between border-b border-paper-border pb-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-paper-heading">
                        {item.product.title}
                      </p>
                      <p className="text-sm text-paper-muted">
                        Количество: {item.quantity}
                      </p>
                    </div>
                    <Price
                      amount={(item.price * item.quantity).toString()}
                      currencyCode={cart.currency}
                      className="text-sm font-medium"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-paper-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-paper-text">Продукти</span>
                  <Price
                    amount={productsSubtotal.toString()}
                    currencyCode={cart.currency}
                    className="font-medium"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-paper-text">Доставка (Speedy)</span>
                  {shipping ? (
                    <Price
                      amount={shippingPrice.toString()}
                      currencyCode={cart.currency}
                      className="font-medium"
                    />
                  ) : (
                    <span className="text-paper-muted">Изберете доставка</span>
                  )}
                </div>
                <div className="flex justify-between pt-2 text-lg font-bold">
                  <span className="text-paper-heading">Общо</span>
                  <Price
                    amount={grandTotal.toString()}
                    currencyCode={cart.currency}
                    className="text-paper-green"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
