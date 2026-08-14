import { useTranslation } from "react-i18next";
import MountainScene from "./MountainScene.jsx";

export default function SplashScreen({ onDone }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onDone}
      className="relative flex min-h-full flex-1 w-full flex-col overflow-hidden bg-night text-left"
    >
      <MountainScene className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/80" />
      <div className="relative z-10 flex min-h-full flex-1 flex-col px-8 pb-16 pt-24">
        <p className="text-center text-sm font-medium tracking-[0.22em] text-white/75">
          {t("lookup.kicker")}
        </p>
        <h1 className="mt-4 text-center text-[38px] font-semibold leading-tight tracking-tight text-white">
          {t("app.name")}
        </h1>
        <p className="mt-3 text-center text-[16px] font-medium text-white/80">{t("splash.line")}</p>
        <div className="mt-auto flex flex-col items-center">
          <span className="splash-go">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="mb-3 text-white">
              <path d="M12 16V6M8 10l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="splash-go-label">{t("splash.go")}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
