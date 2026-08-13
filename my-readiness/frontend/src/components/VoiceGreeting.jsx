import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function VoiceGreeting({ text, locale }) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const started = useRef(false);

  function speak() {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === "sw" ? "sw-KE" : "en-KE";
    utterance.rate = 0.95;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    started.current = false;
    return () => window.speechSynthesis?.cancel();
  }, [text, locale]);

  useEffect(() => {
    if (!text || started.current) return;
    started.current = true;
    const timer = setTimeout(speak, 400);
    return () => clearTimeout(timer);
  }, [text, locale]);

  return (
    <button
      type="button"
      onClick={speak}
      className="btn-pill-ember h-auto justify-start gap-3 px-4 py-3"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9 8.5v7l6.5-3.5L9 8.5Z" />
        </svg>
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
          {t("app.kali")}
        </span>
        <span className="block text-sm font-semibold">
          {playing ? t("voice.playing") : t("voice.play")}
        </span>
      </span>
    </button>
  );
}
