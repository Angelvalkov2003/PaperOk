import clsx from "clsx";
import Image from "next/image";

type PaperTextureProps = {
  src: string;
  /** Semi-transparent brand color wash over the texture */
  overlay?: string;
  className?: string;
  /** Extra class on the image (e.g. scale) */
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

/**
 * Full-bleed seed-paper photo with a color wash on top.
 * Parent must be `position: relative` (and usually `overflow-hidden`).
 */
export function PaperTexture({
  src,
  overlay = "rgba(248, 245, 239, 0.76)",
  className,
  imageClassName,
  priority = false,
  sizes = "100vw",
  quality = 75,
}: PaperTextureProps) {
  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={clsx("object-cover object-center", imageClassName)}
      />
      <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
    </div>
  );
}
