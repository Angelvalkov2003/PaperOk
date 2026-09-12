import { SoftLogoLoader } from "components/ui/soft-logo-loader";

/**
 * Light full-area logo pulse while products data loads.
 * No skeleton grid — content appears as soon as ready.
 */
export function ProductsLoading() {
  return (
    <div
      className="relative flex min-h-[calc(100dvh-5.5rem)] w-full items-center justify-center overflow-hidden bg-paper-bg px-6"
      role="status"
      aria-live="polite"
      aria-label="Зареждане на продукти"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(221,232,204,0.4),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(239,231,219,0.45),_transparent_50%)]"
        aria-hidden
      />
      <SoftLogoLoader size="lg" className="relative z-10 min-h-[180px] w-full max-w-sm bg-transparent" />
    </div>
  );
}

export default ProductsLoading;
