import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    instantInsights: {
      validationLevel: 'manual-warning',
    },
    // Prevent transient .next/lock removal from racing with Vercel output/cache tracing
    lockDistDir: !process.env.VERCEL && !process.env.CI,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
