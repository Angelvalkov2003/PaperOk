import { MAIN_MENU_SECTIONS } from "lib/constants";
import { compareByPosition } from "lib/sort-position";

export type CategoryNode = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  position: number;
  parent_id: string | null;
  available?: boolean;
  children: CategoryNode[];
};

export type FlatCategory = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  position: number;
  parent_id: string | null;
  available?: boolean;
};

const MAIN_HANDLES = new Set(
  MAIN_MENU_SECTIONS.map((s) => s.handle as string),
);

export function buildCategoryTree(categories: FlatCategory[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort(
      (a, b) =>
        compareByPosition(a.position, b.position) ||
        a.title.localeCompare(b.title, "bg"),
    );
    nodes.forEach((n) => sortNodes(n.children));
  };

  sortNodes(roots);
  return roots;
}

/** Flatten tree for select dropdown with indentation */
export function flattenCategoryTree(
  nodes: CategoryNode[],
  depth = 0,
): Array<{ id: string; handle: string; title: string; depth: number }> {
  const result: Array<{
    id: string;
    handle: string;
    title: string;
    depth: number;
  }> = [];
  for (const node of nodes) {
    result.push({
      id: node.id,
      handle: node.handle,
      title: node.title,
      depth,
    });
    result.push(...flattenCategoryTree(node.children, depth + 1));
  }
  return result;
}

/** Get breadcrumb path from root to the category with given handle */
export function getBreadcrumbPath(
  categories: FlatCategory[],
  handle: string,
): FlatCategory[] {
  const map = new Map(categories.map((c) => [c.id, c]));
  const current = categories.find((c) => c.handle === handle);
  if (!current) return [];

  const path: FlatCategory[] = [];
  let node: FlatCategory | undefined = current;
  while (node) {
    path.unshift(node);
    node = node.parent_id ? map.get(node.parent_id) : undefined;
  }
  return path;
}

export function getDescendantHandles(node: CategoryNode): string[] {
  const handles = [node.handle];
  for (const child of node.children) {
    handles.push(...getDescendantHandles(child));
  }
  return handles;
}

export function findCategoryNode(
  nodes: CategoryNode[],
  handle: string,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.handle === handle) return node;
    const found = findCategoryNode(node.children, handle);
    if (found) return found;
  }
  return null;
}

/** Walk up parent_id to the root category (main menu section). */
export function getRootOfCategory(
  categories: FlatCategory[],
  categoryId: string,
): FlatCategory | null {
  const map = new Map(categories.map((c) => [c.id, c]));
  let node = map.get(categoryId);
  if (!node) return null;
  while (node.parent_id && map.has(node.parent_id)) {
    node = map.get(node.parent_id)!;
  }
  return node;
}

/** The 3 storefront roots only (Картички / Подаръци / Семенна хартия). */
export function getMainMenuRoots(categories: FlatCategory[]): FlatCategory[] {
  return MAIN_MENU_SECTIONS.map((section) =>
    categories.find((c) => c.handle === section.handle && !c.parent_id),
  ).filter((c): c is FlatCategory => Boolean(c));
}

/** True if categoryId sits under (or is) one of the 3 main menu roots. */
export function isUnderMainMenu(
  categories: FlatCategory[],
  categoryId: string,
): boolean {
  const root = getRootOfCategory(categories, categoryId);
  return Boolean(root && MAIN_HANDLES.has(root.handle));
}

/**
 * Product category options grouped under the 3 main sections.
 * Orphan categories (outside the 3 roots) are excluded.
 */
export function getProductCategoryGroups(categories: FlatCategory[]) {
  const tree = buildCategoryTree(categories);
  return MAIN_MENU_SECTIONS.flatMap((section) => {
    const root = findCategoryNode(tree, section.handle);
    if (!root || root.parent_id) return [];

    const options: Array<{
      id: string;
      handle: string;
      title: string;
      depth: number;
    }> = [{ id: root.id, handle: root.handle, title: root.title, depth: 0 }];

    const walk = (nodes: typeof root.children, depth: number) => {
      for (const node of nodes) {
        options.push({
          id: node.id,
          handle: node.handle,
          title: node.title,
          depth,
        });
        walk(node.children, depth + 1);
      }
    };
    walk(root.children, 1);

    return [{ handle: section.handle, title: section.title, options }];
  });
}

/**
 * Handles to filter products by when visiting a collection URL:
 * the category itself plus all descendants (so "Подаръци" includes leaf products).
 */
export function getHandlesForCollectionFilter(
  categories: FlatCategory[],
  handle: string,
): string[] {
  const node = findCategoryNode(buildCategoryTree(categories), handle);
  if (!node) return [handle];
  return getDescendantHandles(node);
}

/**
 * Keep only categories that have available products on themselves
 * or anywhere in their descendant subtree. Empty leaf/branch categories
 * are removed from the customer-facing tree.
 */
export function filterCategoriesWithProducts(
  categories: FlatCategory[],
  handlesWithProducts: Set<string>,
): FlatCategory[] {
  if (handlesWithProducts.size === 0) return [];

  const tree = buildCategoryTree(categories);

  function nodeHasProducts(node: CategoryNode): boolean {
    if (handlesWithProducts.has(node.handle)) return true;
    return node.children.some(nodeHasProducts);
  }

  function collectVisible(nodes: CategoryNode[]): FlatCategory[] {
    const result: FlatCategory[] = [];
    for (const node of nodes) {
      if (!nodeHasProducts(node)) continue;
      const visibleChildren = collectVisible(node.children);
      result.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description,
        position: node.position,
        parent_id: node.parent_id,
      });
      result.push(...visibleChildren);
    }
    return result;
  }

  return collectVisible(tree);
}
