"use client";

import clsx from "clsx";
import { Dialog, Transition } from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import LoadingDots from "components/loading-dots";
import Price from "components/price";
import { createUrl } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { redirectToCheckout } from "./actions";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import OpenCart from "./open-cart";

export default function CartModal() {
  const { cart, updateCartItem, cartBump } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const prevBump = useRef(cartBump);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (cartBump > 0 && cartBump !== prevBump.current) {
      prevBump.current = cartBump;
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 700);
      return () => window.clearTimeout(t);
    }
  }, [cartBump]);

  return (
    <>
      <button aria-label="Отвори количка" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} bump={bump} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-paper-border bg-paper-white/80 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-paper-heading backdrop-blur-xl md:w-[390px]">
              <div className="flex shrink-0 items-center justify-between">
                <p className="text-lg font-semibold">Моята Количка</p>
                <button aria-label="Затвори количка" onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {!cart || cart.items.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Вашата количка е празна.
                  </p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-1">
                  <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 [-webkit-overflow-scrolling:touch]">
                    {cart.items
                      .sort((a, b) =>
                        a.product.title.localeCompare(b.product.title),
                      )
                      .map((item, i) => {
                        const productUrl = `/product/${item.product.handle}`;

                        return (
                          <li
                            key={i}
                            className="flex w-full flex-col border-b border-paper-border"
                          >
                            <div className="relative flex w-full min-w-0 flex-row items-start justify-between gap-2 px-1 py-4">
                              <div className="absolute z-40 -ml-1 -mt-2">
                                <DeleteItemButton
                                  item={item}
                                  optimisticUpdate={updateCartItem}
                                />
                              </div>
                              <div className="flex min-w-0 flex-1 flex-row">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-paper-border bg-paper-section">
                                  <Image
                                    className="h-full w-full object-cover"
                                    width={64}
                                    height={64}
                                    alt={item.product.image.altText || item.product.title}
                                    src={item.product.image.url}
                                  />
                                </div>
                                <Link
                                  href={productUrl}
                                  onClick={closeCart}
                                  className="z-30 ml-2 flex min-w-0 flex-1 flex-row"
                                >
                                  <div className="flex min-w-0 flex-1 flex-col text-base">
                                    <span className="leading-tight break-words">
                                      {item.product.title}
                                    </span>
                                    {item.variant.title !== "Стандартен" ? (
                                      <p className="text-sm text-paper-muted break-words">
                                        {item.variant.title}
                                      </p>
                                    ) : null}
                                  </div>
                                </Link>
                              </div>
                              <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch">
                                <Price
                                  className="flex justify-end text-right text-sm"
                                  amount={(item.price * item.quantity).toString()}
                                  currencyCode={cart.currency}
                                />
                                <div className="flex h-9 flex-row items-center rounded-full border border-paper-border">
                                  <EditItemQuantityButton
                                    item={item}
                                    type="minus"
                                    optimisticUpdate={updateCartItem}
                                  />
                                  <p className="w-6 text-center">
                                    <span className="w-full text-sm">
                                      {item.quantity}
                                    </span>
                                  </p>
                                  <EditItemQuantityButton
                                    item={item}
                                    type="plus"
                                    optimisticUpdate={updateCartItem}
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                  <div className="shrink-0 border-t border-paper-border bg-paper-white/90 pt-4">
                    <div className="pb-4 text-sm text-paper-muted">
                      <div className="mb-3 flex items-center justify-between border-b border-paper-border pb-1">
                        <p>Междинна сума</p>
                        <Price
                          className="text-right text-base text-paper-heading"
                          amount={cart.subtotal.toString()}
                          currencyCode={cart.currency}
                        />
                      </div>
                      <div className="mb-3 flex items-center justify-between border-b border-paper-border pb-1 pt-1">
                        <p>Доставка</p>
                        <p className="text-right">Ще се изчисли при плащане</p>
                      </div>
                      <div className="mb-3 flex items-center justify-between border-b border-paper-border pb-1 pt-1">
                        <p>Общо</p>
                        <Price
                          className="text-right text-base text-paper-heading"
                          amount={cart.total.toString()}
                          currencyCode={cart.currency}
                        />
                      </div>
                    </div>
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="btn-primary block w-full rounded-full opacity-90 hover:opacity-100"
                    >
                      Финализирай поръчката
                    </Link>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-paper-border text-paper-heading transition-colors">
      <XMarkIcon
        className={clsx(
          "h-6 transition-all ease-in-out hover:scale-110",
          className,
        )}
      />
    </div>
  );
}

