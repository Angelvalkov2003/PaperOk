import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAdminRequest } from "lib/admin-auth";
import { isLikelyImageFile } from "lib/image-file";

/** Hard server-side cap after client compression (bytes) */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function parseCloudinaryUrl(url: string): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null {
  // cloudinary://api_key:api_secret@cloud_name
  // Secret may contain URL-unsafe characters — avoid URL() parser.
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

function configureCloudinary(): boolean {
  const url = process.env.CLOUDINARY_URL?.trim();
  if (url) {
    const parsed = parseCloudinaryUrl(url);
    if (!parsed) {
      console.error("Invalid CLOUDINARY_URL format");
      return false;
    }
    cloudinary.config({
      cloud_name: parsed.cloudName,
      api_key: parsed.apiKey,
      api_secret: parsed.apiSecret,
      secure: true,
    });
    return true;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) return false;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return true;
}

function cloudinaryErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Failed to upload image";
  }
  const err = error as {
    message?: string;
    error?: { message?: string; http_code?: number };
    http_code?: number;
  };
  return (
    err.error?.message ||
    err.message ||
    (err.http_code ? `Cloudinary error (${err.http_code})` : "Failed to upload image")
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!configureCloudinary()) {
      console.error("Cloudinary configuration missing or invalid");
      return NextResponse.json(
        {
          error:
            "Cloudinary не е конфигуриран на сървъра. Добави CLOUDINARY_URL (или CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET) в hosting env и redeploy.",
        },
        { status: 500 },
      );
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
    const mime = file.type?.startsWith("image/") ? file.type : "image/jpeg";
    // Base64 data URI — works reliably on Vercel; upload_stream often fails there
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "ecommerce",
      resource_type: "image",
      // Client already compresses; keep upload simple (eager transforms often cause "General Error")
      overwrite: false,
    });

    if (!result?.secure_url) {
      throw new Error("Cloudinary did not return a URL");
    }

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: unknown) {
    console.error("Error uploading to Cloudinary:", error);
    const message = cloudinaryErrorMessage(error);
    console.error("[api/upload] failing with message:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
