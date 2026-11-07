import { getStorefrontCollections, getProducts } from "lib/supabase/products";
import { baseUrl } from "lib/utils";
import { MetadataRoute } from "next";

type Route = {
  url: string;
  lastModified: string;
};

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routesMap = [
    "",
    "/products",
    "/ai-design",
    "/contact",
    "/dostavka-i-plashtane",
    "/privacy-policy",
    "/za-biznesa",
    "/blog",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  const collectionsPromise = getStorefrontCollections().then((collections) =>
    collections.map((collection) => ({
      url: `${baseUrl}/search/${collection.handle}`,
      lastModified: collection.updatedAt,
    })),
  );

  const productsPromise = getProducts({}).then((products) =>
    products.map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: product.updatedAt,
    })),
  );

  let fetchedRoutes: Route[] = [];

  try {
    fetchedRoutes = (
      await Promise.all([collectionsPromise, productsPromise])
    ).flat();
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return routesMap;
  }

  return [...routesMap, ...fetchedRoutes];
}
