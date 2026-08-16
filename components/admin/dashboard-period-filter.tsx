"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { RevenuePeriod } from "lib/admin-dashboard-stats";

const PRESETS: { value: RevenuePeriod; label: string }[] = [
  { value: "today", label: "Днес" },
  { value: "week", label: "Тази седмица" },
  { value: "month", label: "Този месец" },
  { value: "year", label: "Тази година" },
  { value: "custom", label: "Собствен период" },
];

function buildUrl(period: string, from: string, to: string) {
  const params = new URLSearchParams();
  if (period && period !== "week") params.set("period", period);
  if (period === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

export function DashboardPeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [period, setPeriod] = useState(
    (searchParams.get("period") as RevenuePeriod) || "week",
  );
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  useEffect(() => {
    setPeriod((searchParams.get("period") as RevenuePeriod) || "week");
    setFrom(searchParams.get("from") || "");
    setTo(searchParams.get("to") || "");
  }, [searchParams]);

  const apply = useCallback(
    (nextPeriod: string, nextFrom: string, nextTo: string) => {
      startTransition(() => {
        router.replace(buildUrl(nextPeriod, nextFrom, nextTo));
      });
    },
    [router],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            disabled={pending}
            onClick={() => {
              setPeriod(p.value);
              if (p.value !== "custom") {
                apply(p.value, from, to);
              } else {
                apply("custom", from, to);
              }
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
              period === p.value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
            От
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
            До
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <button
            type="button"
            disabled={pending || !from}
            onClick={() => apply("custom", from, to || from)}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Приложи
          </button>
        </div>
      )}
    </div>
  );
}
