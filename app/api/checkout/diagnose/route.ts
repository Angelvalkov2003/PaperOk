import { NextResponse } from "next/server";
import { createServiceClient } from "lib/supabase/service";
import { isSpeedyConfigured, findSites, calculateShipping } from "lib/speedy";
import { isStripeEnabled, isStripePublicEnabled } from "lib/stripe";
import { envPresenceReport } from "lib/checkout-diagnostics";

/**
 * GET /api/checkout/diagnose
 * Safe diagnostics for Vercel — no secrets, only presence + connectivity checks.
 */
export async function GET() {
  const report: Record<string, unknown> = {
    ok: true,
    at: new Date().toISOString(),
    env: envPresenceReport(),
    checks: {} as Record<string, unknown>,
  };

  const checks = report.checks as Record<string, unknown>;

  // Supabase
  try {
    const supabase = createServiceClient();
    const { error: pingError } = await supabase
      .from("orders")
      .select("id")
      .limit(1);

    checks.supabase = {
      ok: !pingError,
      error: pingError
        ? { message: pingError.message, code: pingError.code, details: pingError.details }
        : null,
    };

    // Probe columns used by new checkout
    const probe = await supabase.from("orders").insert({
      customer_name: "__diagnose_probe__",
      customer_email: "diagnose@paperok.local",
      customer_address: "diagnose",
      products: [],
      total_price: 0,
      payment_method: "cash_on_delivery",
      payment_status: "cash_on_delivery",
      status: "new",
      comment: "diagnose-probe-do-not-keep",
    }).select("id, payment_status, status").single();

    if (probe.data?.id) {
      await supabase.from("orders").delete().eq("id", probe.data.id);
      checks.ordersSchema = {
        ok: true,
        payment_status: probe.data.payment_status,
        status: probe.data.status,
        hint: "payment_status колоната съществува и insert работи.",
      };
    } else {
      checks.ordersSchema = {
        ok: false,
        error: probe.error
          ? {
              message: probe.error.message,
              code: probe.error.code,
              details: probe.error.details,
              hint: probe.error.message?.includes("payment_status")
                ? "Изпълнете next_migration.sql в Supabase."
                : "Вижте съобщението — вероятно липсва колона или constraint.",
            }
          : { message: "Probe insert failed without error object" },
      };
      report.ok = false;
    }
  } catch (error) {
    checks.supabase = {
      ok: false,
      error:
        error instanceof Error
          ? { message: error.message, name: error.name }
          : String(error),
    };
    report.ok = false;
  }

  // Speedy
  checks.speedy = {
    configured: isSpeedyConfigured(),
  };
  if (isSpeedyConfigured()) {
    try {
      const sites = await findSites("София");
      checks.speedy = {
        ...(checks.speedy as object),
        findSitesOk: true,
        sitesFound: sites.length,
      };
      if (sites[0]?.id) {
        const calc = await calculateShipping({
          siteId: sites[0].id,
          weightKg: 0.5,
        });
        checks.speedy = {
          ...(checks.speedy as object),
          calculateOk: true,
          samplePrice: calc.priceTotal,
          serviceId: calc.serviceId,
        };
      }
    } catch (error) {
      checks.speedy = {
        ...(checks.speedy as object),
        findSitesOk: false,
        error:
          error instanceof Error
            ? { message: error.message }
            : String(error),
      };
      report.ok = false;
    }
  } else {
    report.ok = false;
  }

  // Stripe
  checks.stripe = {
    secretConfigured: isStripeEnabled(),
    publishableConfigured: isStripePublicEnabled(),
  };

  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
