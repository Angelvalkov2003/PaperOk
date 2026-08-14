import Link from "next/link";
import { getOrderById, fulfillCodOrder, fulfillPaidOrder } from "lib/supabase/orders";
import { getSession, isStripeEnabled } from "lib/stripe";
import {
  orderStatusLabel,
  paymentStatusLabel,
} from "lib/order-status";
import { ClearCartOnSuccess } from "components/cart/clear-cart-on-success";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId;
  const sessionId = params.session_id;

  let order = null;

  if (orderId) {
    try {
      order = await getOrderById(orderId);

      if (
        order.payment_method === "cash_on_delivery" ||
        order.payment_method === "bank_transfer"
      ) {
        order = await fulfillCodOrder(orderId);
      } else if (order.payment_method === "card" && isStripeEnabled()) {
        const stripeSessionId = order.stripe_session_id || sessionId;
        if (order.payment_status !== "paid" && stripeSessionId) {
          try {
            const session = await getSession(stripeSessionId);
            if (session.payment_status === "paid") {
              order = await fulfillPaidOrder(orderId);
            }
          } catch (err) {
            console.error("Stripe session verification failed:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  }

  const isAccepted =
    order?.payment_status === "paid" ||
    order?.payment_status === "cash_on_delivery";

  const isAwaitingCard =
    order?.payment_method === "card" &&
    order?.payment_status === "awaiting_payment";

  return (
    <>
      <ClearCartOnSuccess />
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                isAccepted
                  ? "bg-paper-accent-bg"
                  : "bg-yellow-100"
              }`}
            >
              <svg
                className={`h-8 w-8 ${
                  isAccepted
                    ? "text-paper-green"
                    : "text-yellow-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-paper-heading">
            {isAwaitingCard
              ? "Плащането се обработва..."
              : "Поръчката е приета!"}
          </h1>
          {order && (
            <div className="mb-6 text-left bg-paper-white p-4 rounded-lg shadow">
              <p className="text-sm text-paper-text mb-2">
                <strong>Номер на поръчка:</strong> #{order.id.substring(0, 8)}
              </p>
              <p className="text-sm text-paper-text mb-2">
                <strong>Начин на плащане:</strong>{" "}
                {order.payment_method === "cash_on_delivery"
                  ? "Наложен платеж"
                  : order.payment_method === "bank_transfer"
                    ? "Банков превод"
                    : "Плащане с карта"}
              </p>
              {order.customer_address ? (
                <p className="text-sm text-paper-text mb-2">
                  <strong>Доставка:</strong> {order.customer_address}
                </p>
              ) : null}
              {order.shipping_price != null ? (
                <p className="text-sm text-paper-text mb-2">
                  <strong>Цена доставка:</strong> €
                  {Number(order.shipping_price).toFixed(2)}
                </p>
              ) : null}
              <p className="text-sm text-paper-text mb-2">
                <strong>Статус на поръчката:</strong>{" "}
                {orderStatusLabel(order.status)}
              </p>
              <p className="text-sm text-paper-text mb-2">
                <strong>Статус на плащането:</strong>{" "}
                {paymentStatusLabel(order.payment_status)}
              </p>
              {order.payment_method === "cash_on_delivery" && (
                <p className="text-sm text-paper-text">
                  Ще платите при получаване на поръчката.
                </p>
              )}
            </div>
          )}
          <p className="mb-8 text-lg text-paper-text">
            Благодарим ви за поръчката. Ще получите потвърждение по имейл скоро.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="btn-primary"
            >
              Към началната страница
            </Link>
            <Link
              href="/products"
              className="btn-outline"
            >
              Продължи пазаруване
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
