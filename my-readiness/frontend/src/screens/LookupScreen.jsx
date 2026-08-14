import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import PillButton from "../components/PillButton.jsx";
import { readLastLookup, saveLastLookup } from "../api/readiness.js";
import { useReadiness } from "../context/ReadinessContext.jsx";

const FEATURES = [
  { id: "score", icon: ScoreIcon },
  { id: "loan", icon: LoanIcon },
  { id: "improve", icon: ImproveIcon },
];

export default function LookupScreen() {
  const { t } = useTranslation();
  const { lookupFarmer, loading, error, lookup } = useReadiness();
  const [value, setValue] = useState(() => lookup || readLastLookup() || "");

  useEffect(() => {
    if (lookup) setValue(lookup);
  }, [lookup]);

  function onChange(event) {
    const next = event.target.value;
    setValue(next);
    saveLastLookup(next);
  }

  function onSubmit(event) {
    event.preventDefault();
    if (!value.trim() || loading) return;
    lookupFarmer(value);
  }

  return (
    <main className="flex min-h-full flex-1 flex-col bg-night px-6 pb-8 pt-12">
      <header className="flex items-center justify-end">
        <LanguageSwitcher />
      </header>

      <div className="mt-6">
        <p className="text-sm font-medium tracking-[0.22em] text-mute">{t("lookup.kicker")}</p>
        <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-white">
          {t("lookup.headline")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mute">{t("lookup.sub")}</p>
      </div>

      <ul className="mt-6 space-y-2.5">
        {FEATURES.map(({ id, icon: Icon }) => (
          <li
            key={id}
            className="flex items-start gap-3 rounded-[22px] border border-white/12 bg-panel p-3.5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember/20 text-ember-glow">
              <Icon />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white">{t(`lookup.features.${id}.title`)}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-mute">{t(`lookup.features.${id}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="mt-auto space-y-3 pt-6">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-mute">{t("lookup.fieldLabel")}</span>
          <input
            value={value}
            onChange={onChange}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            placeholder={t("lookup.placeholder")}
            className="h-14 w-full rounded-full border border-white/20 bg-white/5 px-5 text-[16px] text-white outline-none placeholder:text-mute focus:border-ember"
          />
        </label>

        {error && <p className="text-center text-sm font-medium text-ember">{t(`errors.${error}`)}</p>}

        <PillButton type="submit" variant="white" disabled={loading || !value.trim()}>
          {loading ? t("lookup.checking") : t("lookup.button")}
        </PillButton>
        <p className="text-center text-xs text-mute">{t("lookup.hint")}</p>
      </form>
    </main>
  );
}

function ScoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LoanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="7" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7V6a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ImproveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 16 L10 10 L14 13 L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
