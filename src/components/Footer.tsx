"use client";

import Link from "next/link";
import { contactInfo } from "@/data/cars";
import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">🚗 Trusty Used Cars</h3>
            <p className="text-gray-400">{t("footer.desc")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/cars" className="hover:text-white transition">
                  {t("footer.cars")}
                </Link>
              </li>
              <li>
                <Link href="/ne-cars" className="hover:text-white transition">
                  {t("nav.neCars")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">{t("footer.services")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>• {t("footer.inspection")}</li>
              <li>• {t("footer.customs")}</li>
              <li>• {t("footer.shipping")}</li>
              <li>• {t("footer.docs")}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📱 WhatsApp: {contactInfo.whatsapp}</li>
              <li>💬 微信: {contactInfo.wechat}</li>
              <li>📧 Email: {contactInfo.email}</li>
              <li>📘 Facebook: {contactInfo.facebook}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>© 2026 Trusty Used Cars. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
