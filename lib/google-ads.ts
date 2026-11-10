import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_LEAD_CONVERSION_SEND_TO,
  GOOGLE_ADS_PURCHASE_CONVERSION_SEND_TO,
} from "lib/constants";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const PURCHASE_DEDUP_PREFIX = "paperok_gads_purchase:";

function ensureGtagStub() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    // Must push `arguments` (not a rest-array) for gtag.js to process the queue.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
}

/**
 * Fire Google Ads conversion for lead form submit.
 * Queues via dataLayer even if the remote gtag.js script is still loading.
 */
export function reportGoogleAdsLeadConversion() {
  if (typeof window === "undefined") return;

  ensureGtagStub();

  window.gtag!("event", "conversion", {
    send_to: GOOGLE_ADS_LEAD_CONVERSION_SEND_TO,
  });
}

/**
 * Fire Google Ads Purchase conversion once per order (deduped in sessionStorage).
 * Call only from the checkout success page after the order is accepted.
 */
export function reportGoogleAdsPurchaseConversion(params: {
  transactionId: string;
  value: number;
  currency?: string;
}) {
  if (typeof window === "undefined") return false;

  const transactionId = String(params.transactionId || "").trim();
  if (!transactionId) return false;

  const value = Number(params.value);
  if (!Number.isFinite(value) || value < 0) return false;

  const storageKey = `${PURCHASE_DEDUP_PREFIX}${transactionId}`;
  try {
    if (
      window.sessionStorage.getItem(storageKey) === "1" ||
      window.localStorage.getItem(storageKey) === "1"
    ) {
      return false;
    }
  } catch {
    // storage may be blocked — still fire once this page load
  }

  ensureGtagStub();

  window.gtag!("event", "conversion", {
    send_to: GOOGLE_ADS_PURCHASE_CONVERSION_SEND_TO,
    value,
    currency: params.currency || "EUR",
    transaction_id: transactionId,
  });

  try {
    window.sessionStorage.setItem(storageKey, "1");
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // ignore
  }

  return true;
}

export { GOOGLE_ADS_ID };
