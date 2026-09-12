import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getContactInquiryById,
  updateContactInquiryStatus,
} from "lib/supabase/admin-contact-inquiries";
import { InquiryStatusForm } from "components/admin/inquiry-status-form";
import { DeleteInquiryButton } from "components/admin/delete-inquiry-button";
import { formatDateTimeBg } from "lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const inquiry = await getContactInquiryById(id);
  if (!inquiry) notFound();

  // Auto-mark as read when opening a new inquiry
  if (inquiry.status === "new") {
    try {
      await updateContactInquiryStatus(id, "read");
      inquiry.status = "read";
    } catch (error) {
      console.error("Failed to auto-mark inquiry as read:", error);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/inquiries"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
        >
          ← Назад към запитванията
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Запитване от {inquiry.name}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {formatDateTimeBg(inquiry.created_at, { month: "long", second: "2-digit" })}
          </p>
        </div>
        <DeleteInquiryButton
          inquiryId={inquiry.id}
          inquiryName={inquiry.name}
        />
      </div>

      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <InquiryStatusForm
            inquiryId={inquiry.id}
            currentStatus={inquiry.status}
          />
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Име
            </h2>
            <p className="mt-1 text-gray-900 dark:text-white">{inquiry.name}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Имейл
            </h2>
            <a
              href={`mailto:${inquiry.email}`}
              className="mt-1 block text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {inquiry.email}
            </a>
          </div>
          {inquiry.phone ? (
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Телефон
              </h2>
              <a
                href={`tel:${inquiry.phone.replace(/\s/g, "")}`}
                className="mt-1 block text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {inquiry.phone}
              </a>
            </div>
          ) : null}
          {inquiry.subject ? (
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Тема
              </h2>
              <p className="mt-1 text-gray-900 dark:text-white">
                {inquiry.subject}
              </p>
            </div>
          ) : null}
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Съобщение
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-900 dark:text-white">
              {inquiry.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
