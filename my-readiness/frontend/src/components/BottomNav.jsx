import { useTranslation } from "react-i18next";

const TABS = [
  { id: "score", icon: ScoreIcon },
  { id: "actions", icon: ActionsIcon },
  { id: "advisory", icon: AdvisoryIcon },
];

export default function BottomNav({ tab, onChange }) {
  const { t } = useTranslation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-night/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {TABS.map(({ id, icon: Icon }) => {
          const active = tab === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                className={`tap flex w-full flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold ${
                  active ? "text-ember" : "text-mute"
                }`}
              >
                <Icon />
                {t(`nav.${id}`)}
                <span className={`h-1 w-1 rounded-full ${active ? "bg-ember" : "bg-transparent"}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ScoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ActionsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AdvisoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 18 L10 9 L15 14 L20 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
