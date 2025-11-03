// next.config.ts
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local dev
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: 'localhost', port: '8888' }, // MAMP común
      { protocol: 'http', hostname: 'wp-headless.test' },

      // WordPress (backend)
      { protocol: 'https', hostname: 'p5marketing.com' },

      // Frontend prod (si llegas a servir imágenes desde aquí)
      { protocol: 'https', hostname: 'courses.p5marketing.com' },

      // Jetpack CDN
      { protocol: 'https', hostname: '**.wp.com' },

      // Azure Blob (si aplica en tus medios)
      { protocol: 'https', hostname: 'sanasanastoragews.blob.core.windows.net' },
    ],
  },

  // Quita el warning de "inferred workspace root"
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
