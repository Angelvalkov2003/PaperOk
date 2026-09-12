import Grid from "components/grid";
import { GridTileImage } from "components/grid/tile";
import { Product } from "lib/types";
import Link from "next/link";

export default function ProductGridItems({
  products,
  /** Prefetch images immediately (home featured section). */
  eager = false,
}: {
  products: Product[];
  eager?: boolean;
}) {
  return (
    <>
      {products.map((product, index) => (
        <Grid.Item key={product.handle}>
          <Link
            className="relative inline-block h-full w-full"
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
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
              priority={eager || index < 4}
              loading={eager || index < 4 ? "eager" : "lazy"}
              fetchPriority={eager || index < 4 ? "high" : "auto"}
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
}
