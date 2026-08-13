import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import sw from "./sw.json";

export const LOCALE_KEY = "my-readiness:locale";

const saved = localStorage.getItem(LOCALE_KEY) || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
  },
  lng: saved,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function persistLocale(lang) {
  localStorage.setItem(LOCALE_KEY, lang);
  i18n.changeLanguage(lang);
}

export default i18n;
