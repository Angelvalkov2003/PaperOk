import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_LEAD_CONVERSION_SEND_TO,
} from "lib/constants";

/**
 * Fire Google Ads conversion for lead form submit.
 * Safe no-op if gtag is not loaded (e.g. marketing cookies declined).
 */
export function reportGoogleAdsLeadConversion() {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_LEAD_CONVERSION_SEND_TO,
  });
}

export { GOOGLE_ADS_ID };
