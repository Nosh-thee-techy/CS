import { paymentStatusLabel } from "./paymentStatus.js";
import { isFeatherlessEnabled, localizeDynamicContent } from "./featherless.js";

const COPY = {
  en: {
    bands: {
      credit_ready: "Credit ready",
      almost_there: "Almost there",
      building_trust: "Building trust",
    },
    why: {
      why_deliveries:
        "Your score is driven mainly by consistent deliveries to the co-op. Keep that rhythm and close the gaps below.",
      why_credit_ready:
        "You have a strong mix of deliveries, savings, and repayment. A few extra records will keep you ready for disbursement.",
      why_building:
        "The co-op is still getting to know your season-to-season pattern. Regular deliveries and chama savings will lift this fastest.",
    },
    signals: {
      delivery_consistency: "Delivery consistency",
      tenure: "Time with the co-op",
      chama_savings: "Chama savings history",
      loan_repayment: "Loan repayment",
      input_records: "Farm input records",
    },
    categories: {
      agriculture: "Agriculture",
      savings: "Savings",
      climate: "Climate",
    },
    actions: {
      deliver_every_harvest: {
        title: "Deliver every harvest this season",
        how: "Take each harvest to your co-op collection point, not a roadside buyer.",
        impact: "Regular deliveries are the strongest signal that you can repay.",
        photoHint: "Photo of your harvest at the collection point, or the weigh-in slip.",
        audioHint: "Say where you delivered, the date, and roughly how much.",
      },
      save_with_chama: {
        title: "Save with your chama monthly",
        how: "Put aside a small amount with your chama on the same day each month.",
        impact: "Savings history shows you can hold money aside when a loan is due.",
        photoHint: "Photo of this month's entry in the chama book, or the M-Pesa message.",
        audioHint: "Say the amount you saved and the day you paid it.",
      },
      keep_repayments_current: {
        title: "Keep loan repayments current",
        how: "Pay on or before the date on your repayment card.",
        impact: "On-time repayment is how the co-op learns you are credit ready.",
        photoHint: "Photo of the stamped repayment card, or the payment SMS.",
        audioHint: "Say the amount you paid and the date.",
      },
      attend_coop_meetings: {
        title: "Attend your next co-op meeting",
        how: "Show up to the next scheduled meeting and sign the attendance book.",
        impact: "Tenure and presence tell officers you are still active in the co-op.",
        photoHint: "Photo of your signature in the attendance book, or the meeting notice.",
        audioHint: "Say which meeting you attended and who was chairing.",
      },
      keep_input_receipts: {
        title: "Keep receipts for seed, fertiliser, and spray",
        how: "Keep this season's input receipts. Photograph them here so they are not lost.",
        impact: "Input records help match your climate plan to what you actually bought.",
        photoHint: "Photo of the shop receipt for seed, fertiliser, or spray.",
        audioHint: "Say what you bought, from which shop, and about how much it cost.",
      },
    },
    advisories: {
      light_rainfall: "Light rainfall expected — plan input purchases early.",
      good_planting: "Soils are moist enough for planting. Stagger sowing over the next two weeks.",
      heavy_rains: "Heavy rains likely. Protect stored harvest and delay spraying.",
      dry_spell: "A short dry spell is coming. Mulch and water seedlings if you can.",
    },
    loan: {
      nextTier: (score, amount) =>
        `Reach ${score} for up to KES ${Number(amount).toLocaleString("en-KE")}.`,
      applyAt: (score) => `Reach a score of ${score} to apply.`,
    },
    improve: {
      summary: (count, from, to) =>
        count === 1
          ? `One step could raise your score from ${from} to ${to} this season.`
          : `${count} steps could raise your score from ${from} to ${to} this season.`,
      none: "You're doing everything we can currently measure. Check back after your next delivery.",
    },
    greeting: ({ name, score, band, nextStep }) =>
      `Hello ${name}. Your readiness score is ${score}. You are ${band.toLowerCase()}. Next step: ${nextStep}.`,
    payments: {
      settlement: "Harvest settlement",
      disbursement: "Loan disbursement",
      loan_repayment: "Loan repayment",
    },
  },
  sw: {
    bands: {
      credit_ready: "Tayari kwa mkopo",
      almost_there: "Karibu kufika",
      building_trust: "Tunajenga imani",
    },
    why: {
      why_deliveries:
        "Alama yako inatokana hasa na kuleta mavuno kwa ushirika kila mara. Endelea hivyo na fanya hatua zilizo hapa chini.",
      why_credit_ready:
        "Una mchanganyiko mzuri wa mavuno, akiba, na kulipa mkopo. Rekodi chache zaidi zitakuweka tayari kupokea pesa.",
      why_building:
        "Ushirika bado unajifunza mwelekeo wako wa msimu. Kuleta mavuno kila mara na kuweka akiba ya chama kutainua alama haraka.",
    },
    signals: {
      delivery_consistency: "Uthabiti wa kuleta mavuno",
      tenure: "Muda katika ushirika",
      chama_savings: "Historia ya akiba ya chama",
      loan_repayment: "Kulipa mkopo",
      input_records: "Rekodi za pembejeo",
    },
    categories: {
      agriculture: "Kilimo",
      savings: "Akiba",
      climate: "Hali ya hewa",
    },
    actions: {
      deliver_every_harvest: {
        title: "Leta mavuno kila msimu huu",
        how: "Peleka kila mavuno kwenye kituo cha ushirika, si kwa mnunuzi wa barabarani.",
        impact: "Kuleta mavuno kila mara ni ishara kubwa kwamba unaweza kulipa.",
        photoHint: "Picha ya mavuno kwenye kituo, au stakabadhi ya kupima.",
        audioHint: "Sema ulipeleka wapi, siku gani, na kiasi kiasi gani.",
      },
      save_with_chama: {
        title: "Weka akiba kwenye chama chako kila mwezi",
        how: "Weka kiasi kidogo kwenye chama siku ile ile kila mwezi.",
        impact: "Historia ya akiba inaonyesha unaweza kutenga pesa mkopo unapodaiwa.",
        photoHint: "Picha ya ingizo la mwezi huu kwenye daftari la chama, au ujumbe wa M-Pesa.",
        audioHint: "Sema kiasi ulichoweka na siku uliyolipa.",
      },
      keep_repayments_current: {
        title: "Endelea kulipa mkopo kwa wakati",
        how: "Lipa siku ya kadi yako ya malipo au kabla yake.",
        impact: "Kulipa kwa wakati ndivyo ushirika unavyojua uko tayari kwa mkopo.",
        photoHint: "Picha ya kadi ya malipo iliyopigwa muhuri, au SMS ya malipo.",
        audioHint: "Sema kiasi ulicholipa na tarehe.",
      },
      attend_coop_meetings: {
        title: "Hudhuria mkutano ujao wa ushirika",
        how: "Fika kwenye mkutano ujao na tia sahihi kwenye daftari la mahudhurio.",
        impact: "Kuwepo kunawaambia maafisa bado uko hai katika ushirika.",
        photoHint: "Picha ya saini yako kwenye daftari la mahudhurio, au taarifa ya mkutano.",
        audioHint: "Sema mkutano gani ulihudhuria na nani alikuwa mwenyekiti.",
      },
      keep_input_receipts: {
        title: "Hifadhi risiti za mbegu, mbolea, na dawa",
        how: "Hifadhi risiti za pembejeo za msimu huu. Zipige picha hapa zisije zikapotea.",
        impact: "Rekodi za pembejeo zinasaidia kuoanisha mpango wa hali ya hewa na ulichonunua.",
        photoHint: "Picha ya risiti ya duka ya mbegu, mbolea, au dawa.",
        audioHint: "Sema ulichonunua, duka gani, na kiasi kiasi gani.",
      },
    },
    advisories: {
      light_rainfall: "Mvua kidogo inatarajiwa — panga kununua pembejeo mapema.",
      good_planting: "Udongo una unyevu wa kutosha kupanda. Panda hatua kwa hatua wiki mbili zijazo.",
      heavy_rains: "Mvua nyingi zinawezekana. Linda mavuno yaliyohifadhiwa na chelewesha kunyunyizia dawa.",
      dry_spell: "Kipindi kifupi cha ukame kinakuja. Funika udongo na nywesha miche ukiweza.",
    },
    loan: {
      nextTier: (score, amount) =>
        `Fikia ${score} upate hadi KES ${Number(amount).toLocaleString("en-KE")}.`,
      applyAt: (score) => `Fikia alama ya ${score} ili kuomba.`,
    },
    improve: {
      summary: (count, from, to) =>
        count === 1
          ? `Hatua moja inaweza kuinua alama yako kutoka ${from} hadi ${to} msimu huu.`
          : `Hatua ${count} zinaweza kuinua alama yako kutoka ${from} hadi ${to} msimu huu.`,
      none: "Unafanya kila tunachoweza kupima sasa. Rudi baada ya mavuno yajayo.",
    },
    greeting: ({ name, score, band, nextStep }) =>
      `Habari ${name}. Alama yako ya utayari ni ${score}. Uko katika kundi la ${band.toLowerCase()}. Hatua inayofuata: ${nextStep}.`,
    payments: {
      settlement: "Malipo ya mavuno",
      disbursement: "Utoaji wa mkopo",
      loan_repayment: "Kulipa mkopo",
    },
  },
};

export function supportedLocale(lang) {
  const short = String(lang || "en").toLowerCase().slice(0, 2);
  return COPY[short] ? short : "en";
}

export async function localizeProfile(raw, actions, advisory, lang) {
  const locale = supportedLocale(lang);
  const t = COPY[locale];
  const en = COPY.en;
  const useAi = locale !== "en" && isFeatherlessEnabled();

  async function dynamic(english, fallback) {
    if (locale === "en") return english;
    if (useAi) {
      const translated = await localizeDynamicContent(english, locale);
      if (translated) return translated;
    }
    return fallback || english;
  }

  const bandKey = raw.band;
  const band = t.bands[bandKey] || t.bands.building_trust;

  const englishWhy = en.why[raw.whyKey] || raw.why || "";
  const why = await dynamic(englishWhy, t.why[raw.whyKey]);

  const localizedActions = [];
  for (const action of actions || []) {
    const enCopy = en.actions[action.key] || {};
    const locCopy = t.actions[action.key] || {};
    const englishTitle = enCopy.title || action.key || action.text || "";
    const englishHow = enCopy.how || "";
    const englishImpact = enCopy.impact || "";
    const englishPhotoHint = enCopy.photoHint || "";
    const englishAudioHint = enCopy.audioHint || "";
    let status = "not_started";
    if (action.verified) status = "verified";
    else if (action.recommended) status = "recommended";
    localizedActions.push({
      id: action.id,
      title: await dynamic(englishTitle, locCopy.title),
      how: await dynamic(englishHow, locCopy.how),
      impact: await dynamic(englishImpact, locCopy.impact),
      photoHint: await dynamic(englishPhotoHint, locCopy.photoHint),
      audioHint: await dynamic(englishAudioHint, locCopy.audioHint),
      category: action.category,
      categoryLabel: t.categories[action.category] || action.category,
      points: action.points,
      verified: Boolean(action.verified),
      selfReported: Boolean(action.selfReported),
      evidence: action.evidence || null,
      status,
    });
  }
  localizedActions.sort((a, b) => b.points - a.points);

  const unclaimed = localizedActions.filter((action) => !action.verified);
  const unclaimedPoints = unclaimed.reduce((sum, action) => sum + (action.points || 0), 0);
  const potentialScore = Math.min(100, Number(raw.score) + unclaimedPoints);
  const nextStep = unclaimed[0]?.title || localizedActions[0]?.title || "";

  const climateKey = advisory?.advisoryKey || advisory?.key;
  const englishClimate = en.advisories[climateKey] || advisory?.text || advisory?.climateAdvisory || "";
  const climateAdvisory = await dynamic(englishClimate, t.advisories[climateKey]);

  let nextTierHint = "";
  if (!raw.disbursementEligible && raw.nextTierScore && raw.nextTierAmount) {
    nextTierHint = t.loan.nextTier(raw.nextTierScore, raw.nextTierAmount);
  } else if (!raw.disbursementEligible && raw.applyThreshold) {
    nextTierHint = t.loan.applyAt(raw.applyThreshold);
  }

  return {
    farmerName: raw.farmerName,
    memberNumber: raw.memberNumber,
    score: raw.score,
    band,
    bandKey,
    why,
    strengths: (raw.strengths || []).slice(0, 2).map((key) => t.signals[key] || key),
    gaps: (raw.gaps || []).slice(0, 2).map((key) => t.signals[key] || key),
    actions: localizedActions,
    climateAdvisory,
    disbursementEligible: Boolean(raw.disbursementEligible),
    eligibleAmount: Number(raw.eligibleAmount) || 0,
    farmerId: raw.farmerId || null,
    cooperativeId: raw.cooperativeId || null,
    phoneNumber: raw.phoneNumber || null,
    nextTierHint,
    applyThreshold: raw.applyThreshold || 50,
    lastUpdated: raw.lastUpdated || null,
    potentialScore,
    improveSummary:
      unclaimed.length === 0
        ? t.improve.none
        : t.improve.summary(unclaimed.length, raw.score, potentialScore),
    loanApplication: raw.loanApplication || null,
    payments: (raw.payments || []).map((payment) => ({
      id: payment.id,
      kind: payment.kind,
      kindLabel: t.payments[payment.kind] || payment.kind,
      amount: payment.amount,
      rawStatus: payment.rawStatus || null,
      status: paymentStatusLabel(payment.rawStatus, locale),
    })),
    deductions: (raw.deductions || []).map((row) => ({
      id: row.id,
      reason: row.reason || "loan_recovery",
      gross: Number(row.gross) || 0,
      deducted: Number(row.deducted) || 0,
      net: Number(row.net) || 0,
      rawStatus: row.rawStatus || null,
      status: paymentStatusLabel(row.rawStatus, locale),
    })),
    voiceGreetingText: t.greeting({
      name: raw.farmerName,
      score: raw.score,
      band,
      nextStep,
    }),
    locale,
  };
}
