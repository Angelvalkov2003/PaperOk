"use server";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  type CreateProductData,
  type UpdateProductData,
} from "lib/supabase/admin-products";
import { revalidatePath } from "next/cache";

function revalidateStorefront() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/api/collections");
  revalidatePath("/");
  revalidatePath("/search");
}

export async function createProductAction(data: CreateProductData) {
  try {
    const product = await createProduct(data);
    revalidateStorefront();
    if (product?.handle) {
      revalidatePath(`/product/${product.handle}`);
    }
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProductAction(data: UpdateProductData) {
  try {
    const product = await updateProduct(data);
    revalidateStorefront();
    revalidatePath(`/admin/products/${data.id}`);
    if (product?.handle) {
      revalidatePath(`/product/${product.handle}`);
    }
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await deleteProduct(productId);
    revalidateStorefront();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete product" };
  }
}
