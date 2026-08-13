import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ActionCard from "../components/ActionCard.jsx";
import BrandArt from "../components/BrandArt.jsx";
import { useReadiness } from "../context/ReadinessContext.jsx";

export default function ActionsScreen() {
  const { t } = useTranslation();
  const { profile, reportAction, toast, setToast } = useReadiness();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <BrandArt src="/brand/flags.jpg" className="h-56" />
      <header className="text-center">
        <h1 className="text-[28px] font-bold tracking-tight text-white">{t("actions.title")}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-mute">{t("actions.selfReportNote")}</p>
      </header>

      {toast && (
        <p
          className={`rounded-full px-3 py-2 text-center text-sm font-medium ${
            toast === "success" ? "bg-ember/15 text-ember-glow" : "bg-white/10 text-white"
          }`}
        >
          {t(`actions.${toast}`)}
        </p>
      )}

      <div className="space-y-3">
        {profile.actions.map((action) => (
          <ActionCard key={action.id} action={action} onReport={reportAction} />
        ))}
      </div>
    </div>
  );
}
