import { useTranslation } from "react-i18next";
import MountainScene from "../components/MountainScene.jsx";
import BandBadge from "../components/BandBadge.jsx";
import VoiceGreeting from "../components/VoiceGreeting.jsx";
import PillButton from "../components/PillButton.jsx";
import { useReadiness } from "../context/ReadinessContext.jsx";
import StrengthsGaps from "./StrengthsGaps.jsx";

import ClimateHeatmapCard from "../components/ClimateHeatmapCard.jsx";

export default function ScoreScreen() {
  const { t, i18n } = useTranslation();
  const { profile, fromCache, reset, setTab } = useReadiness();

  if (!profile) return null;

  const updated = profile.lastUpdated
    ? new Intl.DateTimeFormat(i18n.language.startsWith("sw") ? "sw-KE" : "en-KE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(profile.lastUpdated))
    : null;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-mute">{profile.memberNumber}</p>
          <h1 className="text-[26px] font-bold tracking-tight text-white">{profile.farmerName}</h1>
        </div>
        <button type="button" onClick={reset} className="text-sm font-semibold text-ember">
          {t("score.changeFarmer")}
        </button>
      </header>

      {fromCache && (
        <p className="rounded-2xl border border-ember/40 bg-ember/15 px-3 py-2 text-sm font-medium text-ember-glow">
          {t("score.offline")}
        </p>
      )}

      <section className="relative overflow-hidden rounded-[28px] border border-white/15">
        <MountainScene className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/25" />
        <div className="relative z-10 flex flex-col items-center px-4 py-10 text-center">
          <p className="text-sm font-medium text-white/70">{t("score.yourScore")}</p>
          <p className="mt-1 text-7xl font-bold leading-none tracking-tight text-white">{profile.score}</p>
          <div className="mt-4">
            <BandBadge bandKey={profile.bandKey} label={profile.band} />
          </div>
        </div>
      </section>

      {updated && (
        <p className="text-center text-xs text-mute">
          {t("score.updated")}: {updated}
        </p>
      )}

      <ClimateHeatmapCard profile={profile} />

      <article className="overflow-hidden rounded-[24px] border border-white/10 bg-panel">
        <div className="flex gap-3 p-4">
          <span className="mt-0.5 w-1 shrink-0 rounded-full bg-ember" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{t("score.why")}</p>
            <p className="mt-2 text-[16px] leading-relaxed text-white/90">{profile.why}</p>
          </div>
        </div>
      </article>

      <StrengthsGaps strengths={profile.strengths} gaps={profile.gaps} />

      <VoiceGreeting text={profile.voiceGreetingText} locale={i18n.language} />

      {Number(profile.eligibleAmount) > 0 ? (
        <PillButton type="button" variant="ember" onClick={() => setTab("loan")}>
          {t("score.applyCta", { amount: Number(profile.eligibleAmount).toLocaleString("en-KE") })}
        </PillButton>
      ) : (
        <PillButton type="button" variant="white" onClick={() => setTab("loan")}>
          {t("score.loanTab")}
        </PillButton>
      )}
    </div>
  );
}

function CloudIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 7 17Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
