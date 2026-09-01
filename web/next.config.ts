import type { NextConfig } from 'next';

const config: NextConfig = {
  // Static export: the whole site ships as plain files, so it can be hosted on
  // GitHub Pages, any CDN or a Node server without a runtime.
  output: 'export',
  images: {
    // Images are pre-generated as responsive AVIF/WebP sets by
    // `npm run media`, so Next's on-demand optimizer is not needed.
    unoptimized: true,
  },
  trailingSlash: true,
  productionBrowserSourceMaps: false,
};

export default config;
