"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type CarImageProps = {
  /** 真实图片地址（本地路径如 /cars/1.jpg 或远程 URL）。缺省时显示品牌占位图。 */
  src?: string;
  alt: string;
  /** 占位图上显示的主文案（如 "Toyota Corolla"）。 */
  label: string;
  /** 品牌（用于占位图配色，中文或英文均可）。 */
  brand?: string;
  /** 占位图 emoji，燃油车 🚗 / 新能源 ⚡。 */
  emoji?: string;
  /** 外层高度类，如 "h-56" / "h-80"。 */
  className?: string;
  priority?: boolean;
  sizes?: string;
};

const brandGradients: Record<string, string> = {
  丰田: "from-slate-100 to-slate-200",
  Toyota: "from-slate-100 to-slate-200",
  宝马: "from-blue-50 to-slate-100",
  BMW: "from-blue-50 to-slate-100",
  奔驰: "from-slate-100 to-gray-200",
  "Mercedes-Benz": "from-slate-100 to-gray-200",
  雷克萨斯: "from-indigo-50 to-slate-100",
  Lexus: "from-indigo-50 to-slate-100",
  本田: "from-red-50 to-slate-100",
  Honda: "from-red-50 to-slate-100",
  奥迪: "from-slate-100 to-neutral-200",
  Audi: "from-slate-100 to-neutral-200",
  大众: "from-blue-50 to-gray-100",
  Volkswagen: "from-blue-50 to-gray-100",
  路虎: "from-emerald-50 to-slate-100",
  "Land Rover": "from-emerald-50 to-slate-100",
  比亚迪: "from-green-50 to-emerald-100",
  BYD: "from-green-50 to-emerald-100",
  特斯拉: "from-red-50 to-slate-100",
  Tesla: "from-red-50 to-slate-100",
  小鹏: "from-sky-50 to-slate-100",
  XPeng: "from-sky-50 to-slate-100",
  蔚来: "from-blue-50 to-indigo-100",
  NIO: "from-blue-50 to-indigo-100",
  理想: "from-emerald-50 to-teal-100",
  "Li Auto": "from-emerald-50 to-teal-100",
  广汽埃安: "from-cyan-50 to-slate-100",
  AION: "from-cyan-50 to-slate-100",
  吉利: "from-blue-50 to-slate-100",
  Geely: "from-blue-50 to-slate-100",
  长安: "from-orange-50 to-slate-100",
  Changan: "from-orange-50 to-slate-100",
  哪吒: "from-red-50 to-orange-100",
  NETA: "from-red-50 to-orange-100",
  零跑: "from-teal-50 to-slate-100",
  Leapmotor: "from-teal-50 to-slate-100",
  上汽: "from-sky-50 to-blue-100",
  "Rising Auto": "from-sky-50 to-blue-100",
  东风: "from-slate-100 to-gray-200",
  Voyah: "from-slate-100 to-gray-200",
  凯迪拉克: "from-neutral-100 to-slate-200",
  Cadillac: "from-neutral-100 to-slate-200",
  昊铂: "from-cyan-50 to-blue-100",
  Hyper: "from-cyan-50 to-blue-100",
  高合: "from-violet-50 to-slate-100",
  HiPhi: "from-violet-50 to-slate-100",
  腾势: "from-indigo-50 to-blue-100",
  Denza: "from-indigo-50 to-blue-100",
  智己: "from-sky-50 to-indigo-100",
  "IM Motors": "from-sky-50 to-indigo-100",
  阿维塔: "from-slate-100 to-gray-200",
  Avatr: "from-slate-100 to-gray-200",
  极越: "from-cyan-50 to-sky-100",
  JIDU: "from-cyan-50 to-sky-100",
  小米: "from-orange-50 to-amber-100",
  Xiaomi: "from-orange-50 to-amber-100",
};

function gradientFor(brand?: string): string {
  return (brand && brandGradients[brand]) || "from-slate-100 to-slate-200";
}

export default function CarImage({
  src,
  alt,
  label,
  brand,
  emoji = "🚗",
  className = "h-56",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: CarImageProps) {
  const [failed, setFailed] = useState(false);
  const { t } = useLanguage();
  // 静态导出时 next/image(unoptimized) 不会给绝对路径加 basePath，这里手动补上
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const resolvedSrc = src && src.startsWith("/") ? `${base}${src}` : src;
  const showImage = !!resolvedSrc && !failed;

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {showImage ? (
        <Image
          src={resolvedSrc!}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${gradientFor(
            brand
          )}`}
        >
          <span className="text-5xl drop-shadow-sm">{emoji}</span>
          <span className="mt-2 px-4 text-center font-semibold text-slate-600">
            {label}
          </span>
          <span className="mt-1 text-[11px] text-slate-400">
            {t("photo.coming")}
          </span>
        </div>
      )}
    </div>
  );
}
