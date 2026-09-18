import Script from "next/script";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "lib/constants";

/**
 * Loads Google tag (Ads + Analytics) on every page with Consent Mode v2.
 * Tracking stays denied until CookieConsent grants storage.
 */
export function GoogleTags() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || GA_MEASUREMENT_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || GOOGLE_ADS_ID;

  return (
    <>
      <Script id="gtag-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
          gtag('js', new Date());
          gtag('config', '${adsId}');
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
