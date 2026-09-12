"use client";

import type {
  Cart,
  CartItem,
  PriceTier,
  Product,
  ProductVariant,
} from "lib/types";
import {
  getEffectiveQuantityPricing,
  getMinOrderQuantity,
  normalizePriceTiers,
  resolveUnitPrice,
} from "lib/quantity-pricing";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type UpdateType = "plus" | "minus" | "delete";

type CartContextType = {
  cart: Cart | null;
  updateCartItem: (itemId: string, updateType: UpdateType) => void;
  addCartItem: (
    variant: ProductVariant,
    product: Product,
    quantity?: number,
  ) => void;
  clearCart: () => void;
  /** Increments when an item is added — use to trigger cart icon animation */
  cartBump: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function unitPriceForCartItem(
  item: Pick<
    CartItem,
    "basePrice" | "price" | "priceTiersEnabled" | "priceTiers" | "quantity"
  >,
  quantity: number,
): number | null {
  const base = item.basePrice ?? item.price;
  const resolved = resolveUnitPrice(
    base,
    {
      minQuantityEnabled: false,
      minQuantity: 1,
      priceTiersEnabled: Boolean(item.priceTiersEnabled),
      priceTiers: normalizePriceTiers(item.priceTiers || []),
    },
    quantity,
  );
  return resolved.onInquiry ? null : resolved.unitPrice;
}

function updateCartItemQuantity(
  item: CartItem,
  updateType: UpdateType,
): CartItem | null {
  if (updateType === "delete") return null;

  const minQty = Math.max(1, item.minQuantity || 1);
  const nextQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;

  if (nextQuantity < minQty) return null;

  const unitPrice = unitPriceForCartItem(item, nextQuantity);
  if (unitPrice == null) {
    // Inquiry band — do not allow increasing into it from cart
    if (updateType === "plus") return item;
    return null;
  }

  return {
    ...item,
    quantity: nextQuantity,
    price: unitPrice,
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  addQuantity: number,
): CartItem | null {
  const selectedVariant =
    (product.variants || []).find((v) => v.id === variant.id && v.enabled) ||
    null;
  const pricing = getEffectiveQuantityPricing(product, selectedVariant);
  const minQuantity = getMinOrderQuantity(pricing);
  const quantity = existingItem
    ? existingItem.quantity + Math.max(1, addQuantity)
    : Math.max(minQuantity, addQuantity);
  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const resolved = resolveUnitPrice(basePrice, pricing, quantity);

  if (resolved.onInquiry || resolved.unitPrice == null) {
    return existingItem || null;
  }

  return {
    id: existingItem?.id || `${product.id}-${variant.id}`,
    productId: product.id,
    variantId: variant.id,
    quantity,
    price: resolved.unitPrice,
    minQuantity,
    basePrice,
    priceTiersEnabled: pricing.priceTiersEnabled,
    priceTiers: pricing.priceTiers as PriceTier[],
    product: {
      id: product.id,
      title: product.title,
      handle: product.handle,
      image: product.featuredImage,
    },
    variant: {
      id: variant.id,
      title: variant.title || "Default",
    },
  };
}

function updateCartTotals(
  items: CartItem[],
): Pick<Cart, "totalQuantity" | "subtotal" | "total"> {
  const validItems = items.filter(
    (item): item is CartItem =>
      item !== null &&
      item !== undefined &&
      typeof item.quantity === "number" &&
      typeof item.price === "number",
  );

  const totalQuantity = validItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );
  const subtotal = validItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0,
  );

  return {
    totalQuantity,
    subtotal,
    total: subtotal,
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    items: [],
    totalQuantity: 0,
    subtotal: 0,
    total: 0,
    currency: "EUR",
  };
}

const CART_STORAGE_KEY = "ecommerce_cart";

function loadCartFromStorage(): Cart {
  if (typeof window === "undefined") {
    return createEmptyCart();
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      const validItems = (parsed.items || [])
        .filter(
          (item: any): item is CartItem =>
            item !== null &&
            item !== undefined &&
            typeof item.id === "string" &&
            typeof item.quantity === "number" &&
            typeof item.price === "number" &&
            item.quantity > 0,
        )
        .map((item: CartItem) => {
          const minQuantity = Math.max(1, item.minQuantity || 1);
          const quantity = Math.max(minQuantity, item.quantity);
          const unitPrice = unitPriceForCartItem(item, quantity);
          return {
            ...item,
            minQuantity,
            quantity,
            price: unitPrice ?? item.price,
            priceTiers: normalizePriceTiers(item.priceTiers || []),
          };
        });

      return {
        ...parsed,
        ...updateCartTotals(validItems),
        items: validItems,
        currency: parsed.currency || "EUR",
      };
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }

  return createEmptyCart();
}

function saveCartToStorage(cart: Cart | null) {
  if (typeof window === "undefined") return;

  try {
    if (cart && cart.items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartBump, setCartBump] = useState(0);

  useEffect(() => {
    setCart(loadCartFromStorage());
  }, []);

  useEffect(() => {
    if (cart) {
      saveCartToStorage(cart);
    }
  }, [cart]);

  const updateCartItem = (itemId: string, updateType: UpdateType) => {
    setCart((currentCart) => {
      if (!currentCart || !currentCart.items) return currentCart;

      const validItems = currentCart.items.filter(
        (item): item is CartItem =>
          item !== null && item !== undefined && item.id !== undefined,
      );

      const updatedItems = validItems
        .map((item) => {
          if (item.id === itemId) {
            return updateCartItemQuantity(item, updateType);
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null && item !== undefined);

      if (updatedItems.length === 0) {
        return {
          ...currentCart,
          items: [],
          totalQuantity: 0,
          subtotal: 0,
          total: 0,
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedItems),
        items: updatedItems,
      };
    });
  };

  const addCartItem = (
    variant: ProductVariant,
    product: Product,
    quantity = 1,
  ) => {
    setCart((currentCart) => {
      const cart = currentCart || createEmptyCart();

      const validItems = (cart.items || []).filter(
        (item): item is CartItem =>
          item !== null && item !== undefined && item.id !== undefined,
      );

      const existingItem = validItems.find(
        (item) => item.variantId === variant.id,
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        quantity,
      );

      if (!updatedItem) {
        return cart;
      }

      const updatedItems = existingItem
        ? validItems.map((item) =>
            item.variantId === variant.id ? updatedItem : item,
          )
        : [...validItems, updatedItem];

      return {
        ...cart,
        ...updateCartTotals(updatedItems),
        items: updatedItems,
      };
    });
    setCartBump((n) => n + 1);
  };

  const clearCart = () => {
    setCart(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, updateCartItem, addCartItem, clearCart, cartBump }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
