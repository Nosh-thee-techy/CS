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
    actions: {
      deliver_every_harvest: "Deliver every harvest this season",
      save_with_chama: "Save with your chama monthly",
      keep_repayments_current: "Keep loan repayments current",
      attend_coop_meetings: "Attend your next co-op meeting",
      keep_input_receipts: "Keep receipts for seed, fertiliser, and spray",
    },
    advisories: {
      light_rainfall: "Light rainfall expected — plan input purchases early.",
      good_planting: "Soils are moist enough for planting. Stagger sowing over the next two weeks.",
      heavy_rains: "Heavy rains likely. Protect stored harvest and delay spraying.",
      dry_spell: "A short dry spell is coming. Mulch and water seedlings if you can.",
    },
    greeting: ({ name, score, band, nextStep }) =>
      `Hello ${name}. Your readiness score is ${score}. You are ${band.toLowerCase()}. Next step: ${nextStep}.`,
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
    actions: {
      deliver_every_harvest: "Leta mavuno kila msimu huu",
      save_with_chama: "Weka akiba kwenye chama chako kila mwezi",
      keep_repayments_current: "Endelea kulipa mkopo kwa wakati",
      attend_coop_meetings: "Hudhuria mkutano ujao wa ushirika",
      keep_input_receipts: "Hifadhi risiti za mbegu, mbolea, na dawa",
    },
    advisories: {
      light_rainfall: "Mvua kidogo inatarajiwa — panga kununua pembejeo mapema.",
      good_planting: "Udongo una unyevu wa kutosha kupanda. Panda hatua kwa hatua wiki mbili zijazo.",
      heavy_rains: "Mvua nyingi zinawezekana. Linda mavuno yaliyohifadhiwa na chelewesha kunyunyizia dawa.",
      dry_spell: "Kipindi kifupi cha ukame kinakuja. Funika udongo na nywesha miche ukiweza.",
    },
    greeting: ({ name, score, band, nextStep }) =>
      `Habari ${name}. Alama yako ya utayari ni ${score}. Uko katika kundi la ${band.toLowerCase()}. Hatua inayofuata: ${nextStep}.`,
  },
};

export function supportedLocale(lang) {
  const short = String(lang || "en").toLowerCase().slice(0, 2);
  return COPY[short] ? short : "en";
}

export function localizeProfile(raw, actions, advisory, lang) {
  const locale = supportedLocale(lang);
  const t = COPY[locale];
  const band = t.bands[raw.band] || t.bands.building_trust;
  const localizedActions = (actions || []).map((action) => ({
    id: action.id,
    text: t.actions[action.key] || action.key || action.text,
    verified: Boolean(action.verified),
    selfReported: Boolean(action.selfReported),
  }));
  const nextStep = localizedActions.find((action) => !action.verified)?.text
    || localizedActions[0]?.text
    || "";
  const climateKey = advisory?.advisoryKey || advisory?.key;
  const climateAdvisory =
    t.advisories[climateKey] || advisory?.text || advisory?.climateAdvisory || "";

  return {
    farmerName: raw.farmerName,
    memberNumber: raw.memberNumber,
    score: raw.score,
    band,
    bandKey: raw.band,
    why: t.why[raw.whyKey] || raw.why || "",
    strengths: (raw.strengths || []).map((key) => t.signals[key] || key),
    gaps: (raw.gaps || []).map((key) => t.signals[key] || key),
    actions: localizedActions,
    climateAdvisory,
    disbursementEligible: Boolean(raw.disbursementEligible),
    voiceGreetingText: t.greeting({
      name: raw.farmerName,
      score: raw.score,
      band,
      nextStep,
    }),
    locale,
  };
}
