import { CartProvider } from "components/cart/cart-context";
import { ConditionalNavbar } from "components/layout/conditional-navbar";
import { CookieConsent } from "components/cookie-consent";
import { GoogleTags } from "components/google-tags";
import { ErrorPopupProvider } from "components/error-popup-provider";
import {
  LOGO_WITH_BACKGROUND,
  LOGO_WITH_BACKGROUND_SIZE,
  SITE_NAME,
  SITE_TAGLINE,
} from "lib/constants";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { baseUrl } from "lib/utils";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const GOOGLE_SITE_VERIFICATION =
  "kf2c5zNxLXngidhbvx3kxFWNst6UjwqH6ucMVeWjA_U";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${SITE_NAME} — Подаръци, които разцъфват`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  keywords: [
    "семенна хартия",
    "картички",
    "подаръци",
    "еко",
    "София",
    "България",
    "PaperOK",
  ],
  icons: {
    icon: [{ url: LOGO_WITH_BACKGROUND, type: "image/jpeg" }],
    apple: [{ url: LOGO_WITH_BACKGROUND, type: "image/jpeg" }],
    shortcut: LOGO_WITH_BACKGROUND,
  },
  robots: {
    follow: true,
    index: true,
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: SITE_NAME,
    url: baseUrl,
    title: `${SITE_NAME} — Подаръци, които разцъфват`,
    description: SITE_TAGLINE,
    images: [
      {
        url: LOGO_WITH_BACKGROUND,
        width: LOGO_WITH_BACKGROUND_SIZE.width,
        height: LOGO_WITH_BACKGROUND_SIZE.height,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Подаръци, които разцъфват`,
    description: SITE_TAGLINE,
    images: [LOGO_WITH_BACKGROUND],
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="bg" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content={GOOGLE_SITE_VERIFICATION}
        />
      </head>
      <body
        className={`${dmSans.className} bg-paper-bg text-paper-text antialiased selection:bg-paper-accent-bg selection:text-paper-heading`}
      >
        <GoogleTags />
        <CartProvider>
          <ErrorPopupProvider>
            <ConditionalNavbar />
            <main>
              {children}
              <Toaster closeButton />
            </main>
            <CookieConsent />
          </ErrorPopupProvider>
        </CartProvider>
      </body>
    </html>
  );
}
