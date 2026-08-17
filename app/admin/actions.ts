"use server";

import { isAdminAuthenticated } from "lib/admin-auth";
import { deleteOrders } from "lib/supabase/orders";
import { syncSpeedyOrders, type SpeedySyncResult } from "lib/speedy-sync";
import { revalidatePath } from "next/cache";

export async function deleteOrdersAction(
  ids: string[],
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  try {
    if (!ids?.length) {
      return { success: false, error: "Няма избрани поръчки" };
    }
    const deleted = await deleteOrders(ids);
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true, deleted };
  } catch (error) {
    console.error("deleteOrdersAction:", error);
    return { success: false, error: "Грешка при изтриване на поръчки" };
  }
}

export async function syncSpeedyOrdersAction(
  orderId?: string,
): Promise<{ success: boolean; result?: SpeedySyncResult; error?: string }> {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: "Неоторизиран достъп" };
    }

    const result = await syncSpeedyOrders(
      orderId ? { orderId } : undefined,
    );
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    if (orderId) {
      revalidatePath(`/admin/orders/${orderId}`);
    }
    return { success: true, result };
  } catch (error) {
    console.error("syncSpeedyOrdersAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Грешка при обновяване от Speedy",
    };
  }
}
