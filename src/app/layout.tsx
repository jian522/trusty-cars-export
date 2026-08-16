import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/components/LanguageProvider";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustyusedcars.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Trusty Used Cars - China Used Car Export Expert",
    template: "%s | Trusty Used Cars",
  },
  description:
    "Professional China used car export service. Toyota, BMW, Mercedes, Lexus, BYD, Tesla and more. Verified stock, global shipping to Africa, Middle East, Southeast Asia, Russia and Europe.",
  keywords: [
    "China used car export",
    "used cars from China",
    "Toyota export",
    "BYD export",
    "new energy vehicles export",
    "EV export China",
    "二手车出口",
    "中国二手车出口",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Trusty Used Cars - China Used Car Export Expert",
    description:
      "Verified used cars from China for export. Fuel cars and new energy vehicles. Global shipping available.",
    url: siteUrl,
    siteName: "Trusty Used Cars",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trusty Used Cars - China Used Car Export Expert",
    description:
      "Verified used cars from China for export. Global shipping available.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoDealer",
        name: "Trusty Used Cars",
        url: siteUrl,
        telephone: "+86-180-7907-9999",
        email: "jian5222@gmail.com",
        priceRange: "$10,000-$200,000",
        areaServed: [
          "Africa",
          "Middle East",
          "Southeast Asia",
          "Central Asia",
          "Russia",
          "Europe",
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "CN",
          addressRegion: "Guangdong",
          addressLocality: "Guangzhou",
        },
      },
      {
        "@type": "WebSite",
        name: "Trusty Used Cars",
        url: siteUrl,
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
