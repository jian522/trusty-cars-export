"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { neCars } from "@/data/cars";
import { getCarImages } from "@/data/car-images";
import CarImage from "@/components/CarImage";
import { useLanguage } from "@/components/LanguageProvider";
import { tBrand, tFuelType, tCountry, formatMileage } from "@/lib/i18n";

const priceRanges = [
  { id: "", key: "cars.allPrices", test: () => true },
  { id: "0-20000", key: "ne.under20", test: (p: number) => p < 20000 },
  { id: "20000-30000", key: "cars.range1", test: (p: number) => p >= 20000 && p < 30000 },
  { id: "30000-50000", key: "cars.range2", test: (p: number) => p >= 30000 && p < 50000 },
  { id: "50000+", key: "cars.range4", test: (p: number) => p >= 50000 },
];

const rangeFilters = [
  { id: "", key: "ne.allRange", test: () => true },
  { id: "0-300", key: "ne.range1", test: (r: number) => r < 300 },
  { id: "300-500", key: "ne.range2", test: (r: number) => r >= 300 && r < 500 },
  { id: "500-700", key: "ne.range3", test: (r: number) => r >= 500 && r < 700 },
  { id: "700+", key: "ne.range4", test: (r: number) => r >= 700 },
];

function parseRange(range?: string): number {
  if (!range) return 0;
  const m = range.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

export default function NECarsPage() {
  const { lang, t } = useLanguage();
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [range, setRange] = useState("");

  const brands = useMemo(
    () => Array.from(new Set(neCars.map((c) => c.brand))),
    []
  );

  const filteredCars = useMemo(() => {
    const priceTest =
      priceRanges.find((r) => r.id === price)?.test ?? (() => true);
    const rangeTest =
      rangeFilters.find((r) => r.id === range)?.test ?? (() => true);
    return neCars.filter(
      (c) =>
        (!brand || c.brand === brand) &&
        priceTest(c.priceUSD) &&
        rangeTest(parseRange(c.range))
    );
  }, [brand, price, range]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            {t("ne.title")}
          </h1>
          <p className="text-gray-600 text-lg">{t("ne.sub")}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("cars.brand")}
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border rounded-lg px-4 py-2 min-w-[150px]"
              >
                <option value="">{t("cars.allBrands")}</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {tBrand(b, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("cars.price")}
              </label>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border rounded-lg px-4 py-2 min-w-[150px]"
              >
                {priceRanges.map((r) => (
                  <option key={r.id} value={r.id}>
                    {t(r.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("ne.range")}
              </label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="border rounded-lg px-4 py-2 min-w-[150px]"
              >
                {rangeFilters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {t(r.key)}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto self-end text-sm text-gray-500">
              {t("cars.count", { n: filteredCars.length })}
            </div>
          </div>
        </div>

        {/* NE Cars Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p>{t("cars.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <Link
                key={car.id}
                href={`/ne-cars/${car.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    ⚡ {tFuelType(car.fuelType, lang)}
                  </div>
                  <CarImage
                    src={getCarImages(car)[0]}
                    alt={`${tBrand(car.brand, lang)} ${car.model}`}
                    label={`${tBrand(car.brand, lang)} ${car.model}`}
                    brand={car.brand}
                    emoji="⚡"
                    className="h-56"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {tBrand(car.brand, lang)} {car.model}
                    </h3>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {car.year}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                    <span>🔋 {car.battery}</span>
                    <span>📏 {car.range}</span>
                    <span>🛣️ {formatMileage(car.mileage)}</span>
                    <span>🔄 {tFuelType(car.fuelType, lang)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ${car.priceUSD.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        ¥{car.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">
                    {car.exportCountries.map((country) => (
                      <span
                        key={country}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                      >
                        → {tCountry(country, lang)}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
