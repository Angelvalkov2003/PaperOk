import type { FlatCategory } from "lib/category-tree";

export type CategoryWithAvailability = FlatCategory & {
  available?: boolean;
};

/** Storefront-visible when the category and every ancestor are active. */
export function isCollectionVisibleOnStorefront(
  categories: CategoryWithAvailability[],
  handle: string,
): boolean {
  const byHandle = new Map(categories.map((c) => [c.handle, c]));
  const byId = new Map(categories.map((c) => [c.id, c]));

  let node = byHandle.get(handle);
  if (!node) return false;

  while (node) {
    if (node.available !== true) return false;
    node = node.parent_id ? byId.get(node.parent_id) : undefined;
  }

  return true;
}

export function getVisibleCategoryHandles(
  categories: CategoryWithAvailability[],
): Set<string> {
  return new Set(
    categories
      .filter((c) => isCollectionVisibleOnStorefront(categories, c.handle))
      .map((c) => c.handle),
  );
}

export function filterStorefrontCategories<T extends CategoryWithAvailability>(
  categories: T[],
): T[] {
  return categories.filter((c) =>
    isCollectionVisibleOnStorefront(categories, c.handle),
  );
}
