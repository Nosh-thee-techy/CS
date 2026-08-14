import FarmerService from './FarmerService.js';
import demo from '../data/demoStore.js';
import {
  getReadinessScore,
  getReadinessActions,
  submitReadinessLoan,
} from './ReadinessService.js';
import { issueOtp, verifyOtp } from '../../../my-readiness/backend/src/lib/otp.js';
import { sendSms, isAfricasTalkingReady, toMsisdn } from '../clients/africasTalking.js';
import { t, actionTitle, ussdLocale } from '../lib/ussdCopy.js';

const LOOKUP_MS = 2500;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('lookup_timeout')), ms);
    }),
  ]);
}

/**
 * USSD channel for My Readiness.
 *
 * Africa's Talking owns the radio path (*code#). This service owns the
 * session state machine. Scoring still lives in CreditEngineService —
 * we only read getReadinessScore / getReadinessActions / submitReadinessLoan.
 *
 * AT contract (text/plain, not JSON):
 *   POST application/x-www-form-urlencoded
 *   sessionId, serviceCode, phoneNumber, text
 *   text is the star-joined path: "" → "1" → "1*2"
 *   Reply CON … to continue, END … to hang up.
 *
 * Screen state is stored on sessionId. We use only the last text segment so
 * "Back" still works after AT has already concatenated earlier keys.
 */

const SESSION_TTL_MS = 3 * 60_000;
const sessions = new Map();

function sessionOf(sessionId) {
  const now = Date.now();
  for (const [id, row] of sessions) {
    if (now - row.touchedAt > SESSION_TTL_MS) sessions.delete(id);
  }
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { lang: 'en', screen: 'main', touchedAt: now });
  }
  const row = sessions.get(sessionId);
  row.touchedAt = now;
  return row;
}

function stepsFrom(text) {
  if (!text || !String(text).trim()) return [];
  return String(text).split('*').filter((part) => part !== '');
}

function con(body) {
  return `CON ${body}`;
}

function end(body) {
  return `END ${body}`;
}

function clip(text, max = 160) {
  const value = String(text || '').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

async function farmerFromPhone(phoneNumber) {
  if (!phoneNumber) return null;
  const msisdn = toMsisdn(phoneNumber);
  try {
    const farmer = await withTimeout(
      (async () =>
        (await FarmerService.findByLookup(msisdn)) || (await FarmerService.findByLookup(phoneNumber)))(),
      LOOKUP_MS,
    );
    if (farmer) return farmer;
  } catch (error) {
    console.warn('USSD farmer lookup:', error.message);
  }
  return demo.findFarmerByLookup(phoneNumber) || demo.findFarmerByLookup(msisdn);
}

function lookupKey(farmer, phoneNumber) {
  return farmer.memberNumber || farmer.nationalId || farmer.farmerId || phoneNumber;
}

function actionStatus(action, copy) {
  if (action.verified) return copy.status.verified;
  if (action.selfReported) return copy.status.reported;
  return copy.status.open;
}

class UssdService {
  async handle({ sessionId, phoneNumber, text }) {
    const session = sessionOf(sessionId || phoneNumber || 'anon');
    const steps = stepsFrom(text);
    const input = steps.at(-1) || '';

    try {
      const farmer = await farmerFromPhone(phoneNumber);
      if (!farmer) {
        return end(t(session.lang).unregistered);
      }

      if (steps.length === 0) {
        session.screen = 'main';
        return con(t(session.lang).main(farmer.fullName || 'farmer'));
      }

      if (session.screen === 'improve') {
        return this._improve(session, farmer, input);
      }
      if (session.screen === 'loan') {
        return this._loan(session, farmer, input, phoneNumber);
      }
      if (session.screen === 'loan_otp') {
        return this._loanOtp(session, farmer, input, phoneNumber);
      }
      return this._main(session, farmer, input);
    } catch (error) {
      console.warn('USSD handler error:', error.message);
      return end(t(session.lang).error);
    }
  }

  async _main(session, farmer, input) {
    if (input === '0') {
      session.lang = session.lang === 'sw' ? 'en' : 'sw';
      session.screen = 'main';
      return con(t(session.lang).main(farmer.fullName || 'farmer'));
    }
    if (input === '1') {
      return this._score(farmer, t(session.lang));
    }
    if (input === '2') {
      session.screen = 'improve';
      return this._improve(session, farmer, '');
    }
    if (input === '3') {
      session.screen = 'loan';
      return this._loan(session, farmer, '', farmer.phoneNumber);
    }
    return con(t(session.lang).invalid);
  }

  async _score(farmer, copy) {
    const profile = await getReadinessScore(lookupKey(farmer, farmer.phoneNumber));
    if (!profile) return end(copy.unregistered);
    const band = copy.bands[profile.band] || profile.band;
    return end(copy.score(profile.farmerName || farmer.fullName, profile.score, band));
  }

  async _improve(session, farmer, input) {
    const copy = t(session.lang);
    const actions = await getReadinessActions(lookupKey(farmer, farmer.phoneNumber));
    if (!actions || actions.length === 0) return end(copy.improveEmpty);

    const listed = actions.slice(0, 5);
    session.actions = listed.map((action) => action.key);

    if (!input) {
      const lines = listed.map((action, index) =>
        copy.improveItem(
          index + 1,
          clip(actionTitle(session.lang, action.key), 28),
          actionStatus(action, copy),
        ),
      );
      return con(`${copy.improveHeader}\n${lines.join('\n')}\n0. Back`);
    }

    if (input === '0') {
      session.screen = 'main';
      return con(copy.main(farmer.fullName || 'farmer'));
    }

    const index = Number(input) - 1;
    const action = listed[index];
    if (!action) return con(copy.invalid);
    return end(copy.improveDetail(actionTitle(session.lang, action.key)));
  }

  async _loan(session, farmer, input, phoneNumber) {
    const copy = t(session.lang);
    const profile = await getReadinessScore(lookupKey(farmer, farmer.phoneNumber));
    if (!profile) return end(copy.unregistered);

    if (!input) {
      if (profile.loanApplication?.status === 'pending') {
        return end(copy.loanPending(profile.loanApplication.reference));
      }
      if (!profile.disbursementEligible) {
        return end(copy.loanNotEligible(profile.nextTierHint));
      }
      return con(copy.loanEligible(profile.eligibleAmount));
    }

    if (input === '0') {
      session.screen = 'main';
      return con(copy.main(farmer.fullName || 'farmer'));
    }

    if (input !== '1') return con(copy.invalid);

    const memberKey = lookupKey(farmer, phoneNumber);
    const code = issueOtp(memberKey);
    try {
      const sms = await sendSms({
        to: farmer.phoneNumber || phoneNumber,
        message: t(ussdLocale(session.lang)).otpSms(code),
      });
      if (sms.skipped) {
        console.log(`USSD OTP for ${memberKey}: ${code}`);
      }
    } catch (error) {
      console.warn('USSD OTP SMS failed:', error.message);
      if (isAfricasTalkingReady()) return end(copy.loanOtpFailed);
      console.log(`USSD OTP for ${memberKey}: ${code}`);
    }

    session.screen = 'loan_otp';
    session.memberKey = memberKey;
    return con(copy.loanOtpSent);
  }

  async _loanOtp(session, farmer, input) {
    const copy = t(session.lang);
    const memberKey = session.memberKey || lookupKey(farmer, farmer.phoneNumber);

    if (!verifyOtp(memberKey, input)) {
      return end(copy.loanBadOtp);
    }

    try {
      const loan = await submitReadinessLoan(memberKey);
      return end(copy.loanApplied(loan.amount, loan.reference));
    } catch (error) {
      if (error.code === 'not_eligible') return end(copy.loanNotEligible());
      if (error.code === 'pending_application') return end(copy.loanPending());
      return end(copy.loanError);
    }
  }
}

export default new UssdService();
