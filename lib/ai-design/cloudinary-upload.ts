import { cloudinary } from "lib/cloudinary";

function ensureConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_URL?.trim() ||
      (process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
        process.env.CLOUDINARY_API_KEY?.trim() &&
        process.env.CLOUDINARY_API_SECRET?.trim()),
  );
}

export async function uploadAiDesignImage(params: {
  base64Png: string;
  folder?: string;
  publicId?: string;
}): Promise<{ url: string; publicId: string }> {
  if (!ensureConfigured()) {
    throw new Error("Cloudinary не е конфигуриран");
  }

  const dataUri = params.base64Png.startsWith("data:")
    ? params.base64Png
    : `data:image/png;base64,${params.base64Png}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: params.folder || "ecommerce/ai-temp",
    public_id: params.publicId,
    overwrite: true,
    resource_type: "image",
    format: "png",
  });

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary upload неуспешен");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
