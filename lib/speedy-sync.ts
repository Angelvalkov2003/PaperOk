import {
  inferOrderStatusFromTrack,
  trackSpeedyParcel,
} from "lib/speedy-shipment";
import { shouldSyncOrderStatus } from "lib/speedy-order";
import type { OrderStatus } from "lib/order-status";
import {
  getOrderById,
  getOrdersForSpeedySync,
  updateOrderFromSpeedyTrack,
} from "lib/supabase/orders";

export type SpeedySyncResult = {
  checked: number;
  synced: number;
  statusUpdates: number;
  errors: string[];
};

type SyncableOrder = {
  id: string;
  status: string;
  speedy_parcel_id?: string | null;
};

async function syncOneOrder(order: SyncableOrder): Promise<{
  synced: boolean;
  updated: boolean;
  error?: string;
}> {
  const parcelId = order.speedy_parcel_id;
  if (!parcelId || !shouldSyncOrderStatus(order.status)) {
    return { synced: false, updated: false };
  }

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

    let updated = false;
    if (nextStatus && nextStatus !== order.status) {
      updates.status = nextStatus;
      updated = true;
    }

    await updateOrderFromSpeedyTrack(order.id, updates);
    return { synced: true, updated };
  } catch (err) {
    return {
      synced: false,
      updated: false,
      error: `${order.id}: ${err instanceof Error ? err.message : "sync failed"}`,
    };
  }
}

export async function syncSpeedyOrders(options?: {
  orderId?: string;
}): Promise<SpeedySyncResult> {
  const orders: SyncableOrder[] = options?.orderId
    ? [await getOrderById(options.orderId)]
    : await getOrdersForSpeedySync();

  const result: SpeedySyncResult = {
    checked: orders.length,
    synced: 0,
    statusUpdates: 0,
    errors: [],
  };

  for (const order of orders) {
    const one = await syncOneOrder(order);
    if (one.synced) result.synced += 1;
    if (one.updated) result.statusUpdates += 1;
    if (one.error) result.errors.push(one.error);
  }

  return result;
}
