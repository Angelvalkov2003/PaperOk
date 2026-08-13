import Footer from "components/layout/footer";
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { Breadcrumb } from "components/products/breadcrumb";
import { CategoryMobileNav } from "components/products/category-mobile-nav";
import { CategoryTreeSidebar } from "components/products/category-tree-sidebar";
import { FilterButton } from "components/products/filter-button";
import { SortFilter } from "components/products/sort-filter";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import {
  buildCategoryTree,
  getBreadcrumbPath,
  type FlatCategory,
} from "lib/category-tree";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { getProducts, getStorefrontCollections, getStorefrontCollectionByHandle } from "lib/supabase/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Продукти",
  description: "Разгледайте нашите продукти от семенна хартия — картички, подаръци и още.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    collection?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    categories?: string;
    onSaleOnly?: string;
  }>;
}) {
  const params = await searchParams;
  const collection = params.collection;
  const sort = params.sort as
    | "price-asc"
    | "price-desc"
    | "discount-desc"
    | "name-asc"
    | "newest"
    | undefined;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const categories = params.categories
    ? params.categories.split(",")
    : undefined;
  const onSaleOnly = params.onSaleOnly === "true";

  const [products, collections] = await Promise.all([
    getProducts({
      collection,
      sort: sort || "newest",
      minPrice,
      maxPrice,
      categories,
      onSaleOnly,
    }),
    getStorefrontCollections(),
  ]);

  const flatCategories: FlatCategory[] = collections.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    position: c.position ?? 0,
    parent_id: c.parentId ?? null,
    available: c.available,
  }));

  if (collection) {
    const visible = await getStorefrontCollectionByHandle(collection);
    if (!visible) {
      notFound();
    }
  }

  const categoryTree = buildCategoryTree(flatCategories);
  const breadcrumbPath = collection
    ? getBreadcrumbPath(flatCategories, collection)
    : [];
  const currentCollection = collections.find((c) => c.handle === collection);

  const currentFilters = {
    minPrice,
    maxPrice,
    categories: categories || [],
    onSaleOnly,
  };

  return (
    <>
      <div className="relative z-20 overflow-x-hidden bg-paper-bg">
        <PaperTexture
          src={PAPER_BACKGROUNDS.plain}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={82}
        />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-0 px-4 py-5 text-paper-heading sm:px-5 sm:py-7 lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        {/* Desktop category sidebar */}
        <aside className="hidden w-56 flex-none lg:block lg:w-64">
          <div className="sticky top-4">
            <Reveal variant="left">
              <h2 className="mb-4 font-heading text-lg font-semibold tracking-wide text-paper-heading">
                Категории
              </h2>
              <CategoryTreeSidebar
                tree={categoryTree}
                currentHandle={collection}
              />
            </Reveal>
          </div>
        </aside>

        {/* Main content — full width on mobile */}
        <div className="min-w-0 flex-1 overflow-visible">
          <Reveal variant="fade">
            <Breadcrumb path={breadcrumbPath} />
          </Reveal>

          <Reveal className="mb-4" delay={80}>
            <h1 className="font-heading text-2xl font-bold text-paper-heading sm:text-3xl">
              {currentCollection?.title || "Всички продукти"}
            </h1>
            {currentCollection?.description && (
              <p className="mt-2 text-base text-paper-text sm:mt-3 sm:text-lg">
                {currentCollection.description}
              </p>
            )}
            {products.length > 0 && (
              <p className="mt-2 text-sm text-paper-muted sm:mt-3 sm:text-base">
                {products.length}{" "}
                {products.length === 1 ? "продукт" : "продукта"}
              </p>
            )}
          </Reveal>

          <CategoryMobileNav tree={categoryTree} currentHandle={collection} />

          {/* High z-index so sort/filter panels sit above products and footer */}
          <div className="relative z-50 mb-6 flex flex-row items-center justify-end gap-2 overflow-visible sm:mb-8 sm:gap-3">
            <div className="relative z-50 shrink-0">
              <SortFilter />
            </div>
            <div className="relative z-50 shrink-0">
              <FilterButton
                collections={collections}
                currentFilters={currentFilters}
              />
            </div>
          </div>

          {products.length === 0 ? (
            <p className="py-3 text-lg text-paper-text">
              Няма намерени продукти
            </p>
          ) : (
            <div className="relative z-0">
              <Grid className="grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <ProductGridItems products={products} />
              </Grid>
            </div>
          )}
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
