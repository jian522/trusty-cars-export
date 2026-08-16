// SQLite 数据持久层（基于 Node 22+ 内置 node:sqlite，无需原生依赖）。
// 首次访问时自动建表并从 src/data/cars.ts 播种。
// 注意：此模块仅可在服务端（API 路由）导入，禁止客户端引入。

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { exportHotCars, neCars, type Car } from "@/data/cars";

export type CarType = "fuel" | "ne";
export type CarRecord = Car & { type: CarType };

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "trusty.db");

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      priceUSD REAL NOT NULL,
      mileage TEXT,
      transmission TEXT,
      fuelType TEXT,
      emission TEXT,
      color TEXT,
      location TEXT,
      images TEXT,
      description TEXT,
      descriptionEn TEXT,
      exportCountries TEXT,
      featured INTEGER DEFAULT 0,
      battery TEXT,
      range TEXT
    )
  `);
  seedIfEmpty();
  return db;
}

function seedIfEmpty() {
  const row = db!.prepare("SELECT COUNT(*) AS c FROM cars").get() as {
    c: number | bigint;
  };
  if (Number(row.c) > 0) return;

  const insert = db!.prepare(
    `INSERT INTO cars
      (id, type, brand, model, year, price, priceUSD, mileage, transmission,
       fuelType, emission, color, location, images, description, descriptionEn,
       exportCountries, featured, battery, range)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const seed = (cars: Car[], type: CarType) => {
    for (const c of cars) {
      insert.run(
        c.id,
        type,
        c.brand,
        c.model,
        c.year,
        c.price,
        c.priceUSD,
        c.mileage,
        c.transmission,
        c.fuelType,
        c.emission,
        c.color,
        c.location,
        JSON.stringify(c.images ?? []),
        c.description,
        c.descriptionEn,
        JSON.stringify(c.exportCountries ?? []),
        c.featured ? 1 : 0,
        c.battery ?? null,
        c.range ?? null
      );
    }
  };

  seed(exportHotCars, "fuel");
  seed(neCars, "ne");
}

function rowToCar(row: Record<string, unknown>): CarRecord {
  return {
    id: String(row.id),
    type: row.type as CarType,
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
    images: JSON.parse(String(row.images ?? "[]")) as string[],
    description: String(row.description ?? ""),
    descriptionEn: String(row.descriptionEn ?? ""),
    exportCountries: JSON.parse(
      String(row.exportCountries ?? "[]")
    ) as string[],
    featured: Number(row.featured) === 1,
    battery: row.battery ? String(row.battery) : undefined,
    range: row.range ? String(row.range) : undefined,
  };
}

export function listCars(type?: CarType): CarRecord[] {
  const d = getDb();
  const rows = type
    ? d.prepare("SELECT * FROM cars WHERE type = ? ORDER BY id").all(type)
    : d.prepare("SELECT * FROM cars ORDER BY type, id").all();
  return rows.map(rowToCar);
}

export function getCar(id: string): CarRecord | undefined {
  const row = getDb().prepare("SELECT * FROM cars WHERE id = ?").get(id);
  return row ? rowToCar(row) : undefined;
}

function carParams(car: CarRecord) {
  return [
    car.id,
    car.type,
    car.brand,
    car.model,
    car.year,
    car.price,
    car.priceUSD,
    car.mileage,
    car.transmission,
    car.fuelType,
    car.emission,
    car.color,
    car.location,
    JSON.stringify(car.images ?? []),
    car.description,
    car.descriptionEn,
    JSON.stringify(car.exportCountries ?? []),
    car.featured ? 1 : 0,
    car.battery ?? null,
    car.range ?? null,
  ];
}

export function createCar(car: CarRecord): CarRecord {
  getDb()
    .prepare(
      `INSERT INTO cars
        (id, type, brand, model, year, price, priceUSD, mileage, transmission,
         fuelType, emission, color, location, images, description, descriptionEn,
         exportCountries, featured, battery, range)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(...carParams(car));
  return car;
}

export function updateCar(id: string, car: CarRecord): CarRecord | undefined {
  const existing = getCar(id);
  if (!existing) return undefined;
  getDb()
    .prepare(
      `UPDATE cars SET
         type = ?, brand = ?, model = ?, year = ?, price = ?, priceUSD = ?,
         mileage = ?, transmission = ?, fuelType = ?, emission = ?, color = ?,
         location = ?, images = ?, description = ?, descriptionEn = ?,
         exportCountries = ?, featured = ?, battery = ?, range = ?
       WHERE id = ?`
    )
    .run(
      car.type,
      car.brand,
      car.model,
      car.year,
      car.price,
      car.priceUSD,
      car.mileage,
      car.transmission,
      car.fuelType,
      car.emission,
      car.color,
      car.location,
      JSON.stringify(car.images ?? []),
      car.description,
      car.descriptionEn,
      JSON.stringify(car.exportCountries ?? []),
      car.featured ? 1 : 0,
      car.battery ?? null,
      car.range ?? null,
      id
    );
  return { ...car, id };
}

export function deleteCar(id: string): boolean {
  const result = getDb().prepare("DELETE FROM cars WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}

export { DB_PATH };
