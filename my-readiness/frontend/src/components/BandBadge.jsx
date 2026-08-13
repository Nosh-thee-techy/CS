const STYLES = {
  credit_ready: "bg-ember text-white",
  almost_there: "bg-ember/20 text-ember-glow",
  building_trust: "bg-white/10 text-mute",
};

export default function BandBadge({ bandKey, label }) {
  const tone = STYLES[bandKey] || STYLES.almost_there;
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>
      {label}
    </span>
  );
}
