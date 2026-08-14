import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, isStripeEnabled } from "lib/stripe";
import {
  getOrderById,
  updateOrderStripeSession,
} from "lib/supabase/orders";
import { validateCartPrices } from "lib/supabase/validate-cart";
import { baseUrl } from "lib/utils";

export async function POST(request: NextRequest) {
  try {
    if (!isStripeEnabled()) {
      return NextResponse.json(
        { error: "Плащането с карта не е налично" },
        { status: 503 },
      );
    }

    const { orderId, cart } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Липсва ID на поръчката" },
        { status: 400 },
      );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Количката е празна" },
        { status: 400 },
      );
    }

    const order = await getOrderById(orderId);

    if (order.payment_method !== "card") {
      return NextResponse.json(
        { error: "Поръчката не е с карта" },
        { status: 400 },
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "Поръчката вече е платена" },
        { status: 400 },
      );
    }

    const validated = await validateCartPrices(
      cart.items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        title: item.product?.title || item.title || "",
      })),
    );
    if (!validated.valid) {
      return NextResponse.json(
        { error: validated.error || "Невалидни цени в количката" },
        { status: 400 },
      );
    }

    if (order.stripe_session_id) {
      const { getSession } = await import("lib/stripe");
      try {
        const existing = await getSession(order.stripe_session_id);
        if (
          existing.status === "open" &&
          existing.url &&
          existing.metadata?.orderId === orderId
        ) {
          return NextResponse.json({ url: existing.url });
        }
      } catch {
        // Session expired — create new one
      }
    }

    const session = await createCheckoutSession(
      cart,
      orderId,
      order.customer_email,
      `${baseUrl}/checkout/success?orderId=${orderId}`,
      `${baseUrl}/checkout/cancel?orderId=${orderId}`,
      Number(order.shipping_price) || 0,
    );

    await updateOrderStripeSession(orderId, session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Грешка при създаване на сесия за плащане" },
      { status: 500 },
    );
  }
}
