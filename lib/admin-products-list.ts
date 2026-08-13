export const ADMIN_PRODUCTS_PAGE_SIZES = [10, 20, 50] as const;
export const ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE = 10;

export type AdminProductsPageSize =
  (typeof ADMIN_PRODUCTS_PAGE_SIZES)[number];

export function parseAdminProductsPageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value || String(ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE), 10);
  return ADMIN_PRODUCTS_PAGE_SIZES.includes(parsed as AdminProductsPageSize)
    ? parsed
    : ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE;
}
