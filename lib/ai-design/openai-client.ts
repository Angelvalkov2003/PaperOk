import OpenAI from "openai";
import type { AiFormatId, AiStyleId } from "./constants";
import { AI_STYLES, getAiFormat } from "./constants";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY липсва в средата");
  }
  return new OpenAI({ apiKey });
}

function imageModel() {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2.5-flare";
}

function textModel() {
  return process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-4.1-mini";
}

function styleLabels(styles: AiStyleId[]): string {
  return styles
    .map((id) => AI_STYLES.find((s) => s.id === id)?.label || id)
    .join(", ");
}

export function buildImagePrompt(params: {
  idea: string;
  styles: AiStyleId[];
  formatId: AiFormatId;
}): string {
  const format = getAiFormat(params.formatId);
  const kind = format?.kind === "poster" ? "poster print" : "greeting card front";
  const stylePart = params.styles.length
    ? `Visual style cues: ${styleLabels(params.styles)}.`
    : "Warm, handmade paper craft aesthetic.";

  return [
    `Create a high-quality decorative ${kind} illustration for PaperOK, a Bulgarian seed-paper eco brand.`,
    "Look: warm paper texture feel, botanical/craft, soft natural colors, print-ready, centered composition.",
    "IMPORTANT: Do NOT render any text, letters, numbers, logos, watermarks, or signatures in the image.",
    "Leave a calm lower area suitable for later overlay of printed Bulgarian greeting text.",
    stylePart,
    `Customer idea: ${params.idea.trim()}`,
  ].join("\n");
}

export async function generateAiDesignImage(params: {
  idea: string;
  styles: AiStyleId[];
  formatId: AiFormatId;
}): Promise<{ b64: string; prompt: string }> {
  const openai = getOpenAI();
  const format = getAiFormat(params.formatId);
  const prompt = buildImagePrompt(params);
  const size = format?.imageSize || "1024x1536";

  const result = await openai.images.generate({
    model: imageModel(),
    prompt,
    size,
    quality: "medium",
    output_format: "png",
  } as any);

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI не върна изображение");
  }

  return { b64, prompt };
}

export async function suggestWishTexts(idea: string): Promise<{
  suggestions: string[];
  hint?: string;
}> {
  const trimmed = idea.trim();
  if (trimmed.length < 8) {
    return {
      suggestions: [],
      hint: "Добавете повод, получател или тон (напр. „рожден ден на мама, топло и нежно“).",
    };
  }

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: textModel(),
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content:
          "Ти пишеш кратки български поздравителни текстове за картички. Върни само JSON: {\"suggestions\":[\"...\",\"...\",\"...\"],\"hint\":null}. До 3 предложения, всяко до ~90 символа, без емоджи спам.",
      },
      {
        role: "user",
        content: `Идея на клиента: ${trimmed}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  let parsed: { suggestions?: string[]; hint?: string | null } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const suggestions = (parsed.suggestions || [])
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!suggestions.length) {
    return {
      suggestions: [],
      hint:
        parsed.hint ||
        "Добавете повод и получател в описанието, за да предложим пожелание.",
    };
  }

  return {
    suggestions,
    hint: parsed.hint || undefined,
  };
}
