import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent } from "lib/stripe";
import {
  fulfillPaidOrder,
  getOrderByStripeSessionId,
  markPaymentFailed,
} from "lib/supabase/orders";

function orderIdFromSession(session: {
  metadata?: { orderId?: string } | null;
  id: string;
}) {
  return session.metadata?.orderId;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  const event = constructStripeEvent(body, signature);
  if (!event) {
    return NextResponse.json(
      { error: "Webhook not configured — payments verified on success page" },
      { status: 501 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = orderIdFromSession(session);

    if (!orderId) {
      console.error("Webhook: missing orderId in session metadata");
      return NextResponse.json({ received: true });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const existingBySession = await getOrderByStripeSessionId(session.id);
    const targetOrderId = existingBySession?.id || orderId;

    try {
      await fulfillPaidOrder(targetOrderId);
    } catch (err) {
      console.error("Webhook fulfill error:", err);
    }
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    const orderId = orderIdFromSession(session);

    if (orderId) {
      try {
        await markPaymentFailed(orderId);
      } catch (err) {
        console.error("Webhook payment failed error:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
