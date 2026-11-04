import { NextRequest, NextResponse } from "next/server";
import {
  AI_IDEA_MAX_CHARS,
  AI_MAX_ATTEMPTS,
  AI_MAX_STYLES,
  AI_STYLES,
  getAiFormat,
  type AiBackOption,
  type AiFormatId,
  type AiStyleId,
} from "lib/ai-design/constants";
import { uploadAiDesignImage } from "lib/ai-design/cloudinary-upload";
import {
  createAiProject,
  getAiProject,
  insertAiVariant,
  listAiVariants,
  updateAiProject,
} from "lib/ai-design/db";
import { generateAiDesignImage } from "lib/ai-design/openai-client";

function isStyleId(value: string): value is AiStyleId {
  return AI_STYLES.some((s) => s.id === value);
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "OpenAI не е конфигуриран" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const sessionId = String(body.sessionId || "").trim();
    const formatId = String(body.formatId || "").trim() as AiFormatId;
    const withFrame = Boolean(body.withFrame);
    const idea = String(body.idea || "").trim();
    const exactText = String(body.exactText || "").trim();
    const stylesRaw = Array.isArray(body.styles) ? body.styles : [];
    const styles = stylesRaw
      .map((s: unknown) => String(s))
      .filter(isStyleId)
      .slice(0, AI_MAX_STYLES);
    let projectId = body.projectId ? String(body.projectId) : "";

    if (!sessionId) {
      return NextResponse.json(
        { error: "Липсва session id" },
        { status: 400 },
      );
    }

    const format = getAiFormat(formatId);
    if (!format) {
      return NextResponse.json(
        { error: "Невалиден формат" },
        { status: 400 },
      );
    }

    if (withFrame && format.framedPrice == null) {
      return NextResponse.json(
        { error: "Рамката е само за A4/A3" },
        { status: 400 },
      );
    }

    if (idea.length < 5) {
      return NextResponse.json(
        { error: "Опишете идеята си (поне няколко думи)" },
        { status: 400 },
      );
    }

    if (idea.length > AI_IDEA_MAX_CHARS) {
      return NextResponse.json(
        { error: `Идеята е твърде дълга (макс. ${AI_IDEA_MAX_CHARS} символа)` },
        { status: 400 },
      );
    }

    const backOption: AiBackOption | null =
      format.kind === "card"
        ? body.backOption === "blank"
          ? "blank"
          : "planting"
        : null;

    if (format.kind === "card" && !backOption) {
      return NextResponse.json(
        { error: "Изберете гръб за картичката" },
        { status: 400 },
      );
    }

    let project = projectId ? await getAiProject(projectId) : null;

    if (!project) {
      project = await createAiProject({
        sessionId,
        formatId,
        withFrame,
        backOption,
        idea,
        styles,
        exactText,
      });
      projectId = project.id;
    } else {
      if (project.session_id !== sessionId) {
        return NextResponse.json(
          { error: "Невалидна сесия за проекта" },
          { status: 403 },
        );
      }
      if (Number(project.attempts_used) >= AI_MAX_ATTEMPTS) {
        return NextResponse.json(
          {
            error: "Използвани са 3 от 3 опита за този дизайн",
            attemptsUsed: AI_MAX_ATTEMPTS,
            projectId,
          },
          { status: 400 },
        );
      }

      project = await updateAiProject(projectId, {
        format: formatId,
        with_frame: withFrame,
        back_option: backOption,
        idea,
        styles,
        exact_text: exactText || null,
      });
    }

    const { b64, prompt } = await generateAiDesignImage({
      idea,
      styles,
      formatId,
    });

    const uploaded = await uploadAiDesignImage({
      base64Png: b64,
      folder: "ecommerce/ai-temp",
    });

    const variant = await insertAiVariant({
      projectId,
      imageUrl: uploaded.url,
      previewUrl: uploaded.url,
      printUrl: uploaded.url,
      cloudinaryPublicId: uploaded.publicId,
      prompt,
    });

    const attemptsUsed = Number(project.attempts_used || 0) + 1;
    await updateAiProject(projectId, {
      attempts_used: attemptsUsed,
      selected_variant_id: variant.id,
    });

    const variants = await listAiVariants(projectId);

    return NextResponse.json({
      projectId,
      attemptsUsed,
      maxAttempts: AI_MAX_ATTEMPTS,
      selectedVariantId: variant.id,
      variants: variants.map((v) => ({
        id: v.id,
        imageUrl: v.image_url,
        previewUrl: v.preview_url || v.image_url,
        printUrl: v.print_url || v.image_url,
        createdAt: v.created_at,
      })),
    });
  } catch (error: any) {
    console.error("AI generate error:", error);
    const message =
      error?.message ||
      error?.error?.message ||
      "Грешка при генериране на дизайна";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
