function norm(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(q, words) {
  return words.some((word) => q.includes(word));
}

export function kaliReply(text, { profile, locale } = {}) {
  const q = norm(text);
  const sw = String(locale || "en").startsWith("sw");
  const t = sw ? SW : EN;

  if (!q) return t.askAgain;

  if (hasAny(q, ["hello", "hi", "hey", "habari", "niaje", "sasa", "mambo"])) {
    return profile?.voiceGreetingText || (profile ? t.helloNamed(profile.farmerName) : t.hello);
  }

  if (hasAny(q, ["who are you", "your name", "wewe nani", "jina"])) {
    return t.who;
  }

  if (hasAny(q, ["score", "alama", "readiness", "utayari", "why", "kwa nini"])) {
    if (!profile) return t.needLookup;
    return t.score(profile);
  }

  if (hasAny(q, ["loan", "mkopo", "eligible", "qualify", "stahili", "apply", "omba", "how much", "kiasi"])) {
    if (!profile) return t.needLookup;
    return t.loan(profile);
  }

  if (hasAny(q, ["repay", "pay back", "lipa", "owed", "deni"])) {
    if (!profile) return t.needLookup;
    return t.repay;
  }

  if (hasAny(q, ["improve", "boresha", "action", "hatua", "points", "what should i do", "nifanye"])) {
    if (!profile) return t.needLookup;
    return t.improve(profile);
  }

  if (hasAny(q, ["climate", "weather", "rain", "hewa", "mvua", "advisory"])) {
    if (!profile) return t.needLookup;
    return t.climate(profile);
  }

  if (hasAny(q, ["lookup", "member", "namba", "login", "ingia"])) {
    return t.lookup;
  }

  if (hasAny(q, ["help", "saidia", "nini", "what can you", "unaweza"])) {
    return t.help;
  }

  return t.fallback;
}

const EN = {
  hello: "Hi, I'm Kali from KaLI Coop. Ask me about your score, a loan, or how to improve.",
  helloNamed: (name) => `Hi ${name}. I'm Kali. Ask me about your score, a loan, or what to do next.`,
  who: "I'm Kali, your KaLI Coop helper. I can talk or chat. I only repeat what this app already shows — I don't change your score.",
  needLookup: "Look yourself up first with your member number, phone, or national ID. Then I can talk about your score.",
  lookup: "No login. On the first screen, enter your member number, phone, or ID, then tap Check my score.",
  help: "I can explain your score, how much you qualify to borrow, how to apply, how to pay back, and the steps on Improve. What do you want to know?",
  fallback: "I can help with your score, loans, or Improve steps. Try asking: what is my score, can I get a loan, or what should I do next?",
  score: (p) =>
    `Your readiness score is ${p.score}. You are ${p.band}. ${p.why} Reporting a step does not change the score until an officer verifies it.`,
  loan: (p) => {
    if (p.loanApplication?.status === "pending") {
      return `Your loan application is being reviewed. Reference ${p.loanApplication.reference}.`;
    }
    if (p.disbursementEligible) {
      return `You qualify for up to KES ${Number(p.eligibleAmount).toLocaleString("en-KE")}. On Loan, choose how much you want — not more than that — say what it is for, then confirm with an SMS code.`;
    }
    return p.nextTierHint
      ? `${p.nextTierHint} Open the Loan tab to see the steps. Nothing is sent until you qualify.`
      : "You are not eligible to apply yet. Raise your score on the Improve tab first.";
  },
  repay:
    "If you have a loan that has already been sent, open Loan and choose Pay back. Harvest payouts can take a deduction for the loan — Loan shows how much was taken and how much you received.",
  improve: (p) => {
    const next = (p.actions || []).find((a) => !a.verified);
    const extra = next ? ` A strong next step is: ${next.title}.` : "";
    return `${p.improveSummary}${extra} On Improve, take a photo or record a short voice note so an officer can check. That does not change your score today.`;
  },
  climate: (p) =>
    p.climateAdvisory
      ? `Climate advisory for your zone: ${p.climateAdvisory} Stick to that this season.`
      : "I don't have a climate advisory on this lookup yet.",
  askAgain: "I'm listening. Tell me what you need.",
};

const SW = {
  hello: "Habari, mimi ni Kali wa KaLI Coop. Niulize kuhusu alama, mkopo, au jinsi ya kuboresha.",
  helloNamed: (name) => `Habari ${name}. Mimi ni Kali. Niulize kuhusu alama, mkopo, au hatua inayofuata.`,
  who: "Mimi ni Kali, msaidizi wa KaLI Coop. Naweza kuzungumza au kuandika. Narudia tu kinachoonekana kwenye programu — sibadilishi alama yako.",
  needLookup: "Tafuta kwanza kwa namba ya mwanachama, simu, au kitambulisho. Kisha nitaweza kuongea kuhusu alama yako.",
  lookup: "Hauhitaji kuingia. Kwenye skrini ya kwanza, weka namba ya mwanachama, simu, au kitambulisho, kisha gusa Angalia alama yangu.",
  help: "Naweza kueleza alama yako, kiasi unachostahili, jinsi ya kuomba, jinsi ya kulipa, na hatua za Boresha. Unataka kujua nini?",
  fallback: "Naweza kusaidia kuhusu alama, mikopo, au hatua za Boresha. Jaribu: alama yangu ni nini, naweza pata mkopo, au nifanye nini?",
  score: (p) =>
    `Alama yako ya utayari ni ${p.score}. Uko ${p.band}. ${p.why} Kuripoti hatua hakubadilishi alama hadi afisa athibitishe.`,
  loan: (p) => {
    if (p.loanApplication?.status === "pending") {
      return `Ombi lako la mkopo linaangaliwa. Kumbukumbu ${p.loanApplication.reference}.`;
    }
    if (p.disbursementEligible) {
      return `Unastahili hadi KES ${Number(p.eligibleAmount).toLocaleString("en-KE")}. Kwenye Mkopo, chagua kiasi — si zaidi ya hicho — sema madhumuni, kisha thibitisha kwa SMS.`;
    }
    return p.nextTierHint
      ? `${p.nextTierHint} Fungua Mkopo kuona hatua. Hakuna kinachotumwa hadi ustahili.`
      : "Bado hufai kuomba. Inua alama kwenye Boresha kwanza.";
  },
  repay:
    "Ukawa na mkopo uliotumwa, fungua Mkopo na chagua Lipa. Malipo ya mavuno yanaweza kata mkopo — Mkopo inaonyesha kiasi kilichotolewa na ulichopokea.",
  improve: (p) => {
    const next = (p.actions || []).find((a) => !a.verified);
    const extra = next ? ` Hatua nzuri inayofuata: ${next.title}.` : "";
    return `${p.improveSummary}${extra} Kwenye Boresha, piga picha au rekodi sauti fupi ili afisa athibitishe. Hiyo haibadilishi alama leo.`;
  },
  climate: (p) =>
    p.climateAdvisory
      ? `Ushauri wa hali ya hewa kwa eneo lako: ${p.climateAdvisory} Fuata huo msimu huu.`
      : "Sina ushauri wa hali ya hewa kwenye utafutaji huu bado.",
  askAgain: "Ninasikiliza. Niambie unahitaji nini.",
};
