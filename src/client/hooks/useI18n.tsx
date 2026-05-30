import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en from "@/locales/en.json";
import zhCN from "@/locales/zh-CN.json";
import ja from "@/locales/ja.json";

type Lang = "en" | "zh-CN" | "ja";

const locales = { en, "zh-CN": zhCN, ja } as const;
type Locales = typeof locales;

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Locales["en"];
}>({ lang: "en", setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Lang) || "en";
    }
    return "en";
  });

  const setLangPersist = useCallback((l: Lang) => {
    setLang(l);
    localStorage.setItem("lang", l);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang: setLangPersist, t: locales[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
