"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { GridTileImage } from "components/grid/tile";
import {
  LOGO_TRANSPARENT,
  LOGO_TRANSPARENT_SIZE,
  SITE_NAME,
} from "lib/constants";
import Image from "next/image";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.35;
const CLICK_ZOOM = 2.5;
const TAP_MOVE_THRESHOLD = 8;
/** Soft minimum so the logo pulse is visible, without feeling stuck. */
const GALLERY_MIN_LOADER_MS = 520;
const GALLERY_IMAGE_SIZES = "(min-width: 1024px) 66vw, 100vw";

type GalleryImage = { src: string; altText: string };

function GalleryLogoLoader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-paper-bg ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Зареждане на снимка"
    >
      <Image
        src={LOGO_TRANSPARENT}
        alt={SITE_NAME}
        width={LOGO_TRANSPARENT_SIZE.width}
        height={LOGO_TRANSPARENT_SIZE.height}
        priority
        className="h-auto w-[42%] max-w-[220px] animate-pulse object-contain opacity-90"
      />
      <span className="sr-only">Зареждане…</span>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function GalleryLightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
}: {
  images: GalleryImage[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{
    startDistance: number;
    startZoom: number;
  } | null>(null);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const current = images[index];

  const setZoomBoth = useCallback((value: number) => {
    const next = clamp(value, MIN_ZOOM, MAX_ZOOM);
    zoomRef.current = next;
    setZoom(next);
    if (next === 1) {
      offsetRef.current = { x: 0, y: 0 };
      setOffset({ x: 0, y: 0 });
    }
    return next;
  }, []);

  const setOffsetBoth = useCallback((value: { x: number; y: number }) => {
    offsetRef.current = value;
    setOffset(value);
  }, []);

  const resetView = useCallback(() => {
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    pinchRef.current = null;
    panRef.current = null;
    setDragging(false);
  }, []);

  useEffect(() => {
    if (open) resetView();
  }, [open, index, resetView]);

  const goToNext = useCallback(() => {
    if (images.length < 2 || zoomRef.current > 1) return;
    onIndexChange((index + 1) % images.length);
  }, [images.length, index, onIndexChange]);

  const goToPrevious = useCallback(() => {
    if (images.length < 2 || zoomRef.current > 1) return;
    onIndexChange(index === 0 ? images.length - 1 : index - 1);
  }, [images.length, index, onIndexChange]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goToNext, goToPrevious, onClose]);

  const onWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoomBoth(Number((zoomRef.current + delta).toFixed(2)));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      if (a && b) {
        pinchRef.current = {
          startDistance: pointerDistance(a, b),
          startZoom: zoomRef.current,
        };
        panRef.current = null;
        setDragging(true);
      }
      return;
    }

    panRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
      moved: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = Array.from(pointersRef.current.values());
      if (!a || !b) return;
      const distance = pointerDistance(a, b);
      const ratio = distance / Math.max(pinchRef.current.startDistance, 1);
      setZoomBoth(pinchRef.current.startZoom * ratio);
      return;
    }

    const pan = panRef.current;
    if (!pan || pan.pointerId !== e.pointerId) return;

    const dx = e.clientX - pan.startX;
    const dy = e.clientY - pan.startY;
    if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD) {
      pan.moved = true;
    }

    if (zoomRef.current > 1) {
      setDragging(true);
      setOffsetBoth({
        x: pan.originX + dx,
        y: pan.originY + dy,
      });
    }
  };

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const wasTap =
      pan &&
      pan.pointerId === e.pointerId &&
      !pan.moved &&
      pointersRef.current.size <= 1 &&
      !pinchRef.current;

    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }

    if (pan?.pointerId === e.pointerId) {
      panRef.current = null;
      setDragging(false);
    }

    if (wasTap) {
      if (zoomRef.current > 1) {
        setZoomBoth(1);
      } else {
        setZoomBoth(CLICK_ZOOM);
      }
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  if (!current) return null;

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-[80]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
        </Transition.Child>

        <div className="fixed inset-0 flex flex-col">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Panel className="relative flex h-full w-full flex-col">
              <Dialog.Title className="sr-only">{current.altText}</Dialog.Title>

              <button
                type="button"
                onClick={onClose}
                aria-label="Затвори"
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-5 sm:top-5"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              {images.length > 1 && zoom <= 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    aria-label="Предишна снимка"
                    className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-sm hover:bg-black/55 sm:left-4 sm:flex"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Следваща снимка"
                    className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-sm hover:bg-black/55 sm:right-4 sm:flex"
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              <div
                className="relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden"
                onWheel={onWheel}
              >
                <div
                  className={`flex max-h-full max-w-full items-center justify-center ${
                    zoom > 1
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-zoom-in"
                  }`}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endPointer}
                  onPointerCancel={endPointer}
                  style={{
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                    transition: dragging ? "none" : "transform 0.2s ease-out",
                    touchAction: "none",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.src}
                    alt={current.altText}
                    draggable={false}
                    className="max-h-[100dvh] max-w-[100vw] select-none object-contain"
                  />
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export function Gallery({
  images,
}: {
  images: GalleryImage[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentReady, setCurrentReady] = useState(false);
  const [minLoaderDone, setMinLoaderDone] = useState(false);
  const [firstImageReady, setFirstImageReady] = useState(false);
  /** How many extra gallery images to warm via hidden Next/Image (starts after first). */
  const [preloadCount, setPreloadCount] = useState(0);
  const loadedSrcsRef = useRef<Set<string>>(new Set());

  const markLoaded = useCallback((src: string) => {
    loadedSrcsRef.current.add(src);
  }, []);

  useEffect(() => {
    setMinLoaderDone(false);
    const timer = window.setTimeout(
      () => setMinLoaderDone(true),
      GALLERY_MIN_LOADER_MS,
    );
    return () => window.clearTimeout(timer);
  }, [images]);

  useEffect(() => {
    const src = images[currentIndex]?.src;
    if (!src) {
      setCurrentReady(false);
      return;
    }
    setCurrentReady(loadedSrcsRef.current.has(src));
  }, [currentIndex, images]);

  // After the first visible image is ready, warm the rest one-by-one (next first).
  useEffect(() => {
    if (!firstImageReady || images.length < 2) return;

    if (preloadCount === 0) {
      setPreloadCount(1);
      return;
    }

    if (preloadCount >= images.length - 1) return;

    const timer = window.setTimeout(() => {
      setPreloadCount((n) => Math.min(n + 1, images.length - 1));
    }, 100);
    return () => window.clearTimeout(timer);
  }, [firstImageReady, preloadCount, images.length]);

  const goToImage = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;

      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 200);
    },
    [currentIndex, isTransitioning],
  );

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    goToImage(nextIndex);
  }, [currentIndex, images.length, goToImage]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToImage(prevIndex);
  }, [currentIndex, images.length, goToImage]);

  useEffect(() => {
    if (lightboxOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      else if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNext, goToPrevious, lightboxOpen]);

  const buttonClassName =
    "h-full px-6 transition-all ease-in-out hover:scale-110 hover:text-paper-heading flex items-center justify-center";

  if (!images.length) return null;

  const current = images[currentIndex]!;
  const showLoader = !(currentReady && minLoaderDone);

  // Preload order: next, next+1, … wrapping around, skipping the first (already shown).
  const preloadQueue =
    images.length > 1
      ? Array.from({ length: images.length - 1 }, (_, i) => {
          const idx = (1 + i) % images.length;
          return images[idx]!;
        })
      : [];

  const onMainLoad = () => {
    markLoaded(current.src);
    setCurrentReady(true);
    setFirstImageReady(true);
  };

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-lg bg-paper-bg">
        <button
          type="button"
          onClick={() => {
            if (showLoader) return;
            setLightboxOpen(true);
          }}
          aria-label="Отвори снимката на цял екран"
          className="relative mx-auto aspect-square w-full max-h-[min(80vh,720px)] max-w-[min(100%,80vh,720px)] cursor-zoom-in overflow-hidden"
        >
          <Image
            key={current.src}
            className={`object-contain transition-opacity duration-300 ${
              showLoader ? "opacity-0" : "opacity-100"
            }`}
            fill
            sizes={GALLERY_IMAGE_SIZES}
            alt={current.altText}
            src={current.src}
            priority
            onLoad={onMainLoad}
            unoptimized={
              current.src.startsWith("/placeholder") ||
              current.src.endsWith(".svg")
            }
          />
          {showLoader ? (
            <GalleryLogoLoader className="absolute inset-0 z-10" />
          ) : null}
        </button>

        {/* Warm Next.js optimized URLs in the same sizes as the main viewer */}
        <div
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
          aria-hidden
        >
          {preloadQueue.slice(0, preloadCount).map((image) => (
            <Image
              key={`preload-${image.src}`}
              src={image.src}
              alt=""
              width={1200}
              height={1200}
              sizes={GALLERY_IMAGE_SIZES}
              onLoad={() => markLoaded(image.src)}
              unoptimized={
                image.src.startsWith("/placeholder") ||
                image.src.endsWith(".svg")
              }
            />
          ))}
        </div>

        {images.length > 1 ? (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-white bg-paper-section/80 text-paper-muted backdrop-blur-sm">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Предишна снимка на продукт"
                className={buttonClassName}
                disabled={isTransitioning || showLoader}
              >
                <ArrowLeftIcon className="h-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-paper-muted" />
              <button
                type="button"
                onClick={goToNext}
                aria-label="Следваща снимка на продукт"
                className={buttonClassName}
                disabled={isTransitioning || showLoader}
              >
                <ArrowRightIcon className="h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="scrollbar-none my-8 flex flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden py-1 lg:mb-0">
          {images.map((image, index) => {
            const isActive = index === currentIndex;

            return (
              <li key={image.src} className="h-20 w-20 shrink-0">
                <button
                  type="button"
                  onClick={() => goToImage(index)}
                  aria-label="Избери снимка на продукт"
                  className={`h-full w-full transition-opacity ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                  disabled={isTransitioning || (showLoader && index === 0)}
                >
                  <GridTileImage
                    alt={image.altText}
                    src={image.src}
                    width={80}
                    height={80}
                    active={isActive}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <GalleryLightbox
        images={images}
        index={currentIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
}
