import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_LEAD_CONVERSION_SEND_TO,
} from "lib/constants";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

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

export { GOOGLE_ADS_ID };
