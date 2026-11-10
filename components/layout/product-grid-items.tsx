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
            prefetch={true}
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
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 50vw"
              quality={72}
              priority={eager || index < 8}
              loading={eager || index < 8 ? "eager" : "lazy"}
              fetchPriority={eager || index < 6 ? "high" : "auto"}
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
}
