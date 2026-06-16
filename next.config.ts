import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Static export can't run Next's built-in optimizer, so we delegate to a
    // custom loader that rewrites Sanity CDN URLs to request AVIF/WebP +
    // right-sized images on the fly (see lib/sanity/image-loader.ts). This
    // gives every next/image a responsive srcset of optimized assets at build
    // time; non-Sanity/local URLs pass through untouched. `remotePatterns` is
    // not enforced under a custom loader, so it's no longer needed.
    loader: "custom",
    loaderFile: "./lib/sanity/image-loader.ts",
  },
  ...(isDev && {
    turbopack: {
      rules: {
        "**/*.{tsx,jsx}": {
          loaders: [
            { loader: "@locator/webpack-loader", options: { env: "development" } },
          ],
        },
      },
    },
  }),
};


export default nextConfig;
