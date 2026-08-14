import {
  inferOrderStatusFromTrack,
  trackSpeedyParcel,
} from "lib/speedy-shipment";
import { shouldSyncOrderStatus } from "lib/speedy-order";
import {
  getOrdersForSpeedySync,
  updateOrderFromSpeedyTrack,
} from "lib/supabase/orders";
import type { OrderStatus } from "lib/order-status";
import { NextRequest, NextResponse } from "next/server";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await getOrdersForSpeedySync();
    let synced = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const order of orders) {
      const parcelId = order.speedy_parcel_id;
      if (!parcelId || !shouldSyncOrderStatus(order.status)) continue;

      try {
        const track = await trackSpeedyParcel(parcelId);
        const nextStatus = inferOrderStatusFromTrack(
          order.status,
          track.operations,
        );

        const updates: {
          status?: OrderStatus;
          speedy_last_synced_at: string;
        } = {
          speedy_last_synced_at: new Date().toISOString(),
        };

        if (nextStatus && nextStatus !== order.status) {
          updates.status = nextStatus;
          updated += 1;
        }

        await updateOrderFromSpeedyTrack(order.id, updates);
        synced += 1;
      } catch (err) {
        errors.push(
          `${order.id}: ${err instanceof Error ? err.message : "sync failed"}`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      checked: orders.length,
      synced,
      statusUpdates: updated,
      errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
