export const AI_DESIGN_PRODUCT_ID = "ai-design";

export const AI_MAX_ATTEMPTS = 3;
/** Max separate designs (cards) per browser before soft limit. */
export const AI_MAX_DESIGNS = 5;
/** One visual style at a time so the image model gets a clear direction. */
export const AI_MAX_STYLES = 1;
export const AI_IDEA_MAX_CHARS = 500;
export const AI_TEXT_WARN_CHARS = 90;

export type AiFormatId = "A6" | "A5" | "A4" | "A3";
export type AiBackOption = "planting" | "blank";

export type AiFormatOption = {
  id: AiFormatId;
  label: string;
  kind: "card" | "poster";
  price: number;
  framedPrice?: number;
  /** OpenAI / preview portrait size */
  imageSize: "1024x1536" | "1024x1024";
};

/** Prices from client Word doc (source of truth). */
export const AI_FORMATS: AiFormatOption[] = [
  {
    id: "A6",
    label: "A6 Картичка",
    kind: "card",
    price: 4,
    imageSize: "1024x1536",
  },
  {
    id: "A5",
    label: "A5 Картичка",
    kind: "card",
    price: 6,
    imageSize: "1024x1536",
  },
  {
    id: "A4",
    label: "A4 Постер",
    kind: "poster",
    price: 10,
    framedPrice: 15,
    imageSize: "1024x1536",
  },
  {
    id: "A3",
    label: "A3 Постер",
    kind: "poster",
    price: 17,
    framedPrice: 25,
    imageSize: "1024x1536",
  },
];

export const AI_STYLES = [
  {
    id: "watercolor",
    label: "Акварелен",
    summary:
      "Мека, ръчно рисувана визия с нежни цветови преливания. Подходящ за рождени дни, благодарствени и романтични картички.",
    promptGuidance:
      "Watercolor illustration style: soft hand-painted washes, gentle color bleeds and gradients, translucent pigment on a clean white background, delicate brush edges, romantic and tender mood. Avoid hard outlines, flat vector shapes, harsh contrast, paper texture, and decorative borders/frames.",
  },
  {
    id: "botanical",
    label: "Ботанически",
    summary:
      "Цветя, листа и природни детайли. Подходящ за пролетни празници, рождени дни и поздрави за любители на природата.",
    promptGuidance:
      "Botanical naturalist style: flowers, leaves, stems and organic plant details as the main motif, realistic-to-stylized flora, airy nature arrangement, seed-paper friendly greens and soft blooms. Avoid cartoon characters, city scenes, and heavy geometric patterns.",
  },
  {
    id: "minimal",
    label: "Минималистичен",
    summary:
      "Изчистена композиция, малко детайли и повече свободно пространство. Подходящ за модерни поздрави и делови поводи.",
    promptGuidance:
      "Minimalist modern style: clean composition, few carefully placed details, generous negative space, restrained palette, quiet contemporary look suitable for business or modern greetings. Avoid busy florals, ornate decoration, and playful cartoons.",
  },
  {
    id: "elegant",
    label: "Класически елегантен",
    summary:
      "Балансирана подредба и фини декоративни акценти. Подходящ за юбилеи, официални поздрави и специални семейни поводи.",
    promptGuidance:
      "Classic elegant style: balanced formal layout, refined decorative accents (subtle flourishes, delicate ornaments), timeless and ceremonial mood for anniversaries and formal family occasions. Avoid outer frames/borders around the design, childish motifs, neon colors, and sparse ultra-minimal emptiness.",
  },
  {
    id: "playful",
    label: "Детски и закачлив",
    summary:
      "Ярки цветове и приятелски илюстрации. Подходящ за детски рождени дни и поздрави за деца.",
    promptGuidance:
      "Playful children's illustration style: bright cheerful colors, friendly cute illustrations, lighthearted and joyful mood for kids' birthdays and greetings to children. Soft rounded shapes welcome; avoid dark moody tones, formal luxury ornament, and stern minimal corporate look.",
  },
] as const;

export type AiStyleId = (typeof AI_STYLES)[number]["id"];

const AI_STYLE_IDS = new Set<string>(AI_STYLES.map((s) => s.id));

/** Legacy ids from earlier UI — map into current styles when restoring drafts. */
const AI_STYLE_ID_ALIASES: Record<string, AiStyleId> = {
  gentle: "watercolor",
  fun: "playful",
};

export function normalizeAiStyleId(value: unknown): AiStyleId | null {
  if (typeof value !== "string") return null;
  const aliased = AI_STYLE_ID_ALIASES[value] || value;
  return AI_STYLE_IDS.has(aliased) ? (aliased as AiStyleId) : null;
}

export function getAiStyle(id: string) {
  return AI_STYLES.find((s) => s.id === id);
}

export function getAiFormat(id: string): AiFormatOption | undefined {
  return AI_FORMATS.find((f) => f.id === id);
}

export function resolveAiUnitPrice(
  formatId: AiFormatId,
  withFrame: boolean,
): number {
  const format = getAiFormat(formatId);
  if (!format) throw new Error("Невалиден формат");
  if (withFrame && format.framedPrice != null) return format.framedPrice;
  return format.price;
}

export function aiVariantId(formatId: AiFormatId, withFrame: boolean): string {
  return withFrame ? `ai-design-${formatId}-framed` : `ai-design-${formatId}`;
}

export function isAiDesignProductId(productId: string): boolean {
  return productId === AI_DESIGN_PRODUCT_ID || productId.startsWith("ai-design");
}
