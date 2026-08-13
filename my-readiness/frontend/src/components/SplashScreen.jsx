import { useTranslation } from "react-i18next";

export default function SplashScreen({ onDone }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onDone}
      className="relative block min-h-[100dvh] w-full overflow-hidden bg-night text-left"
    >
      <img
        src="/brand/splash.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/80" />
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-8">
        <p className="text-sm font-medium tracking-[0.22em] text-white/70">{t("lookup.kicker")}</p>
        <h1 className="mt-3 text-center text-[42px] font-semibold tracking-tight text-white">
          {t("app.name")}
        </h1>
        <p className="mt-24 text-sm text-white/55">{t("splash.tap")}</p>
      </div>
    </button>
  );
}
