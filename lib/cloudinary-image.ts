import type { ImageLoaderProps } from "next/image";

const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_MARKER = "/image/upload/";

function looksLikeTransformSegment(segment: string): boolean {
  // e.g. f_auto,q_auto,w_800 or c_fill,w_400,h_400
  if (!segment || segment.startsWith("v") && /^v\d+$/.test(segment)) {
    return false;
  }
  return /(?:^|,)(?:f_|q_|w_|h_|c_|dpr_|e_|fl_|g_|b_|ar_)/.test(segment);
}

/**
 * Inject responsive Cloudinary transforms into a delivery URL so the CDN
 * serves an already-resized WebP/AVIF instead of the full original.
 */
export function withCloudinaryTransforms(
  src: string,
  options?: { width?: number; quality?: number | string },
): string {
  if (!src.includes(CLOUDINARY_HOST)) return src;

  const idx = src.indexOf(UPLOAD_MARKER);
  if (idx === -1) return src;

  let rest = src.slice(idx + UPLOAD_MARKER.length);
  const firstSlash = rest.indexOf("/");
  if (firstSlash > 0) {
    const maybeTransforms = rest.slice(0, firstSlash);
    if (looksLikeTransformSegment(maybeTransforms)) {
      rest = rest.slice(firstSlash + 1);
    }
  }

  const parts: string[] = ["f_auto", "c_limit"];
  if (options?.width && options.width > 0) {
    parts.push(`w_${Math.round(options.width)}`);
  }
  if (typeof options?.quality === "number") {
    parts.push(`q_${options.quality}`);
  } else if (typeof options?.quality === "string") {
    parts.push(`q_${options.quality}`);
  } else {
    parts.push("q_auto:good");
  }

  return `${src.slice(0, idx + UPLOAD_MARKER.length)}${parts.join(",")}/${rest}`;
}

export function isCloudinaryUrl(src: string | undefined | null): boolean {
  return Boolean(src && src.includes(CLOUDINARY_HOST));
}

/** Next/Image loader — browser hits Cloudinary CDN directly (no /_next/image hop). */
export function cloudinaryImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!isCloudinaryUrl(src)) return src;
  return withCloudinaryTransforms(src, {
    width,
    quality: quality ?? 75,
  });
}
