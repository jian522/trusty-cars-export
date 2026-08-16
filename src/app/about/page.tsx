"use client";

import { contactInfo } from "@/data/cars";
import { useLanguage } from "@/components/LanguageProvider";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          {t("about.title")}
        </h1>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Company Intro */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">
              {t("about.intro")}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t("about.introText")}
            </p>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">
              {t("about.services")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="font-bold mb-1">{t("footer.inspection")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("home.why1d")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">📋</div>
                <div>
                  <h3 className="font-bold mb-1">{t("footer.customs")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("home.why3d")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">🚢</div>
                <div>
                  <h3 className="font-bold mb-1">{t("footer.shipping")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("home.why2d")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">📄</div>
                <div>
                  <h3 className="font-bold mb-1">{t("footer.docs")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("home.why3d")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Assurance */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">
              {t("about.qa")}
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ {t("about.qa1")}</li>
              <li>✓ {t("about.qa2")}</li>
              <li>✓ {t("about.qa3")}</li>
              <li>✓ {t("about.qa4")}</li>
              <li>✓ {t("about.qa5")}</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">
              {t("footer.contact")}
            </h2>
            <div className="space-y-3 text-gray-600">
              <p>
                <span className="font-bold">WhatsApp:</span>{" "}
                {contactInfo.whatsapp}
              </p>
              <p>
                <span className="font-bold">微信:</span> {contactInfo.wechat}
              </p>
              <p>
                <span className="font-bold">Email:</span> {contactInfo.email}
              </p>
              <p>
                <span className="font-bold">Facebook:</span>{" "}
                {contactInfo.facebook}
              </p>
              <p>
                <span className="font-bold">{t("contact.address")}:</span>{" "}
                {contactInfo.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
