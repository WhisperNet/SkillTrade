import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  webpack: config => {
    config.watchOptions.poll = 300
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
