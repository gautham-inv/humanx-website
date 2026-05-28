import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      // Sanity CDN host for image asset URLs returned by the insight
      // schema's `image.asset->url` projection. `unoptimized: true` above
      // means Next won't re-encode these — we just need the host allowed
      // so next/image accepts the src.
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
