"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  orderStatusLabel,
  paymentStatusLabel,
} from "lib/order-status";

const SORT_OPTIONS = [
  { value: "date_desc", label: "Дата — най-новите" },
  { value: "date_asc", label: "Дата — най-старите" },
  { value: "payment_status_asc", label: "Статус плащане (А→Я)" },
  { value: "payment_status_desc", label: "Статус плащане (Я→А)" },
  { value: "status_asc", label: "Статус поръчка (по етап ↑)" },
  { value: "status_desc", label: "Статус поръчка (по етап ↓)" },
] as const;

function buildUrl(values: {
  paymentStatus: string;
  status: string;
  from: string;
  to: string;
  sort: string;
}) {
  const params = new URLSearchParams();
  if (values.paymentStatus) params.set("paymentStatus", values.paymentStatus);
  if (values.status) params.set("status", values.status);
  if (values.from) params.set("from", values.from);
  if (values.to) params.set("to", values.to);
  if (values.sort && values.sort !== "date_desc") params.set("sort", values.sort);
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

export function OrdersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [paymentStatus, setPaymentStatus] = useState(
    searchParams.get("paymentStatus") || "",
  );
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "date_desc");

  useEffect(() => {
    setPaymentStatus(searchParams.get("paymentStatus") || "");
    setStatus(searchParams.get("status") || "");
    setFrom(searchParams.get("from") || "");
    setTo(searchParams.get("to") || "");
    setSort(searchParams.get("sort") || "date_desc");
  }, [searchParams]);

  const apply = useCallback(
    (next: {
      paymentStatus: string;
      status: string;
      from: string;
      to: string;
      sort: string;
    }) => {
      startTransition(() => {
        router.replace(buildUrl(next));
      });
    },
    [router],
  );

  const hasFilters =
    Boolean(paymentStatus) ||
    Boolean(status) ||
    Boolean(from) ||
    Boolean(to) ||
    (sort !== "date_desc" && Boolean(sort));

  function clearAll() {
    setPaymentStatus("");
    setStatus("");
    setFrom("");
    setTo("");
    setSort("date_desc");
    startTransition(() => {
      router.replace("/admin/orders");
    });
  }

  const fieldClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white";

  return (
    <div
      className={`mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Филтри и сортиране
        </h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
          >
            Изчисти всички
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label
            htmlFor="orders-payment-status"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Статус на плащането
          </label>
          <select
            id="orders-payment-status"
            value={paymentStatus}
            onChange={(e) => {
              const value = e.target.value;
              setPaymentStatus(value);
              apply({ paymentStatus: value, status, from, to, sort });
            }}
            className={fieldClass}
          >
            <option value="">Всички</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {paymentStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="orders-status"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Статус на поръчката
          </label>
          <select
            id="orders-status"
            value={status}
            onChange={(e) => {
              const value = e.target.value;
              setStatus(value);
              apply({ paymentStatus, status: value, from, to, sort });
            }}
            className={fieldClass}
          >
            <option value="">Всички</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="orders-from"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            От дата
          </label>
          <input
            id="orders-from"
            type="date"
            value={from}
            onChange={(e) => {
              const value = e.target.value;
              setFrom(value);
              apply({ paymentStatus, status, from: value, to, sort });
            }}
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="orders-to"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            До дата
          </label>
          <input
            id="orders-to"
            type="date"
            value={to}
            onChange={(e) => {
              const value = e.target.value;
              setTo(value);
              apply({ paymentStatus, status, from, to: value, sort });
            }}
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-2 xl:col-span-2">
          <label
            htmlFor="orders-sort"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Сортиране
          </label>
          <select
            id="orders-sort"
            value={sort}
            onChange={(e) => {
              const value = e.target.value;
              setSort(value);
              apply({ paymentStatus, status, from, to, sort: value });
            }}
            className={fieldClass}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
