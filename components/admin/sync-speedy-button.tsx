"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { syncSpeedyOrdersAction } from "app/admin/actions";

export function SyncSpeedyButton({
  orderId,
  prominent = false,
}: {
  orderId?: string;
  prominent?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await syncSpeedyOrdersAction(orderId);
      if (!result.success) {
        toast.error(result.error || "Грешка при обновяване от Speedy");
        return;
      }

      const data = result.result;
      if (!data) {
        toast.error("Няма резултат от Speedy");
        return;
      }

      if (data.checked === 0) {
        toast.message(
          orderId
            ? "Тази поръчка няма активна Speedy товарителница за проследяване."
            : "Няма поръчки със Speedy товарителница за обновяване.",
        );
      } else if (data.statusUpdates > 0) {
        toast.success(
          `Обновени статуси: ${data.statusUpdates} от ${data.synced} проверени.`,
        );
      } else {
        toast.success(
          `Проверени ${data.synced} поръчк${data.synced === 1 ? "а" : "и"}. Няма нова промяна в статуса.`,
        );
      }

      if (data.errors.length > 0) {
        toast.error(data.errors.slice(0, 3).join("\n"));
      }

      router.refresh();
    } catch {
      toast.error("Грешка при обновяване от Speedy");
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "Обновяване…"
    : orderId
      ? "Обнови статус от Speedy"
      : "Обнови от Speedy";

  if (prominent) {
    return (
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
    >
      {label}
    </button>
  );
}
