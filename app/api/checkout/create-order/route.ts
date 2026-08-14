import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder } from "lib/create-checkout-order";
import type { CreateOrderData } from "lib/supabase/orders";
import type { CartPriceCheckItem } from "lib/supabase/validate-cart";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body?.order as CreateOrderData | undefined;
    const cartItems = (body?.cartItems || []) as CartPriceCheckItem[];

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Липсват данни за поръчката" },
        { status: 400 },
      );
    }

    const result = await createCheckoutOrder(data, cartItems);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ id: result.id });
  } catch (error: unknown) {
    console.error("POST /api/checkout/create-order:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Грешка при създаване на поръчката";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
