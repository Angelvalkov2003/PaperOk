"use client";

import clsx from "clsx";
import { Product } from "lib/types";
import { useState } from "react";

const plantingInstructions = [
  "Намокрете хартията с вода, за да се овлажни равномерно.",
  "Поставете я в саксия или директно в градината.",
  "Покрийте с тънък слой почва — около 1 см.",
  "Поливайте редовно, като поддържате почвата влажна, но не прекалено мокра.",
  "Поставете на светло място при температура около 18–25°C.",
  "След 1–3 седмици ще забележите първите кълнове.",
];

const textClass =
  "font-body text-base font-normal not-italic leading-7 text-paper-text";
const listClass = `list-disc space-y-2 pl-5 ${textClass}`;

type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] };

function stripDecorations(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[^*])\*(?!\s)([^*\n]+)\*/g, "$1$2")
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1$2")
    .trim();
}

function parseDescription(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = stripDecorations(paragraph.join(" "));
    paragraph = [];
    if (!text) return;
    blocks.push({ type: "p", text });
  };

  const isBullet = (line: string) => /^\s*[\*\-•]\s+/.test(line);
  const bulletText = (line: string) =>
    stripDecorations(line.replace(/^\s*[\*\-•]\s+/, ""));
  const isHeading = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || isBullet(trimmed) || trimmed.length > 72) return false;
    if (trimmed.endsWith(":")) return true;
    if (/[.!?]$/.test(trimmed)) return false;
    return trimmed.length <= 48;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (isBullet(line)) {
      flushParagraph();
      const items: string[] = [bulletText(line)];
      while (i + 1 < lines.length && isBullet(lines[i + 1] ?? "")) {
        i += 1;
        items.push(bulletText(lines[i] ?? ""));
      }
      blocks.push({ type: "ul", items: items.filter(Boolean) });
      continue;
    }

    if (isHeading(line) && paragraph.length === 0) {
      const text = stripDecorations(trimmed.replace(/:$/, ""));
      if (text) blocks.push({ type: "h", text });
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return blocks;
}

function DescriptionBody({ text }: { text: string }) {
  const blocks = parseDescription(text);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "h") {
          return (
            <p key={`${block.text}-${index}`} className={`${textClass} pt-1 first:pt-0`}>
              {block.text}
            </p>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className={listClass}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className={textClass}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export function ProductTabs({ product }: { product: Product }) {
  const tabs = [
    { id: "description", label: "Описание" },
    ...(product.plantable
      ? [{ id: "planting", label: "Как се засажда" } as const]
      : []),
    { id: "specs", label: "Характеристики" },
    { id: "shipping", label: "Доставка и плащане" },
  ] as const;

  type TabId = (typeof tabs)[number]["id"];
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div className="mt-8 overflow-hidden rounded-[1.35rem] border border-paper-border/70 bg-paper-surface/80">
      <div className="flex justify-center border-b border-paper-border-strong/60 bg-paper-surface/75 px-4 py-3 sm:px-6">
        <div className="grid w-full max-w-md grid-cols-2 justify-items-center gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "rounded-full px-3 py-2 text-center font-heading text-sm font-semibold tracking-tight transition-colors sm:px-4 sm:text-base",
                activeTab === tab.id
                  ? "bg-paper-white text-paper-heading shadow-sm"
                  : "text-paper-heading/70 hover:bg-paper-white/55 hover:text-paper-heading",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-7">
        {activeTab === "description" &&
          (product.description ? (
            <DescriptionBody text={product.description} />
          ) : (
            <p className={textClass}>
              Продукт от ръчно изработена семенна хартия, създаден с грижа в
              нашата работилница в София.
            </p>
          ))}

        {activeTab === "planting" && product.plantable && (
          <div className="space-y-4">
            <p className={textClass}>
              Семенната хартия е лесна за засаждане. Следвайте тези стъпки:
            </p>
            <ol className={`list-decimal space-y-2 pl-5 ${textClass}`}>
              {plantingInstructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {activeTab === "specs" && (
          <ul className={listClass}>
            <li>Материал: рециклирана семенна хартия</li>
            <li>
              Семена: натурални семена на цветя или билки (съставът може да
              варира според сезона)
            </li>
            <li>Изработка: ръчна, в София, България</li>
            <li>
              Еко: без пластмаса, биоразградима
              {product.plantable ? ", може да се засади" : ""}
            </li>
            {product.variants && product.variants.length > 0 && (
              <li>
                Налични размери:{" "}
                {product.variants
                  .filter((v) => v.enabled)
                  .map((v) => v.name)
                  .join(", ")}
              </li>
            )}
          </ul>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4">
            <p className={textClass}>
              Доставка: доставяме в цяла България чрез Speedy — до офис, автомат
              или адрес. Цената се изчислява автоматично при поръчка.
              Ориентировъчен срок след изпращане: 1–3 работни дни. Изработка:
              обикновено 3–7 работни дни.
            </p>
            <p className={textClass}>Плащане: онлайн с карта или наложен платеж.</p>
            <p className={textClass}>
              Повече информация: вижте страницата{" "}
              <a
                href="/dostavka-i-plashtane"
                className="text-paper-green underline decoration-paper-green/40 underline-offset-2 hover:text-paper-green-hover"
              >
                Доставка и плащане
              </a>
              .
            </p>
            <p className={textClass}>
              Връщане: поради индивидуалния характер на продуктите, връщане не
              се приема, освен при дефект. Свържете се с нас при проблем.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
