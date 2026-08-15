import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder } from "lib/create-checkout-order";
import type { CreateOrderData } from "lib/supabase/orders";
import type { CartPriceCheckItem } from "lib/supabase/validate-cart";
import {
  checkoutError,
  envPresenceReport,
  serializeUnknownError,
} from "lib/checkout-diagnostics";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      const report = checkoutError(
        "parse_body",
        "Невалиден JSON в заявката за поръчка.",
        { details: serializeUnknownError(error) },
      );
      return NextResponse.json(report, { status: 400 });
    }

    const payload = body as {
      order?: CreateOrderData;
      cartItems?: CartPriceCheckItem[];
    };
    const data = payload?.order;
    const cartItems = payload?.cartItems || [];

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        checkoutError("parse_body", "Липсват данни за поръчката", {
          details: { bodyKeys: Object.keys((body as object) || {}) },
        }),
        { status: 400 },
      );
    }

    const result = await createCheckoutOrder(data, cartItems);

    if (!result.ok) {
      console.error("[create-order] failed", {
        step: result.step,
        error: result.error,
        hint: result.hint,
        details: result.details,
        env: envPresenceReport(),
        ms: Date.now() - startedAt,
      });

      return NextResponse.json(
        {
          ...result,
          env: envPresenceReport(),
          durationMs: Date.now() - startedAt,
        },
        { status: result.step === "unknown" ? 500 : 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      durationMs: Date.now() - startedAt,
    });
  } catch (error: unknown) {
    console.error("POST /api/checkout/create-order:", error);
    const report = checkoutError(
      "unknown",
      error instanceof Error
        ? error.message
        : "Грешка при създаване на поръчката",
      {
        details: serializeUnknownError(error),
        hint: "Неочаквана сървърна грешка — виж details и Vercel Function Logs.",
      },
    );

    return NextResponse.json(
      {
        ...report,
        env: envPresenceReport(),
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
