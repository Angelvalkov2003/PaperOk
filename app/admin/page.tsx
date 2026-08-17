import { Suspense } from "react";
import { getAllOrders, isPaidRevenueOrder } from "lib/supabase/orders";
import { getAllContactInquiries } from "lib/supabase/admin-contact-inquiries";
import {
  orderInPeriod,
  resolveRevenuePeriod,
} from "lib/admin-dashboard-stats";
import { DashboardPeriodFilter } from "components/admin/dashboard-period-filter";
import { DeleteTestOrdersPanel } from "components/admin/delete-test-orders-panel";
import { SyncSpeedyButton } from "components/admin/sync-speedy-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRevenuePeriod(params);

  const [orders, inquiries] = await Promise.all([
    getAllOrders(),
    getAllContactInquiries().catch(() => []),
  ]);

  const paidInPeriod = orders.filter(
    (o) => orderInPeriod(o.created_at, range) && isPaidRevenueOrder(o),
  );

  const revenue = paidInPeriod.reduce(
    (sum, o) => sum + Number(o.total_price),
    0,
  );
  const paidCount = paidInPeriod.length;
  const averageOrderValue = paidCount > 0 ? revenue / paidCount : 0;

  const stats = {
    totalOrders: orders.length,
    newOrders: orders.filter((o) => o.status === "new").length,
    newInquiries: inquiries.filter((i) => i.status === "new").length,
    revenue,
    paidCount,
    averageOrderValue,
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Административен панел
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Преглед на поръчките, запитванията и приходите
          </p>
        </div>
        <SyncSpeedyButton prominent />
      </div>

      {/* Main KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Общо поръчки
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalOrders}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Нови поръчки
          </h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.newOrders}
          </p>
        </div>
        <Link
          href="/admin/inquiries"
          className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Нови запитвания
          </h3>
          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats.newInquiries}
          </p>
        </Link>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Приходи
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            €{stats.revenue.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {range.label} · само платени
          </p>
        </div>
      </div>

      {/* Period + paid extras */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Приходи за периода
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Карта с статус „платено“ и наложен платеж при доставена поръчка
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-9 w-64 animate-pulse rounded-md bg-gray-100 dark:bg-gray-700" />
            }
          >
            <DashboardPeriodFilter />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Приходи</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              €{stats.revenue.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Платени поръчки
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {stats.paidCount}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Средна стойност на поръчка
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              €{stats.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <DeleteTestOrdersPanel
        orders={orders.map((o) => ({
          id: o.id,
          customer_name: o.customer_name,
          customer_email: o.customer_email,
          comment: o.comment ?? null,
          total_price: Number(o.total_price),
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          created_at: o.created_at,
        }))}
      />

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Управление на поръчки:{" "}
        <Link
          href="/admin/orders"
          className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          Поръчки →
        </Link>
      </p>
    </div>
  );
}
