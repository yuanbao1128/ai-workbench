import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=10, stale-while-revalidate=59',
          },
        ],
      },
    ]
  },
};

export default nextConfig;