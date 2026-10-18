import { redirect } from "next/navigation";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { isAdmin } from "lib/supabase/auth";
import { AdminNavbar } from "components/admin/navbar";
import { headers } from "next/headers";

/** Keep the admin area out of search / AI indexes */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ||
    headersList.get("x-invoke-path") ||
    "";

  // Login page: no auth shell (and no nested <main>)
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  try {
    const admin = await isAdmin();

    if (!admin) {
      redirect("/admin/login");
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavbar />
        {/* Use <div>, not <main> — root layout already wraps children in <main> */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    );
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error checking admin status:", error);
    redirect("/admin/login");
  }
}
