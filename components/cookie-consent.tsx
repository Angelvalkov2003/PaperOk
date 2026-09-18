"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_PREFERENCES_KEY = "cookie_preferences";

function applyConsent(analytics: boolean, marketing: boolean) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    // Fallback stub — GoogleTags normally defines gtag in <head>
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }

  window.gtag("consent", "update", {
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
    analytics_storage: analytics ? "granted" : "denied",
  });
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsButton, setShowSettingsButton] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent === "accepted") {
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences) as CookiePreferences;
          setPreferences(parsed);
          applyConsent(!!parsed.analytics, !!parsed.marketing);
        } catch (e) {
          console.error("Error parsing cookie preferences:", e);
        }
      }
      setShowSettingsButton(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    applyConsent(prefs.analytics, prefs.marketing);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (!showBanner && !showSettings) {
    if (showSettingsButton) {
      return (
        <button
          onClick={openSettings}
          className="fixed bottom-4 right-4 z-50 p-3 bg-paper-heading text-white rounded-full shadow-lg hover:bg-paper-green-hover transition-colors"
          aria-label="Cookie настройки"
          title="Cookie настройки"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      );
    }
    return null;
  }

  return (
    <>
      {showBanner && !showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-paper-white border-t border-paper-border shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-paper-heading mb-2">
                  Използваме бисквитки
                </h3>
                <p className="text-sm text-paper-text">
                  Използваме бисквитки, за да подобрим вашето изживяване, да
                  анализираме трафика и да персонализираме съдържанието. Като
                  натиснете &quot;Приеми всички&quot;, вие се съгласявате с
                  използването на всички бисквитки. Можете да промените
                  настройките по всяко време.{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-paper-green hover:underline"
                  >
                    Политика за поверителност
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <button
                  onClick={openSettings}
                  className="px-4 py-2 text-sm font-medium text-paper-heading bg-paper-section rounded-md hover:bg-paper-section transition-colors"
                >
                  Настройки
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm font-medium text-paper-heading bg-paper-section rounded-md hover:bg-paper-section transition-colors"
                >
                  Отхвърли всички
                </button>
                <button onClick={acceptAll} className="btn-primary-sm">
                  Приеми всички
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-paper-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-paper-heading">
                  Настройки на бисквитките
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-paper-muted hover:text-paper-text"
                  aria-label="Затвори"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <p className="text-sm text-paper-text mb-6">
                Можете да изберете кои бисквитки да приемете. Необходимите
                бисквитки са задължителни за функционирането на сайта и не могат
                да бъдат деактивирани.
              </p>

              <div className="mb-6 p-4 border border-paper-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-paper-heading">
                      Необходими бисквитки
                    </h3>
                    <p className="text-sm text-paper-text mt-1">
                      Тези бисквитки са задължителни за основното функциониране
                      на уебсайта и не могат да бъдат деактивирани.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="h-5 w-5 text-paper-green rounded border-paper-border"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 border border-paper-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-paper-heading">
                      Аналитични бисквитки
                    </h3>
                    <p className="text-sm text-paper-text mt-1">
                      Тези бисквитки ни помагат да разберем как посетителите
                      използват нашия уебсайт, като събират и докладват
                      информация анонимно. Използваме Google Analytics за тази
                      цел.
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          updatePreference("analytics", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-paper-section peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-paper-accent-bg rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-paper-white after:border-paper-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-paper-green"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 border border-paper-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-paper-heading">
                      Маркетингови бисквитки
                    </h3>
                    <p className="text-sm text-paper-text mt-1">
                      Тези бисквитки се използват за Google Ads и измерване на
                      конверсии (напр. изпратена форма за запитване), както и за
                      по-релевантни реклами.
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          updatePreference("marketing", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-paper-section peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-paper-accent-bg rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-paper-white after:border-paper-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-paper-green"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-paper-border">
                <button
                  onClick={saveCustomPreferences}
                  className="btn-primary-sm"
                >
                  Запази настройките
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
                      setShowBanner(true);
                    }
                  }}
                  className="px-6 py-2 text-sm font-medium text-paper-heading bg-paper-section rounded-md hover:bg-paper-section transition-colors"
                >
                  Отказ
                </button>
                <Link
                  href="/privacy-policy"
                  className="px-6 py-2 text-sm font-medium text-paper-heading hover:text-paper-heading transition-colors"
                >
                  Политика за поверителност
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
