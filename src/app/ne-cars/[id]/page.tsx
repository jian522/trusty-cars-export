import { neCars } from "@/data/cars";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NECarDetailClient from "./NECarDetailClient";
import { tBrand } from "@/lib/i18n";

export function generateStaticParams() {
  return neCars.map((car) => ({
    id: car.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = neCars.find((c) => c.id === id);
  if (!car) {
    return { title: "Car Not Found" };
  }
  return {
    title: `${tBrand(car.brand, "en")} ${car.model} ${car.year} - $${car.priceUSD.toLocaleString()}`,
    description: car.descriptionEn,
  };
}

export default async function NECarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = neCars.find((c) => c.id === id);

  if (!car) {
    notFound();
  }

  return <NECarDetailClient car={car} />;
}
