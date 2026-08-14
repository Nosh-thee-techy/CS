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
    <div className={`overflow-hidden rounded-[24px] border ${isHelp ? "border-ember/35 bg-ember/10" : "border-white/10 bg-white/5"}`}>
      <div className="flex items-center gap-2 px-4 pt-4">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isHelp ? "bg-ember text-white" : "bg-white/10 text-white"
          }`}
        >
          {isHelp ? <CheckIcon /> : <GapIcon />}
        </span>
        <h2 className={`text-sm font-semibold ${isHelp ? "text-ember-glow" : "text-white"}`}>{title}</h2>
      </div>
      <ul className="mt-2 divide-y divide-white/10">
        {(items || []).map((item) => (
          <li key={item} className="flex items-start gap-3 px-4 py-3">
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${isHelp ? "bg-ember-glow" : "bg-white/50"}`} />
            <span className="text-[15px] font-medium leading-snug text-white">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 8v5M12 16.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
