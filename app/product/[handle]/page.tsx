import { GridTileImage } from "components/grid/tile";
import Footer from "components/layout/footer";
import { Gallery } from "components/product/gallery";
import { BackButton } from "components/product/back-button";
import { ProductDescription } from "components/product/product-description";
import { ProductTabs } from "components/product/product-tabs";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS } from "lib/backgrounds";
import { getProduct, getProducts } from "lib/supabase/products";
import type { Image } from "lib/types";
import { baseUrl } from "lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const featured = product.featuredImage;
  const rawUrl = featured?.url?.trim() || "";
  const isPlaceholder =
    !rawUrl ||
    rawUrl.includes("placeholder") ||
    rawUrl.endsWith(".svg");

  const imageUrl = isPlaceholder
    ? undefined
    : rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `${baseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

  const description =
    product.description?.trim() ||
    `${product.title} — ръчно изработен продукт от семенна хартия от PaperOK.`;

  const ogImages = imageUrl
    ? [
        {
          url: imageUrl,
          width: featured?.width || 1200,
          height: featured?.height || 630,
          alt: featured?.altText || product.title,
        },
      ]
    : undefined;

  return {
    title: product.title,
    description,
    robots: {
      index: product.available,
      follow: product.available,
    },
    alternates: {
      canonical: `${baseUrl}/product/${product.handle}`,
    },
    openGraph: {
      type: "website",
      locale: "bg_BG",
      siteName: "PaperOK",
      title: product.title,
      description,
      url: `${baseUrl}/product/${product.handle}`,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const galleryImages = [
    {
      src: product.featuredImage?.url || "",
      altText: product.featuredImage?.altText || product.title,
    },
    ...(product.images || []).slice(0, 4).map((image: Image) => ({
      src: image.url,
      altText: image.altText || product.title,
    })),
  ].filter((img) => img.src);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url || "",
    offers: {
      "@type": "Offer",
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: "EUR",
      price: product.price,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="relative min-h-screen overflow-hidden bg-paper-bg">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(221,232,204,0.35),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(239,231,219,0.4),_transparent_50%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-(--breakpoint-2xl) px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <BackButton />
          <div
            className="relative flex flex-col overflow-hidden rounded-[1.35rem] border border-paper-border/70 p-8 md:p-12 lg:flex-row lg:gap-8"
            style={{ boxShadow: "var(--paper-shadow)" }}
          >
            <PaperTexture
              src={PAPER_BACKGROUNDS.petalsSoft}
              overlay="rgba(255, 252, 247, 0.82)"
              sizes="(min-width: 1024px) 90vw, 100vw"
              quality={75}
            />
            <div className="animate-fade-in relative z-10 h-full w-full basis-full lg:basis-4/6">
              <Gallery images={galleryImages} />
            </div>

            <div className="animate-fade-in-up animate-delay-100 relative z-10 basis-full lg:basis-2/6">
              <ProductDescription product={product} />
            </div>
          </div>
          <div className="animate-fade-in-up animate-delay-200 relative z-10">
            <ProductTabs product={product} />
          </div>
          <Suspense fallback={null}>
            <RelatedProducts category={product.category} currentId={product.id} />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
}

async function RelatedProducts({
  category,
  currentId,
}: {
  category?: string;
  currentId: string;
}) {
  const relatedProducts = await getProducts({
    collection: category,
    limit: 4,
    excludeId: currentId,
  });

  if (!relatedProducts.length) return null;

  return (
    <div className="relative z-10 py-8">
      <h2 className="mb-4 font-heading text-2xl font-bold text-paper-heading">
        Свързани Продукти
      </h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {relatedProducts.map((product, index) => (
          <li
            key={product.handle}
            className="aspect-square w-full flex-none animate-fade-in-up min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <Link
              className="relative h-full w-full"
              href={`/product/${product.handle}`}
              prefetch={false}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.price.toString(),
                  compareAtAmount: product.compareAtPrice?.toString(),
                  currencyCode: "EUR",
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
