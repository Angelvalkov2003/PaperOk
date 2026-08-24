/** Lower position number appears first. */
export function compareByPosition(
  a: number | string | null | undefined,
  b: number | string | null | undefined,
): number {
  return (Number(a) || 0) - (Number(b) || 0);
}
