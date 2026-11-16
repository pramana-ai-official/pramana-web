import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't announce the framework in every response.
  poweredByHeader: false,
  // Serve the three product screens as AVIF where the browser can show it, WebP otherwise.
  images: { formats: ["image/avif", "image/webp"] },
  // Basic protection headers on every response.
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
