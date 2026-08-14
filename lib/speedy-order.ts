import type { OrderStatus, PaymentStatus } from "lib/order-status";
import {
  createSpeedyShipment,
  parcelWeightFromProducts,
  speedyShipmentConfigured,
  type CreateSpeedyShipmentInput,
} from "lib/speedy-shipment";

export type OrderForShipment = {
  id: string;
  status: string;
  payment_method: string;
  payment_status: PaymentStatus | string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  total_price: number;
  products: unknown;
  shipping_method?: string | null;
  shipping_site_id?: number | null;
  shipping_office_id?: number | null;
  shipping_office_name?: string | null;
  shipping_details?: Record<string, unknown> | null;
  speedy_shipment_id?: string | null;
  speedy_parcel_id?: string | null;
};

export type ShipmentEligibility = {
  canCreate: boolean;
  reason?: string;
};

export function getSpeedyShipmentEligibility(
  order: OrderForShipment,
): ShipmentEligibility {
  if (!speedyShipmentConfigured()) {
    return {
      canCreate: false,
      reason: "Speedy API не е конфигуриран (SPEEDY_USERNAME / SPEEDY_PASSWORD).",
    };
  }

  if (order.speedy_shipment_id || order.speedy_parcel_id) {
    return {
      canCreate: false,
      reason: "Товарителницата вече е създадена за тази поръчка.",
    };
  }

  if (order.status !== "processing") {
    return {
      canCreate: false,
      reason: 'Бутонът е активен само при статус „За изпълнение“.',
    };
  }

  if (order.payment_method === "card") {
    if (order.payment_status !== "paid") {
      return {
        canCreate: false,
        reason:
          "При плащане с карта товарителница може да се създаде само след потвърдено плащане.",
      };
    }
  }

  if (!order.customer_phone?.trim()) {
    return {
      canCreate: false,
      reason: "Липсва телефон на клиента.",
    };
  }

  const method = order.shipping_method;
  if (method === "office" || method === "apt") {
    if (!order.shipping_office_id) {
      return {
        canCreate: false,
        reason: "Липсва Speedy ID на избрания офис/автомат.",
      };
    }
  } else if (method === "address") {
    if (!order.shipping_site_id) {
      return {
        canCreate: false,
        reason: "Липсва Speedy ID на населеното място.",
      };
    }
    const addressLine = order.shipping_details?.addressLine;
    if (!addressLine || !String(addressLine).trim()) {
      return {
        canCreate: false,
        reason: "Липсва адрес за доставка.",
      };
    }
  } else {
    return {
      canCreate: false,
      reason: "Поръчката няма конфигурирана Speedy доставка.",
    };
  }

  return { canCreate: true };
}

function orderProducts(order: OrderForShipment) {
  return Array.isArray(order.products)
    ? (order.products as Array<{ name?: string; quantity?: number }>)
    : [];
}

function buildContents(order: OrderForShipment): string {
  const products = orderProducts(order);
  if (!products.length) return "PaperOK поръчка";
  const summary = products
    .map((p) => p.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  return summary ? `PaperOK: ${summary}`.slice(0, 100) : "PaperOK поръчка";
}

function codAmountForOrder(order: OrderForShipment): number | undefined {
  if (order.payment_method === "card") {
    return undefined;
  }
  return Number(order.total_price);
}

export function buildSpeedyShipmentInput(
  order: OrderForShipment,
): CreateSpeedyShipmentInput {
  const products = orderProducts(order);
  const method = order.shipping_method as "office" | "apt" | "address";

  return {
    recipientName: order.customer_name,
    recipientEmail: order.customer_email,
    recipientPhone: order.customer_phone!,
    shippingMethod: method,
    siteId: Number(order.shipping_site_id),
    officeId: order.shipping_office_id ?? undefined,
    addressLine: order.shipping_details?.addressLine
      ? String(order.shipping_details.addressLine)
      : undefined,
    weightKg: parcelWeightFromProducts(products),
    contents: buildContents(order),
    orderRef: order.id,
    codAmount: codAmountForOrder(order),
  };
}

export async function createShipmentForOrder(order: OrderForShipment) {
  const eligibility = getSpeedyShipmentEligibility(order);
  if (!eligibility.canCreate) {
    throw new Error(eligibility.reason || "Не може да се създаде товарителница.");
  }

  const input = buildSpeedyShipmentInput(order);
  return createSpeedyShipment(input);
}

export function shouldSyncOrderStatus(status: OrderStatus | string): boolean {
  return status === "processing" || status === "shipped";
}
