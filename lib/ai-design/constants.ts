export const AI_DESIGN_PRODUCT_ID = "ai-design";

export const AI_MAX_ATTEMPTS = 3;
export const AI_MAX_STYLES = 2;
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
  { id: "gentle", label: "Нежен" },
  { id: "botanical", label: "Ботанически" },
  { id: "minimal", label: "Минималистичен" },
  { id: "elegant", label: "Елегантен" },
  { id: "fun", label: "Забавен" },
] as const;

export type AiStyleId = (typeof AI_STYLES)[number]["id"];

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
