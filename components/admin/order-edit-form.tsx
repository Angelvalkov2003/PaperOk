"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderFields } from "app/admin/orders/[id]/actions";
import {
  ORDER_STATUSES,
  orderStatusLabel,
  paymentStatusLabel,
  type OrderStatus,
} from "lib/order-status";
import { toast } from "sonner";

interface OrderEditFormProps {
  order: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    customer_address: string;
    total_price: number;
    payment_method: "cash_on_delivery" | "card" | "bank_transfer";
    payment_status?: string;
    status: string;
    comment?: string;
    created_at: string;
  };
}

export function OrderEditForm({ order }: OrderEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone || "",
    customer_address: order.customer_address,
    total_price: order.total_price.toString(),
    payment_method: order.payment_method,
    status: order.status as OrderStatus,
    comment: order.comment || "",
    created_at: formatDateForInput(order.created_at),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateOrderFields(order.id, {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || undefined,
        customer_address: formData.customer_address,
        total_price: parseFloat(formData.total_price),
        payment_method: formData.payment_method,
        status: formData.status,
        comment: formData.comment || undefined,
        created_at: new Date(formData.created_at).toISOString(),
      });
      toast.success("Поръчката е обновена успешно!");
      router.refresh();
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Грешка при обновяване на поръчката");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="customer_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Име на клиента *
        </label>
        <input
          type="text"
          id="customer_name"
          required
          value={formData.customer_name}
          onChange={(e) =>
            setFormData({ ...formData, customer_name: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="customer_email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Имейл *
        </label>
        <input
          type="email"
          id="customer_email"
          required
          value={formData.customer_email}
          onChange={(e) =>
            setFormData({ ...formData, customer_email: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="customer_phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Телефон
        </label>
        <input
          type="tel"
          id="customer_phone"
          value={formData.customer_phone}
          onChange={(e) =>
            setFormData({ ...formData, customer_phone: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="customer_address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Адрес *
        </label>
        <textarea
          id="customer_address"
          required
          rows={3}
          value={formData.customer_address}
          onChange={(e) =>
            setFormData({ ...formData, customer_address: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="total_price"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Обща сума (€) *
        </label>
        <input
          type="number"
          id="total_price"
          required
          step="0.01"
          min="0"
          value={formData.total_price}
          onChange={(e) =>
            setFormData({ ...formData, total_price: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="payment_method"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Начин на плащане *
        </label>
        <select
          id="payment_method"
          required
          value={formData.payment_method}
          onChange={(e) =>
            setFormData({
              ...formData,
              payment_method: e.target.value as
                | "cash_on_delivery"
                | "card"
                | "bank_transfer",
            })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        >
          <option value="cash_on_delivery">Наложен платеж</option>
          <option value="card">Плащане с карта</option>
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Статус на плащането
        </span>
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
          {paymentStatusLabel(order.payment_status)}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {order.payment_method === "card"
            ? "Актуализира се автоматично от Stripe."
            : "При наложен платеж клиентът плаща при получаване."}
        </p>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Статус на поръчката *
        </label>
        <select
          id="status"
          required
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as OrderStatus })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        >
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel(value)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="created_at"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Дата на поръчката *
        </label>
        <input
          type="datetime-local"
          id="created_at"
          required
          value={formData.created_at}
          onChange={(e) =>
            setFormData({ ...formData, created_at: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Коментар
        </label>
        <textarea
          id="comment"
          rows={3}
          value={formData.comment}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Запазване..." : "Запази промените"}
      </button>
    </form>
  );
}
