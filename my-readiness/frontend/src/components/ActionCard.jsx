import { useTranslation } from "react-i18next";

export default function ActionCard({ action, onReport }) {
  const { t } = useTranslation();
  const locked = action.verified || action.selfReported;

  return (
    <article className="panel flex items-start gap-3 p-4">
      <button
        type="button"
        disabled={locked}
        onClick={() => onReport(action.id)}
        aria-pressed={locked}
        className={`tap mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          action.verified
            ? "border-ember bg-ember text-white"
            : action.selfReported
              ? "border-ember/50 bg-ember/20 text-ember-glow"
              : "border-white/15 bg-white/5 text-transparent"
        }`}
      >
        {(action.verified || action.selfReported) && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-semibold text-white">{action.text}</p>
        <p className="mt-1 text-sm font-medium text-mute">
          {action.verified
            ? t("actions.verified")
            : action.selfReported
              ? t("actions.reported")
              : t("actions.report")}
        </p>
      </div>
    </article>
  );
}
