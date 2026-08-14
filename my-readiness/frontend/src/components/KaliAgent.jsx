import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { kaliReply } from "../lib/kaliReply.js";
import { useReadiness } from "../context/ReadinessContext.jsx";

const KALI_SRC = "/kali.png";

function SpeechEngine() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function KaliToggle({ onOpen }) {
  const { t } = useTranslation();
  return (
    <button type="button" onClick={onOpen} className="kali-toggle" aria-label={t("kali.open")}>
      <img src={KALI_SRC} alt={t("app.kali")} />
      <span className="kali-toggle-dot" />
    </button>
  );
}

export default function KaliSheet({ onClose }) {
  const { t, i18n } = useTranslation();
  const { profile } = useReadiness();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micError, setMicError] = useState("");
  const listRef = useRef(null);
  const recognitionRef = useRef(null);
  const greeted = useRef(false);

  const locale = i18n.language;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, speaking, listening]);

  useEffect(() => {
    if (greeted.current) return undefined;
    greeted.current = true;
    const hello = profile?.voiceGreetingText || kaliReply("hello", { profile, locale });
    const timer = setTimeout(() => pushKali(hello), 350);
    return () => clearTimeout(timer);
  }, [profile, locale]);

  useEffect(() => () => stopAll(), []);

  function stopAll() {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function speak(text) {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale.startsWith("sw") ? "sw-KE" : "en-KE";
    utterance.rate = 0.96;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function pushKali(text) {
    setMessages((current) => [...current, { id: `k-${Date.now()}`, role: "kali", text }]);
    speak(text);
  }

  function send(text) {
    const value = String(text || "").trim();
    if (!value) return;
    setDraft("");
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: "user", text: value }]);
    const answer = kaliReply(value, { profile, locale });
    setTimeout(() => pushKali(answer), 280);
  }

  function toggleListen() {
    const Ctor = SpeechEngine();
    if (!Ctor) {
      setMicError(t("kali.noMic"));
      return;
    }
    if (listening) {
      recognitionRef.current?.stop?.();
      return;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setMicError("");
    const recognition = new Ctor();
    recognition.lang = locale.startsWith("sw") ? "sw-KE" : "en-KE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setListening(false);
      setMicError(t("kali.micFail"));
    };
    recognition.onresult = (event) => {
      const heard = event.results?.[0]?.[0]?.transcript;
      if (heard) send(heard);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setMicError(t("kali.micFail"));
    }
  }

  return (
    <section className="kali-sheet" role="dialog" aria-modal="true" aria-label={t("kali.title")}>
      <header className="kali-sheet-head">
        <p className="text-sm font-semibold text-white">{t("kali.title")}</p>
        <button type="button" onClick={() => { stopAll(); onClose(); }} className="kali-close">
          {t("kali.close")}
        </button>
      </header>

      <div className="kali-hero">
        <img src={KALI_SRC} alt={t("app.kali")} />
        <p className="kali-status" aria-live="polite">
          {listening ? t("kali.listening") : speaking ? t("kali.speaking") : t("kali.ready")}
        </p>
      </div>

      <div ref={listRef} className="kali-thread" aria-live="polite">
        {messages.map((message) => (
          <p key={message.id} className={message.role === "kali" ? "kali-bubble kali" : "kali-bubble user"}>
            {message.text}
          </p>
        ))}
      </div>

      {micError && <p className="px-4 text-xs text-ember-glow">{micError}</p>}

      <form
        className="kali-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <button
          type="button"
          onClick={toggleListen}
          className={`kali-mic ${listening ? "on" : ""}`}
          aria-label={listening ? t("kali.stop") : t("kali.talk")}
        >
          <MicIcon />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("kali.placeholder")}
          className="kali-input"
        />
        <button type="submit" className="kali-send" disabled={!draft.trim()}>
          {t("kali.send")}
        </button>
      </form>
    </section>
  );
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
