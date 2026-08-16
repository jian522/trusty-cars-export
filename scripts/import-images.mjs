// 图片接入脚本：扫描 public/cars/{车辆id}/ 目录，自动生成 src/data/car-images.ts。
//
// 用法：
//   1. 把每台车的照片放到 public/cars/{车辆id}/ 下，例如：
//        public/cars/1/1.jpg   (燃油车 id=1)
//        public/cars/ne1/1.jpg (新能源车 id=ne1)
//   2. 运行：node scripts/import-images.mjs
//   3. 脚本会重写 src/data/car-images.ts，按 id 生成图片路径映射。
//
import { readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const CARS_DIR = join(ROOT, "public", "cars");
const OUT_FILE = join(ROOT, "src", "data", "car-images.ts");

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function isImage(name) {
  const lower = name.toLowerCase();
  return IMAGE_EXTS.some((ext) => lower.endsWith(ext));
}

function main() {
  if (!existsSync(CARS_DIR)) {
    console.log(`未找到图片目录 ${CARS_DIR}，已创建空目录。`);
    mkdirSync(CARS_DIR, { recursive: true });
  }

  const map = {};
  for (const id of readdirSync(CARS_DIR)) {
    const dir = join(CARS_DIR, id);
    try {
      const files = readdirSync(dir)
        .filter(isImage)
        .sort()
        .map((f) => `/cars/${id}/${f}`);
      if (files.length > 0) {
        map[id] = files;
      }
    } catch {
      // 不是目录则跳过
    }
  }

  const ids = Object.keys(map);
  const entries = ids
    .map((id) => `  ${JSON.stringify(id)}: ${JSON.stringify(map[id])},`)
    .join("\n");

  const content = `// 本文件由 scripts/import-images.mjs 自动生成，请勿手动编辑。
// 车辆真实图片映射：{ 车辆id: ["图片路径", ...] }
export const carImages: Record<string, string[]> = {
${entries}
};

import type { Car } from "@/data/cars";

/** 合并数据内置图片与本表图片，返回某台车的完整图片列表。 */
export function getCarImages(car: Car): string[] {
  const extra = carImages[car.id];
  if (extra && extra.length > 0) {
    return extra;
  }
  return car.images;
}
`;

  writeFileSync(OUT_FILE, content, "utf8");
  console.log(`已生成 ${OUT_FILE}，共 ${ids.length} 台车、${Object.values(map).flat().length} 张图片。`);
}

main();
