"use client";

import Link from "next/link";
import type { Car } from "@/data/cars";
import { contactInfo } from "@/data/cars";
import { getCarImages } from "@/data/car-images";
import CarImage from "@/components/CarImage";
import { useLanguage } from "@/components/LanguageProvider";
import {
  tBrand,
  tFuelType,
  tTransmission,
  tColor,
  tCity,
  tCountry,
  formatMileage,
} from "@/lib/i18n";

export default function NECarDetailClient({ car }: { car: Car }) {
  const { lang, t } = useLanguage();
  const images = getCarImages(car);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/ne-cars"
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-6"
        >
          {t("detail.backNE")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <CarImage
                src={images[0]}
                alt={`${tBrand(car.brand, lang)} ${car.model}`}
                label={`${tBrand(car.brand, lang)} ${car.model}`}
                brand={car.brand}
                emoji="⚡"
                className="h-80"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                  ⚡ {tFuelType(car.fuelType, lang)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {tBrand(car.brand, lang)} {car.model} {car.year}
              </h1>
              <p className="text-gray-600 mb-4">{car.descriptionEn}</p>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-green-600">
                  ${car.priceUSD.toLocaleString()}
                </span>
                <span className="text-xl text-gray-500">
                  ¥{car.price.toLocaleString()}
                </span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-500 text-sm">{t("detail.battery")}</span>
                  <p className="font-semibold">{car.battery}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-500 text-sm">{t("detail.range")}</span>
                  <p className="font-semibold">{car.range}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-500 text-sm">{t("detail.mileage")}</span>
                  <p className="font-semibold">{formatMileage(car.mileage)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-500 text-sm">{t("detail.gearbox")}</span>
                  <p className="font-semibold">{tTransmission(car.transmission, lang)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-500 text-sm">{t("detail.color")}</span>
                  <p className="font-semibold">{tColor(car.color, lang)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-500 text-sm">{t("detail.location")}</span>
                  <p className="font-semibold">{tCity(car.location, lang)}</p>
                </div>
              </div>

              {/* Export Countries */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">{t("detail.export")}</h3>
                <div className="flex flex-wrap gap-2">
                  {car.exportCountries.map((country) => (
                    <span
                      key={country}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full"
                    >
                      → {tCountry(country, lang)}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace("+", "")}?text=${encodeURIComponent(`I'm interested in ${tBrand(car.brand, lang)} ${car.model} ${car.year}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-4 rounded-lg font-bold transition"
                >
                  {t("detail.whatsapp")}
                </a>
                <a
                  href={`mailto:${contactInfo.email}?subject=${encodeURIComponent(`Inquiry: ${tBrand(car.brand, lang)} ${car.model} ${car.year}`)}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-lg font-bold transition"
                >
                  {t("detail.email")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
