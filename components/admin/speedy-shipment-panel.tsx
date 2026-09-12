"use client";

import { createSpeedyShipmentAction } from "app/admin/orders/[id]/speedy-actions";
import { SyncSpeedyButton } from "components/admin/sync-speedy-button";
import type { ShipmentEligibility } from "lib/speedy-order";
import { useErrorPopup } from "components/error-popup-provider";
import { formatDateTimeBg } from "lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  orderId: string;
  eligibility: ShipmentEligibility;
  shipmentId?: string | null;
  parcelId?: string | null;
  createdAt?: string | null;
  orderStatus: string;
};

export function SpeedyShipmentPanel({
  orderId,
  eligibility,
  shipmentId,
  parcelId,
  createdAt,
  orderStatus,
}: Props) {
  const router = useRouter();
  const { showError } = useErrorPopup();
  const [pending, startTransition] = useTransition();

  const hasShipment = Boolean(parcelId || shipmentId);
  const labelUrl = `/api/admin/orders/${orderId}/speedy/label`;

  function handleCreate() {
    startTransition(async () => {
      try {
        await createSpeedyShipmentAction(orderId);
        router.refresh();
      } catch (err: unknown) {
        showError(err);
      }
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Speedy товарителница
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Създайте товарителница директно от данните на поръчката. Статусът не се
        сменя при създаване — обновете го от Speedy след приемане или доставка.
      </p>

      {hasShipment ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Номер на товарителница:
              </span>
              <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                {parcelId || shipmentId}
              </p>
            </div>
            {shipmentId && parcelId && shipmentId !== parcelId ? (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Speedy shipment ID:
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {shipmentId}
                </p>
              </div>
            ) : null}
            {createdAt ? (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Създадена на:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {formatDateTimeBg(createdAt)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Принтирай товарителница
            </a>
            <SyncSpeedyButton orderId={orderId} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orderStatus === "processing" && eligibility.canCreate ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={pending}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Създаване…" : "Създай товарителница"}
            </button>
          ) : (
            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 rounded-md px-3 py-2">
              {eligibility.reason ||
                'Бутонът е достъпен при статус „За изпълнение“ и валидни данни за доставка.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
