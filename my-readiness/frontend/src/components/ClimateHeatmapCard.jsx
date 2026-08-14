import { useState } from "react";
import { useTranslation } from "react-i18next";
import FarmPlotMapCard from "./FarmPlotMapCard.jsx";

const ZONES = [
  {
    id: "KE-CEN-01",
    name: "Mt. Kenya South",
    subName: "Kiambu, Murang'a, Nyeri",
    status: "optimal", // 'optimal' | 'moderate' | 'alert'
    statusLabelEn: "Optimal Soil Moisture",
    statusLabelSw: "Unyevu wa Udongo Mwema",
    moisturePct: 82,
    rainfall: "88 mm / 30d",
    temp: "21°C",
    x: 48, // percentage for map marker/heat point
    y: 42,
    radius: 40,
    advisoryEn: "Soils are moist enough for planting. Stagger sowing over the next two weeks.",
    advisorySw: "Udongo una unyevu wa kutosha kupanda. Panda hatua kwa hatua wiki mbili zijazo.",
  },
  {
    id: "KE-RIFT-04",
    name: "Kericho & Bomet",
    subName: "Rift Highlands",
    status: "alert",
    statusLabelEn: "Pest & Risk Alert",
    statusLabelSw: "Tahadhari ya Wadudu",
    moisturePct: 38,
    rainfall: "22 mm / 30d",
    temp: "24°C",
    x: 32,
    y: 46,
    radius: 36,
    advisoryEn: "Fall armyworm detected 14 km NE — scout tea and maize plots within 72h.",
    advisorySw: "Minyoo ya jeshi (armyworm) imeonekana km 14 Kaskazini Mashariki — kagua shamba lako ndani ya saa 72.",
  },
  {
    id: "KE-RIFT-02",
    name: "Uasin Gishu Plateau",
    subName: "Eldoret, Kitale",
    status: "moderate",
    statusLabelEn: "Moderate Moisture",
    statusLabelSw: "Unyevu wa Kati",
    moisturePct: 62,
    rainfall: "78 mm / 30d",
    temp: "19°C",
    x: 35,
    y: 32,
    radius: 44,
    advisoryEn: "Moisture levels stable. Prepare seedbed for upcoming short-rain top dressing.",
    advisorySw: "Unyevu ni wa kuridhisha. Tayarisha udongo kwa ajili ya mbolea ya mvua fupi.",
  },
  {
    id: "KE-NYZ-03",
    name: "Nyanza Highlands",
    subName: "Kisii, Nyamira",
    status: "optimal",
    statusLabelEn: "High Moisture / Rainfall",
    statusLabelSw: "Unyevu wa Juu / Mvua Kubwa",
    moisturePct: 91,
    rainfall: "110 mm / 30d",
    temp: "22°C",
    x: 25,
    y: 52,
    radius: 38,
    advisoryEn: "Heavy rainfall pattern. Ensure adequate field drainage to prevent root rot.",
    advisorySw: "Mvua nyingi inatarajiwa. Hakikisha mitaro ya maji iko wazi ili kuzuia kuoza kwa mizizi.",
  },
  {
    id: "KE-EAS-02",
    name: "Coastal & Lower Eastern",
    subName: "Kilifi, Ukambani",
    status: "alert",
    statusLabelEn: "Dry / Heat Alert",
    statusLabelSw: "Hali ya Ukame / Joto",
    moisturePct: 31,
    rainfall: "54 mm / 30d",
    temp: "29°C",
    x: 75,
    y: 72,
    radius: 48,
    advisoryEn: "Dry spell active. Utilize mulching and prioritize water conservation techniques.",
    advisorySw: "Hali ya ukavu inaendelea. Tumia tandavu (mulching) na hifadhi maji kwa umwagiliaji.",
  },
];

export default function ClimateHeatmapCard({ profile }) {
  const { i18n } = useTranslation();
  const isSwahili = i18n.language?.startsWith("sw");

  const [mode, setMode] = useState("farm"); // 'farm' | 'region'

  // Pre-select zone matching profile if possible, otherwise default to Mt. Kenya
  const initialZone = ZONES.find((z) => profile?.climateAdvisory?.toLowerCase().includes("armyworm") ? z.id === "KE-RIFT-04" : z.id === "KE-CEN-01") || ZONES[0];
  
  const [selectedZone, setSelectedZone] = useState(initialZone);
  const [filter, setFilter] = useState("all"); // 'all' | 'optimal' | 'moderate' | 'alert'

  const filteredZones = filter === "all" ? ZONES : ZONES.filter((z) => z.status === filter);

  return (
    <article className="overflow-hidden rounded-[24px] border border-white/15 bg-panel shadow-2xl transition-all duration-300">
      {/* Header Bar with Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 bg-white/5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-ember/20 text-ember-glow">
            <CloudSunIcon />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-ember"></span>
            </span>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">
              {isSwahili ? "Elimu ya Hali ya Hewa & Shamba" : "Climate & Farm Intelligence"}
            </p>
            <p className="text-sm font-semibold text-white">
              {mode === "farm"
                ? isSwahili
                  ? "Ramani ya Shamba Lako (Inazunguka)"
                  : "My Rotatable Farm Plot Map (2D/3D)"
                : isSwahili
                ? "Angalia Hali ya Hewa Eneo Lako"
                : "Live Regional Agronomic Advisories"}
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setMode("farm")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mode === "farm" ? "bg-ember text-white shadow-lg" : "text-white/70 hover:text-white"
            }`}
          >
            🚜 {isSwahili ? "Shamba Langu (2D/3D)" : "My Farm Map"}
          </button>
          <button
            type="button"
            onClick={() => setMode("region")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mode === "region" ? "bg-ember text-white shadow-lg" : "text-white/70 hover:text-white"
            }`}
          >
            🗺️ {isSwahili ? "Mikoa ya Kenya" : "Kenya Region"}
          </button>
        </div>
      </div>

      {mode === "farm" ? (
        <div className="p-4">
          <FarmPlotMapCard profile={profile} />
        </div>
      ) : (
        <div className="relative p-4">
          {/* Filter Chips */}
          <div className="mb-3 flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-mute shrink-0">
            {isSwahili ? "Kichungi:" : "Filter:"}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filter === "all" ? "bg-white/20 text-white font-semibold shadow" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {isSwahili ? "Zote" : "All Zones"}
            </button>
            <button
              type="button"
              onClick={() => setFilter("optimal")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filter === "optimal" ? "bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40" : "bg-white/5 text-emerald-400/70"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {isSwahili ? "Nzuri" : "Optimal"}
            </button>
            <button
              type="button"
              onClick={() => setFilter("moderate")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filter === "moderate" ? "bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40" : "bg-white/5 text-amber-400/70"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {isSwahili ? "Kati" : "Watch"}
            </button>
            <button
              type="button"
              onClick={() => setFilter("alert")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filter === "alert" ? "bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/40" : "bg-white/5 text-rose-400/70"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              {isSwahili ? "Tahadhari" : "Alert"}
            </button>
          </div>
        </div>

        {/* Heatmap Graphic Area */}
        <div className="relative h-60 w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-2">
          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Kenya Contour Canvas SVG */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {/* Radial Gradients for Heat Blobs */}
              <radialGradient id="heat-optimal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-moderate" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#D97706" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-alert" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#E11D48" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Stylized Kenya Regional Boundary Lines */}
            <path
              d="M30 15 Q45 8, 65 12 T85 30 T80 65 T60 88 T35 80 T15 55 T20 30 Z"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
            <path
              d="M40 20 L55 45 L45 75 M55 45 L78 50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="0.5"
            />

            {/* Glowing Regional Heat Blobs */}
            {filteredZones.map((z) => {
              const gradId =
                z.status === "optimal"
                  ? "url(#heat-optimal)"
                  : z.status === "alert"
                  ? "url(#heat-alert)"
                  : "url(#heat-moderate)";
              const isSelected = selectedZone.id === z.id;
              return (
                <g key={z.id}>
                  <circle
                    cx={z.x}
                    cy={z.y}
                    r={isSelected ? z.radius * 1.25 : z.radius}
                    fill={gradId}
                    className="transition-all duration-500 ease-out"
                  />
                  {z.status === "alert" && (
                    <circle
                      cx={z.x}
                      cy={z.y}
                      r={z.radius * 0.9}
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="0.5"
                      className="animate-ping opacity-60"
                      style={{ animationDuration: "3s" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Heatmap Pin Hotspots */}
          {filteredZones.map((z) => {
            const isSelected = selectedZone.id === z.id;
            const isHomeZone = initialZone.id === z.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZone(z)}
                style={{ left: `${z.x}%`, top: `${z.y}%` }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all duration-300 ${
                  isSelected ? "z-30 scale-125" : "z-20 hover:scale-110"
                }`}
              >
                {/* Outer Glow Halo */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? "bg-white/20 shadow-lg ring-2 ring-white/60"
                      : "bg-black/40 hover:bg-black/60"
                  }`}
                >
                  {/* Pin Dot */}
                  <span
                    className={`h-4 w-4 rounded-full shadow-md transition-transform ${
                      z.status === "optimal"
                        ? "bg-emerald-400 shadow-emerald-500/50"
                        : z.status === "alert"
                        ? "bg-rose-500 shadow-rose-500/50"
                        : "bg-amber-400 shadow-amber-500/50"
                    } ${isSelected ? "scale-110" : ""}`}
                  />
                </div>

                {/* Pin Label Overlay */}
                <div
                  className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold shadow-md transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 ring-1 ring-black/20"
                      : "bg-black/80 text-white/90 group-hover:bg-black"
                  }`}
                >
                  {z.name}
                  {isHomeZone && (
                    <span className="ml-1 rounded bg-ember px-1 text-[8px] font-extrabold text-white">
                      {isSwahili ? "WAKO" : "YOU"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Map Controls & Watermark */}
          <div className="absolute bottom-2 left-2 pointer-events-none text-[10px] font-bold uppercase tracking-wider text-white/30">
            Kenya Agro-Ecological Heatmap
          </div>
        </div>

        {/* Selected Zone Detail Card & Agronomic Advisory */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedZone.name}</h3>
                <span className="text-xs text-mute font-medium">({selectedZone.subName})</span>
              </div>
              <p className="mt-0.5 text-xs text-mute">
                {isSwahili ? "Hali:" : "Zone Condition:"}{" "}
                <span
                  className={`font-semibold ${
                    selectedZone.status === "optimal"
                      ? "text-emerald-400"
                      : selectedZone.status === "alert"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {isSwahili ? selectedZone.statusLabelSw : selectedZone.statusLabelEn}
                </span>
              </p>
            </div>

            {/* Soil Moisture Mini Progress Bar */}
            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-mute font-medium">{isSwahili ? "Unyevu:" : "Soil Moisture:"}</span>
              <span className="font-bold text-white">{selectedZone.moisturePct}%</span>
              <div className="h-1.5 w-12 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedZone.status === "optimal"
                      ? "bg-emerald-400"
                      : selectedZone.status === "alert"
                      ? "bg-rose-500"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${selectedZone.moisturePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/5">
              <span className="text-ember-glow">🌧</span>
              <div>
                <span className="block text-[10px] text-mute">{isSwahili ? "Mvua (Siku 30)" : "Rainfall (30 Days)"}</span>
                <span className="font-semibold text-white">{selectedZone.rainfall}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/5">
              <span className="text-amber-400">🌡</span>
              <div>
                <span className="block text-[10px] text-mute">{isSwahili ? "Joto la Kawaida" : "Avg Temp"}</span>
                <span className="font-semibold text-white">{selectedZone.temp}</span>
              </div>
            </div>
          </div>

          {/* Agronomic Advisory Narrative Box */}
          <div className="mt-3.5 rounded-xl bg-ember/10 border border-ember/30 p-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-ember-glow font-bold text-sm">💡</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ember-glow">
                  {isSwahili ? "Ushauri wa Kilimo Ukanda Huu" : "Agronomic Recommendation"}
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-white">
                  {isSwahili ? selectedZone.advisorySw : selectedZone.advisoryEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </article>
  );
}

function CloudSunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 17h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 7 17Z"
        fill="rgba(255, 107, 0, 0.25)"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
