import {
  getCollectionProducts,
  getStorefrontCollectionByHandle,
} from "lib/supabase/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getStorefrontCollectionByHandle(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.title,
    description: `Продукти от ${collection.title}`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const collection = await getStorefrontCollectionByHandle(params.collection);

  if (!collection) {
    return notFound();
  }

  const products = await getCollectionProducts(params.collection);

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{collection.title}</h1>
        {collection.description && (
          <p className="mt-3 text-lg text-paper-text">
            {collection.description}
          </p>
        )}
        {products.length > 0 && (
          <p className="mt-2 text-paper-text">
            {products.length} {products.length === 1 ? "продукт" : "продукта"}
          </p>
        )}
      </div>
      {products.length === 0 ? (
        <p className="py-3 text-lg">{`Няма намерени продукти в тази колекция`}</p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      )}
    </section>
  );
}
