const SPEEDY_BASE = "https://api.speedy.bg/v1";
export const SPEEDY_COUNTRY_BG = 100;
/** Speedy Standard — commonly available for BG domestic */
export const SPEEDY_DEFAULT_SERVICE_ID = 505;

export type SpeedyOfficeType = "OFFICE" | "APT";

export type SpeedySite = {
  id: number;
  type?: string;
  name: string;
  nameEn?: string;
  municipality?: string;
  region?: string;
  postCode?: string;
};

export type SpeedyOffice = {
  id: number;
  name: string;
  nameEn?: string;
  type: SpeedyOfficeType;
  siteId?: number;
  address?: {
    fullAddressString?: string;
    localAddressString?: string;
  };
};

export type SpeedyCalcResult = {
  serviceId: number;
  priceTotal: number;
  currency: string;
  pickupDate?: string;
  deliveryDeadline?: string;
};

function getCredentials() {
  const userName = process.env.SPEEDY_USERNAME?.trim();
  const password = process.env.SPEEDY_PASSWORD?.trim();
  if (!userName || !password) {
    throw new Error("Speedy не е конфигуриран (липсват SPEEDY_USERNAME / SPEEDY_PASSWORD)");
  }
  return { userName, password };
}

export function isSpeedyConfigured(): boolean {
  return Boolean(
    process.env.SPEEDY_USERNAME?.trim() && process.env.SPEEDY_PASSWORD?.trim(),
  );
}

function formatSpeedyError(data: any, status?: number): string {
  const err = data?.error;
  if (err && typeof err === "object") {
    const parts = [err.message, err.context]
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .map((p) => p.trim());
    if (err.code != null) parts.push(`код ${err.code}`);
    if (parts.length) return parts.join(" — ");
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  return status ? `Speedy API грешка (${status})` : "Speedy API грешка";
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
    console.error("Speedy API error", {
      path,
      status: res.status,
      error: data?.error ?? data,
    });
    throw new Error(formatSpeedyError(data, res.status));
  }

  if (data?.error) {
    console.error("Speedy API error body", { path, error: data.error });
    throw new Error(formatSpeedyError(data));
  }

  return data as T;
}

export function formatSiteLabel(site: SpeedySite): string {
  const type = site.type ? `${site.type} ` : "";
  const name = site.name || site.nameEn || String(site.id);
  const pc = site.postCode ? ` (${site.postCode})` : "";
  return `${type}${name}${pc}`.trim();
}

export function formatOfficeLabel(office: SpeedyOffice): string {
  const name = office.name || office.nameEn || `Офис ${office.id}`;
  const addr =
    office.address?.localAddressString || office.address?.fullAddressString;
  return addr ? `${name} — ${addr}` : name;
}

/** Rough parcel weight from cart item count (kg). */
export function estimateParcelWeight(itemCount: number): number {
  const weight = 0.3 + Math.max(1, itemCount) * 0.15;
  return Math.min(Math.max(weight, 0.5), 20);
}

export async function findSites(name: string): Promise<SpeedySite[]> {
  const q = name.trim();
  if (q.length < 2) return [];

  const data = await speedyPost<{ sites?: SpeedySite[] }>("/location/site/", {
    countryId: SPEEDY_COUNTRY_BG,
    name: q,
  });

  return (data.sites || []).slice(0, 30);
}

export async function findOffices(
  siteId: number,
  officeType?: SpeedyOfficeType,
): Promise<SpeedyOffice[]> {
  // Speedy currently returns HTTP 400 when officeType is sent on
  // /location/office — fetch all for the site and filter locally.
  const data = await speedyPost<{ offices?: SpeedyOffice[] }>(
    "/location/office/",
    { siteId },
  );

  let offices = data.offices || [];
  if (officeType) {
    offices = offices.filter((o) => o.type === officeType);
  }
  return offices;
}

export async function calculateShipping(params: {
  siteId: number;
  officeId?: number;
  weightKg: number;
  serviceId?: number;
}): Promise<SpeedyCalcResult> {
  const recipient = params.officeId
    ? { privatePerson: true, pickupOfficeId: params.officeId }
    : {
        privatePerson: true,
        addressLocation: { siteId: params.siteId },
      };

  const data = await speedyPost<{
    calculations?: Array<{
      error?: { message?: string };
      serviceId: number;
      price?: { total?: number; currency?: string };
      pickupDate?: string;
      deliveryDeadline?: string;
    }>;
  }>("/calculate/", {
    recipient,
    service: {
      autoAdjustPickupDate: true,
      serviceIds: [params.serviceId || SPEEDY_DEFAULT_SERVICE_ID],
    },
    content: {
      parcelsCount: 1,
      totalWeight: params.weightKg,
    },
    // Shop pays Speedy; customer pays shipping as part of order total
    payment: {
      courierServicePayer: "SENDER",
    },
  });

  const calc = (data.calculations || []).find((c) => !c.error && c.price?.total != null);
  if (!calc || calc.price?.total == null) {
    const err = data.calculations?.[0]?.error?.message;
    throw new Error(err || "Неуспешно изчисление на доставка");
  }

  return {
    serviceId: calc.serviceId,
    priceTotal: Number(calc.price.total),
    currency: calc.price.currency || "EUR",
    pickupDate: calc.pickupDate,
    deliveryDeadline: calc.deliveryDeadline,
  };
}
