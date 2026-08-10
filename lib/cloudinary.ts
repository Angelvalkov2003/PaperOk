import { v2 as cloudinary } from "cloudinary";

function parseCloudinaryUrl(url: string): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null {
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i);
  if (!match) return null;
  const [, apiKey, apiSecret, cloudName] = match;
  if (!apiKey || !apiSecret || !cloudName) return null;
  return {
    apiKey: decodeURIComponent(apiKey),
    apiSecret: decodeURIComponent(apiSecret),
    cloudName: cloudName.replace(/\/$/, ""),
  };
}

/**
 * Prefer calling configure from the upload route on each request.
 * This module still configures at import for any other callers.
 */
function configureFromEnv() {
  const url = process.env.CLOUDINARY_URL?.trim();
  if (url) {
    const parsed = parseCloudinaryUrl(url);
    if (parsed) {
      cloudinary.config({
        cloud_name: parsed.cloudName,
        api_key: parsed.apiKey,
        api_secret: parsed.apiSecret,
        secure: true,
      });
      return;
    }
  }

  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

configureFromEnv();

export { cloudinary };

export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  },
): string {
  const transformations: string[] = [];

  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);

  const transformString =
    transformations.length > 0 ? transformations.join(",") + "/" : "";

  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName && process.env.CLOUDINARY_URL) {
    const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
    cloudName = parsed?.cloudName;
  }

  if (!cloudName) {
    throw new Error("Cloudinary cloud_name is not configured");
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}
