import { AiDesignBanner } from "components/ai-design/ai-design-banner";
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
        <AiDesignBanner />
        <AiDesignStudio />
      </div>
    </div>
  );
}
