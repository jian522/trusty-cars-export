"use client";

import { useState } from "react";
import { contactInfo } from "@/data/cars";
import { useLanguage } from "@/components/LanguageProvider";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    interestedCar: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 无后端时降级方案：打开用户邮件客户端，预填询价内容发到卖家邮箱。
    const subject = `Inquiry from ${formData.name || "Customer"} (${formData.country || "N/A"})`;
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone/WhatsApp: ${formData.phone}`,
      `Country: ${formData.country}`,
      `Interested car: ${formData.interestedCar}`,
      ``,
      `Message:`,
      formData.message,
    ].join("\n");
    window.location.href = `mailto:${contactInfo.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          {t("contact.title")}
        </h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">
              {t("contact.inquiry")}
            </h2>

            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  {t("contact.success")}
                </h3>
                <p className="text-gray-600">{t("contact.successDesc")}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  {t("contact.again")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contact.name")}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contact.phone")}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contact.country")}
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Nigeria"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contact.car")}
                  </label>
                  <input
                    type="text"
                    value={formData.interestedCar}
                    onChange={(e) =>
                      setFormData({ ...formData, interestedCar: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Toyota Corolla 2021"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contact.message")}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Please describe your requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  {t("contact.submit")}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-blue-900">
                {t("contact.quick")}
              </h2>
              <div className="space-y-4">
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace("+", "")}`}
                  className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <span className="text-3xl">💬</span>
                  <div>
                    <p className="font-bold text-green-700">WhatsApp</p>
                    <p className="text-gray-600">{contactInfo.whatsapp}</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <span className="text-3xl">📱</span>
                  <div>
                    <p className="font-bold text-blue-700">微信</p>
                    <p className="text-gray-600">{contactInfo.wechat}</p>
                  </div>
                </div>

                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-4 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition"
                >
                  <span className="text-3xl">📧</span>
                  <div>
                    <p className="font-bold text-red-700">Email</p>
                    <p className="text-gray-600">{contactInfo.email}</p>
                  </div>
                </a>

                <a
                  href={`https://facebook.com/${contactInfo.facebook}`}
                  target="_blank"
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <span className="text-3xl">📘</span>
                  <div>
                    <p className="font-bold text-blue-700">Facebook</p>
                    <p className="text-gray-600">{contactInfo.facebook}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-900">
                {t("contact.hours")}
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li>{t("contact.hours1")}</li>
                <li>{t("contact.hours2")}</li>
                <li>{t("contact.hours3")}</li>
                <li className="pt-2 text-green-600">
                  {t("contact.hoursNote")}
                </li>
              </ul>
            </div>

            {/* Response Time */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-md p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">{t("contact.resp")}</h2>
              <p className="text-blue-100">
                {t("contact.resp1")}
                <span className="font-bold text-white">{t("contact.resp30")}</span>
                {t("contact.resp1b")}
              </p>
              <p className="text-blue-100 mt-2">
                {t("contact.resp2")}
                <span className="font-bold text-white">{t("contact.resp24")}</span>
                {t("contact.resp2b")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
