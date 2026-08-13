"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ADMIN_PRODUCTS_PAGE_SIZES } from "lib/admin-products-list";

type ProductsPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function buildProductsAdminUrl(
  searchParams: URLSearchParams,
  overrides: { page?: number; perPage?: number },
) {
  const params = new URLSearchParams(searchParams.toString());
  const nextPage = overrides.page ?? Number(params.get("page") || 1);
  const nextPerPage =
    overrides.perPage ?? Number(params.get("perPage") || 10);

  if (nextPage <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(nextPage));
  }

  if (nextPerPage === 10) {
    params.delete("perPage");
  } else {
    params.set("perPage", String(nextPerPage));
  }

  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

function getVisiblePages(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const value = sorted[i]!;
    const prev = sorted[i - 1];
    if (prev !== undefined && value - prev > 1) {
      result.push("ellipsis");
    }
    result.push(value);
  }
  return result;
}

export function ProductsPagination({
  page,
  pageSize,
  total,
  totalPages,
}: ProductsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, totalPages);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>
          Показване {start}–{end} от {total}
        </span>
        <span aria-hidden className="text-gray-300 dark:text-gray-600">
          ·
        </span>
        <label htmlFor="admin-products-per-page" className="sr-only">
          Продукти на страница
        </label>
        <select
          id="admin-products-per-page"
          value={pageSize}
          onChange={(e) => {
            router.push(
              buildProductsAdminUrl(searchParams, {
                page: 1,
                perPage: Number(e.target.value),
              }),
            );
          }}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {ADMIN_PRODUCTS_PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>на страница</span>
      </div>

      <nav
        className="flex flex-wrap items-center gap-1"
        aria-label="Странициране на продукти"
      >
        {page > 1 ? (
          <Link
            href={buildProductsAdminUrl(searchParams, { page: page - 1 })}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Предишна
          </Link>
        ) : (
          <span className="rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500">
            Предишна
          </span>
        )}

        {visiblePages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-gray-400 dark:text-gray-500"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildProductsAdminUrl(searchParams, { page: item })}
              aria-current={item === page ? "page" : undefined}
              className={clsx(
                "min-w-[2.25rem] rounded-md border px-3 py-1.5 text-center text-sm font-medium transition-colors",
                item === page
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
              )}
            >
              {item}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link
            href={buildProductsAdminUrl(searchParams, { page: page + 1 })}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Следваща
          </Link>
        ) : (
          <span className="rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500">
            Следваща
          </span>
        )}
      </nav>
    </div>
  );
}
