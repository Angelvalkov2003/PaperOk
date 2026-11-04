import { createServiceClient } from "lib/supabase/service";
import type { AiBackOption, AiFormatId, AiStyleId } from "./constants";

const TEMP_TTL_MINUTES = 45;

export class AiDbUnavailableError extends Error {
  constructor(cause?: string) {
    super(
      cause?.includes("fetch failed") || cause?.includes("TypeError")
        ? "Няма връзка със Supabase (fetch failed). Проверете интернет / VPN или изпълнете ai_design_migration.sql."
        : cause ||
            "AI таблиците в базата липсват или са недостъпни. Изпълнете ai_design_migration.sql в Supabase.",
    );
    this.name = "AiDbUnavailableError";
  }
}

function wrapDbError(error: { message?: string; code?: string } | null) {
  const message = error?.message || "unknown db error";
  if (
    message.includes("fetch failed") ||
    message.includes("TypeError") ||
    error?.code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  ) {
    return new AiDbUnavailableError(message);
  }
  return new Error(message);
}

export async function createAiProject(params: {
  sessionId: string;
  formatId: AiFormatId;
  withFrame: boolean;
  backOption: AiBackOption | null;
  idea: string;
  styles: AiStyleId[];
  exactText: string;
}) {
  const supabase = createServiceClient();
  const expiresAt = new Date(
    Date.now() + TEMP_TTL_MINUTES * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("ai_design_projects")
    .insert({
      session_id: params.sessionId,
      format: params.formatId,
      with_frame: params.withFrame,
      back_option: params.backOption,
      idea: params.idea,
      styles: params.styles,
      exact_text: params.exactText || null,
      attempts_used: 0,
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error) throw wrapDbError(error);
  return data;
}

export async function getAiProject(projectId: string) {
  const supabase = createServiceClient();
  try {
    const { data, error } = await supabase
      .from("ai_design_projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (error) throw wrapDbError(error);
    return data;
  } catch (error) {
    if (error instanceof AiDbUnavailableError) throw error;
    if (error instanceof Error && error.message.includes("fetch failed")) {
      throw new AiDbUnavailableError(error.message);
    }
    throw error;
  }
}

export async function updateAiProject(
  projectId: string,
  patch: Record<string, unknown>,
) {
  const supabase = createServiceClient();
  const expiresAt = new Date(
    Date.now() + TEMP_TTL_MINUTES * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("ai_design_projects")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) throw wrapDbError(error);
  return data;
}

export async function insertAiVariant(params: {
  projectId: string;
  imageUrl: string;
  previewUrl?: string;
  printUrl?: string;
  cloudinaryPublicId?: string;
  prompt?: string;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ai_design_variants")
    .insert({
      project_id: params.projectId,
      image_url: params.imageUrl,
      preview_url: params.previewUrl || params.imageUrl,
      print_url: params.printUrl || params.imageUrl,
      cloudinary_public_id: params.cloudinaryPublicId || null,
      prompt: params.prompt || null,
    })
    .select("*")
    .single();

  if (error) throw wrapDbError(error);
  return data;
}

export async function listAiVariants(projectId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ai_design_variants")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw wrapDbError(error);
  return data || [];
}
