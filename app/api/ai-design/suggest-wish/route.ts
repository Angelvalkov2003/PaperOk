import { NextRequest, NextResponse } from "next/server";
import { suggestWishTexts } from "lib/ai-design/openai-client";

export async function POST(request: NextRequest) {
  try {
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
