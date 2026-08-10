import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "lib/cloudinary";
import { isAdminRequest } from "lib/admin-auth";
import { isLikelyImageFile } from "lib/image-file";

/** Hard server-side cap after client compression (bytes) */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL) return true;
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      console.error("Cloudinary configuration missing");
      return NextResponse.json(
        {
          error:
            "Cloudinary не е конфигуриран. Добави CLOUDINARY_URL (или CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET) в .env.local / hosting env и рестартирай сървъра.",
        },
        { status: 500 },
      );
    }

    // Ensure SDK is configured even when only individual vars are set
    if (
      !process.env.CLOUDINARY_URL &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }

    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: "Не си влязъл като админ. Влез отново в /admin/login." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isLikelyImageFile(file)) {
      return NextResponse.json(
        { error: "Моля, избери валиден файл със снимка" },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error:
            "Файлът е твърде голям след компресия. Опитай с по-малко изображение (до 15MB оригинал).",
        },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Stream upload — avoids base64 bloat that breaks large payloads
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ecommerce",
          resource_type: "image",
          transformation: [
            { width: 2000, height: 2000, crop: "limit", quality: "auto:good" },
          ],
        },
        (error, uploadResult) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(uploadResult);
          }
        },
      );
      stream.end(buffer);
    });

    if (!result?.secure_url) {
      throw new Error("Cloudinary did not return a URL");
    }

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error);
    const errorMessage =
      error.message || error.error?.message || "Failed to upload image";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
