import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mercaditoapp.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/products/**",
      },
      {
        protocol: "https",
        hostname: "mercaditoapp.s3.amazonaws.com",
        port: "",
        pathname: "/products/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
