import { useTranslation } from "react-i18next";
import { persistLocale } from "../i18n/index.js";

const LOCALES = [
  { id: "en", label: "English" },
  { id: "sw", label: "Kiswahili" },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-[11px] font-medium text-mute">{t("lookup.languageAsk")}</p>
      <div className="flex rounded-full border border-white/20 bg-white/5 p-0.5" role="group" aria-label={t("lookup.language")}>
        {LOCALES.map((locale) => {
          const active = i18n.language.startsWith(locale.id);
          return (
            <button
              key={locale.id}
              type="button"
              aria-pressed={active}
              onClick={() => persistLocale(locale.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                active ? "bg-white text-black" : "text-white/70"
              }`}
            >
              {locale.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
