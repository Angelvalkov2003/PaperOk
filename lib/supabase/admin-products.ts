import { createServiceClient } from "./service";
import type { Image, ProductSizeVariant } from "lib/types";
import {
  ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE,
  ADMIN_PRODUCTS_PAGE_SIZES,
  type AdminProductsPageSize,
} from "lib/admin-products-list";

// Helper to check if error is React.postpone()
function isReactPostpone(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "$$typeof" in error &&
    error.$$typeof === Symbol.for("react.postpone")
  );
}

export interface CreateProductData {
  handle: string;
  title: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  featured_image?: Image;
  images?: Image[];
  category?: string;
  available?: boolean;
  plantable?: boolean;
  position?: number;
  variants?: ProductSizeVariant[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

/**
 * Get product order count (number of orders containing this product)
 */
export async function getProductOrderCount(productId: string): Promise<number> {
  try {
    const supabase = createServiceClient();
    
    // Query orders where products JSONB array contains this product ID
    const { data, error } = await supabase
      .from("orders")
      .select("products")
      .neq("status", "canceled"); // Exclude canceled orders

    if (error) {
      console.error("Error fetching orders for product count:", error);
      return 0;
    }

    if (!data) {
      return 0;
    }

    // Count how many orders contain this product
    let count = 0;
    for (const order of data) {
      if (Array.isArray(order.products)) {
        const hasProduct = order.products.some(
          (p: any) => p.id === productId
        );
        if (hasProduct) {
          count++;
        }
      }
    }

    return count;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getProductOrderCount:", error);
    return 0;
  }
}

export type { AdminProductsPageSize } from "lib/admin-products-list";
export {
  ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE,
  ADMIN_PRODUCTS_PAGE_SIZES,
} from "lib/admin-products-list";

export type AdminProductsListResult = {
  products: Array<Record<string, unknown> & { orderCount: number }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Get all products (including unavailable ones) for admin
 */
export async function getAllProductsForAdmin(params?: {
  category?: string;
  search?: string;
  sortBy?: "price" | "sales" | "position" | "created_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}): Promise<AdminProductsListResult> {
  try {
    const supabase = createServiceClient();
    
    let query = supabase.from("products").select("*");

    // Filter by category if provided
    if (params?.category) {
      query = query.eq("category", params.category);
    }

    const search = params?.search?.trim();
    if (search) {
      // Case-insensitive match on title or handle
      const escaped = search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `title.ilike.%${escaped}%,handle.ilike.%${escaped}%`,
      );
    }

    // Apply sorting
    const sortBy = params?.sortBy || "position";
    const sortOrder = params?.sortOrder || "asc";

    if (sortBy === "price") {
      query = query.order("price", { ascending: sortOrder === "asc" });
    } else if (sortBy === "created_at") {
      query = query.order("created_at", { ascending: sortOrder === "asc" });
    } else {
      // Default: position
      query = query.order("position", { ascending: sortOrder === "asc" });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }

    const products = data || [];

    // Get all orders once to calculate order counts efficiently
    const supabaseForOrders = createServiceClient();
    const { data: ordersData } = await supabaseForOrders
      .from("orders")
      .select("products")
      .neq("status", "canceled");

    // Create a map of product ID to order count
    const productOrderCountMap = new Map<string, number>();
    
    if (ordersData) {
      for (const order of ordersData) {
        if (Array.isArray(order.products)) {
          for (const product of order.products) {
            if (product.id) {
              const currentCount = productOrderCountMap.get(product.id) || 0;
              productOrderCountMap.set(product.id, currentCount + 1);
            }
          }
        }
      }
    }

    // Add order counts to products
    const productsWithCounts = products.map((product) => ({
      ...product,
      orderCount: productOrderCountMap.get(product.id) || 0,
    }));

    // If sorting by sales, sort by order count
    if (sortBy === "sales") {
      productsWithCounts.sort((a, b) => {
        if (sortOrder === "asc") {
          return a.orderCount - b.orderCount;
        } else {
          return b.orderCount - a.orderCount;
        }
      });
    }

    const rawPageSize = params?.pageSize ?? ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE;
    const pageSize = ADMIN_PRODUCTS_PAGE_SIZES.includes(
      rawPageSize as AdminProductsPageSize,
    )
      ? rawPageSize
      : ADMIN_PRODUCTS_DEFAULT_PAGE_SIZE;
    const total = productsWithCounts.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const requestedPage = Math.max(1, params?.page ?? 1);
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * pageSize;
    const paginatedProducts = productsWithCounts.slice(offset, offset + pageSize);

    return {
      products: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getAllProductsForAdmin:", error);
    throw error;
  }
}

/**
 * Get product by ID for admin
 */
export async function getProductByIdForAdmin(productId: string) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      throw new Error("Failed to fetch product");
    }

    return data;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getProductByIdForAdmin:", error);
    throw error;
  }
}

/**
 * Check if handle already exists
 */
async function checkHandleExists(handle: string, excludeId?: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const trimmedHandle = handle.trim();
    
    let query = supabase
      .from("products")
      .select("id")
      .eq("handle", trimmedHandle)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking handle:", error);
      return false;
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in checkHandleExists:", error);
    return false;
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductData) {
  try {
    const supabase = createServiceClient();
    
    const trimmedHandle = data.handle.trim();
    
    // Check if handle already exists
    const handleExists = await checkHandleExists(trimmedHandle);
    if (handleExists) {
      throw new Error(`Slug "${trimmedHandle}" вече е зает. Моля, изберете друг slug.`);
    }
    
    const productData: Record<string, unknown> = {
      handle: trimmedHandle,
      title: data.title,
      description: data.description || null,
      price: data.price,
      compare_at_price: data.compare_at_price || null,
      featured_image: data.featured_image || null,
      images: data.images || [],
      category: data.category || null,
      available: data.available === true,
      plantable: data.plantable !== false,
      position: data.position ?? 0,
      variants: data.variants || [],
      updated_at: new Date().toISOString(),
    };

    let { data: product, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    // Fallback if plantable column is not migrated yet
    if (error?.message?.includes("plantable")) {
      delete productData.plantable;
      ({ data: product, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single());
    }

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        throw new Error(`Slug "${trimmedHandle}" вече е зает. Моля, изберете друг slug.`);
      }
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }

    return product;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in createProduct:", error);
    throw error;
  }
}

/**
 * Update a product
 */
export async function updateProduct(data: UpdateProductData) {
  try {
    const supabase = createServiceClient();
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.handle !== undefined) {
      const trimmedHandle = data.handle.trim();
      
      // Check if handle already exists for another product
      const handleExists = await checkHandleExists(trimmedHandle, data.id);
      if (handleExists) {
        throw new Error(`Slug "${trimmedHandle}" вече е зает. Моля, изберете друг slug.`);
      }
      
      updateData.handle = trimmedHandle;
    }
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.compare_at_price !== undefined) updateData.compare_at_price = data.compare_at_price || null;
    if (data.featured_image !== undefined) updateData.featured_image = data.featured_image || null;
    if (data.images !== undefined) updateData.images = data.images || [];
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.available !== undefined) updateData.available = data.available;
    if (data.plantable !== undefined) updateData.plantable = data.plantable;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.variants !== undefined) updateData.variants = data.variants || [];

    let { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single();

    if (error?.message?.includes("plantable")) {
      delete updateData.plantable;
      ({ data: product, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single());
    }

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        throw new Error(`Slug "${updateData.handle || data.handle}" вече е зает. Моля, изберете друг slug.`);
      }
      console.error("Error updating product:", error);
      throw new Error("Failed to update product");
    }

    return product;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in updateProduct:", error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }

    return true;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in deleteProduct:", error);
    throw error;
  }
}
