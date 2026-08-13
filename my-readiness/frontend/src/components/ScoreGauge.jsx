const BAND_COLORS = {
  credit_ready: "#FF5C2A",
  almost_there: "#FB923C",
  building_trust: "#A0A0A0",
};

export default function ScoreGauge({ score, bandKey }) {
  const size = 220;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = circumference - (clamped / 100) * circumference;
  const color = BAND_COLORS[bandKey] || BAND_COLORS.almost_there;

  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <div className="orange-glow absolute inset-[-24px]" />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A2C"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 900ms ease",
            filter: "drop-shadow(0 0 8px rgba(255,92,42,0.85))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-bold leading-none tracking-tight text-white">{clamped}</span>
        <span className="mt-1 text-sm font-medium text-mute">/ 100</span>
      </div>
    </div>
  );
}
