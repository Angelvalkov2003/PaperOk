export type SaleMeta = {
  price: number;
  compareAt: number;
  savings: number;
  percent: number;
};

export function getSaleMeta(
  price: number | string | null | undefined,
  compareAt?: number | string | null,
): SaleMeta | null {
  const current = typeof price === "string" ? parseFloat(price) : Number(price);
  const was =
    typeof compareAt === "string" ? parseFloat(compareAt) : Number(compareAt);

  if (!Number.isFinite(current) || !Number.isFinite(was)) return null;
  if (!(was > current) || current < 0) return null;

  const savings = was - current;
  const percent = Math.round((savings / was) * 100);
  if (percent < 1) return null;

  return {
    price: current,
    compareAt: was,
    savings,
    percent,
  };
}

export function formatDiscountPercent(percent: number): string {
  return `−${percent}%`;
}
