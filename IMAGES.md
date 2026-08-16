# 车辆真实图片接入方案

本项目目前用品牌占位图（`CarImage` 组件，渐变底色 + 车型名）。接入真实车图有两种方式。

## 方式一：本地图片（推荐）

1. 把每台车的照片放到 `public/cars/{车辆id}/` 目录：

   ```
   public/cars/1/1.jpg     # 燃油车 id=1（对应 data 里 exportHotCars 的 id）
   public/cars/1/2.jpg
   public/cars/ne1/1.jpg   # 新能源车 id=ne1（对应 neCars 的 id）
   ```

2. 运行脚本自动生成映射：

   ```bash
   node scripts/import-images.mjs
   ```

3. 脚本会重写 `src/data/car-images.ts`，把所有图片路径映射进去。
   组件通过 `getCarImages(car)` 自动读取，无需改动页面代码。

## 方式二：远程图片（图床 / CDN）

把图片 URL 直接填进两个地方之一（二选一）：

- `src/data/car-images.ts` 的 `carImages` map；
- 或 `src/data/cars.ts` 每台车的 `images` 数组。

远程域名需要在 `next.config.ts` 的 `images.remotePatterns` 中放行。
已预置：Cloudinary、Unsplash、阿里云 OSS、腾讯云 COS、汽车之家图床、carimagery 等。

## 图片规范建议

- 首图建议 `primary.jpg`，宽高比约 4:3（列表卡片）/ 16:10（详情大图）。
- 建议压缩到单张 ≤ 200KB（可用 WebP），导出站图片多，首屏要快。
- 每台车 3~9 张图（外观/内饰/细节），详情页会展示缩略图。

## 占位图降级逻辑

`CarImage` 组件的渲染优先级：

1. 有真实图且加载成功 → 显示真实图；
2. 真实图加载失败 → 自动降级为品牌渐变占位图（带车型名 + "Photo coming soon"）；
3. 无图 → 直接显示占位图。

这样即使部分图片失效，页面也不会出现破图。
