import FarmerService from './FarmerService.js';
import { getReadinessScore, getReadinessActions } from './ReadinessService.js';
import { t, actionTitle } from '../lib/ussdCopy.js';
import { toMsisdn } from '../clients/africasTalking.js';
import env from '../config/env.js';

/**
 * Africa's Talking Voice XML for the sandbox simulator.
 * Same farmer lookup / score source as USSD. Not a PSTN bridge.
 */

function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function say(text) {
  return `<Say playBeep="false">${xmlEscape(text)}</Say>`;
}

function response(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}

function lookupKey(farmer, phone) {
  return farmer.memberNumber || farmer.nationalId || farmer.farmerId || phone;
}

class VoiceService {
  async handle(body = {}) {
    const isActive = String(body.isActive ?? '1') !== '0';
    if (!isActive) return '';

    const digits = String(body.dtmfDigits || body.dtmf || '').replace(/[^0-9]/g, '');
    const caller = body.callerNumber || body.phoneNumber || '';
    const publicBase = String(env.AT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const digitUrl = publicBase ? `${publicBase}/api/voice` : undefined;

    const farmer = (await FarmerService.findByLookup(toMsisdn(caller)))
      || (await FarmerService.findByLookup(caller));

    if (!farmer) {
      return response(say(t('en').unregistered));
    }

    const copy = t('en');
    const key = lookupKey(farmer, caller);

    if (!digits) {
      const getDigits = digitUrl
        ? `<GetDigits timeout="20" finishOnKey="#" callbackUrl="${xmlEscape(digitUrl)}">`
        : '<GetDigits timeout="20" finishOnKey="#">';
      return response(
        `${say(`Hello ${farmer.fullName}. This is LiLoo on Lima na Loop.`)}${getDigits}${say('Press 1 for your score. 2 for next steps. 3 for loan. Hash to finish.')}</GetDigits>`,
      );
    }

    if (digits.startsWith('1')) {
      const profile = await getReadinessScore(key);
      if (!profile) return response(say(copy.unregistered));
      const band = copy.bands[profile.band] || profile.band;
      return response(say(copy.score(profile.farmerName || farmer.fullName, profile.score, band)));
    }

    if (digits.startsWith('2')) {
      const actions = await getReadinessActions(key);
      const first = actions?.[0];
      const title = first ? actionTitle('en', first.key) : copy.improveEmpty;
      return response(say(`${copy.improveHeader}. ${title}. Self-report does not change the score today.`));
    }

    if (digits.startsWith('3')) {
      const profile = await getReadinessScore(key);
      if (!profile) return response(say(copy.unregistered));
      if (profile.loanApplication?.status === 'pending') {
        return response(say(copy.loanPending(profile.loanApplication.reference)));
      }
      if (!profile.disbursementEligible) {
        return response(say(copy.loanNotEligible(profile.nextTierHint)));
      }
      return response(say(`You are eligible for KES ${Number(profile.eligibleAmount).toLocaleString('en-KE')}. Apply on My Readiness or USSD after an SMS code.`));
    }

    return response(say('Press 1 for score, 2 for next steps, or 3 for loan.'));
  }
}

export default new VoiceService();
