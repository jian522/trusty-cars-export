import type { NextConfig } from "next";

// 静态导出（GitHub Pages）时置为 true：EXPORT_STATIC=true npm run build
const isExport = process.env.EXPORT_STATIC === "true";
// 部署子路径（GitHub Pages 用 /trusty-cars-export；Vercel 根路径不设）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isExport ? "/trusty-cars-export" : "");

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  // GitHub Pages 部署在子路径下
  basePath,
  images: {
    // 静态导出无图片优化服务，原样输出
    unoptimized: isExport,
    // 允许加载的远程车图源（接入真实图片时使用）。
    // 本地图片放 public/cars/ 下则无需任何配置。
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.oss-cn-*.aliyuncs.com" },
      { protocol: "https", hostname: "*.myqcloud.com" },
      { protocol: "https", hostname: "2sc2.autoimg.cn" },
      { protocol: "https", hostname: "carimages.com" },
      { protocol: "https", hostname: "*.carimagery.com" },
    ],
  },
};

export default nextConfig;
