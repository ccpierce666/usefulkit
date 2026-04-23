import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const isVercel = process.env.VERCEL === "1";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;"
  : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;";

const nextConfig: NextConfig = {
  distDir: isVercel ? ".next" : ".next-app",
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; ${scriptSrc} connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; img-src 'self' blob: data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; worker-src 'self' blob:; frame-ancestors 'self'; base-uri 'self'; form-action 'self';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
