"use client";

import Link from "next/link";
import { exportHotCars, neCars, contactInfo } from "@/data/cars";
import { getCarImages } from "@/data/car-images";
import CarImage from "@/components/CarImage";
import { useLanguage } from "@/components/LanguageProvider";
import { tBrand, tFuelType, tCountry, formatMileage } from "@/lib/i18n";

export default function Home() {
  const { lang, t } = useLanguage();
  // 热门新能源车
  const hotNECars = neCars.filter((car) => car.featured).slice(0, 6);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("home.heroTitle")}
            </h1>
            <p className="text-xl mb-8">{t("home.heroSub")}</p>
            <div className="flex gap-4 flex-wrap">
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace("+", "")}`}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {t("home.whatsapp")}
              </a>
              <Link
                href="/cars"
                className="bg-white text-blue-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition"
              >
                {t("home.viewFuel")}
              </Link>
              <Link
                href="/ne-cars"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {t("home.viewNE")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Car Type Selection */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/cars"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white"
            >
              <div className="relative z-10">
                <span className="text-4xl mb-2 block">🚗</span>
                <h3 className="text-2xl font-bold mb-2">{t("home.fuel")}</h3>
                <p className="text-blue-100">{t("home.fuelDesc")}</p>
                <span className="inline-block mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium group-hover:bg-blue-50 transition">
                  {t("home.viewAll")}
                </span>
              </div>
            </Link>

            <Link
              href="/ne-cars"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-green-800 p-8 text-white"
            >
              <div className="relative z-10">
                <span className="text-4xl mb-2 block">⚡</span>
                <h3 className="text-2xl font-bold mb-2">{t("home.ne")}</h3>
                <p className="text-green-100">{t("home.neDesc")}</p>
                <span className="inline-block mt-4 bg-white text-green-600 px-4 py-2 rounded-lg font-medium group-hover:bg-green-50 transition">
                  {t("home.viewAll")}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Fuel Cars */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {t("home.hotFuel")}
            </h2>
            <Link href="/cars" className="text-green-600 hover:underline">
              {t("home.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exportHotCars.slice(0, 6).map((car) => (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <CarImage
                    src={getCarImages(car)[0]}
                    alt={`${tBrand(car.brand, lang)} ${car.model}`}
                    label={`${tBrand(car.brand, lang)} ${car.model}`}
                    brand={car.brand}
                    emoji="🚗"
                    className="h-48"
                  />
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {t("home.hot")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {tBrand(car.brand, lang)} {car.model} {car.year}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{car.descriptionEn}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ${car.priceUSD.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">{formatMileage(car.mileage)}</span>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {car.exportCountries.map((country: string) => (
                      <span
                        key={country}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                      >
                        →{tCountry(country, lang)}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot NE Cars */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-green-800">
              {t("home.hotNE")}
            </h2>
            <Link href="/ne-cars" className="text-green-600 hover:underline">
              {t("home.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotNECars.map((car) => (
              <Link
                key={car.id}
                href={`/ne-cars/${car.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <CarImage
                    src={getCarImages(car)[0]}
                    alt={`${tBrand(car.brand, lang)} ${car.model}`}
                    label={`${tBrand(car.brand, lang)} ${car.model}`}
                    brand={car.brand}
                    emoji="⚡"
                    className="h-48"
                  />
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    ⚡ {tFuelType(car.fuelType, lang)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {tBrand(car.brand, lang)} {car.model}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{car.range} range</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ${car.priceUSD.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">{formatMileage(car.mileage)}</span>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {car.exportCountries.map((country: string) => (
                      <span
                        key={country}
                        className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded"
                      >
                        →{tCountry(country, lang)}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t("home.whyTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">{t("home.why1t")}</h3>
              <p className="text-gray-600">{t("home.why1d")}</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">{t("home.why2t")}</h3>
              <p className="text-gray-600">{t("home.why2d")}</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2">{t("home.why3t")}</h3>
              <p className="text-gray-600">{t("home.why3d")}</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">{t("home.why4t")}</h3>
              <p className="text-gray-600">{t("home.why4d")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.ctaTitle")}</h2>
          <p className="text-xl mb-8">{t("home.ctaSub")}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace("+", "")}`}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition text-lg"
            >
              WhatsApp: {contactInfo.whatsapp}
            </a>
            <a
              href={`mailto:${contactInfo.email}`}
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition text-lg"
            >
              {t("home.email")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
