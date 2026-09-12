import { ReadonlyURLSearchParams } from "next/navigation";
import { SITE_URL } from "lib/constants";

/**
 * Site URL for metadata, emails, sitemap, Stripe redirects.
 * Prefers NEXT_PUBLIC_SITE_URL, then production domain; localhost only in development.
 */
export function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return SITE_URL;
}

export const baseUrl = getBaseUrl();

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const formatPrice = (price: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
  }).format(price);
};

/** Always format admin/store dates in Bulgaria local time (not server UTC). */
export const BG_TIME_ZONE = "Europe/Sofia";

export function formatDateTimeBg(
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("bg-BG", {
    timeZone: BG_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

export function formatDateBg(
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("bg-BG", {
    timeZone: BG_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/** Value for `<input type="datetime-local">` in Europe/Sofia wall clock. */
export function formatDateTimeLocalBg(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BG_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
