import { exportHotCars } from "@/data/cars";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CarDetailClient from "./CarDetailClient";
import { tBrand } from "@/lib/i18n";

export function generateStaticParams() {
  return exportHotCars.map((car) => ({
    id: car.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = exportHotCars.find((c) => c.id === id);
  if (!car) {
    return { title: "Car Not Found" };
  }
  return {
    title: `${tBrand(car.brand, "en")} ${car.model} ${car.year} - $${car.priceUSD.toLocaleString()}`,
    description: car.descriptionEn,
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = exportHotCars.find((c) => c.id === id);

  if (!car) {
    notFound();
  }

  return <CarDetailClient car={car} />;
}
