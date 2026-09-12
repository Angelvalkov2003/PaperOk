import { getAllContactInquiries } from "lib/supabase/admin-contact-inquiries";
import { formatDateTimeBg } from "lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  if (status === "new") return "Ново";
  if (status === "read") return "Прочетено";
  if (status === "archived") return "Архивирано";
  return status;
}

function statusClass(status: string) {
  if (status === "new") {
    return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200";
  }
  if (status === "read") {
    return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200";
  }
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

export default async function AdminInquiriesPage() {
  const inquiries = await getAllContactInquiries();
  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Запитвания
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Съобщения от Контакти и бизнес запитвания (За бизнеса)
          {newCount > 0 ? ` · ${newCount} нови` : ""}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Източник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Име
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Имейл / Телефон
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Съобщение
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
              {inquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Няма запитвания
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => {
                  const isBusiness = (inquiry.subject || "")
                    .toLowerCase()
                    .startsWith("бизнес");
                  return (
                  <tr
                    key={inquiry.id}
                    className={
                      inquiry.status === "new"
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                        : undefined
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTimeBg(inquiry.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isBusiness
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {isBusiness ? "Бизнес" : "Контакти"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {inquiry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>{inquiry.email}</div>
                      {inquiry.phone ? (
                        <div className="text-xs">{inquiry.phone}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {inquiry.subject ? (
                        <span className="mr-1 text-xs text-gray-500">
                          [{inquiry.subject}]
                        </span>
                      ) : null}
                      {inquiry.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(inquiry.status)}`}
                      >
                        {statusLabel(inquiry.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                      >
                        Преглед
                      </Link>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
