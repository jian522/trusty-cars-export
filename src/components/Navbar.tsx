"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { contactInfo } from "@/data/cars";
import { useLanguage } from "@/components/LanguageProvider";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";

const navItems = [
  { href: "/", key: "nav.home" as const },
  { href: "/cars", key: "nav.cars" as const },
  { href: "/ne-cars", key: "nav.neCars" as const },
  { href: "/about", key: "nav.about" as const },
  { href: "/contact", key: "nav.contact" as const },
];

const langLabels: Record<Lang, string> = {
  zh: "中文",
  en: "EN",
  ar: "عربي",
  ru: "RU",
};

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold text-blue-900">
              Trusty Used Cars
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition ${
                  pathname === item.href
                    ? "text-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>

          {/* Language & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="border rounded px-2 py-1 text-sm"
            >
              {SUPPORTED_LANGS.map((l) => (
                <option key={l} value={l}>
                  {langLabels[l]}
                </option>
              ))}
            </select>
            <Link
              href="/admin"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
            >
              {t("nav.admin")}
            </Link>
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {t("nav.consult")}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-600 hover:text-green-600"
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-3 border-t mt-3">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="border rounded px-2 py-1 text-sm"
              >
                {SUPPORTED_LANGS.map((l) => (
                  <option key={l} value={l}>
                    {langLabels[l]}
                  </option>
                ))}
              </select>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.admin")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
