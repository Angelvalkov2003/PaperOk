export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 15+ only allows listed qualities on <Image quality={...} />
    qualities: [70, 72, 75, 78, 80, 82, 85, 86, 88, 90, 92, 95, 100],
    // Prefer smaller candidates for product grids on phone/desktop.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 80, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};
