"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setActiveLang, getActiveLang, type Lang } from "@/lib/i18n";
import { uiTranslations } from "@/lib/translations";

const STORAGE_KEY = "trusty-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** 翻译 UI 文案；支持 {name} 插值。 */
  t: (key: keyof typeof uiTranslations, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && ["zh", "en", "ar", "ru"].includes(stored)) return stored;
  // 按浏览器语言猜测，仅支持的四语命中则使用。
  const nav = window.navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    setActiveLang(lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const t = useCallback(
    (key: keyof typeof uiTranslations, params?: Record<string, string | number>) => {
      const entry = uiTranslations[key];
      let text = entry?.[lang] ?? entry?.en ?? String(key);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

export { getActiveLang };
