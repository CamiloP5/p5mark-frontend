import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' }, // MAMP
      { protocol: 'http', hostname: 'wp-headless.test' },
      { protocol: 'https', hostname: '**.wp.com' }, // Jetpack/CDN opcional
    ],
  },
};

export default nextConfig;
