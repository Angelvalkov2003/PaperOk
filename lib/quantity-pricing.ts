import type { PriceTier, Product, ProductSizeVariant, QuantityPricing } from "lib/types";

export type ResolvedUnitPrice = {
  unitPrice: number | null;
  onInquiry: boolean;
  tier: PriceTier | null;
};

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function createEmptyPriceTier(minQty = 1): PriceTier {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tier-${Date.now()}-${minQty}`;
  return {
    id,
    minQty,
    maxQty: null,
    price: 0,
  };
}

export function normalizePriceTiers(raw: unknown): PriceTier[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((tier, index) => {
      const row = tier && typeof tier === "object" ? (tier as Record<string, unknown>) : {};
      const minQty = Math.max(1, Math.floor(asNumber(row.minQty ?? row.min_qty, 1)));
      const maxRaw = row.maxQty ?? row.max_qty;
      const maxQty =
        maxRaw === null || maxRaw === undefined || maxRaw === ""
          ? null
          : Math.max(minQty, Math.floor(asNumber(maxRaw, minQty)));
      const priceRaw = row.price;
      const price =
        priceRaw === null || priceRaw === undefined || priceRaw === ""
          ? null
          : Math.max(0, asNumber(priceRaw, 0));
      const id =
        typeof row.id === "string" && row.id.trim()
          ? row.id
          : `tier-${index}-${minQty}`;

      return { id, minQty, maxQty, price } satisfies PriceTier;
    })
    .sort((a, b) => a.minQty - b.minQty);
}

export function normalizeQuantityPricing(
  raw: Partial<QuantityPricing> | Record<string, unknown> | null | undefined,
): QuantityPricing {
  const source =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};
  const minQuantityEnabled = Boolean(
    source.minQuantityEnabled ?? source.min_quantity_enabled,
  );
  const minQuantity = Math.max(
    1,
    Math.floor(
      asNumber(source.minQuantity ?? source.min_quantity, 1),
    ),
  );
  const priceTiersEnabled = Boolean(
    source.priceTiersEnabled ?? source.price_tiers_enabled,
  );
  const priceTiers = normalizePriceTiers(
    source.priceTiers ?? source.price_tiers,
  );

  return {
    minQuantityEnabled,
    minQuantity,
    priceTiersEnabled,
    priceTiers,
  };
}

export function emptyQuantityPricing(): QuantityPricing {
  return {
    minQuantityEnabled: false,
    minQuantity: 1,
    priceTiersEnabled: false,
    priceTiers: [],
  };
}

export function getEffectiveQuantityPricing(
  product: Pick<
    Product,
    | "minQuantityEnabled"
    | "minQuantity"
    | "priceTiersEnabled"
    | "priceTiers"
    | "variants"
  >,
  variant?: ProductSizeVariant | null,
): QuantityPricing {
  const enabledVariants = (product.variants || []).filter((v) => v.enabled);
  if (enabledVariants.length > 0) {
    if (!variant) return emptyQuantityPricing();
    return normalizeQuantityPricing(variant);
  }
  return normalizeQuantityPricing(product);
}

export function getMinOrderQuantity(pricing: QuantityPricing): number {
  if (!pricing.minQuantityEnabled) return 1;
  return Math.max(1, Math.floor(pricing.minQuantity || 1));
}

export function findPriceTierForQuantity(
  tiers: PriceTier[],
  quantity: number,
): PriceTier | null {
  const qty = Math.max(1, Math.floor(quantity));
  for (const tier of normalizePriceTiers(tiers)) {
    const withinMax = tier.maxQty == null || qty <= tier.maxQty;
    if (qty >= tier.minQty && withinMax) return tier;
  }
  return null;
}

export function resolveUnitPrice(
  basePrice: number,
  pricing: QuantityPricing,
  quantity: number,
): ResolvedUnitPrice {
  const fallback = Math.max(0, asNumber(basePrice, 0));

  if (!pricing.priceTiersEnabled || pricing.priceTiers.length === 0) {
    return { unitPrice: fallback, onInquiry: false, tier: null };
  }

  const tier = findPriceTierForQuantity(pricing.priceTiers, quantity);
  if (!tier) {
    return { unitPrice: fallback, onInquiry: false, tier: null };
  }

  if (tier.price == null) {
    return { unitPrice: null, onInquiry: true, tier };
  }

  return {
    unitPrice: Math.max(0, asNumber(tier.price, fallback)),
    onInquiry: false,
    tier,
  };
}

export function formatPriceTierLabel(tier: PriceTier): string {
  if (tier.maxQty == null) return `${tier.minQty}+ бр.`;
  if (tier.minQty === tier.maxQty) return `${tier.minQty} бр.`;
  return `${tier.minQty}–${tier.maxQty} бр.`;
}

export function getCatalogFromPrice(
  product: Pick<Product, "price" | "variants" | "priceTiersEnabled" | "priceTiers">,
): number {
  const enabledVariants = (product.variants || []).filter((v) => v.enabled);
  if (enabledVariants.length > 0) {
    const prices = enabledVariants.flatMap((variant) => {
      const pricing = normalizeQuantityPricing(variant);
      const base = Math.max(0, asNumber(variant.price, 0));
      if (!pricing.priceTiersEnabled || pricing.priceTiers.length === 0) {
        return [base];
      }
      const tierPrices = pricing.priceTiers
        .map((t) => t.price)
        .filter((p): p is number => p != null && Number.isFinite(p));
      return tierPrices.length > 0 ? tierPrices : [base];
    });
    return prices.length ? Math.min(...prices) : product.price;
  }

  const pricing = normalizeQuantityPricing(product);
  if (pricing.priceTiersEnabled && pricing.priceTiers.length > 0) {
    const tierPrices = pricing.priceTiers
      .map((t) => t.price)
      .filter((p): p is number => p != null && Number.isFinite(p));
    if (tierPrices.length > 0) return Math.min(...tierPrices);
  }
  return Math.max(0, asNumber(product.price, 0));
}

export function normalizeProductSizeVariant(
  raw: Record<string, unknown> | ProductSizeVariant,
): ProductSizeVariant {
  const pricing = normalizeQuantityPricing(raw as Record<string, unknown>);
  const idRaw = (raw as { id?: unknown }).id;
  return {
    id:
      typeof idRaw === "string" && idRaw.trim()
        ? idRaw
        : `variant-${Math.random().toString(36).slice(2, 10)}`,
    name: String((raw as { name?: unknown }).name || ""),
    price: Math.max(0, asNumber((raw as { price?: unknown }).price, 0)),
    description:
      typeof (raw as { description?: unknown }).description === "string"
        ? ((raw as { description?: string }).description as string)
        : undefined,
    enabled: Boolean((raw as { enabled?: unknown }).enabled),
    ...pricing,
  };
}
