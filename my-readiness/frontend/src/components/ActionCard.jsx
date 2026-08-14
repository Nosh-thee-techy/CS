import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const ICONS = {
  agriculture: <path d="M12 4c4 3.2 6.5 6.4 6.5 10.2A6.5 6.5 0 0 1 5.5 14.2C5.5 10.4 8 7.2 12 4Z" />,
  savings: <path d="M5 8h14v10H5zM8 8V6h8v2" />,
  climate: <path d="M4 16 L10 8 L14 12 L20 6" />,
};

export default function ActionCard({ action, onReport }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [audio, setAudio] = useState(null);
  const [note, setNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photoUrl = useRef("");
  const audioUrl = useRef("");
  const recorder = useRef(null);
  const chunks = useRef([]);

  useEffect(
    () => () => {
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
      recorder.current?.stop?.();
    },
    [],
  );

  const locked = action.verified || action.selfReported;
  const statusKey = action.verified
    ? "verified"
    : action.selfReported
      ? "pending"
      : action.status === "recommended"
        ? "recommended"
        : "not_started";

  function onPhoto(file) {
    if (!file) return;
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    photoUrl.current = URL.createObjectURL(file);
    setPhoto(file);
    setError("");
  }

  async function toggleRecord() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError(t("improve.noAudio"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const media = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks.current = [];
      media.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks.current, { type: media.mimeType || "audio/webm" });
        const file = new File([blob], "voice-note.webm", { type: blob.type });
        if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
        audioUrl.current = URL.createObjectURL(blob);
        setAudio(file);
        setRecording(false);
        recorder.current = null;
      };
      recorder.current = media;
      media.start();
      setRecording(true);
      setError("");
      setTimeout(() => {
        if (recorder.current === media && media.state === "recording") media.stop();
      }, 60000);
    } catch {
      setError(t("improve.noAudio"));
    }
  }

  async function submit() {
    if (!photo && !audio) {
      setError(t("improve.needEvidence"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onReport(action.id, { photo, audio, note });
      setOpen(false);
    } catch {
      setError(t("improve.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-[24px] border border-white/10 bg-panel p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ember">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            {ICONS[action.category] || ICONS.agriculture}
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[16px] font-semibold text-white">{action.title}</h2>
            <span className="shrink-0 rounded-full bg-ember/20 px-2 py-0.5 text-xs font-semibold text-ember-glow">
              {t("improve.points", { count: action.points })}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-mute">{action.categoryLabel}</p>
        </div>
      </div>

      <dl className="mt-3 space-y-2 text-[14px] leading-relaxed">
        <div>
          <dt className="font-semibold text-white/55">{t("improve.how")}</dt>
          <dd className="text-white/90">{action.how}</dd>
        </div>
        <div>
          <dt className="font-semibold text-white/55">{t("improve.impact")}</dt>
          <dd className="text-white/90">{action.impact}</dd>
        </div>
        {(action.photoHint || action.audioHint) && (
          <div>
            <dt className="font-semibold text-white/55">{t("improve.means")}</dt>
            <dd className="mt-1 space-y-1 text-white/90">
              {action.photoHint && (
                <p>
                  <span className="font-medium text-ember-glow">{t("improve.meansPhoto")}: </span>
                  {action.photoHint}
                </p>
              )}
              {action.audioHint && (
                <p>
                  <span className="font-medium text-ember-glow">{t("improve.meansAudio")}: </span>
                  {action.audioHint}
                </p>
              )}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-mute">{t(`improve.${statusKey}`)}</span>
        {!action.verified && !action.selfReported && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-white"
          >
            {open ? t("improve.cancel") : t("improve.doThis")}
          </button>
        )}
      </div>

      {action.selfReported && action.evidence && (
        <p className="mt-2 text-xs text-mute">
          {action.evidence.photo ? t("improve.photoSent") : ""}
          {action.evidence.photo && action.evidence.audio ? " · " : ""}
          {action.evidence.audio ? t("improve.audioSent") : ""}
        </p>
      )}

      {open && !locked && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <p className="text-sm leading-relaxed text-mute">{t("improve.evidenceHelp")}</p>
          {action.photoHint && <p className="text-sm text-white/80">{action.photoHint}</p>}
          <div className="grid grid-cols-2 gap-2">
            <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white">
              {t("improve.photo")}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => onPhoto(event.target.files?.[0])}
              />
            </label>
            <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white">
              {t("improve.gallery")}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => onPhoto(event.target.files?.[0])}
              />
            </label>
          </div>
          {action.audioHint && <p className="text-sm text-white/80">{action.audioHint}</p>}
          <button
            type="button"
            onClick={toggleRecord}
            className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold ${
              recording ? "bg-ember text-white" : "border border-white/20 text-white"
            }`}
          >
            {recording ? t("improve.audioStop") : audio ? t("improve.audioAgain") : t("improve.audioStart")}
          </button>

          {photo && photoUrl.current && (
            <img src={photoUrl.current} alt="" className="h-28 w-full rounded-2xl object-cover" />
          )}
          {audio && audioUrl.current && <audio controls src={audioUrl.current} className="w-full" />}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-mute">{t("improve.noteLabel")}</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 280))}
              placeholder={t("improve.notePlaceholder")}
              rows={2}
              className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-[15px] text-white outline-none placeholder:text-mute"
            />
          </label>

          {error && <p className="text-sm text-ember-glow">{error}</p>}

          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="btn-pill-ember"
          >
            {busy ? t("improve.sending") : t("improve.sendEvidence")}
          </button>
        </div>
      )}
    </article>
  );
}
