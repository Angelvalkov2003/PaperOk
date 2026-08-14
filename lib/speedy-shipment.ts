import {
  SPEEDY_COUNTRY_BG,
  SPEEDY_DEFAULT_SERVICE_ID,
  estimateParcelWeight,
  isSpeedyConfigured,
} from "lib/speedy";

const SPEEDY_BASE = "https://api.speedy.bg/v1";

/** Speedy T&T codes — see API Appendix 1 */
export const SPEEDY_OP_IN_TRANSIT = new Set([
  39, // Courier Pick-up
  148, // Shipment data received
  1, // Arrival Scan
  2, // Departure Scan
  11, // Received in Office
  21, // Processed in Office
  12, // Out for Delivery
  217, // Handover to midway carrier
  176, // Export to foreign provider
  152, // Routed to another Speedy Location
  1134, // Notification sent for parcel in office/locker
]);

export const SPEEDY_OP_DELIVERED = new Set([-14]); // Delivered

export type CreateSpeedyShipmentInput = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingMethod: "office" | "apt" | "address";
  siteId: number;
  officeId?: number;
  addressLine?: string;
  weightKg: number;
  contents: string;
  orderRef: string;
  codAmount?: number;
};

export type SpeedyShipmentResult = {
  shipmentId: string;
  parcelId: string;
  pickupDate?: string;
  deliveryDeadline?: string;
};

export type SpeedyTrackOperation = {
  operationCode: number;
  dateTime?: string;
  place?: string;
  description?: string;
};

export type SpeedyTrackResult = {
  parcelId: string;
  operations: SpeedyTrackOperation[];
  lastOperation?: SpeedyTrackOperation;
};

function getCredentials() {
  const userName = process.env.SPEEDY_USERNAME?.trim();
  const password = process.env.SPEEDY_PASSWORD?.trim();
  if (!userName || !password) {
    throw new Error(
      "Speedy не е конфигуриран (липсват SPEEDY_USERNAME / SPEEDY_PASSWORD)",
    );
  }
  return { userName, password };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("359") && digits.length >= 11) {
    return `0${digits.slice(3)}`;
  }
  if (digits.startsWith("0")) return digits;
  if (digits.length === 9) return `0${digits}`;
  return phone.trim();
}

function buildSender() {
  const phone = process.env.SPEEDY_SENDER_PHONE?.trim();
  const contactName = process.env.SPEEDY_SENDER_CONTACT_NAME?.trim();
  const email = process.env.SPEEDY_SENDER_EMAIL?.trim();

  if (!phone && !contactName && !email) return undefined;

  return {
    ...(phone ? { phone1: { number: normalizePhone(phone) } } : {}),
    ...(contactName ? { contactName } : {}),
    ...(email ? { email } : {}),
  };
}

async function speedyPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const auth = getCredentials();
  const res = await fetch(`${SPEEDY_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ...auth,
      language: "BG",
      ...body,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Speedy API грешка (${res.status})`;
    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.error.message || "Speedy API грешка");
  }

  return data as T;
}

export function speedyShipmentConfigured(): boolean {
  return isSpeedyConfigured();
}

export async function createSpeedyShipment(
  input: CreateSpeedyShipmentInput,
): Promise<SpeedyShipmentResult> {
  const recipient: Record<string, unknown> = {
    privatePerson: true,
    clientName: input.recipientName.slice(0, 60),
    email: input.recipientEmail,
    phone1: { number: normalizePhone(input.recipientPhone) },
  };

  if (input.shippingMethod === "office" || input.shippingMethod === "apt") {
    if (!input.officeId) {
      throw new Error("Липсва Speedy ID на офис/автомат.");
    }
    recipient.pickupOfficeId = input.officeId;
  } else {
    recipient.address = {
      countryId: SPEEDY_COUNTRY_BG,
      siteId: input.siteId,
      addressNote: (input.addressLine || "").slice(0, 200),
    };
  }

  const service: Record<string, unknown> = {
    serviceId: SPEEDY_DEFAULT_SERVICE_ID,
    autoAdjustPickupDate: true,
  };

  if (input.codAmount != null && input.codAmount > 0) {
    service.additionalServices = {
      cod: {
        amount: Number(input.codAmount.toFixed(2)),
        processingType: "CASH",
      },
    };
  }

  const sender = buildSender();

  const data = await speedyPost<{
    id?: string;
    parcels?: Array<{ id?: string }>;
    pickupDate?: string;
    deliveryDeadline?: string;
  }>("/shipment/", {
    ...(sender ? { sender } : {}),
    recipient,
    service,
    content: {
      parcelsCount: 1,
      totalWeight: input.weightKg,
      contents: input.contents.slice(0, 100),
      package: "BOX",
    },
    payment: {
      courierServicePayer: "SENDER",
    },
    ref1: input.orderRef.slice(0, 30),
  });

  const shipmentId = data.id;
  const parcelId = data.parcels?.[0]?.id;

  if (!shipmentId || !parcelId) {
    throw new Error("Speedy не върна номер на товарителница.");
  }

  return {
    shipmentId,
    parcelId,
    pickupDate: data.pickupDate,
    deliveryDeadline: data.deliveryDeadline,
  };
}

export async function printSpeedyLabel(parcelId: string): Promise<Buffer> {
  const auth = getCredentials();
  const res = await fetch(`${SPEEDY_BASE}/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ...auth,
      language: "BG",
      format: "pdf",
      paperSize: "A6",
      parcels: [{ parcel: { id: parcelId } }],
    }),
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/pdf")) {
    return Buffer.from(await res.arrayBuffer());
  }

  const data = await res.json().catch(() => ({}));
  throw new Error(
    data?.error?.message || data?.message || "Неуспешно генериране на етикет",
  );
}

export async function trackSpeedyParcel(
  parcelId: string,
): Promise<SpeedyTrackResult> {
  const data = await speedyPost<{
    parcels?: Array<{
      parcelId?: string;
      operations?: Array<{
        operationCode: number;
        dateTime?: string;
        place?: string;
        description?: string;
      }>;
    }>;
  }>("/track", {
    parcels: [{ id: parcelId }],
    lastOperationOnly: false,
  });

  const parcel = data.parcels?.[0];
  const operations = (parcel?.operations || []).map((op) => ({
    operationCode: op.operationCode,
    dateTime: op.dateTime,
    place: op.place,
    description: op.description,
  }));

  return {
    parcelId: parcel?.parcelId || parcelId,
    operations,
    lastOperation: operations.length ? operations[operations.length - 1] : undefined,
  };
}

export function inferOrderStatusFromTrack(
  currentStatus: string,
  operations: SpeedyTrackOperation[],
): "shipped" | "delivered" | null {
  const codes = operations.map((o) => o.operationCode);

  if (codes.some((c) => SPEEDY_OP_DELIVERED.has(c))) {
    return "delivered";
  }

  if (
    currentStatus === "processing" &&
    codes.some((c) => SPEEDY_OP_IN_TRANSIT.has(c))
  ) {
    return "shipped";
  }

  return null;
}

export function parcelWeightFromProducts(
  products: Array<{ quantity?: number }>,
): number {
  const count = products.reduce(
    (sum, p) => sum + Math.max(0, Number(p.quantity) || 0),
    0,
  );
  return estimateParcelWeight(count || 1);
}
