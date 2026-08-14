import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchFlaggedAccounts } from "../api/readiness.js";

export default function AdminScreen() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFlaggedAccounts()
      .then((data) => setAccounts(data.accounts || []))
      .catch(() => setError(t("admin.error")));
  }, [t]);

  return (
    <main className="mx-auto min-h-[100dvh] max-w-md bg-night px-5 py-8">
      <p className="text-sm font-medium tracking-[0.18em] text-mute">{t("lookup.kicker")}</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-white">{t("admin.title")}</h1>
      <p className="mt-2 text-sm leading-relaxed text-mute">{t("admin.sub")}</p>

      {error && <p className="mt-4 text-sm text-ember">{error}</p>}

      <ul className="mt-6 space-y-3">
        {accounts.map((row) => (
          <li key={row.memberNumber} className="rounded-[24px] border border-white/15 bg-panel p-4">
            <p className="text-sm text-mute">{row.memberNumber}</p>
            <p className="text-[16px] font-semibold text-white">{row.farmerName}</p>
            <p className="mt-1 text-sm text-ember-glow">
              {t(`admin.reasons.${row.reason}`, { defaultValue: row.reason })}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
