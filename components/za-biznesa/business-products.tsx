import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  IdentificationIcon,
  MegaphoneIcon,
  RectangleStackIcon,
  TagIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { PaperTexture } from "components/ui/paper-texture";
import { Reveal } from "components/ui/reveal";
import {
  BUSINESS_GRID_CLASS,
  BUSINESS_GRID_REVEAL_CLASS,
  BusinessCard,
} from "components/za-biznesa/business-card";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import type { ComponentType, SVGProps } from "react";

const CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const products: { title: string; icon: IconComponent }[] = [
  { title: "Визитки", icon: IdentificationIcon },
  { title: "Картички", icon: RectangleStackIcon },
  { title: "Етикети", icon: TagIcon },
  { title: "Брандирани картички", icon: MegaphoneIcon },
  { title: "Ваучери", icon: TicketIcon },
  { title: "Календари", icon: CalendarDaysIcon },
  { title: "Бележници", icon: BookOpenIcon },
  { title: "Менюта", icon: ClipboardDocumentListIcon },
  { title: "Етикети за дрехи (Hang tags)", icon: BookmarkIcon },
];

function ProductIcon({ icon: Icon }: { icon: IconComponent }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-paper-green/20 bg-paper-accent-bg/60 transition-transform duration-300 group-hover:scale-110">
      <Icon className="h-5 w-5 text-paper-green" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

export function BusinessProducts() {
  return (
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
            Какво изработваме
          </h2>
        </Reveal>
        <div className={`${BUSINESS_GRID_CLASS} gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
          {products.map((product, index) => (
            <Reveal
              key={product.title}
              delay={index * 60}
              variant="up"
              className={BUSINESS_GRID_REVEAL_CLASS}
            >
              <BusinessCard
                textureSrc={CARD_BG}
                textureSizes="(min-width: 1024px) 33vw, 50vw"
                padding="md"
                bodyClassName="justify-center"
                className="group transition-colors hover:border-paper-green/30"
              >
                <div className="flex min-h-[4.75rem] items-center gap-4">
                  <ProductIcon icon={product.icon} />
                  <span className="font-medium leading-snug text-paper-heading">
                    {product.title}
                  </span>
                </div>
              </BusinessCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
