"use server";

import { isAdminAuthenticated } from "lib/admin-auth";
import { createShipmentForOrder } from "lib/speedy-order";
import {
  getOrderById,
  saveSpeedyShipment,
} from "lib/supabase/orders";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Неоторизиран достъп");
  }
}

export async function createSpeedyShipmentAction(orderId: string) {
  await requireAdmin();

  const order = await getOrderById(orderId);
  const result = await createShipmentForOrder(order);

  const updated = await saveSpeedyShipment(orderId, {
    speedy_shipment_id: result.shipmentId,
    speedy_parcel_id: result.parcelId,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");

  return {
    shipmentId: updated.speedy_shipment_id,
    parcelId: updated.speedy_parcel_id,
    createdAt: updated.speedy_created_at,
  };
}
