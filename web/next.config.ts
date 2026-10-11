import type { NextConfig } from "next";

const API_BACKEND = process.env.BLITZYXSC_PLUS_API || "http://localhost:8787";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      // Proxy /api/* and /health to the standalone blitzyxsc-plus API server.
      // In production, deploy the API separately (Vercel/Cloudflare/etc.)
      // and point BLITZYXSC_PLUS_API at the deployed URL.
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${API_BACKEND}/health`,
      },
    ];
  },
};

export default nextConfig;
