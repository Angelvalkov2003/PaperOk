export const SITE_NAME = "PaperOK";

/** Canonical production site URL */
export const SITE_URL = "https://paperok.bg";

/** Google Analytics 4 — loaded after cookie consent */
export const GA_MEASUREMENT_ID = "G-3Q5K0W0735";

/** Transparent logo for UI on cream/colored backgrounds */
export const LOGO_TRANSPARENT = "/logo-removebg-preview.png";

/** Logo with solid background — emails, Open Graph, favicons, sharing */
export const LOGO_WITH_BACKGROUND = "/logo.jpeg";

export const LOGO_TRANSPARENT_SIZE = { width: 718, height: 347 } as const;
export const LOGO_WITH_BACKGROUND_SIZE = { width: 1192, height: 577 } as const;

export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: "RELEVANCE" | "CREATED_AT" | "PRICE";
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: "Релевантност",
  slug: null,
  sortKey: "RELEVANCE",
  reverse: false,
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: "Най-нови",
    slug: "latest-desc",
    sortKey: "CREATED_AT",
    reverse: true,
  },
  {
    title: "Цена: Ниска към висока",
    slug: "price-asc",
    sortKey: "PRICE",
    reverse: false,
  },
  {
    title: "Цена: Висока към ниска",
    slug: "price-desc",
    sortKey: "PRICE",
    reverse: true,
  },
];

/** Root shop sections in the top nav — must match collection handles in the DB. */
export const MAIN_MENU_SECTIONS = [
  { handle: "kartichki", title: "Картички" },
  { handle: "podaraci", title: "Подаръци" },
  { handle: "semenna-hartia", title: "Семенна хартия" },
] as const;

export const FIXED_MENU = [
  { title: "Начало", path: "/" },
  { title: "Картички", path: "/products?collection=kartichki" },
  { title: "Подаръци", path: "/products?collection=podaraci" },
  { title: "Семенна хартия", path: "/products?collection=semenna-hartia" },
  { title: "За бизнеса", path: "/za-biznesa" },
  { title: "Блог", path: "/blog" },
  { title: "Контакти", path: "/contact" },
] as const;

/** @deprecated Prefer FIXED_MENU category links from the brief */
export const SHOP_MENU = {
  title: "Магазин",
  path: "/products",
} as const;

export type MenuItem = { title: string; path: string };

export const SITE_TAGLINE =
  "Ръчно изработени картички, подаръци и семенна хартия, създадени в София, България.";

export const SITE_HEADLINE = "Подаръци, които разцъфват";

export const CONTACT_EMAIL = "paperok.info@gmail.com";
export const INSTAGRAM_URL = "https://www.instagram.com/paperok.official/";
export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61591837265074";
export const YOUTUBE_URL = "https://www.youtube.com/@paperok.official";
export const TIKTOK_URL = "https://www.tiktok.com/@paperok.official";
export const LINKEDIN_URL = "https://www.linkedin.com/company/paperok/";
export const CONTACT_LOCATION = "София, България";
export const SUPPORT_PHONE = "0877836667";

/** Card checkout is shown only when the publishable Stripe key is set. */
export const CARD_PAYMENTS_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
);
export const BUSINESS_TAGLINE =
  "Еко хартия със семена. С нас вашата марка ще процъфти";
export const BUSINESS_BIO =
  "Екополиграфия за осъзнати брандове — ръчна хартия със семена, eco-friendly, готови и персонални поръчки.";
