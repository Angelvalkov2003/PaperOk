import { PaperTexture } from "components/ui/paper-texture";
import { Reveal } from "components/ui/reveal";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { Section } from "./section";

const steps = [
  {
    number: "01",
    title: "Използваш продукта",
    description:
      "Подари картичката, бележника или хартията — красиви и с еко послание.",
  },
  {
    number: "02",
    title: "Засаждаш хартията",
    description:
      "След употреба засади хартията в саксия или в градината — където има почва и светлина.",
  },
  {
    number: "03",
    title: "Поливаш",
    description:
      "Навлажни леко и поливай редовно. Дръж на светло място, без силно пряко слънце.",
  },
  {
    number: "04",
    title: "Поникват цветя или билки",
    description:
      "След 1–3 седмици семената поникват — подаръкът продължава да живее.",
  },
];

/** Same seed-paper texture as card 04 for all steps */
const STEP_CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

export function HowItWorks() {
  return (
    <Section
      title="Как работи"
      subtitle="Четири кратки стъпки — от подаръка до живите растения"
      texture="plain"
    >
      <ol className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Reveal
            key={step.number}
            as="li"
            delay={index * 90}
            variant="up"
            className="h-full"
          >
            <div
              className="hover-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-paper-border/70 p-6"
              style={{ boxShadow: "var(--paper-shadow)" }}
            >
              <PaperTexture
                src={STEP_CARD_BG}
                overlay={PAPER_OVERLAYS.cardSoft}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                quality={88}
              />
              {index < steps.length - 1 && (
                <span
                  className="absolute -right-3 top-10 z-10 hidden h-px w-6 bg-paper-border lg:block"
                  aria-hidden
                />
              )}
              <div className="relative z-10 flex h-full flex-col">
                <span className="font-heading text-sm font-semibold tracking-[0.18em] text-paper-green">
                  {step.number}
                </span>
                <h3 className="mt-4 line-clamp-2 min-h-[3.75rem] font-heading text-xl font-semibold leading-snug text-paper-heading">
                  {step.title}
                </h3>
                <p className="mt-3 line-clamp-4 min-h-[6rem] flex-1 text-sm leading-relaxed text-paper-muted">
                  {step.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
