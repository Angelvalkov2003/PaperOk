import { isAdminRequest } from "lib/admin-auth";
import { printSpeedyLabel } from "lib/speedy-shipment";
import { getOrderById } from "lib/supabase/orders";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await getOrderById(id);
    const parcelId = order.speedy_parcel_id;

    if (!parcelId) {
      return NextResponse.json(
        { error: "Няма създадена товарителница за тази поръчка." },
        { status: 404 },
      );
    }

    const pdf = await printSpeedyLabel(parcelId);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="speedy-${parcelId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Грешка при печат на етикет";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
