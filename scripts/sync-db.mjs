// 把数据库中的车辆数据同步回 src/data/cars.ts（供静态站点重新构建）。
//
// 用法：node scripts/sync-db.mjs
// 场景：在后台管理页增删改车辆后，运行本脚本把改动写回静态数据，
//       再 `npm run build` 部署，即可让公开站点反映最新库存。
//
import { DatabaseSync } from "node:sqlite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DB = resolve(ROOT, "data", "trusty.db");
const DATA = resolve(ROOT, "src", "data", "cars.ts");

const db = new DatabaseSync(DB);

function toCar(row) {
  return {
    id: String(row.id),
    brand: String(row.brand),
    model: String(row.model),
    year: Number(row.year),
    price: Number(row.price),
    priceUSD: Number(row.priceUSD),
    mileage: String(row.mileage ?? ""),
    transmission: String(row.transmission ?? ""),
    fuelType: String(row.fuelType ?? ""),
    emission: String(row.emission ?? ""),
    color: String(row.color ?? ""),
    location: String(row.location ?? ""),
    images: JSON.parse(String(row.images ?? "[]")),
    description: String(row.description ?? ""),
    descriptionEn: String(row.descriptionEn ?? ""),
    exportCountries: JSON.parse(String(row.exportCountries ?? "[]")),
    featured: Number(row.featured) === 1,
    battery: row.battery ? String(row.battery) : null,
    range: row.range ? String(row.range) : null,
  };
}

function formatCar(c) {
  const fields = [
    `id: ${JSON.stringify(c.id)}`,
    `brand: ${JSON.stringify(c.brand)}`,
    `model: ${JSON.stringify(c.model)}`,
    `year: ${c.year}`,
    `price: ${c.price}`,
    `priceUSD: ${c.priceUSD}`,
    `mileage: ${JSON.stringify(c.mileage)}`,
    `transmission: ${JSON.stringify(c.transmission)}`,
    `fuelType: ${JSON.stringify(c.fuelType)}`,
    `emission: ${JSON.stringify(c.emission)}`,
    `color: ${JSON.stringify(c.color)}`,
    `location: ${JSON.stringify(c.location)}`,
    `images: ${JSON.stringify(c.images)}`,
    `description: ${JSON.stringify(c.description)}`,
    `descriptionEn: ${JSON.stringify(c.descriptionEn)}`,
    `exportCountries: ${JSON.stringify(c.exportCountries)}`,
    `featured: ${c.featured}`,
  ];
  if (c.battery) fields.push(`battery: ${JSON.stringify(c.battery)}`);
  if (c.range) fields.push(`range: ${JSON.stringify(c.range)}`);
  return `  { ${fields.join(", ")} }`;
}

const fuel = db
  .prepare("SELECT * FROM cars WHERE type = 'fuel' ORDER BY CAST(id AS INTEGER)")
  .all()
  .map(toCar);
const ne = db
  .prepare("SELECT * FROM cars WHERE type = 'ne' ORDER BY id")
  .all()
  .map(toCar);

let src = readFileSync(DATA, "utf8");

// 替换 exportHotCars 数组（位于 contactInfo 之前）
const fuelStart = src.indexOf("export const exportHotCars: Car[] = [");
const contactStart = src.indexOf("export const contactInfo");
if (fuelStart === -1 || contactStart === -1) {
  throw new Error("未找到 exportHotCars / contactInfo 标记，数据文件结构可能已变化");
}
const fuelBlock =
  "export const exportHotCars: Car[] = [\n" +
  fuel.map(formatCar).join(",\n") +
  "\n];\n\n";
src = src.slice(0, fuelStart) + fuelBlock + src.slice(contactStart);

// 替换 neCars 数组（文件末尾）
const neStart = src.indexOf("export const neCars: Car[] = [");
const neEnd = src.lastIndexOf("];");
if (neStart === -1 || neEnd === -1 || neEnd < neStart) {
  throw new Error("未找到 neCars 数组结束标记");
}
const neBlock =
  "export const neCars: Car[] = [\n" +
  ne.map(formatCar).join(",\n") +
  "\n];\n";
src = src.slice(0, neStart) + neBlock;

writeFileSync(DATA, src, "utf8");
console.log(
  `已同步：燃油车 ${fuel.length} 台，新能源 ${ne.length} 台 → ${DATA}`
);
