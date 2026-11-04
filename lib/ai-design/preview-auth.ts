import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated, isAdminRequest } from "lib/admin-auth";

export const AI_PREVIEW_COOKIE = "paperok_ai_preview";

function previewPassword(): string | null {
  const dedicated = process.env.AI_DESIGN_PREVIEW_PASSWORD?.trim();
  if (dedicated) return dedicated;
  const admin = process.env.ADMIN_PASSWORD?.trim();
  return admin || null;
}

function createPreviewToken(password: string): string {
  return createHash("sha256")
    .update(`paperok-ai-preview:${password}`)
    .digest("hex");
}

function tokensMatch(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return a === b;
  }
}

export function verifyAiPreviewPassword(password: string): boolean {
  const expected = previewPassword();
  if (!expected) return false;
  return tokensMatch(password, expected);
}

export async function setAiPreviewSession(): Promise<void> {
  const password = previewPassword();
  if (!password) {
    throw new Error("AI preview password is not configured");
  }
  const cookieStore = await cookies();
  cookieStore.set(AI_PREVIEW_COOKIE, createPreviewToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function isAiPreviewAuthenticated(): Promise<boolean> {
  if (await isAdminAuthenticated()) return true;

  const password = previewPassword();
  if (!password) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(AI_PREVIEW_COOKIE)?.value;
  if (!token) return false;

  return tokensMatch(token, createPreviewToken(password));
}

export function isAiPreviewRequest(request: NextRequest): boolean {
  if (isAdminRequest(request)) return true;

  const password = previewPassword();
  if (!password) return false;

  const token = request.cookies.get(AI_PREVIEW_COOKIE)?.value;
  if (!token) return false;

  return tokensMatch(token, createPreviewToken(password));
}
