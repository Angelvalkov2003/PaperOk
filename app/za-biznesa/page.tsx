import Footer from "components/layout/footer";
import { TrustedCompanies } from "components/home/trusted-companies";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { BusinessInquiryForm } from "components/za-biznesa/business-inquiry-form";
import {
  BUSINESS_GRID_CLASS,
  BUSINESS_GRID_REVEAL_CLASS,
  BusinessCard,
  BusinessCardText,
  BusinessCardTitle,
} from "components/za-biznesa/business-card";
import { BusinessProducts } from "components/za-biznesa/business-products";
import { BusinessProjects } from "components/za-biznesa/business-projects";
import { BusinessSamplePrices } from "components/za-biznesa/business-sample-prices";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import type { Metadata } from "next";

const CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

export const metadata: Metadata = {
  title: "За бизнеса",
  description:
    "Корпоративни продукти от семенна хартия — еко рекламни материали и корпоративни подаръци от PaperOK, София.",
};

const paperTypes = [
  {
    name: "Хартия с цветя",
    description: "Семенна хартия с подбрани цветни семена.",
  },
  {
    name: "Хартия с диви цветя",
    description: "Семенна хартия с микс от диворастящи цветя.",
  },
  {
    name: "Хартия с билки",
    description: "Семенна хартия със семена от билки и зелени подправки.",
  },
  {
    name: "Хартия с цветни листенца",
    description: "Семенна хартия с естествени цветни листенца и семена.",
  },
];

const benefits = [
  {
    title: "Продукти, които оставят впечатление",
    description: "Корпоративен подарък и рекламен материал с еко характер.",
  },
  {
    title: "Устойчив избор",
    description: "Рециклирана семенна хартия, която може да се засади.",
  },
  {
    title: "Собствено производство",
    description: "Целият процес е в наши ръце — от хартията до печат.",
  },
  {
    title: "Персонализация",
    description:
      "Печат по готов дизайн на клиента (PDF, AI, PNG или JPEG).",
  },
  {
    title: "Произведено в София",
    description: "Кратки срокове и директна комуникация.",
  },
  {
    title: "Опит с корпоративни клиенти",
    description: "Работим с фирми, агенции, хотели и организатори на събития.",
  },
];

const testimonials = [
  {
    name: "Иван М.",
    company: "Tech Solutions EOOD",
    text: "Поръчахме 300 благодарствени картички за клиенти. Реакцията беше невероятна — всеки пита откъде са.",
  },
  {
    name: "Петя С.",
    company: "Green Beauty BG",
    text: "Етикетите от семенна хартия перфектно допълват нашия еко бранд. Качеството е отлично.",
  },
  {
    name: "Димитър К.",
    company: "Event Pro",
    text: "Работихме по покани за сватба — красиви, оригинални и на достъпна цена. Препоръчвам!",
  },
  {
    name: "Анна В.",
    company: "HR Manager, FinCorp",
    text: "Коледните комплекти за служителите бяха хит. PaperOK ни помогнаха с дизайна и доставката навреме.",
  },
];

export default function ZaBiznesaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-paper-accent-bg via-paper-bg to-paper-section py-16 md:py-24">
        <PaperTexture
          src={PAPER_BACKGROUNDS.petals}
          overlay={PAPER_OVERLAYS.hero}
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="animate-fade-in-up font-heading text-4xl font-bold tracking-tight text-paper-heading sm:text-5xl">
            Корпоративни продукти от семенна хартия
          </h1>
          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-6 max-w-2xl text-lg text-paper-text">
            Еко рекламни материали и корпоративни подаръци, които се засаждат и
            оставят трайно впечатление.
          </p>
        </div>
      </section>

      {/* Какво изработваме */}
      <BusinessProducts />

      {/* Видове хартия */}
      <section className="relative overflow-hidden bg-paper-section py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Видове хартия
            </h2>
          </Reveal>
          <div className={`${BUSINESS_GRID_CLASS} gap-6 sm:grid-cols-2 lg:grid-cols-4`}>
            {paperTypes.map((paper, index) => (
              <Reveal
                key={paper.name}
                delay={index * 80}
                variant="up"
                className={BUSINESS_GRID_REVEAL_CLASS}
              >
                <BusinessCard
                  textureSrc={CARD_BG}
                  textureOverlay={PAPER_OVERLAYS.card}
                  textureSizes="(min-width: 1024px) 25vw, 50vw"
                >
                  <BusinessCardTitle lines={2} className="text-paper-green">
                    {paper.name}
                  </BusinessCardTitle>
                  <BusinessCardText className="min-h-[2.75rem]">
                    {paper.description}
                  </BusinessCardText>
                </BusinessCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BusinessSamplePrices />

      <BusinessProjects />

      {/* Защо PaperOK за бизнеса */}
      <section className="relative overflow-hidden bg-paper-accent-bg py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.fibers}
          overlay={PAPER_OVERLAYS.accent}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Защо PaperOK за бизнеса
            </h2>
          </Reveal>
          <div className={`${BUSINESS_GRID_CLASS} gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
            {benefits.map((b, index) => (
              <Reveal
                key={b.title}
                delay={index * 70}
                variant="up"
                className={BUSINESS_GRID_REVEAL_CLASS}
              >
                <BusinessCard
                  textureSrc={CARD_BG}
                  textureSizes="(min-width: 1024px) 33vw, 50vw"
                  className="border-paper-border/50 shadow-sm"
                >
                  <BusinessCardTitle lines={3} className="text-paper-heading">
                    {b.title}
                  </BusinessCardTitle>
                  <BusinessCardText className="min-h-[3rem]">
                    {b.description}
                  </BusinessCardText>
                </BusinessCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TrustedCompanies />

      {/* Отзиви от бизнес клиенти */}
      <section className="relative overflow-hidden bg-paper-bg py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.plain}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Отзиви от бизнес клиенти
            </h2>
          </Reveal>
          <div className={`${BUSINESS_GRID_CLASS} gap-6 md:grid-cols-2 lg:grid-cols-4`}>
            {testimonials.map((t, index) => (
              <Reveal
                key={t.name}
                delay={index * 80}
                variant="up"
                className={BUSINESS_GRID_REVEAL_CLASS}
              >
                <BusinessCard
                  textureSrc={CARD_BG}
                  textureSizes="(min-width: 1024px) 25vw, 50vw"
                >
                  <blockquote className="flex h-full flex-col">
                    <p className="flex-1 text-sm leading-relaxed text-paper-text">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <footer className="mt-4 border-t border-paper-border pt-4">
                      <cite className="not-italic">
                        <span className="font-semibold text-paper-heading">
                          {t.name}
                        </span>
                        <span className="block text-xs text-paper-muted">
                          {t.company}
                        </span>
                      </cite>
                    </footer>
                  </blockquote>
                </BusinessCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Форма за запитване */}
      <section className="relative overflow-hidden bg-paper-section py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <BusinessInquiryForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
