import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Phone, PhoneOff, RefreshCw, Volume2 } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';
import { formatRelative } from '../../lib/officerDesk';
import { kaliReply } from '../../../my-readiness/frontend/src/lib/kaliReply.js';
import { apiUrl } from '../../lib/api';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const AT_SIM = 'https://simulator.africastalking.com:1517/';

type ChatRow = { who: 'kali' | 'you'; text: string };
type ReadinessProfile = {
  farmerName?: string;
  voiceGreetingText?: string;
  [key: string]: unknown;
};
type AtStatus = {
  shortCode: string;
  voiceNumber: string;
  sandbox: boolean;
  smsOutbound: boolean;
  publicCallback: boolean;
  simulator: string;
  username?: string;
  callbacks: { ussd: string; voice: string };
  channelHints: string[];
};
type SpeechRec = {
  start: () => void;
  stop: () => void;
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
};

const EXAMPLES = [
  { lang: 'en', text: 'What is my score?' },
  { lang: 'en', text: 'Can I get a loan?' },
  { lang: 'en', text: 'What should I do next?' },
  { lang: 'en', text: 'Why has my score not changed?' },
  { lang: 'sw', text: 'Alama yangu ni nini?' },
  { lang: 'sw', text: 'Naweza pata mkopo?' },
  { lang: 'sw', text: 'Nifanye nini sasa?' },
];

function SpeechEngine(): (new () => SpeechRec) | null {
  const w = window as typeof window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function welcomeCopy(shortCode: string, voiceNumber: string) {
  return `AT sandbox\nUSSD  ${shortCode || 'set AT_SHORT_CODE'}\nVoice  ${voiceNumber || 'set AT_VOICE_NUMBER'}\n\nGreen = LiLoo voice\nRed = hang up`;
}

export default function PhoneSimulator() {
  const { smsOutbox, officers } = usePlatform();
  const [phoneNumber, setPhoneNumber] = useState('0700434567');
  const [dial, setDial] = useState('');
  const [display, setDisplay] = useState(welcomeCopy('', ''));
  const [sessionId] = useState(() => `sim-${Date.now()}`);
  const [sessionText, setSessionText] = useState('');
  const [dialed, setDialed] = useState(false);
  const [ended, setEnded] = useState(false);
  const [mode, setMode] = useState<'dialer' | 'ussd' | 'call'>('dialer');
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState('en');
  const [profile, setProfile] = useState<ReadinessProfile | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [log, setLog] = useState<ChatRow[]>([]);
  const [at, setAt] = useState<AtStatus>({
    shortCode: '',
    voiceNumber: '',
    sandbox: true,
    smsOutbound: false,
    publicCallback: false,
    simulator: AT_SIM,
    username: 'sandbox',
    callbacks: { ussd: '/api/ussd', voice: '/api/voice' },
    channelHints: [],
  });
  const recognitionRef = useRef<SpeechRec | null>(null);
  const shortCode = at.shortCode || 'AT-assigned *384*…#';
  const voiceNumber = at.voiceNumber || '0700000000';

  const inbox = smsOutbox.filter((m) => {
    const digits = (s: string) => s.replace(/\D/g, '');
    const a = digits(m.to);
    const b = digits(phoneNumber);
    return a.endsWith(b.slice(-9)) || b.endsWith(a.slice(-9)) || officers.some((f) => f.phone === m.to && digits(f.phone).endsWith(b.slice(-9)));
  });

  useEffect(() => {
    fetch(apiUrl('/api/at/status'))
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.data) return;
        setAt((current) => ({ ...current, ...payload.data }));
        setDisplay(welcomeCopy(payload.data.shortCode, payload.data.voiceNumber));
      })
      .catch(() => {});
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string, lang = locale) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang.startsWith('sw') ? 'sw-KE' : 'en-KE';
    utterance.rate = 0.96;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [locale]);

  const loadProfile = useCallback(async (lang = locale) => {
    const res = await fetch(apiUrl(`/api/readiness/${encodeURIComponent(phoneNumber)}?lang=${encodeURIComponent(lang)}`));
    if (!res.ok) return null;
    const data = (await res.json()) as ReadinessProfile;
    setProfile(data);
    return data;
  }, [phoneNumber, locale]);

  const runUssd = useCallback(async (nextText: string) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/ussd'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          sessionId,
          serviceCode: shortCode,
          phoneNumber,
          text: nextText,
        }),
      });
      const raw = await res.text();
      const body = raw.replace(/^(CON|END)\s*/i, '');
      setDisplay(body || 'No reply from USSD.');
      setEnded(/^END/i.test(raw));
      setMode('ussd');
    } catch {
      setDisplay('USSD backend unreachable.\nStart the API on :3000.');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, sessionId, shortCode]);

  function hangUp() {
    stopVoice();
    setMode('dialer');
    setDialed(false);
    setEnded(false);
    setSessionText('');
    setDial('');
    setDisplay(welcomeCopy(shortCode, voiceNumber));
  }

  async function startCall() {
    stopVoice();
    setMode('call');
    setDialed(true);
    setEnded(false);
    setDial(voiceNumber);
    setDisplay(`Calling LiLoo…\n${voiceNumber}`);
    setLog([]);
    try {
      const data = await loadProfile(locale);
      const hello = data?.voiceGreetingText
        || kaliReply('hello', { profile: data, locale });
      setDisplay(`LiLoo · ${data?.farmerName || 'KaLI Coop'}\n\n${hello}\n\n1 Score  2 Improve  3 Loan\n0 Lugha  # Hang up`);
      setLog([{ who: 'kali', text: hello }]);
      speak(hello, locale);
    } catch {
      const fallback = 'Hi, I am LiLoo. Look up failed. Try USSD *384*11400# or My Readiness.';
      setDisplay(fallback);
      speak(fallback, locale);
    }
  }

  function askKali(text: string, lang = locale, nextProfile = profile) {
    const answer = kaliReply(text, { profile: nextProfile, locale: lang });
    setLog((rows) => [...rows, { who: 'you', text }, { who: 'kali', text: answer }]);
    setDisplay(`You: ${text}\n\nLiLoo: ${answer}\n\n1 Score  2 Improve  3 Loan\nTalk or tap an example →`);
    speak(answer, lang);
  }

  function sendDial() {
    const n = dial.replace(/\s/g, '');
    if (!n || n === voiceNumber || n.replace(/^0/, '') === String(voiceNumber).replace(/^0/, '')) {
      startCall();
      return;
    }
    if (n === shortCode) {
      setDialed(true);
      setSessionText('');
      setEnded(false);
      runUssd('');
      return;
    }
    setDisplay(`Unknown number.\nUSSD ${shortCode}\nVoice ${voiceNumber}`);
  }

  function press(key: string) {
    if (mode === 'call') {
      if (key === '#') {
        hangUp();
        return;
      }
      if (key === '1') askKali(locale === 'sw' ? 'alama yangu' : 'what is my score');
      else if (key === '2') askKali(locale === 'sw' ? 'nifanye nini' : 'what should I do next');
      else if (key === '3') askKali(locale === 'sw' ? 'naweza pata mkopo' : 'can I get a loan');
      else if (key === '0') {
        const next = locale === 'sw' ? 'en' : 'sw';
        setLocale(next);
        const line = next === 'sw' ? 'Sawa. Tutazungumza Kiswahili.' : 'Okay. We will speak English.';
        setDisplay(line);
        speak(line, next);
      } else if (key === '*') {
        const last = [...log].reverse().find((row) => row.who === 'kali');
        if (last) speak(last.text, locale);
      }
      return;
    }
    if (mode === 'ussd' && dialed && !ended) {
      const next = sessionText ? `${sessionText}*${key}` : key;
      setSessionText(next);
      runUssd(next);
      return;
    }
    setDial((d) => d + key);
  }

  function softLeft() {
    if (mode === 'ussd' && dialed && !ended) {
      const next = sessionText ? `${sessionText}*0` : '0';
      setSessionText(next);
      runUssd(next);
      return;
    }
    hangUp();
  }

  function toggleListen() {
    const Ctor = SpeechEngine();
    if (!Ctor) {
      setDisplay('This browser has no speech recognition.\nTap an example on the right, or use the keypad.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop?.();
      return;
    }
    if (mode !== 'call') startCall();
    window.speechSynthesis?.cancel();
    const recognition = new Ctor();
    recognition.lang = locale.startsWith('sw') ? 'sw-KE' : 'en-KE';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const heard = event.results?.[0]?.[0]?.transcript;
      if (heard) askKali(heard);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }

  useEffect(() => () => stopVoice(), [stopVoice]);

  const leftLabel = mode === 'ussd' && dialed && !ended ? 'Back' : 'Clear';
  const rightLabel = mode === 'call' ? 'Talk' : 'OK';

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 22 }}>
      <div>
        <h2>Africa's Talking sandbox</h2>
        <p>
          USSD and Voice callbacks are what the AT simulator hits.
          SMS only reaches numbers you add in the simulator.
        </p>
        <div className="phone-shell" style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.16em', marginBottom: 8, opacity: 0.6 }}>
            KALI · AT SANDBOX {speaking ? '· SPEAKING' : listening ? '· LISTENING' : ''}
          </div>
          <div className="phone-screen">{loading ? 'Connecting…' : display}</div>
          <div className="phone-softkeys">
            <button type="button" className="phone-soft" onClick={softLeft}>{leftLabel}</button>
            <button
              type="button"
              className="phone-soft"
              onClick={() => (mode === 'call' ? toggleListen() : sendDial())}
            >
              {rightLabel}
            </button>
          </div>
          <input
            value={dial}
            onChange={(e) => setDial(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendDial(); }}
            placeholder="Dial…"
            style={{
              width: '100%', marginTop: 10, background: '#11161C', color: '#FFF',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 10px',
              fontFamily: "'DM Mono', monospace", fontSize: '0.8rem',
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
            {KEYS.map((k) => (
              <button type="button" key={k} className="phone-key" onClick={() => press(k)}>{k}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            <button type="button" className="phone-key phone-key-call" onClick={startCall} aria-label="Call LiLoo">
              <Phone size={16} /> Call
            </button>
            <button type="button" className="phone-key phone-key-end" onClick={hangUp} aria-label="Hang up">
              <PhoneOff size={16} /> End
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card-clean">
          <h3>Sandbox wiring</h3>
          <p style={{ marginTop: 8 }}>
            Username <strong>{at.sandbox ? 'sandbox' : at.username}</strong>
            {at.smsOutbound ? ' · SMS SDK ready' : ' · set AT_API_KEY for outbound SMS'}
          </p>
          <p>USSD callback: <code>{at.callbacks?.ussd}</code></p>
          <p>Voice callback: <code>{at.callbacks?.voice}</code></p>
          {!at.publicCallback ? (
            <p style={{ marginTop: 8, color: 'var(--status-overdue, #c45c26)' }}>
              Channel create will fail until AT_PUBLIC_BASE_URL is a public https tunnel to port 3000. localhost is not reachable from AT.
            </p>
          ) : null}
          <p>
            In the AT sandbox app, let them assign a unique code — do not type *384*100#. Paste the callback with no query string, save, then copy that code into AT_SHORT_CODE. Add 0700434567 in the simulator and dial {shortCode}.
          </p>
          {(at.channelHints || []).map((hint: string) => (
            <p key={hint} style={{ marginTop: 6, fontSize: '0.8rem' }}>{hint}</p>
          ))}
          <a className="btn btn-orange btn-sm" href={at.simulator || AT_SIM} target="_blank" rel="noreferrer" style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none' }}>
            Open AT simulator
          </a>
        </div>
        <div className="card-clean">
          <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>SIM phone number</label>
          <input className="input" style={{ marginTop: 6 }} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <p style={{ marginTop: 8 }}>Demo: 0700434567 Mary Wanjiku · 0712345678 Samuel (credit ready)</p>
        </div>

        <div className="card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Volume2 size={16} /> Talk to LiLoo</h3>
            <button type="button" className="btn btn-orange btn-sm" onClick={toggleListen}>
              <Mic size={14} /> {listening ? 'Stop' : 'Speak'}
            </button>
          </div>
          <p style={{ marginTop: 8 }}>
            In this desk, LiLoo speaks in the browser. The AT sandbox Voice number uses POST /api/voice (XML) in their simulator — not a live Safaricom call.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.text}
                type="button"
                className="filter-pill"
                onClick={async () => {
                  setLocale(ex.lang);
                  let data = profile;
                  if (mode !== 'call') {
                    stopVoice();
                    setMode('call');
                    setDial(voiceNumber);
                    data = await loadProfile(ex.lang);
                  }
                  askKali(ex.text, ex.lang, data);
                }}
              >
                {ex.text}
              </button>
            ))}
          </div>
          {log.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {log.slice(-6).map((row, i) => (
                <div key={`${row.who}-${i}`} style={{ fontSize: '0.82rem' }}>
                  <strong>{row.who === 'kali' ? 'LiLoo' : 'You'}:</strong> {row.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>SMS inbox</h3>
            <RefreshCw size={14} color="var(--text-muted)" />
          </div>
          <p>After an officer commits a stance on the scorecard, the message lands here.</p>
          {inbox.length === 0 && <p style={{ marginTop: 10 }}>No SMS for this handset yet.</p>}
          {inbox.map((m) => (
            <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatRelative(m.sentIso)} · {m.category}</div>
              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{m.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
