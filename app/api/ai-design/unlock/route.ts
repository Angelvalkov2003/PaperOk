import { NextRequest, NextResponse } from "next/server";
import {
  setAiPreviewSession,
  verifyAiPreviewPassword,
} from "lib/ai-design/preview-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = String(body.password || "");

    if (!verifyAiPreviewPassword(password)) {
      return NextResponse.json(
        { error: "Грешна парола" },
        { status: 401 },
      );
    }

    await setAiPreviewSession();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Грешка при отключване" },
      { status: 500 },
    );
  }
}
