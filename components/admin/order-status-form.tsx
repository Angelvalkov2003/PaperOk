"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "app/admin/orders/[id]/actions";
import {
  ORDER_STATUSES,
  orderStatusLabel,
  type OrderStatus,
} from "lib/order-status";
import { toast } from "sonner";

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(
    currentStatus as OrderStatus,
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateOrderStatus(orderId, status);
      toast.success("Статусът е обновен успешно!");
      router.refresh();
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Грешка при обновяване на статуса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label
        htmlFor="status"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Промени статус на поръчката:
      </label>
      <select
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
        disabled={loading}
      >
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {orderStatusLabel(value)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || status === currentStatus}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? "Запазване..." : "Запази статус"}
      </button>
    </form>
  );
}
