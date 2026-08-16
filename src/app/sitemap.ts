import type { MetadataRoute } from "next";
import { exportHotCars, neCars } from "@/data/cars";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustyusedcars.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = ["", "/cars", "/ne-cars", "/about", "/contact"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  const carPages = exportHotCars.map((car) => ({
    url: `${siteUrl}/cars/${car.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const neCarPages = neCars.map((car) => ({
    url: `${siteUrl}/ne-cars/${car.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...carPages, ...neCarPages];
}
