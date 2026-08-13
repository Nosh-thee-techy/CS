import { useState } from "react";
import { useTranslation } from "react-i18next";
import BrandArt from "../components/BrandArt.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import PillButton from "../components/PillButton.jsx";
import { useReadiness } from "../context/ReadinessContext.jsx";

export default function LookupScreen() {
  const { t } = useTranslation();
  const { lookupFarmer, loading, error } = useReadiness();
  const [value, setValue] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    if (!value.trim() || loading) return;
    lookupFarmer(value);
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-night px-6 pb-8 pt-4">
      <header className="flex items-center justify-end">
        <LanguageSwitcher />
      </header>

      <BrandArt src="/brand/glance.jpg" className="mx-auto mt-4 max-h-[34vh] w-full" />

      <form onSubmit={onSubmit} className="mt-2 space-y-4">
        <div className="text-center">
          <h1 className="text-[28px] font-bold tracking-tight text-white">{t("app.name")}</h1>
          <p className="mt-1 text-[16px] text-mute">{t("lookup.sub")}</p>
        </div>

        <label className="block">
          <span className="sr-only">{t("lookup.placeholder")}</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            placeholder={t("lookup.placeholder")}
            className="h-14 w-full rounded-full border border-white/10 bg-white/5 px-5 text-[16px] text-white outline-none placeholder:text-mute focus:border-ember/60"
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
