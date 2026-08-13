import { useTranslation } from "react-i18next";
import { persistLocale } from "../i18n/index.js";

const LOCALES = [
  { id: "en", label: "English" },
  { id: "sw", label: "Kiswahili" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = LOCALES.find((locale) => i18n.language.startsWith(locale.id)) || LOCALES[0];
  const next = LOCALES.find((locale) => locale.id !== current.id);

  return (
    <button
      type="button"
      onClick={() => persistLocale(next.id)}
      className="glass-pill tap inline-flex items-center gap-1.5 px-3 py-2"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3c2.5 3 3.8 6 3.8 9s-1.3 6-3.8 9c-2.5-3-3.8-6-3.8-9S9.5 6 12 3Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {current.label}
    </button>
  );
}
