import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 允许从 GitHub raw URL 加载图片
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/buxuele/next-js-ideas-app/main/imgs/**",
      },
    ],
  },
  // 确保静态文件可以被访问
  async rewrites() {
    return [
      {
        source: "/imgs/:path*",
        destination: "/imgs/:path*",
      },
    ];
  },
};

export default nextConfig;
