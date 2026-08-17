import type { Metadata } from "next";
import Link from "next/link";
import Footer from "components/layout/footer";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { CONTACT_EMAIL, SITE_NAME } from "lib/constants";

export const metadata: Metadata = {
  title: "Доставка и плащане",
  description:
    "Информация за доставка със Speedy, срокове и начини на плащане в PaperOK.",
};

export default function ShippingPaymentPage() {
  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-paper-bg py-12 px-4 sm:px-6 lg:px-8">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-paper-green">
              {SITE_NAME}
            </p>
            <h1 className="font-heading mb-4 text-4xl font-bold text-paper-heading">
              Доставка и плащане
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-paper-text">
              Доставяме в цяла България чрез Speedy. При завършване на поръчката
              избирате населено място, офис, автомат или адрес, а цената на
              доставката се изчислява автоматично според избора ви.
            </p>
          </Reveal>

          <div className="space-y-8">
            <Reveal delay={40}>
            <section className="hover-lift rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Доставка чрез Speedy
              </h2>
              <p className="leading-relaxed text-paper-text">
                Работим с куриерска компания Speedy. След като поръчката ви е
                готова за изпращане, пратката се предава на Speedy и можете да я
                проследите с предоставения номер за пратка.
              </p>
            </section>
            </Reveal>

            <Reveal delay={80}>
            <section className="hover-lift rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Начини на доставка
              </h2>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed text-paper-text">
                <li>
                  <strong className="text-paper-heading">До офис на Speedy</strong>{" "}
                  — избирате населено място и конкретен офис от списъка.
                </li>
                <li>
                  <strong className="text-paper-heading">
                    До автомат (APT) на Speedy
                  </strong>{" "}
                  — удобно вземане от автомат в избраното населено място.
                </li>
                <li>
                  <strong className="text-paper-heading">До адрес</strong> — въвеждате
                  пълен адрес за доставка (улица, номер, вход, етаж, апартамент и
                  др.).
                </li>
              </ul>
              <p className="mt-4 leading-relaxed text-paper-text">
                Цената не е фиксирана ръчно — изчислява се автоматично чрез
                Speedy според населеното място, типа доставка и параметрите на
                пратката. Крайната сума на поръчката се обновява при избора.
              </p>
            </section>
            </Reveal>

            <Reveal delay={120}>
            <section className="hover-lift rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Срокове
              </h2>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed text-paper-text">
                <li>
                  <strong className="text-paper-heading">Изработка:</strong> обикновено
                  1–2 работни дни (персоналните поръчки могат да отнемат повече
                  време).
                </li>
                <li>
                  <strong className="text-paper-heading">Доставка със Speedy:</strong>{" "}
                  ориентировъчно 1–2 работни дни след предаване на пратката на
                  куриера, в зависимост от населеното място.
                </li>
              </ul>
            </section>
            </Reveal>

            <Reveal delay={160}>
            <section className="hover-lift rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Начини на плащане
              </h2>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed text-paper-text">
                <li>
                  <strong className="text-paper-heading">Онлайн с карта</strong> —
                  сигурно плащане чрез Stripe.
                </li>
                <li>
                  <strong className="text-paper-heading">Наложен платеж</strong> —
                  плащате при получаване на пратката.
                </li>
              </ul>
            </section>
            </Reveal>

            <Reveal delay={200}>
            <section className="hover-lift rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Потвърждения
              </h2>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed text-paper-text">
                <li>
                  След успешно завършване на поръчката получавате потвърждение
                  по имейл.
                </li>
                <li>
                  Когато пратката бъде предадена на Speedy, ще ви уведомим за
                  изпращането.
                </li>
              </ul>
              <p className="mt-4 leading-relaxed text-paper-text">
                Въпроси? Пишете ни на{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-paper-green underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                или през{" "}
                <Link href="/contact" className="text-paper-green underline">
                  контактната форма
                </Link>
                .
              </p>
            </section>
            </Reveal>
          </div>

          <Reveal className="mt-10 flex flex-wrap gap-4" delay={240}>
            <Link href="/checkout" className="btn-primary">
              Към поръчката
            </Link>
            <Link href="/products" className="btn-outline">
              Към продуктите
            </Link>
          </Reveal>
        </div>
      </div>
      <Footer />
    </>
  );
}
