import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import sw from "./sw.json";

export const LOCALE_KEY = "my-readiness:locale";
const MEMBER_LOCALE_KEY = "my-readiness:member-locale";

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

export function rememberMemberLocale(lookup, lang) {
  const member = String(lookup || "").trim().toUpperCase();
  if (!member) return;
  try {
    const raw = JSON.parse(localStorage.getItem(MEMBER_LOCALE_KEY) || "{}");
    raw[member] = lang;
    localStorage.setItem(MEMBER_LOCALE_KEY, JSON.stringify(raw));
  } catch {
    localStorage.setItem(MEMBER_LOCALE_KEY, JSON.stringify({ [member]: lang }));
  }
}

export default i18n;
