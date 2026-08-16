"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { exportHotCars } from "@/data/cars";
import { getCarImages } from "@/data/car-images";
import CarImage from "@/components/CarImage";
import { useLanguage } from "@/components/LanguageProvider";
import {
  tBrand,
  tFuelType,
  tTransmission,
  tEmission,
  tCountry,
  formatMileage,
} from "@/lib/i18n";

const priceRanges = [
  { id: "", key: "cars.allPrices", test: () => true },
  { id: "0-15000", key: "cars.under", test: (p: number) => p < 15000 },
  { id: "15000-25000", key: "cars.range1", test: (p: number) => p >= 15000 && p < 25000 },
  { id: "25000-40000", key: "cars.range2", test: (p: number) => p >= 25000 && p < 40000 },
  { id: "40000-60000", key: "cars.range3", test: (p: number) => p >= 40000 && p < 60000 },
  { id: "60000+", key: "cars.range4", test: (p: number) => p >= 60000 },
];

export default function CarsPage() {
  const { lang, t } = useLanguage();
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");

  const brands = useMemo(
    () => Array.from(new Set(exportHotCars.map((c) => c.brand))),
    []
  );

  const filteredCars = useMemo(() => {
    const priceTest =
      priceRanges.find((r) => r.id === price)?.test ?? (() => true);
    return exportHotCars.filter(
      (c) => (!brand || c.brand === brand) && priceTest(c.priceUSD)
    );
  }, [brand, price]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          {t("cars.title")}
        </h1>

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

            <div className="ml-auto self-end text-sm text-gray-500">
              {t("cars.count", { n: filteredCars.length })}
            </div>
          </div>
        </div>

        {/* Car Grid */}
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
                href={`/cars/${car.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <CarImage
                  src={getCarImages(car)[0]}
                  alt={`${tBrand(car.brand, lang)} ${car.model}`}
                  label={`${tBrand(car.brand, lang)} ${car.model}`}
                  brand={car.brand}
                  emoji="🚗"
                  className="h-56"
                />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {tBrand(car.brand, lang)} {car.model}
                    </h3>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {car.year}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {car.descriptionEn}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                    <span>📏 {formatMileage(car.mileage)}</span>
                    <span>🔄 {tTransmission(car.transmission, lang)}</span>
                    <span>⛽ {tFuelType(car.fuelType, lang)}</span>
                    <span>🌿 {tEmission(car.emission, lang)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
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
                        →{tCountry(country, lang)}
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
