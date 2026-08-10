const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "bmp",
  "svg",
  "heic",
  "heif",
]);

export function getImageFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** True when MIME or file extension looks like an image. */
export function isLikelyImageFile(file: Pick<File, "name" | "type">): boolean {
  if (file.type?.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.has(getImageFileExtension(file.name));
}

export const IMAGE_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif";
