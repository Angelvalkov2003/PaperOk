"use server";

import { deleteOrders } from "lib/supabase/orders";
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
