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
  hero: "rgba(248, 245, 236, 0.74)",
  cream: "rgba(248, 245, 236, 0.80)",
  surface: "rgba(238, 241, 223, 0.88)",
  section: "rgba(231, 235, 216, 0.78)",
  accent: "rgba(228, 235, 214, 0.76)",
  card: "rgba(255, 255, 255, 0.72)",
  cardSoft: "rgba(255, 252, 247, 0.68)",
  white: "rgba(255, 255, 255, 0.78)",
} as const;
