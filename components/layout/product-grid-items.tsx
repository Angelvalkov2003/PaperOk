import Grid from "components/grid";
import { GridTileImage } from "components/grid/tile";
import { Reveal } from "components/ui/reveal";
import { Product } from "lib/types";
import Link from "next/link";

export default function ProductGridItems({
  products,
}: {
  products: Product[];
}) {
  return (
    <>
      {products.map((product, index) => (
        <Grid.Item key={product.handle}>
          <Reveal
            className="h-full w-full"
            delay={Math.min(index, 7) * 70}
            variant="up"
          >
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
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
              />
            </Link>
          </Reveal>
        </Grid.Item>
      ))}
    </>
  );
}
