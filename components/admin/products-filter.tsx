"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductsFilterProps {
  collections: Array<{ id: string; title: string; handle: string }>;
}

export function ProductsFilter({ collections }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || "",
  );
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "position");
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "asc",
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }
    if (category) {
      params.set("category", category);
    }
    if (sortBy && sortBy !== "position") {
      params.set("sortBy", sortBy);
    }
    if (sortOrder && sortOrder !== "asc") {
      params.set("sortOrder", sortOrder);
    }

    const currentPerPage = searchParams.get("perPage");
    if (currentPerPage && currentPerPage !== "10") {
      params.set("perPage", currentPerPage);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `/admin/products?${queryString}`
      : "/admin/products";

    router.replace(newUrl);
  }, [debouncedSearch, category, sortBy, sortOrder, router]);

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[220px]">
        <label
          htmlFor="admin-product-search"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Търсене по име
        </label>
        <input
          id="admin-product-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Име или handle…"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="min-w-[200px] flex-1">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Филтрирай по категория
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Всички категории</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.handle}>
              {collection.title}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[180px]">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Сортирай по
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="position">Позиция</option>
          <option value="price">Цена</option>
          <option value="sales">Продажби</option>
          <option value="created_at">Дата на създаване</option>
        </select>
      </div>

      <div className="min-w-[120px]">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ред
        </label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="asc">Възходящ (по-малко число отгоре)</option>
          <option value="desc">Низходящ (по-голямо число отгоре)</option>
        </select>
      </div>
    </div>
  );
}
