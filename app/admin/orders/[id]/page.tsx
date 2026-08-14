import { getOrderById } from "lib/supabase/orders";
import { getProductByIdForAdmin } from "lib/supabase/admin-products";
import {
  orderStatusBadgeClass,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusBadgeClass,
  paymentStatusLabel,
} from "lib/order-status";
import { getSpeedyShipmentEligibility } from "lib/speedy-order";
import { SpeedyShipmentPanel } from "components/admin/speedy-shipment-panel";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderEditForm } from "components/admin/order-edit-form";
import Image from "next/image";

// Disable static generation for this page - always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) {
    notFound();
  }
  
  let order;
  try {
    order = await getOrderById(id);
    
    if (!order) {
      notFound();
    }
  } catch (error: any) {
    console.error("Error fetching order:", error);
    // If it's a not found error, show 404
    if (error?.code === "PGRST116" || error?.message?.includes("not found")) {
      notFound();
    }
    // For other errors, also show 404 but log the error
    notFound();
  }

  const products = Array.isArray(order.products) ? order.products : [];
  const shipmentEligibility = getSpeedyShipmentEligibility(order);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
        >
          ← Назад към поръчките
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Поръчка #{order.id.substring(0, 8)}
        </h1>
        <div className="mt-2 space-y-1">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Направена на:</span>{" "}
            {new Date(order.created_at).toLocaleDateString("bg-BG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {order.updated_at && order.updated_at !== order.created_at && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Промяна по поръчката от админ на:</span>{" "}
              {new Date(order.updated_at).toLocaleDateString("bg-BG", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Edit Order Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Редактиране на поръчката
        </h2>
        <OrderEditForm order={order} />
      </div>

      <SpeedyShipmentPanel
        orderId={order.id}
        eligibility={shipmentEligibility}
        shipmentId={order.speedy_shipment_id}
        parcelId={order.speedy_parcel_id}
        createdAt={order.speedy_created_at}
        orderStatus={order.status}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer Information (Read-only view) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Информация за клиента
          </h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Име:
              </span>
              <p className="text-gray-900 dark:text-white">{order.customer_name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Имейл:
              </span>
              <p className="text-gray-900 dark:text-white">
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                >
                  {order.customer_email}
                </a>
              </p>
            </div>
            {order.customer_phone && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Телефон:
                </span>
                <p className="text-gray-900 dark:text-white">
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                  >
                    {order.customer_phone}
                  </a>
                </p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Адрес / доставка:
              </span>
              <p className="text-gray-900 dark:text-white whitespace-pre-line">
                {order.customer_address}
              </p>
              {order.shipping_method ? (
                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    Speedy:{" "}
                    {order.shipping_method === "office"
                      ? "до офис"
                      : order.shipping_method === "apt"
                        ? "до автомат"
                        : "до адрес"}
                  </p>
                  {order.shipping_site_name ? (
                    <p>Населено място: {order.shipping_site_name}</p>
                  ) : null}
                  {order.shipping_office_name ? (
                    <p>Офис/автомат: {order.shipping_office_name}</p>
                  ) : null}
                  {order.shipping_office_id ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Speedy ID: {order.shipping_office_id}
                    </p>
                  ) : null}
                  {order.shipping_details?.addressLine ? (
                    <p>Адрес: {String(order.shipping_details.addressLine)}</p>
                  ) : null}
                  {order.shipping_deadline ? (
                    <p>
                      Ориентировъчен срок:{" "}
                      {new Date(order.shipping_deadline).toLocaleString("bg-BG")}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Начин на плащане:
              </span>
              <p className="text-gray-900 dark:text-white">
                {paymentMethodLabel(order.payment_method)}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Статус на плащането:
              </span>
              <p className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusBadgeClass(order.payment_status)}`}
                >
                  {paymentStatusLabel(order.payment_status)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Резюме на поръчката
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Статус на поръчката:
              </span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${orderStatusBadgeClass(order.status)}`}
              >
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Брой артикули:
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {products.reduce(
                  (sum: number, p: any) => sum + (p.quantity || 0),
                  0
                )}
              </span>
            </div>
            {order.products_subtotal != null ? (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Продукти:</span>
                <span className="text-gray-900 dark:text-white">
                  €{Number(order.products_subtotal).toFixed(2)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Доставка:</span>
              <span className="text-gray-900 dark:text-white">
                €{Number(order.shipping_price || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white">Обща сума:</span>
              <span className="text-gray-900 dark:text-white">
                €{Number(order.total_price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Продукти
        </h2>
        <div className="space-y-4">
          {await Promise.all(
            products.map(async (product: any, index: number) => {
              // Try to get product details to show image
              let productDetails = null;
              try {
                productDetails = await getProductByIdForAdmin(product.id);
              } catch (error) {
                // Product might not exist anymore, use order snapshot
              }

              const productImage =
                productDetails?.featured_image?.url ||
                productDetails?.featured_image ||
                null;

              return (
                <div
                  key={index}
                  className="flex gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  {productImage && (
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <Image
                        src={typeof productImage === "string" ? productImage : productImage.url || ""}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Количество: {product.quantity} × €{product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      €{(product.price * product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Comment */}
      {order.comment && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Коментар от клиента
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {order.comment}
          </p>
        </div>
      )}
    </div>
  );
}
