import { getAllCollectionsForAdmin } from "lib/supabase/admin-collections";
import { buildCategoryTree } from "lib/category-tree";
import Link from "next/link";
import { CategoryTreeTable } from "components/admin/category-tree-table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCollectionsPage() {
  const collections = await getAllCollectionsForAdmin();
  const tree = buildCategoryTree(
    collections.map((c: any) => ({
      id: c.id,
      handle: c.handle,
      title: c.title,
      description: c.description,
      position: c.position ?? 0,
      parent_id: c.parent_id || null,
      available: c.available === true,
    })),
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Категории
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Всяка категория принадлежи към главно меню: Картички, Подаръци или
            Семенна хартия
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Нова Категория
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Име
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Главно меню
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Позиция
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
              <CategoryTreeTable tree={tree} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
