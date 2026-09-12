import { NextResponse } from "next/server";
import { getStorefrontCollections } from "lib/supabase/products";

export const revalidate = 60;

export async function GET() {
  try {
    const collections = await getStorefrontCollections();
    return NextResponse.json(collections, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json([], { status: 500 });
  }
}
