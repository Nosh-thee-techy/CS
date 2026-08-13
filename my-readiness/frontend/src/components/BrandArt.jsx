export default function BrandArt({ src, alt = "", className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="orange-glow pointer-events-none absolute inset-0" />
      <img src={src} alt={alt} className="relative z-10 mx-auto max-h-full w-full object-contain" />
    </div>
  );
}
