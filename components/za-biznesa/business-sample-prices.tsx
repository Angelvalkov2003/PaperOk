import { PaperTexture } from "components/ui/paper-texture";
import { Reveal } from "components/ui/reveal";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { formatPrice } from "lib/utils";

const CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

const QUANTITY_TIERS = [
  { id: "100-199", label: "100–199 бр." },
  { id: "200-499", label: "200–499 бр." },
  { id: "500-999", label: "500–999 бр." },
  { id: "1000+", label: "1000+ бр." },
] as const;

const SAMPLE_PRICES_BY_SIZE = [
  { size: "56×50 мм", prices: [0.31, 0.28, 0.25, 0.22] },
  { size: "50×70 мм", prices: [0.38, 0.35, 0.32, 0.29] },
  { size: "70×65 мм", prices: [0.45, 0.4, 0.37, 0.33] },
  { size: "90×50 мм", prices: [0.51, 0.46, 0.42, 0.38] },
  { size: "65×95 мм", prices: [0.6, 0.54, 0.49, 0.44] },
  { size: "100×95 мм", prices: [0.89, 0.81, 0.73, 0.66] },
  { size: "143×65 мм", prices: [0.89, 0.81, 0.73, 0.66] },
  { size: "100×143 мм", prices: [1.34, 1.21, 1.1, 0.99] },
  { size: "120×120 мм", prices: [1.79, 1.62, 1.46, 1.32] },
] as const;

function unitPrice(value: number) {
  return formatPrice(value);
}

export function BusinessSamplePrices() {
  return (
    <section className="relative overflow-hidden bg-paper-section py-16 md:py-20">
      <PaperTexture
        src={PAPER_BACKGROUNDS.seeds}
        overlay={PAPER_OVERLAYS.section}
        sizes="100vw"
        quality={85}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-heading mb-4 text-center text-3xl font-bold text-paper-heading">
            Примерни цени
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed text-paper-muted sm:text-base">
            Ориентировъчни цени с включен ДДС. Посочените цени са за 1 бр. За
            точна оферта попълнете формата по-долу.
          </p>
        </Reveal>

        <Reveal delay={100} variant="up">
          <div className="relative overflow-hidden rounded-xl border border-paper-border">
            <PaperTexture
              src={CARD_BG}
              overlay={PAPER_OVERLAYS.white}
              sizes="(min-width: 768px) 72rem, 100vw"
              quality={80}
            />

            <div className="relative z-10">
              <p className="px-4 pt-3 text-xs text-paper-muted md:hidden">
                Плъзнете таблицата надясно, за да видите всички колони →
              </p>

              <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-[38rem] border-collapse text-left text-sm sm:min-w-[44rem] sm:text-base">
                  <caption className="sr-only">
                    Примерни цени за 1 бр. според размер и количество
                  </caption>
                  <thead>
                    <tr className="bg-paper-green text-white">
                      <th
                        scope="col"
                        className="sticky left-0 z-20 min-w-[6.5rem] bg-paper-green px-3 py-3 font-semibold sm:min-w-[7.5rem] sm:px-4"
                      >
                        Размер
                      </th>
                      {QUANTITY_TIERS.map((tier) => (
                        <th
                          key={tier.id}
                          scope="col"
                          className="whitespace-nowrap px-3 py-3 text-center font-semibold sm:px-4"
                        >
                          {tier.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-border">
                    {SAMPLE_PRICES_BY_SIZE.map((row) => (
                      <tr key={row.size} className="bg-paper-white/70">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 min-w-[6.5rem] bg-paper-white/95 px-3 py-3.5 font-medium text-paper-heading backdrop-blur-sm sm:min-w-[7.5rem] sm:px-4"
                        >
                          {row.size}
                        </th>
                        {row.prices.map((price, index) => (
                          <td
                            key={`${row.size}-${QUANTITY_TIERS[index]?.id}`}
                            className="whitespace-nowrap px-3 py-3.5 text-center font-medium text-paper-green sm:px-4"
                          >
                            {unitPrice(price)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-paper-text sm:text-base">
            За нестандартни размери, корпоративни поръчки или индивидуални
            проекти попълнете формата по-долу, за да получите индивидуална
            оферта.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
