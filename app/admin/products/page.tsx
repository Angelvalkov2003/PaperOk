import {
  getAllProductsForAdmin,
} from "lib/supabase/admin-products";
import {
  parseAdminProductsPageSize,
} from "lib/admin-products-list";
import { getAllCollectionsForAdmin } from "lib/supabase/admin-collections";
import Link from "next/link";
import { DeleteProductButton } from "components/admin/delete-product-button";
import { ProductsFilter } from "components/admin/products-filter";
import { ProductsPagination } from "components/admin/products-pagination";
import { VisibilityStatusBadge } from "components/admin/visibility-status-badge";
import { Suspense } from "react";

// Disable static generation for this page - always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

function ProductsTable({
  products,
  search,
  page,
  pageSize,
  total,
  totalPages,
}: {
  products: any[];
  search?: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Снимка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Име
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Handle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Поръчки
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {search
                    ? `Няма продукти за „${search}“`
                    : "Няма продукти. Създай първия продукт!"}
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.featured_image?.url ? (
                      <img
                        src={product.featured_image.url}
                        alt={product.featured_image.altText || product.title}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">
                        Няма
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {product.handle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      €{Number(product.price).toFixed(2)}
                      {product.compare_at_price && (
                        <span className="ml-2 text-xs text-gray-500 line-through">
                          €{Number(product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.category || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {product.orderCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <VisibilityStatusBadge active={product.available === true} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Редактирай
                      </Link>
                      <DeleteProductButton productId={product.id} productTitle={product.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Suspense fallback={null}>
        <ProductsPagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    perPage?: string;
  }>;
}) {
  const params = await searchParams;
  const category = params.category || undefined;
  const search = params.q || undefined;
  const sortBy =
    (params.sortBy as "price" | "sales" | "position" | "created_at") ||
    "position";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "asc";
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const pageSize = parseAdminProductsPageSize(params.perPage);

  const [productList, collections] = await Promise.all([
    getAllProductsForAdmin({
      category,
      search,
      sortBy,
      sortOrder,
      page,
      pageSize,
    }),
    getAllCollectionsForAdmin(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Продукти
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Управление на продуктите
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Нов Продукт
        </Link>
      </div>

      <ProductsFilter collections={collections} />

      <ProductsTable
        products={productList.products}
        search={search}
        page={productList.page}
        pageSize={productList.pageSize}
        total={productList.total}
        totalPages={productList.totalPages}
      />
    </div>
  );
}
