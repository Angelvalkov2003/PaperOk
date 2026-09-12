import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import { getCatalogFromPrice } from "lib/quantity-pricing";
import { Product } from "lib/types";
import { ProductTrustBadges } from "./product-trust-badges";

export function ProductDescription({ product }: { product: Product }) {
  const enabledVariants = (product.variants || []).filter((v) => v.enabled);
  const showBasePrice = enabledVariants.length === 0;
  const fromPrice = getCatalogFromPrice(product);

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        {showBasePrice && (
          <div className="mr-auto w-auto rounded-full bg-paper-section p-2 text-sm text-paper-heading">
            {product.compareAtPrice &&
            product.compareAtPrice > product.price &&
            !product.priceTiersEnabled ? (
              <div className="flex items-center gap-2">
                <span className="text-red-600 line-through">
                  <Price
                    amount={product.compareAtPrice.toString()}
                    currencyCode="EUR"
                  />
                </span>
                <Price amount={product.price.toString()} currencyCode="EUR" />
              </div>
            ) : product.priceTiersEnabled ? (
              <span>
                от <Price amount={fromPrice.toString()} currencyCode="EUR" />
              </span>
            ) : (
              <Price amount={product.price.toString()} currencyCode="EUR" />
            )}
          </div>
        )}
        {!showBasePrice && (
          <p className="text-sm text-paper-muted">
            от <Price amount={fromPrice.toString()} currencyCode="EUR" />
          </p>
        )}
      </div>
      <AddToCart product={product} />
      <ProductTrustBadges plantable={product.plantable} />
    </>
  );
}
