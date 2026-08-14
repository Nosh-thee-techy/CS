const MAP = {
  completed: "Sent",
  pending: "Pending",
  failed: "Failed, retrying",
};

const SW_MAP = {
  completed: "Imetumwa",
  pending: "Inasubiri",
  failed: "Imeshindwa, inajaribu tena",
};

export function paymentStatusLabel(rawStatus, lang = "en") {
  const table = String(lang).startsWith("sw") ? SW_MAP : MAP;
  return table[rawStatus] || (String(lang).startsWith("sw") ? "Inakaguliwa" : "Checking status");
}
