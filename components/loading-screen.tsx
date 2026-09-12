import Image from "next/image";
import {
  LOGO_TRANSPARENT,
  LOGO_TRANSPARENT_SIZE,
  SITE_NAME,
} from "lib/constants";

/**
 * Lightweight cream loading screen with PaperOK logo.
 * Avoids fetching full-bleed textures during route transitions.
 */
export default function LoadingScreen() {
  return (
    <div
      className="relative flex min-h-[calc(100dvh-5.5rem)] w-full flex-col items-center justify-center overflow-hidden bg-paper-bg px-6"
      role="status"
      aria-live="polite"
      aria-label="Зареждане"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(221,232,204,0.45),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(239,231,219,0.5),_transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center">
        <Image
          src={LOGO_TRANSPARENT}
          alt={SITE_NAME}
          width={LOGO_TRANSPARENT_SIZE.width}
          height={LOGO_TRANSPARENT_SIZE.height}
          priority
          className="h-auto w-full max-w-[280px] animate-pulse object-contain sm:max-w-[360px] md:max-w-[420px]"
        />
        <span className="sr-only">Зареждане…</span>
      </div>
    </div>
  );
}
