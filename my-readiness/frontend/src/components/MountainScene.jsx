export default function MountainScene({ className = "" }) {
  return (
    <svg
      viewBox="0 0 360 420"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1A22" />
          <stop offset="55%" stopColor="#163040" />
          <stop offset="100%" stopColor="#2A1A12" />
        </linearGradient>
        <linearGradient id="sunlit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB26B" />
          <stop offset="45%" stopColor="#E86A2A" />
          <stop offset="100%" stopColor="#6B2A14" />
        </linearGradient>
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2C3A44" />
          <stop offset="100%" stopColor="#0E1418" />
        </linearGradient>
      </defs>
      <rect width="360" height="420" fill="url(#sky)" />
      <circle cx="268" cy="118" r="28" fill="#F4C27A" opacity="0.9" />
      <path d="M0 250 L70 170 L110 210 L160 120 L210 190 L250 150 L360 250 V420 H0 Z" fill="url(#shade)" />
      <path d="M40 420 L160 120 L210 190 L250 150 L320 260 L360 230 V420 Z" fill="url(#sunlit)" />
      <path d="M160 120 L186 168 L210 190 L178 148 Z" fill="#FFF3D6" opacity="0.55" />
    </svg>
  );
}
