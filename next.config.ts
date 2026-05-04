import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'davegavigan.com' },
      { protocol: 'https', hostname: 'www.davegavigan.com' },
    ],
  },
};

export default nextConfig;
