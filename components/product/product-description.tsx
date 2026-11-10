import { AddToCart } from "components/cart/add-to-cart";
import SalePrice from "components/sale-price";
import { getCatalogFromPrice } from "lib/quantity-pricing";
import { Product } from "lib/types";
import { ProductTrustBadges } from "./product-trust-badges";

export function ProductDescription({ product }: { product: Product }) {
  const hasVariants = (product.variants || []).some((v) => v.enabled);
  const showFrom = Boolean(product.priceTiersEnabled || hasVariants);
  const fromPrice = getCatalogFromPrice(product);

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6">
        <h1 className="mb-4 text-5xl font-medium">{product.title}</h1>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
          {showFrom ? (
            <span className="text-sm font-medium text-paper-muted">от</span>
          ) : null}
          <SalePrice
            amount={fromPrice.toString()}
            compareAtAmount={product.compareAtPrice?.toString()}
            currencyCode="EUR"
            size="large"
          />
        </div>
      </div>
      <AddToCart product={product} />
      <ProductTrustBadges plantable={product.plantable} />
    </>
  );
}
