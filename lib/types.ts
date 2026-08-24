// Base types for the ecommerce application

export type Image = {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
};

export type ProductSizeVariant = {
  id: string;
  name: string;
  price: number;
  description?: string;
  enabled: boolean;
};

export type ProductVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventory?: number;
  available: boolean;
  selectedOptions?: { name: string; value: string }[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: Image;
  images: Image[];
  price: number;
  compareAtPrice?: number;
  category?: string;
  variants: ProductSizeVariant[];
  /** Show planting instructions / plantable badge when true */
  plantable: boolean;
  createdAt: string;
  updatedAt: string;
  available: boolean;
  /** Lower number appears first in listings. */
  position: number;
};

export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    handle: string;
    image: Image;
  };
  variant: {
    id: string;
    title: string;
  };
};

export type Cart = {
  id?: string;
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  total: number;
  currency: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  parentId?: string | null;
  position?: number;
  available?: boolean;
  updatedAt: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: Image;
  images: Image[];
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  currency: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
};
