import { useTranslation } from "react-i18next";
import { useReadiness } from "../context/ReadinessContext.jsx";

export default function AdvisoryScreen() {
  const { t } = useTranslation();
  const { profile } = useReadiness();

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <header className="text-center">
        <h1 className="text-[28px] font-bold tracking-tight text-white">{t("advisory.title")}</h1>
        <p className="mt-2 text-[15px] text-mute">{t("advisory.zoneHint")}</p>
      </header>

      <div className="relative overflow-hidden rounded-[28px]">
        <img src="/brand/alerts.jpg" alt="" className="h-56 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <p className="absolute inset-x-0 bottom-0 p-5 text-[17px] leading-relaxed text-white">
          {profile.climateAdvisory}
        </p>
      </div>

      <section className="relative overflow-hidden rounded-[28px]">
        <img src="/brand/hero.jpg" alt="" className="h-40 w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            {t("advisory.disbursement")}
          </h2>
          <p className="mt-2 text-[16px] leading-relaxed text-white">
            {profile.disbursementEligible ? t("advisory.eligible") : t("advisory.notEligible")}
          </p>
        </div>
      </section>
    </div>
  );
}
