import { AiDesignGate, AiDesignUnlocked } from "components/ai-design/ai-design-gate";
import { isAiPreviewAuthenticated } from "lib/ai-design/preview-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Създай картичка или постер с AI",
  description:
    "Персонален дизайн с AI за картички и постери PaperOK — избери формат, генерирай варианти и поръчай печат.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AiDesignPage() {
  const allowed = await isAiPreviewAuthenticated();

  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(221,232,204,0.4),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(239,231,219,0.45),_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        {allowed ? (
          <>
            <div className="mb-8 max-w-2xl">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-700">
                Тестов режим · скрито от менюто
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-paper-heading sm:text-4xl">
                Създай картичка или постер с AI
              </h1>
              <p className="mt-3 text-paper-text">
                До 3 варианта на дизайн. След „Добави в количката“ или с бутона
                „Нов дизайн“ започвате следваща картичка (до 5 дизайна в тази
                сесия).
              </p>
            </div>
            <AiDesignUnlocked />
          </>
        ) : (
          <AiDesignGate />
        )}
      </div>
    </div>
  );
}
