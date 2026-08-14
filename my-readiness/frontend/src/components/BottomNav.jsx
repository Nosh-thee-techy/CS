import { useTranslation } from "react-i18next";

const TABS = [
  { id: "score", icon: ScoreIcon },
  { id: "loan", icon: LoanIcon },
  { id: "improve", icon: ImproveIcon },
];

export default function BottomNav({ tab, onChange }) {
  const { t } = useTranslation();

  return (
    <nav className="pointer-events-auto">
      <ul className="flex items-center justify-around rounded-full bg-black/85 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/15 backdrop-blur-xl">
        {TABS.map(({ id, icon: Icon }) => {
          const active = tab === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 min-w-16 flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-semibold ${
                  active ? "text-white" : "text-white/45"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    active ? "bg-white text-black" : ""
                  }`}
                >
                  <Icon />
                </span>
                {t(`nav.${id}`)}
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LoanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="7" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7V6a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ImproveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 16 L10 10 L14 13 L19 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
