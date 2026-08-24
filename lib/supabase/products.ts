import type { Product, Collection } from "lib/types";
import { getHandlesForCollectionFilter } from "lib/category-tree";
import {
  filterStorefrontCategories,
  getVisibleCategoryHandles,
  isCollectionVisibleOnStorefront,
  type CategoryWithAvailability,
} from "lib/category-visibility";
import { isProductPlantable } from "lib/product-plantable";
import { compareByPosition } from "lib/sort-position";
import { cache } from "react";
import { createServiceClient } from "./service";

// Helper to check if error is React.postpone()
function isReactPostpone(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "$$typeof" in error &&
    error.$$typeof === Symbol.for("react.postpone")
  );
}

function toFlatCategories(collections: Collection[]): CategoryWithAvailability[] {
  return collections.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    position: c.position ?? 0,
    parent_id: c.parentId ?? null,
    available: c.available,
  }));
}

function filterProductsByVisibleCategories(
  products: Product[],
  visibleHandles: Set<string>,
): Product[] {
  return products.filter(
    (p) => !p.category || visibleHandles.has(p.category),
  );
}

export async function getProducts(params?: {
  query?: string;
  collection?: string;
  limit?: number;
  offset?: number;
  excludeId?: string;
  sort?:
    | "price-asc"
    | "price-desc"
    | "discount-desc"
    | "name-asc"
    | "newest"
    | "position";
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
  onSaleOnly?: boolean;
}): Promise<Product[]> {
  try {
    const supabase = createServiceClient();
    
    let query = supabase
      .from("products")
      .select("*")
      .eq("available", true);

    const collectionHandle = params?.collection?.trim();
    const allCollections = await getCollections();
    const flatCategories = toFlatCategories(allCollections);
    const visibleHandles = getVisibleCategoryHandles(flatCategories);

    let collectionFlat:
      | Array<{ id: string; handle: string; parent_id: string | null }>
      | null = null;

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }

    if (params?.collection) {
      if (
        !collectionHandle ||
        !isCollectionVisibleOnStorefront(flatCategories, collectionHandle)
      ) {
        return [];
      }

      collectionFlat = flatCategories.map((c) => ({
        id: c.id,
        handle: c.handle,
        parent_id: c.parent_id,
      }));

      const handles = getHandlesForCollectionFilter(
        flatCategories,
        collectionHandle,
      ).filter((h) => visibleHandles.has(h));

      if (handles.length === 0) {
        return [];
      }

      if (handles.length === 1) {
        query = query.eq("category", handles[0]);
      } else {
        query = query.in("category", handles);
      }
    }

    // Filter by multiple categories (storefront-visible only)
    if (params?.categories && params.categories.length > 0) {
      const visible = params.categories.filter((h) => visibleHandles.has(h));
      if (visible.length === 0) {
        return [];
      }
      query = query.in("category", visible);
    }

    // Filter by price range
    if (params?.minPrice !== undefined) {
      query = query.gte("price", params.minPrice);
    }
    if (params?.maxPrice !== undefined) {
      query = query.lte("price", params.maxPrice);
    }

    // Filter only products on sale (have compareAtPrice > price)
    // Note: This needs to be done client-side as Supabase doesn't support
    // comparing two columns directly in a query

    // Exclude specific product ID if provided
    if (params?.excludeId) {
      query = query.neq("id", params.excludeId);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    // Apply sorting — default is position (lower number first)
    const sort = params?.sort || "position";
    if (sort === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price-desc") {
      query = query.order("price", { ascending: false });
    } else if (sort === "name-asc") {
      query = query.order("title", { ascending: true });
    } else if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("position", { ascending: true, nullsFirst: false });
      query = query.order("created_at", { ascending: false });
    }

    let { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error.message || error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Fallback: if collection filtering returns empty, try to determine the root
    // for each product's category by walking parents upwards.
    if (
      collectionHandle &&
      params?.collection &&
      Array.isArray(data) &&
      data.length === 0 &&
      collectionFlat
    ) {
      const idMap = new Map(collectionFlat.map((c) => [c.id, c]));
      const handleMap = new Map(collectionFlat.map((c) => [c.handle, c]));

      const getRootHandleForCategory = (categoryHandle: string) => {
        const node = handleMap.get(categoryHandle);
        if (!node) return categoryHandle;

        let cur = node;
        while (cur.parent_id && idMap.has(cur.parent_id)) {
          cur = idMap.get(cur.parent_id)!;
        }
        return cur.handle;
      };

      let fallbackQuery = supabase
        .from("products")
        .select("*")
        .eq("available", true);

      if (params?.query) {
        fallbackQuery = fallbackQuery.or(
          `title.ilike.%${params.query}%,description.ilike.%${params.query}%`
        );
      }

      if (params?.categories && params.categories.length > 0) {
        fallbackQuery = fallbackQuery.in("category", params.categories);
      }

      if (params?.minPrice !== undefined) {
        fallbackQuery = fallbackQuery.gte("price", params.minPrice);
      }
      if (params?.maxPrice !== undefined) {
        fallbackQuery = fallbackQuery.lte("price", params.maxPrice);
      }

      if (params?.excludeId) {
        fallbackQuery = fallbackQuery.neq("id", params.excludeId);
      }

      if (sort === "price-asc") {
        fallbackQuery = fallbackQuery.order("price", { ascending: true });
      } else if (sort === "price-desc") {
        fallbackQuery = fallbackQuery.order("price", { ascending: false });
      } else if (sort === "name-asc") {
        fallbackQuery = fallbackQuery.order("title", { ascending: true });
      } else if (sort === "newest") {
        fallbackQuery = fallbackQuery.order("created_at", { ascending: false });
      } else {
        fallbackQuery = fallbackQuery.order("position", {
          ascending: true,
          nullsFirst: false,
        });
        fallbackQuery = fallbackQuery.order("created_at", { ascending: false });
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      if (!fallbackError && fallbackData) {
        const filteredRows = (fallbackData as any[]).filter(
          (row) => getRootHandleForCategory(String(row.category)) === collectionHandle
        );

        const offset = params?.offset ?? 0;
        const limit = params?.limit;

        data =
          limit !== undefined
            ? filteredRows.slice(offset, offset + limit)
            : offset
              ? filteredRows.slice(offset)
              : filteredRows;
      }
    }

    let products = data.map(transformProduct);
    products = filterProductsByVisibleCategories(products, visibleHandles);

    // Filter only products on sale (have compareAtPrice > price)
    if (params?.onSaleOnly) {
      products = products.filter(
        (p) => p.compareAtPrice && p.compareAtPrice > p.price
      );
    }

    // Sort by discount percentage if needed (client-side as it requires calculation)
    if (sort === "discount-desc") {
      products = products.sort((a, b) => {
        const discountA = a.compareAtPrice && a.compareAtPrice > a.price
          ? ((a.compareAtPrice - a.price) / a.compareAtPrice) * 100
          : 0;
        const discountB = b.compareAtPrice && b.compareAtPrice > b.price
          ? ((b.compareAtPrice - b.price) / b.compareAtPrice) * 100
          : 0;
        return discountB - discountA;
      });
    } else if (sort === "position") {
      products = products.sort(
        (a, b) =>
          compareByPosition(a.position, b.position) ||
          a.title.localeCompare(b.title, "bg"),
      );
    }

    // Parent category page: products assigned to this category first,
    // then products from its subcategories (existing sort kept within each group).
    if (collectionHandle) {
      products = products.sort((a, b) => {
        const aDirect = a.category === collectionHandle ? 0 : 1;
        const bDirect = b.category === collectionHandle ? 0 : 1;
        if (aDirect !== bDirect) return aDirect - bDirect;
        if (sort === "position") {
          return (
            compareByPosition(a.position, b.position) ||
            a.title.localeCompare(b.title, "bg")
          );
        }
        return 0;
      });
    }

    return products;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getProducts:", error);
    return [];
  }
}

// Cache getProduct to prevent duplicate calls in the same request
export const getProduct = cache(async (handle: string): Promise<Product | null> => {
  try {
    const supabase = createServiceClient();
    
    // Trim the handle to match database (in case there are trailing spaces)
    const trimmedHandle = handle.trim();
    
    // Query directly by handle - much more efficient than fetching all products
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("handle", trimmedHandle)
      .eq("available", true)
      .single();

    if (error || !data) {
      return null;
    }

    const product = transformProduct(data);

    if (product.category) {
      const collections = await getCollections();
      const flat = toFlatCategories(collections);
      if (!isCollectionVisibleOnStorefront(flat, product.category)) {
        return null;
      }
    }

    return product;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getProduct:", error);
    return null;
  }
});

export async function getCollections(): Promise<Collection[]> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("position", { ascending: true, nullsFirst: false })
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching collections:", error.message || error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      handle: item.handle,
      title: item.title,
      description: item.description || undefined,
      parentId: item.parent_id || null,
      position: item.position ?? 0,
      available: item.available === true,
      updatedAt: item.updated_at || new Date().toISOString(),
    }));
  } catch (error) {
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getCollections:", error);
    return [];
  }
}

/**
 * Storefront categories — only active categories with active ancestors.
 */
export async function getStorefrontCollections(): Promise<Collection[]> {
  const all = await getCollections();
  const flat = toFlatCategories(all);
  const visibleIds = new Set(
    filterStorefrontCategories(flat).map((c) => c.id),
  );
  return all.filter((c) => visibleIds.has(c.id));
}

export async function getStorefrontCollectionByHandle(
  handle: string,
): Promise<Collection | null> {
  const collections = await getCollections();
  const flat = toFlatCategories(collections);
  if (!isCollectionVisibleOnStorefront(flat, handle)) {
    return null;
  }
  return collections.find((c) => c.handle === handle) ?? null;
}

export async function getCollectionProducts(handle: string): Promise<Product[]> {
  try {
    const collection = await getStorefrontCollectionByHandle(handle);
    if (!collection) {
      return [];
    }

    return getProducts({ collection: handle });
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getCollectionProducts:", error);
    return [];
  }
}

function transformProduct(data: any): Product {
  const variants = Array.isArray(data.variants) ? data.variants : [];
  return {
    id: data.id,
    handle: data.handle,
    title: data.title,
    description: data.description || "",
    featuredImage: data.featured_image || {
      id: "",
      url: "/placeholder-image.svg",
      altText: data.title,
    },
    images: data.images || [],
    price: data.price,
    compareAtPrice: data.compare_at_price,
    category: data.category,
    variants,
    plantable: isProductPlantable({
      plantable: data.plantable,
      category: data.category,
    }),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    available: data.available !== false,
    position: Number(data.position) || 0,
  };
}
