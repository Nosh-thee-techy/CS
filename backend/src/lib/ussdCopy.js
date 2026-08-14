const COPY = {
  en: {
    unregistered:
      'You are not on Lima na Loop yet. Ask your factory, or open My Readiness with your member number.',
    main: (name) =>
      `My Readiness\nHi ${name}\n1. Score\n2. Improve\n3. Loan\n0. Kiswahili`,
    invalid: 'Invalid choice.\n1. Score\n2. Improve\n3. Loan\n0. Kiswahili',
    lang: '1. English\n2. Kiswahili',
    score: (name, score, band) =>
      `${name}, your score is ${score} (${band}). Self-report does not change it today.`,
    improveHeader: 'Next steps (score unchanged today)',
    improveEmpty: 'No steps listed. Deliver to your co-op this season.',
    improveItem: (i, title, status) => `${i}. ${title}${status}`,
    improveDetail: (title) =>
      `${title}\nThis does not change your score today. Photo/voice proof is on My Readiness.`,
    loanEligible: (amount) =>
      `Eligible: KES ${Number(amount).toLocaleString('en-KE')}\n1. Apply (SMS code)\n0. Back`,
    loanNotEligible: (hint) => hint || 'Not eligible for a loan yet. Keep delivering.',
    loanPending: (ref) => `Application already pending${ref ? ` (${ref})` : ''}.`,
    loanOtpSent: 'We sent a 6-digit code by SMS. Enter it now.',
    loanOtpFailed: 'Could not send SMS. Try My Readiness or request a new code.',
    loanApplied: (amount, ref) =>
      `Applied for KES ${Number(amount).toLocaleString('en-KE')}. Ref ${ref}. Score unchanged.`,
    loanBadOtp: 'That code did not match. Request a new one from My Readiness.',
    loanError: 'Could not apply right now. Try My Readiness.',
    error: 'Service is busy. Try again shortly.',
    bands: {
      credit_ready: 'Credit ready',
      almost_there: 'Almost there',
      building_trust: 'Building trust',
    },
    status: {
      verified: ' [ok]',
      reported: ' [sent]',
      open: '',
    },
    otpSms: (code) => `Lima na Loop code: ${code}. Expires in 5 min. Do not share it.`,
  },
  sw: {
    unregistered:
      'Bado hujaandikishwa Lima na Loop. Uliza kiwanda, au fungua My Readiness kwa namba ya mwanachama.',
    main: (name) =>
      `My Readiness\nHabari ${name}\n1. Alama\n2. Boresha\n3. Mkopo\n0. English`,
    invalid: 'Chaguo si sahihi.\n1. Alama\n2. Boresha\n3. Mkopo\n0. English',
    lang: '1. English\n2. Kiswahili',
    score: (name, score, band) =>
      `${name}, alama yako ni ${score} (${band}). Kujiripoti hakubadilishi alama leo.`,
    improveHeader: 'Hatua (alama haibadiliki leo)',
    improveEmpty: 'Hakuna hatua. Peleka mavuno kwa ushirika msimu huu.',
    improveItem: (i, title, status) => `${i}. ${title}${status}`,
    improveDetail: (title) =>
      `${title}\nHii haibadilishi alama leo. Picha/sauti iko kwenye My Readiness.`,
    loanEligible: (amount) =>
      `Unastahili: KES ${Number(amount).toLocaleString('en-KE')}\n1. Tuma ombi (SMS)\n0. Rudi`,
    loanNotEligible: (hint) => hint || 'Bado hustahili mkopo. Endelea kupeleka.',
    loanPending: (ref) => `Ombi bado linasubiri${ref ? ` (${ref})` : ''}.`,
    loanOtpSent: 'Tumetuma namba ya tarakimu 6 kwa SMS. Iandike sasa.',
    loanOtpFailed: 'SMS haikuenda. Jaribu My Readiness.',
    loanApplied: (amount, ref) =>
      `Umeomba KES ${Number(amount).toLocaleString('en-KE')}. Kumbukumbu ${ref}. Alama haijabadilika.`,
    loanBadOtp: 'Namba haikulingana. Omba nyingine kwenye My Readiness.',
    loanError: 'Ombi halikuweza. Jaribu My Readiness.',
    error: 'Huduma ina shughuli. Jaribu tena.',
    bands: {
      credit_ready: 'Tayari kwa mkopo',
      almost_there: 'Karibu',
      building_trust: 'Kujenga imani',
    },
    status: {
      verified: ' [sawa]',
      reported: ' [imetumwa]',
      open: '',
    },
    otpSms: (code) => `Namba ya Lima na Loop: ${code}. Inaisha dakika 5. Usishiriki.`,
  },
};

const ACTION_TITLES = {
  en: {
    deliver_every_harvest: 'Deliver every harvest',
    save_with_chama: 'Save with your chama',
    keep_repayments_current: 'Keep repayments current',
    attend_coop_meetings: 'Attend co-op meeting',
    keep_input_receipts: 'Keep input receipts',
  },
  sw: {
    deliver_every_harvest: 'Peleka mavuno yote',
    save_with_chama: 'Weka chama kila mwezi',
    keep_repayments_current: 'Lipa mkopo kwa wakati',
    attend_coop_meetings: 'Hudhuria mkutano',
    keep_input_receipts: 'Hifadhi risiti za pembejeo',
  },
};

export function ussdLocale(lang) {
  return lang === 'sw' ? 'sw' : 'en';
}

export function t(lang) {
  return COPY[ussdLocale(lang)];
}

export function actionTitle(lang, key) {
  const loc = ussdLocale(lang);
  return ACTION_TITLES[loc][key] || ACTION_TITLES.en[key] || key;
}
