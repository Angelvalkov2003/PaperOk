import { getProductByIdForAdmin } from "lib/supabase/admin-products";
import { getAllCollectionsForAdmin } from "lib/supabase/admin-collections";
import { normalizeProductSizeVariant } from "lib/quantity-pricing";
import { ProductForm } from "components/admin/product-form";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const [product, collections] = await Promise.all([
    getProductByIdForAdmin(id).catch((err) => {
      console.error("Error loading product for edit:", err);
      return null;
    }),
    getAllCollectionsForAdmin(),
  ]);

  if (!product) {
    notFound();
  }

  // Normalize DB shape for the form (JSONB / arrays)
  const normalizedProduct = {
    ...product,
    price: product.price != null ? Number(product.price) : 0,
    compare_at_price:
      product.compare_at_price != null
        ? Number(product.compare_at_price)
        : null,
    featured_image: product.featured_image || null,
    images: Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : [],
    variants: Array.isArray(product.variants)
      ? product.variants.map((v: any) => normalizeProductSizeVariant(v))
      : [],
    available: product.available !== false,
    plantable: product.plantable !== false,
    position: product.position ?? 0,
    min_quantity_enabled: Boolean(product.min_quantity_enabled),
    min_quantity: Math.max(1, Math.floor(Number(product.min_quantity) || 1)),
    price_tiers_enabled: Boolean(product.price_tiers_enabled),
    price_tiers: Array.isArray(product.price_tiers)
      ? product.price_tiers
      : [],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 text-sm font-medium"
        >
          ← Назад към продуктите
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Редактирай Продукт
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {normalizedProduct.title}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <ProductForm
          product={normalizedProduct}
          collections={collections.map((c: any) => ({
            id: c.id,
            handle: c.handle,
            title: c.title,
            position: c.position ?? 0,
            parent_id: c.parent_id || null,
          }))}
        />
      </div>
    </div>
  );
}
