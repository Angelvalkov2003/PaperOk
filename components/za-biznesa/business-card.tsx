import clsx from "clsx";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_OVERLAYS } from "lib/backgrounds";
import type { ReactNode } from "react";

type BusinessCardProps = {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  textureSrc: string;
  textureSizes?: string;
  textureOverlay?: string;
  rounded?: "xl" | "2xl" | "lg";
  padding?: "md" | "lg";
  bare?: boolean;
};

export function BusinessCard({
  children,
  className,
  bodyClassName,
  textureSrc,
  textureSizes = "50vw",
  textureOverlay = PAPER_OVERLAYS.white,
  rounded = "xl",
  padding = "lg",
  bare = false,
}: BusinessCardProps) {
  const roundedClass =
    rounded === "2xl" ? "rounded-2xl" : rounded === "lg" ? "rounded-lg" : "rounded-xl";

  const paddingClass = padding === "md" ? "p-5" : "p-6";

  return (
    <div
      className={clsx(
        "relative flex h-full flex-col overflow-hidden",
        !bare && ["hover-lift border border-paper-border", roundedClass],
        className,
      )}
    >
      <PaperTexture
        src={textureSrc}
        overlay={textureOverlay}
        sizes={textureSizes}
        quality={82}
      />
      <div
        className={clsx(
          "relative z-10 flex flex-1 flex-col",
          paddingClass,
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function BusinessCardTitle({
  children,
  className,
  lines = 3,
}: {
  children: ReactNode;
  className?: string;
  lines?: 2 | 3;
}) {
  return (
    <h3
      className={clsx(
        "font-semibold leading-snug",
        lines === 2 ? "line-clamp-2 min-h-[2.75rem]" : "line-clamp-3 min-h-[4.25rem]",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function BusinessCardText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx("mt-2 flex-1 text-sm leading-relaxed text-paper-text", className)}>
      {children}
    </p>
  );
}

/** Apply to grid containers so Reveal children stretch to equal row height. */
export const BUSINESS_GRID_CLASS = "grid items-stretch";

/** Apply to Reveal wrappers inside business grids. */
export const BUSINESS_GRID_REVEAL_CLASS = "h-full";
