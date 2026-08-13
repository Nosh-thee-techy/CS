import { useTranslation } from "react-i18next";

export default function StrengthsGaps({ strengths, gaps }) {
  const { t } = useTranslation();

  return (
    <section className="grid gap-3">
      <SignalList title={t("score.strengths")} items={strengths} tone="help" />
      <SignalList title={t("score.gaps")} items={gaps} tone="gap" />
    </section>
  );
}

function SignalList({ title, items, tone }) {
  const isHelp = tone === "help";
  return (
    <div className={`rounded-[24px] p-4 ${isHelp ? "bg-ember/15" : "bg-white/5"}`}>
      <h2 className={`text-sm font-semibold ${isHelp ? "text-ember-glow" : "text-mute"}`}>{title}</h2>
      <ul className="mt-2 space-y-1.5">
        {(items || []).map((item) => (
          <li key={item} className="text-[16px] font-medium text-white">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
