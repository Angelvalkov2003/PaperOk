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
  AiDbUnavailableError,
  createAiProject,
  getAiProject,
  insertAiVariant,
  listAiVariants,
  updateAiProject,
} from "lib/ai-design/db";
import { generateAiDesignImage } from "lib/ai-design/openai-client";
import { isAiPreviewRequest } from "lib/ai-design/preview-auth";

function isStyleId(value: string): value is AiStyleId {
  return AI_STYLES.some((s) => s.id === value);
}

function newLocalId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAiPreviewRequest(request)) {
      return NextResponse.json(
        { error: "AI дизайнът е в тестов режим. Въведете preview парола." },
        { status: 401 },
      );
    }

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
    const clientAttempts = Math.max(0, Number(body.attemptsUsed) || 0);
    const existingVariants = Array.isArray(body.existingVariants)
      ? body.existingVariants
      : [];

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

    if (clientAttempts >= AI_MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error: "Използвани са 3 от 3 опита за този дизайн",
          attemptsUsed: AI_MAX_ATTEMPTS,
        },
        { status: 400 },
      );
    }

    let dbProject = null as Awaited<ReturnType<typeof getAiProject>> | null;
    let dbAvailable = true;

    if (projectId) {
      try {
        dbProject = await getAiProject(projectId);
        if (dbProject) {
          if (dbProject.session_id !== sessionId) {
            return NextResponse.json(
              { error: "Невалидна сесия за проекта" },
              { status: 403 },
            );
          }
          if (Number(dbProject.attempts_used || 0) >= AI_MAX_ATTEMPTS) {
            return NextResponse.json(
              {
                error: "Използвани са 3 от 3 опита за този дизайн",
                attemptsUsed: AI_MAX_ATTEMPTS,
                projectId,
              },
              { status: 400 },
            );
          }
        }
      } catch (error) {
        if (error instanceof AiDbUnavailableError) {
          dbAvailable = false;
          dbProject = null;
        } else {
          throw error;
        }
      }
    }

    const { b64, prompt } = await generateAiDesignImage({
      idea,
      styles,
      formatId,
      exactText,
    });

    const uploaded = await uploadAiDesignImage({
      base64Png: b64,
      folder: "ecommerce/ai-temp",
    });

    if (dbAvailable) {
      try {
        let project = dbProject;
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
          project = await updateAiProject(projectId, {
            format: formatId,
            with_frame: withFrame,
            back_option: backOption,
            idea,
            styles,
            exact_text: exactText || null,
          });
        }

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
          ephemeral: false,
          variants: variants.map((v) => ({
            id: v.id,
            imageUrl: v.image_url,
            previewUrl: v.preview_url || v.image_url,
            printUrl: v.print_url || v.image_url,
            createdAt: v.created_at,
          })),
        });
      } catch (dbError) {
        if (!(dbError instanceof AiDbUnavailableError)) throw dbError;
        console.warn(
          "AI generate: DB unavailable after image, ephemeral mode",
          dbError.message,
        );
      }
    }

    const variantId = newLocalId("var");
    const ephemeralProjectId = projectId || newLocalId("local");
    const attemptsUsed = clientAttempts + 1;
    const now = new Date().toISOString();
    const nextVariant = {
      id: variantId,
      imageUrl: uploaded.url,
      previewUrl: uploaded.url,
      printUrl: uploaded.url,
      cloudinaryPublicId: uploaded.publicId,
      createdAt: now,
    };

    return NextResponse.json({
      projectId: ephemeralProjectId,
      attemptsUsed,
      maxAttempts: AI_MAX_ATTEMPTS,
      selectedVariantId: variantId,
      ephemeral: true,
      warning:
        "Базата е временно недостъпна или миграцията липсва — дизайнът е в Cloudinary за теста. Изпълнете ai_design_migration.sql когато има връзка.",
      variants: [...existingVariants, nextVariant],
    });
  } catch (error: any) {
    console.error("AI generate error:", error);
    const message =
      error instanceof AiDbUnavailableError
        ? error.message
        : error?.message ||
          error?.error?.message ||
          "Грешка при генериране на дизайна";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
