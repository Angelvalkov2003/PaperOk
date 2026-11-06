import OpenAI from "openai";
import type { AiFormatId, AiStyleId } from "./constants";
import { getAiFormat, getAiStyle } from "./constants";

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

function stylePromptPart(styles: AiStyleId[]): string {
  if (!styles.length) {
    return [
      "STYLE: No specific customer style selected.",
      "Default look: warm handmade paper-craft aesthetic, soft natural colors, print-ready centered composition.",
    ].join("\n");
  }

  const lines = styles.map((id, index) => {
    const style = getAiStyle(id);
    if (!style) return `STYLE ${index + 1}: ${id}`;
    return [
      `STYLE (${style.label}):`,
      style.promptGuidance,
      "Follow this style direction strictly so the result matches the customer's chosen look.",
    ].join("\n");
  });

  return lines.join("\n\n");
}

export function buildImagePrompt(params: {
  idea: string;
  styles: AiStyleId[];
  formatId: AiFormatId;
  exactText?: string;
}): string {
  const format = getAiFormat(params.formatId);
  const kind = format?.kind === "poster" ? "poster print" : "greeting card front";
  const text = params.exactText?.trim();

  const textInstructions = text
    ? [
        "TEXT ON THE CARD (mandatory — render this exactly in the image):",
        `The greeting text must appear clearly on the design, letter by letter exactly as written: «${text}».`,
        "Use elegant readable typography: dark/black letters on a clean light or soft white paper panel near the lower third (or centered if it fits better).",
        "The panel should look printed on seed paper — soft edges, natural, not a harsh UI box.",
        "Bulgarian Cyrillic must be correct and sharp. Do not invent extra words, do not translate, do not misspell.",
        "No watermarks, logos, or extra captions besides this greeting.",
      ].join("\n")
    : [
        "Do NOT invent greeting text. If no text is provided, leave the composition decorative without letters.",
        "No watermarks, logos, or random captions.",
      ].join("\n");

  return [
    `Create a high-quality decorative ${kind} illustration for PaperOK, a Bulgarian seed-paper eco brand.`,
    "Base material feel: warm seed-paper texture, natural fibers visible where appropriate, print-ready.",
    "The final image IS the print preview — what the customer sees must match the downloadable file.",
    stylePromptPart(params.styles),
    textInstructions,
    `Customer idea / scene: ${params.idea.trim()}`,
  ].join("\n");
}

export async function generateAiDesignImage(params: {
  idea: string;
  styles: AiStyleId[];
  formatId: AiFormatId;
  exactText?: string;
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
