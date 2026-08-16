import Image from "next/image";
import Link from "next/link";
import { Reveal } from "components/ui/reveal";
import { Section } from "./section";

const categories = [
  {
    title: "Картички",
    description:
      "Картички от семенна хартия с цветя — за повод, за любимите хора и вдъхновяващи послания.",
    href: "/products?collection=kartichki",
    tone: "from-[#EEF1DF] to-[#F8F5EC]",
    image: "/IMG_9774.JPG",
  },
  {
    title: "Подаръци",
    description:
      "Бележници, календари, сашета и комплекти — готови артикули с еко характер.",
    href: "/products?collection=podaraci",
    tone: "from-[#F8F5EC] to-[#E7EBD8]",
    image: "/IMG_9772.PNG",
  },
  {
    title: "Семенна хартия",
    description:
      "Материал за творчество, подаръци и бизнес проекти — с цветя, билки или листенца.",
    href: "/products?collection=semenna-hartia",
    tone: "from-[#E4EBD6] to-[#EEF1DF]",
    image: "/IMG_9777.JPG",
  },
];

export function CategoryCards() {
  return (
    <Section
      title="Нашите продукти"
      subtitle="Три основни направления — избери категория и разгледай колекциите"
      variant="muted"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {categories.map((cat, index) => (
          <Reveal key={cat.href} delay={index * 100} variant="up">
            <Link
              href={cat.href}
              className="group hover-lift relative flex min-h-[280px] flex-col overflow-hidden rounded-[1.5rem] border border-paper-border/70 bg-paper-white"
              style={{ boxShadow: "var(--paper-shadow)" }}
            >
              <div
                className={`relative h-36 overflow-hidden bg-gradient-to-br ${cat.tone}`}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="img-zoom object-cover"
                  />
                ) : (
                  <span className="absolute left-4 top-4 font-heading text-5xl font-semibold text-paper-heading/10">
                    0{index + 1}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading text-2xl font-semibold text-paper-heading">
                  {cat.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-muted">
                  {cat.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-paper-green transition-colors group-hover:text-paper-green-hover">
                  Разгледай
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
