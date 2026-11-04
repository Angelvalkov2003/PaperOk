import { createServiceClient } from "lib/supabase/service";
import type { AiBackOption, AiFormatId, AiStyleId } from "./constants";

const TEMP_TTL_MINUTES = 45;

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

  if (error) throw new Error(error.message);
  return data;
}

export async function getAiProject(projectId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ai_design_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
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

  if (error) throw new Error(error.message);
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

  if (error) throw new Error(error.message);
  return data;
}

export async function listAiVariants(projectId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ai_design_variants")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}
