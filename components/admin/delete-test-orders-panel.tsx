"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteOrdersAction } from "app/admin/actions";
import { looksLikeTestOrder } from "lib/admin-dashboard-stats";
import {
  paymentMethodLabel,
  paymentStatusLabel,
} from "lib/order-status";

type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  comment?: string | null;
  total_price: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
};

export function DeleteTestOrdersPanel({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const suggested = useMemo(
    () => orders.filter((o) => looksLikeTestOrder(o)),
    [orders],
  );

  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() =>
    new Set(suggested.map((o) => o.id)),
  );
  const [loading, setLoading] = useState(false);

  const list = showAll ? orders : suggested;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    const ids = list.map((o) => o.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) {
      toast.error("Изберете поне една поръчка");
      return;
    }
    if (
      !confirm(
        `Сигурен ли си, че искаш да изтриеш ${ids.length} поръчк${ids.length === 1 ? "а" : "и"}? Това не може да се отмени.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteOrdersAction(ids);
      if (result.success) {
        toast.success(
          `Изтрити ${result.deleted ?? ids.length} поръчк${(result.deleted ?? ids.length) === 1 ? "а" : "и"}`,
        );
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error(result.error || "Грешка при изтриване");
      }
    } catch {
      toast.error("Грешка при изтриване");
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0) return null;

  return (
    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Изчистване на тестови поръчки
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Изтритите поръчки вече няма да влизат в статистиката. Предложените са
          маркирани автоматично (test, примерни имейли и др.).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className={`text-sm font-medium ${
            !showAll
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Предложени ({suggested.length})
        </button>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className={`text-sm font-medium ${
            showAll
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Всички ({orders.length})
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleAllVisible}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            {list.length > 0 && list.every((o) => selected.has(o.id))
              ? "Премахни избора"
              : "Избери видимите"}
          </button>
          <button
            type="button"
            disabled={loading || selected.size === 0}
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Изтриване..."
              : `Изтрий избраните (${selected.size})`}
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="px-6 py-8 text-sm text-gray-500 dark:text-gray-400">
          {showAll
            ? "Няма поръчки."
            : "Няма автоматично разпознати тестови поръчки. Отворете „Всички“ и изберете ръчно."}
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="w-10 px-4 py-2" />
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Клиент
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Сума
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Плащане
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {list.map((order) => {
                const suggestedRow = looksLikeTestOrder(order);
                return (
                  <tr
                    key={order.id}
                    className={
                      selected.has(order.id)
                        ? "bg-red-50/50 dark:bg-red-950/20"
                        : undefined
                    }
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggle(order.id)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Избери поръчка ${order.id.slice(0, 8)}`}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{order.customer_name}</span>
                      {suggestedRow && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          тест?
                        </span>
                      )}
                      <br />
                      <span className="text-xs text-gray-500">
                        {order.customer_email}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      €{Number(order.total_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                      {paymentMethodLabel(order.payment_method)}
                      <br />
                      {paymentStatusLabel(order.payment_status)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleString("bg-BG")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
