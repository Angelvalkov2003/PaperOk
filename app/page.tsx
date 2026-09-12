import { Suspense } from "react";
import Footer from "components/layout/footer";
import { AboutUs } from "components/home/about-us";
import { CategoryCards } from "components/home/category-cards";
import { FAQ } from "components/home/faq";
import { FeaturedProducts } from "components/home/featured-products";
import { Hero } from "components/home/hero";
import { HowItWorks } from "components/home/how-it-works";
import { Testimonials } from "components/home/testimonials";
import { TrustedCompanies } from "components/home/trusted-companies";
import { WhyPaperOK } from "components/home/why-paperok";
import { SITE_TAGLINE, LOGO_WITH_BACKGROUND, LOGO_WITH_BACKGROUND_SIZE } from "lib/constants";

/** Allow ISR/PPR — products still refresh via admin revalidatePath. */
export const revalidate = 60;

export const metadata = {
  title: "PaperOK — Подаръци, които разцъфват",
  description: SITE_TAGLINE,
  openGraph: {
    type: "website",
    title: "PaperOK — Подаръци, които разцъфват",
    description: SITE_TAGLINE,
    images: [
      {
        url: LOGO_WITH_BACKGROUND,
        width: LOGO_WITH_BACKGROUND_SIZE.width,
        height: LOGO_WITH_BACKGROUND_SIZE.height,
        alt: "PaperOK",
      },
    ],
  },
};

function FeaturedProductsFallback() {
  return (
    <section className="bg-paper-section/40 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 h-8 w-48 animate-pulse rounded-lg bg-paper-border/50" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-paper-border/40"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryCards />
      <HowItWorks />
      <Suspense fallback={<FeaturedProductsFallback />}>
        <FeaturedProducts />
      </Suspense>
      <WhyPaperOK />
      <Testimonials />
      <AboutUs />
      <TrustedCompanies />
      <FAQ />
      <Footer />
    </>
  );
}
