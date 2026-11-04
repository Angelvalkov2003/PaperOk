import { AiDesignStudio } from "components/ai-design/ai-design-studio";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Създай картичка или постер с AI",
  description:
    "Персонален дизайн с AI за картички и постери PaperOK — избери формат, генерирай варианти и поръчай печат.",
};

export default function AiDesignPage() {
  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(221,232,204,0.4),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(239,231,219,0.45),_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-paper-heading sm:text-4xl">
            Създай картичка или постер с AI
          </h1>
          <p className="mt-3 text-paper-text">
            Опиши идеята си, избери формат и стил, генерирай до 3 варианта и
            добави избрания дизайн в количката за печат.
          </p>
          <p className="mt-2 text-sm text-paper-muted">
            Без поръчка временните файлове се изтриват автоматично. С поръчка
            дизайнът се пази за печат.
          </p>
        </div>
        <AiDesignStudio />
      </div>
    </div>
  );
}
