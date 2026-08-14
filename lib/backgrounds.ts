/** Seed-paper texture photos in /public/backgrounds */
export const PAPER_BACKGROUNDS = {
  /** Cream paper with purple petals + seeds — good for hero */
  petals: "/backgrounds/IMG_9981.jpeg",
  /** Similar petals alternate */
  petalsSoft: "/backgrounds/IMG_9988.jpeg",
  /** Oval dark seeds */
  seeds: "/backgrounds/IMG_9987.jpeg",
  /** Elongated fibers / grass seeds */
  fibers: "/backgrounds/IMG_9986.jpeg",
  /** Cleaner seed paper — versatile */
  plain: "/backgrounds/IMG_9980.jpeg",
} as const;

export type PaperBackgroundKey = keyof typeof PAPER_BACKGROUNDS;

/** Cycle for cards / repeated surfaces */
export const PAPER_BG_CYCLE = [
  PAPER_BACKGROUNDS.plain,
  PAPER_BACKGROUNDS.seeds,
  PAPER_BACKGROUNDS.fibers,
  PAPER_BACKGROUNDS.petalsSoft,
  PAPER_BACKGROUNDS.petals,
] as const;

export function paperBgAt(index: number): string {
  return PAPER_BG_CYCLE[index % PAPER_BG_CYCLE.length]!;
}

/** Brand-tinted overlays — keep site colors, let texture show through */
export const PAPER_OVERLAYS = {
  hero: "rgba(248, 245, 239, 0.72)",
  cream: "rgba(248, 245, 239, 0.78)",
  surface: "rgba(210, 197, 180, 0.88)",
  section: "rgba(239, 231, 219, 0.76)",
  accent: "rgba(221, 232, 204, 0.74)",
  card: "rgba(255, 255, 255, 0.72)",
  cardSoft: "rgba(255, 252, 247, 0.68)",
  white: "rgba(255, 255, 255, 0.78)",
} as const;
