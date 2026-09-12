import Image from "next/image";
import {
  LOGO_TRANSPARENT,
  LOGO_TRANSPARENT_SIZE,
  SITE_NAME,
} from "lib/constants";

type SoftLogoLoaderProps = {
  /** Visual size of the logo */
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const SIZE_CLASS = {
  sm: "max-w-[72px] w-[45%]",
  md: "max-w-[140px] w-[38%]",
  lg: "max-w-[220px] w-[42%]",
} as const;

/** Soft pulsing PaperOK logo for in-place loading (tiles / panels). */
export function SoftLogoLoader({
  size = "md",
  className = "",
  label = "Зареждане",
}: SoftLogoLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center bg-paper-bg ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Image
        src={LOGO_TRANSPARENT}
        alt=""
        width={LOGO_TRANSPARENT_SIZE.width}
        height={LOGO_TRANSPARENT_SIZE.height}
        className={`h-auto animate-pulse object-contain opacity-80 ${SIZE_CLASS[size]}`}
        priority={size !== "sm"}
      />
      <span className="sr-only">{label}…</span>
    </div>
  );
}
