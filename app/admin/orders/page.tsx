import { getOrdersFiltered } from "lib/supabase/orders";
import {
  orderStatusBadgeClass,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusBadgeClass,
  paymentStatusLabel,
} from "lib/order-status";
import { OrdersFilter } from "components/admin/orders-filter";
import { SyncSpeedyButton } from "components/admin/sync-speedy-button";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    paymentStatus?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const orders = await getOrdersFiltered({
    paymentStatus: params.paymentStatus,
    status: params.status,
    from: params.from,
    to: params.to,
    sort: params.sort,
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Поръчки
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Управление на всички поръчки
          </p>
        </div>
        <SyncSpeedyButton prominent />
      </div>

      <Suspense fallback={null}>
        <OrdersFilter />
      </Suspense>

      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Показани: <span className="font-medium text-gray-800 dark:text-gray-200">{orders.length}</span>
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Продукти
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Обща Сума
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Плащане
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус плащане
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус поръчка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Няма поръчки за избраните филтри
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const products = Array.isArray(order.products)
                    ? order.products
                    : [];
                  const totalItems = products.reduce(
                    (sum: number, p: any) => sum + (p.quantity || 0),
                    0,
                  );

                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {order.customer_email}
                          </div>
                          {order.customer_phone && (
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {order.customer_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{totalItems} артикула</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {products.length} различни продукта
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        €{Number(order.total_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {paymentMethodLabel(order.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusBadgeClass(order.payment_status)}`}
                        >
                          {paymentStatusLabel(order.payment_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${orderStatusBadgeClass(order.status)}`}
                        >
                          {orderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("bg-BG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Виж детайли
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
