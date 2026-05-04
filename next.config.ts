// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  // Allow NextAuth API routes
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ]
  },
}

export default nextConfig