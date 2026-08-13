import { headers } from "next/headers";
import { NavbarClient } from "./navbar-client";

/** Hide storefront navbar on /admin routes (SSR-safe via middleware pathname). */
export async function ConditionalNavbar() {
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ||
    headersList.get("x-invoke-path") ||
    "";

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <NavbarClient />;
}
