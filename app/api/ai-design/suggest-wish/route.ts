import { NextRequest, NextResponse } from "next/server";
import { suggestWishTexts } from "lib/ai-design/openai-client";
import { isAiPreviewRequest } from "lib/ai-design/preview-auth";

export async function POST(request: NextRequest) {
  try {
    if (!isAiPreviewRequest(request)) {
      return NextResponse.json(
        { error: "AI дизайнът е в тестов режим. Въведете preview парола." },
        { status: 401 },
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "OpenAI не е конфигуриран" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const idea = String(body.idea || "").trim();
    const result = await suggestWishTexts(idea);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI suggest-wish error:", error);
    return NextResponse.json(
      { error: error?.message || "Грешка при предложение за пожелание" },
      { status: 500 },
    );
  }
}
