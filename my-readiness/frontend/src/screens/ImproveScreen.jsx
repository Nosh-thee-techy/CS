import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ActionCard from "../components/ActionCard.jsx";
import { useReadiness } from "../context/ReadinessContext.jsx";

export default function ImproveScreen() {
  const { t } = useTranslation();
  const { profile, reportAction, toast, setToast } = useReadiness();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  if (!profile) return null;

  const actions = profile.actions || [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-white">{t("improve.title")}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-mute">{profile.improveSummary}</p>
        <p className="mt-2 text-sm leading-relaxed text-mute">{t("improve.note")}</p>
      </header>

      {toast && (
        <p
          className={`rounded-2xl border px-3 py-2 text-sm font-medium ${
            toast === "success"
              ? "border-ember/40 bg-ember/15 text-ember-glow"
              : "border-white/15 bg-white/10 text-white"
          }`}
        >
          {t(`improve.${toast}`)}
        </p>
      )}

      {actions.length === 0 ? (
        <section className="rounded-[24px] border border-white/15 bg-panel p-4">
          <p className="text-[16px] text-white">{profile.improveSummary}</p>
        </section>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} onReport={reportAction} />
          ))}
        </div>
      )}
    </div>
  );
}
