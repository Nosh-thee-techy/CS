import { useTranslation } from "react-i18next";
import BandBadge from "../components/BandBadge.jsx";
import VoiceGreeting from "../components/VoiceGreeting.jsx";
import { useReadiness } from "../context/ReadinessContext.jsx";
import StrengthsGaps from "./StrengthsGaps.jsx";

export default function ScoreScreen() {
  const { t, i18n } = useTranslation();
  const { profile, fromCache, reset } = useReadiness();

  if (!profile) return null;

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
        <p className="rounded-full bg-ember/15 px-3 py-2 text-sm font-medium text-ember-glow">
          {t("score.offline")}
        </p>
      )}

      <section className="relative overflow-hidden rounded-[28px]">
        <img src="/brand/hero-lower.jpg" alt="" className="h-80 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />
        <div className="orange-glow pointer-events-none absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <p className="text-sm font-medium text-white/70">{t("score.yourScore")}</p>
          <p className="mt-1 text-7xl font-bold tracking-tight text-white">{profile.score}</p>
          <div className="mt-3">
            <BandBadge bandKey={profile.bandKey} label={profile.band} />
          </div>
        </div>
      </section>

      <img src="/brand/themes.jpg" alt="" className="w-full rounded-[24px] object-cover" />

      <VoiceGreeting text={profile.voiceGreetingText} locale={i18n.language} />

      <section className="panel p-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{t("score.why")}</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-white/85">{profile.why}</p>
      </section>

      <StrengthsGaps strengths={profile.strengths} gaps={profile.gaps} />
    </div>
  );
}
