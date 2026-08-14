import { useState } from "react";
import { useTranslation } from "react-i18next";

const REALISTIC_FARM_PLOTS = [
  {
    id: "plot-a",
    name: "Plot A: Upper Tea Terrace",
    size: "0.8 Acres",
    cropName: "Tea (Purple & CG14)",
    produceIcon: "🍃",
    cropImage: "/tea-crop.png",
    expectedHarvest: "180 kg fresh leaf",
    estRevenue: "KES 11,700",
    readinessPct: 92,
    moisturePct: 84,
    moistureStatus: "Optimal Moisture",
    pestRisk: "low",
    pestNameEn: "🟢 Healthy Leaf Density (Low Pest)",
    pestNameSw: "🟢 Majani Yako Shwari (Wadudu Wachache)",
    predictionEn: "Peak flush growth. Optimal plucking window in 4–6 days. High quality grade A.",
    predictionSw: "Ukuaji mzuri wa majani. Wakati mzuri wa kuchuma ni siku 4–6 zijazo.",
    uploadedDate: "Aug 12, 14:22 EAT",
    uploadedNote: "Verified photo of fresh tea flush shoots.",
    aiHealthScore: "94% Chlorophyll Index",
    x: 34,
    y: 28,
    color: "#10B981",
  },
  {
    id: "plot-b",
    name: "Plot B: Maize & Legumes Field",
    size: "0.5 Acres",
    cropName: "Hybrid Maize (H614)",
    produceIcon: "🌽",
    cropImage: "/maize-crop.png",
    expectedHarvest: "14 Bags (90kg ea)",
    estRevenue: "KES 42,000",
    readinessPct: 65,
    moisturePct: 42,
    moistureStatus: "Moderate / Dry",
    pestRisk: "high",
    pestNameEn: "🚨 Fall Armyworm Migration Spore Alert",
    pestNameSw: "🚨 Tahadhari ya Minyoo ya Jeshi",
    predictionEn: "Pest vector approaching 14km NE. Spore density rising. Apply neem extract or biopesticide spray within 48h.",
    predictionSw: "Upepo wa wadudu kutoka km 14. Nyunyizia dawa ya neem au biopesticide ndani ya masaa 48.",
    uploadedDate: "Aug 09, 09:15 EAT",
    uploadedNote: "Maize leaf whorl inspection photo.",
    aiHealthScore: "72% Crop Vigour (Pest Risk)",
    x: 68,
    y: 40,
    color: "#F43F5E",
  },
  {
    id: "plot-c",
    name: "Plot C: Valley Vegetable Nursery",
    size: "0.4 Acres",
    cropName: "Tomatoes & Kales",
    produceIcon: "🍅",
    cropImage: "/tomato-crop.png",
    expectedHarvest: "350 kg ripe produce",
    estRevenue: "KES 24,500",
    readinessPct: 78,
    moisturePct: 92,
    moistureStatus: "High Saturation",
    pestRisk: "moderate",
    pestNameEn: "⚠️ Fungal Blight & Damping-off Risk",
    pestNameSw: "⚠️ Hatari ya Ugonjwa wa Baka (Fungus)",
    predictionEn: "Soil moisture high. Open drainage furrows on lower slope to prevent root rot.",
    predictionSw: "Unyevu mwingi unaweza kuoza mizizi. Chimbua mitaro ya maji sehemu ya chini.",
    uploadedDate: "Aug 07, 16:40 EAT",
    uploadedNote: "Tomato vine nursery photo.",
    aiHealthScore: "86% Fruit Development",
    x: 28,
    y: 72,
    color: "#F59E0B",
  },
  {
    id: "plot-d",
    name: "Plot D: Avocado Orchard",
    size: "0.4 Acres",
    cropName: "Avocado",
    produceIcon: "🥑",
    cropImage: "/avocado-crop.png",
    expectedHarvest: "450 kg mature avocado fruit",
    estRevenue: "KES 31,500",
    readinessPct: 88,
    moisturePct: 68,
    moistureStatus: "Optimal Moisture",
    pestRisk: "low",
    pestNameEn: "🟢 Healthy Tree Canopy (Low Pest Risk)",
    pestNameSw: "🟢 Miti Safi na Majani Mazuri",
    predictionEn: "Export harvesting window opens in 2 weeks. Optimal oil content. High co-op buyer demand.",
    predictionSw: "Msimu wa kuvuna parachichi za kulipwa vizuri unaanza wiki mbili zijazo.",
    uploadedDate: "Aug 11, 11:30 EAT",
    uploadedNote: "Avocado tree cluster photo uploaded & verified.",
    aiHealthScore: "96% Tree Canopy Health",
    x: 74,
    y: 76,
    color: "#059669",
  },
];

export default function FarmPlotMapCard({ profile }) {
  const { i18n } = useTranslation();
  const isSwahili = i18n.language?.startsWith("sw");

  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees
  const [is3D, setIs3D] = useState(true); // 3D perspective tilt vs 2D flat
  const [zoom, setZoom] = useState(1);
  const [mapStyle, setMapStyle] = useState("satellite"); // 'satellite' | 'textures' | 'heatmap'
  const [selectedPlot, setSelectedPlot] = useState(REALISTIC_FARM_PLOTS[0]);

  function rotateClockwise() {
    setRotation((prev) => (prev + 90) % 360);
  }

  function rotateCounterClockwise() {
    setRotation((prev) => (prev - 90 + 360) % 360);
  }

  function resetView() {
    setRotation(0);
    setIs3D(true);
    setZoom(1);
  }

  return (
    <div className="space-y-4">
      {/* Farm Overview Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <img
            src="/farm-aerial.png"
            alt="Farm Aerial Drone"
            className="h-12 w-12 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                {profile?.farmerName || "Wanjiku Kinuthia"}'s Farm Digital Twin
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                ✓ 100% Geo-Verified
              </span>
            </div>
            <p className="mt-0.5 text-xs text-mute font-medium">
              2.1 Acres · Kiambu County · Plot ID: KTDA-PLOT-8842 · Drone Pass: Yesterday 14:30 EAT
            </p>
          </div>
        </div>

        {/* Map Style Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-black/60 p-1 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setMapStyle("satellite")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mapStyle === "satellite" ? "bg-ember text-white shadow-md" : "text-white/70 hover:text-white"
            }`}
          >
            🛰️ {isSwahili ? "Picha ya Satelaiti" : "Satellite Photo"}
          </button>
          <button
            type="button"
            onClick={() => setMapStyle("textures")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mapStyle === "textures" ? "bg-ember text-white shadow-md" : "text-white/70 hover:text-white"
            }`}
          >
            🌾 {isSwahili ? "Mimea Ya Shamba" : "Realistic Produce"}
          </button>
          <button
            type="button"
            onClick={() => setMapStyle("heatmap")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mapStyle === "heatmap" ? "bg-ember text-white shadow-md" : "text-white/70 hover:text-white"
            }`}
          >
            🌡️ {isSwahili ? "Unyevu & Wadudu" : "Climate & Pest"}
          </button>
        </div>
      </div>

      {/* Realistic 2D/3D Interactive Canvas */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-950 p-4 shadow-2xl">
        {/* Floating Viewport Controls */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-2xl bg-black/75 p-2 border border-white/15 backdrop-blur-md shadow-2xl">
          <button
            type="button"
            title="Rotate Left 90°"
            onClick={rotateCounterClockwise}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-bold"
          >
            ↺
          </button>
          <button
            type="button"
            title="Rotate Right 90°"
            onClick={rotateClockwise}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-bold"
          >
            ↻
          </button>
          <button
            type="button"
            title="Toggle 2D / 3D Angle"
            onClick={() => setIs3D(!is3D)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              is3D ? "bg-ember text-white shadow" : "bg-white/10 text-white/70"
            }`}
          >
            {is3D ? "3D Perspective" : "2D Flat"}
          </button>
          <button
            type="button"
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-bold"
          >
            +
          </button>
          <button
            type="button"
            title="Zoom Out"
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-bold"
          >
            -
          </button>
          <button
            type="button"
            title="Reset View"
            onClick={resetView}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold"
          >
            🎯
          </button>
        </div>

        {/* Rotation Angle Overlay Badge */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-xl bg-black/75 px-3.5 py-1.5 border border-white/15 text-xs text-white/90 backdrop-blur-md shadow-lg">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Angle: {rotation}°</span>
          <span className="text-mute">·</span>
          <span>{is3D ? "3D Tilt (42°)" : "Top-Down 2D"}</span>
        </div>

        {/* Ground Canvas Viewport */}
        <div className="flex h-80 w-full items-center justify-center overflow-hidden py-4">
          <div
            className="relative h-72 w-full max-w-lg overflow-hidden rounded-3xl border-2 border-emerald-500/40 shadow-2xl transition-all duration-700 ease-out"
            style={{
              transform: `${
                is3D
                  ? `perspective(900px) rotateX(42deg) rotateZ(${rotation}deg) scale(${zoom})`
                  : `rotate(${rotation}deg) scale(${zoom})`
              }`,
              transformOrigin: "center center",
            }}
          >
            {/* Real Aerial Drone Survey Texture Base */}
            {mapStyle === "satellite" && (
              <img
                src="/farm-aerial.png"
                alt="Aerial Drone Survey"
                className="absolute inset-0 h-full w-full object-cover filter brightness-90 contrast-105"
              />
            )}

            {/* Realistic Crop Texture Base */}
            {mapStyle === "textures" && (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950">
                <img
                  src="/farm-plot-satellite.png"
                  alt="Realistic Crop Texture"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay"
                />
              </div>
            )}

            {/* Heatmap Layer Base */}
            {mapStyle === "heatmap" && (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-950 to-rose-950">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: `radial-gradient(circle at 70% 30%, rgba(244, 63, 94, 0.7) 0%, transparent 40%), radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.7) 0%, transparent 45%), radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.7) 0%, transparent 40%)`,
                  }}
                />
              </div>
            )}

            {/* Overlay Semi-Transparent Dark Glass Tint for Pins */}
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* SVG Farm Plot Boundaries & Realistic Crop Furrow Graphics */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Tea Plot Boundary */}
              <polygon
                points="8,8 55,8 48,45 8,42"
                fill="rgba(16, 185, 129, 0.18)"
                stroke="#10B981"
                strokeWidth="1"
                strokeDasharray="2,1"
              />
              <text x="20" y="22" fill="#FFFFFF" fontSize="3.8" fontWeight="bold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                🍃 Tea Terrace (0.8 Acre)
              </text>

              {/* Maize Field Boundary & Pest Radar Vector */}
              <polygon
                points="58,8 92,8 92,55 52,48"
                fill="rgba(244, 63, 94, 0.25)"
                stroke="#F43F5E"
                strokeWidth="1.2"
              />
              <text x="64" y="25" fill="#FFFFFF" fontSize="3.8" fontWeight="bold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                🌽 Maize Plot (Alert)
              </text>

              {/* Pest Spore Vector Line */}
              <g>
                <line x1="95" y1="5" x2="68" y2="35" stroke="#F43F5E" strokeWidth="1.4" strokeDasharray="1,1" />
                <polygon points="66,37 72,32 70,38" fill="#F43F5E" />
                <text x="72" y="15" fill="#F43F5E" fontSize="3" fontWeight="bold">
                  Armyworm Vector ↘
                </text>
              </g>

              {/* Vegetable Nursery Boundary */}
              <polygon
                points="8,45 48,48 44,92 8,88"
                fill="rgba(245, 158, 11, 0.2)"
                stroke="#F59E0B"
                strokeWidth="1"
              />
              <text x="18" y="66" fill="#FFFFFF" fontSize="3.8" fontWeight="bold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                🍅 Tomatoes & Nursery
              </text>

              {/* Avocado Orchard Boundary */}
              <polygon
                points="52,52 92,56 88,92 48,88"
                fill="rgba(5, 150, 105, 0.2)"
                stroke="#059669"
                strokeWidth="1"
              />
              <text x="60" y="70" fill="#FFFFFF" fontSize="3.8" fontWeight="bold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                🥑 Avocado Orchard
              </text>
            </svg>

            {/* Interactive Produce Hotspot Markers */}
            {REALISTIC_FARM_PLOTS.map((plot) => {
              const isSelected = selectedPlot.id === plot.id;
              const isAlert = plot.pestRisk === "high";
              const markerCounterRotation = -rotation;

              return (
                <button
                  key={plot.id}
                  type="button"
                  onClick={() => setSelectedPlot(plot)}
                  style={{ left: `${plot.x}%`, top: `${plot.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none transition-transform duration-300 ${
                    isSelected ? "scale-125 z-30" : "hover:scale-110"
                  }`}
                >
                  <div
                    style={{
                      transform: is3D
                        ? `rotateZ(${markerCounterRotation}deg) rotateX(-42deg)`
                        : `rotate(${markerCounterRotation}deg)`,
                      transformOrigin: "center center",
                    }}
                    className="flex flex-col items-center"
                  >
                    {/* Hotspot Produce Circle Badge with Live Glow */}
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-2xl shadow-2xl border-2 transition-all ${
                        isSelected
                          ? "border-white ring-4 ring-white/40 scale-110 shadow-2xl"
                          : "border-white/60 opacity-95 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: plot.color }}
                    >
                      <span className="text-lg">{plot.produceIcon}</span>

                      {/* Alert Pulse Ring */}
                      {isAlert && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex h-4 w-4 rounded-full bg-rose-600 text-[9px] font-black text-white flex items-center justify-center border border-white">
                            !
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Produce & Crop Tag */}
                    <div
                      className={`mt-1 whitespace-nowrap rounded-lg px-2 py-0.5 text-[9px] font-extrabold shadow-lg backdrop-blur-md transition-all ${
                        isSelected
                          ? "bg-white text-slate-950 ring-2 ring-black/30"
                          : "bg-slate-900/90 text-white border border-white/20"
                      }`}
                    >
                      {plot.cropName.split(" ")[0]} · {plot.expectedHarvest.split(" ")[0]} {plot.expectedHarvest.split(" ")[1]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Legend Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px] text-mute">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-white/90">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> 🍃 Tea Terrace (High Moisture)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-white/90">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> 🌽 Maize Field (Pest Alert)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-white/90">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> 🍅 Tomato Nursery
            </span>
            <span className="flex items-center gap-1.5 font-medium text-white/90">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> 🥑 Avocado Orchard
            </span>
          </div>
          <span className="font-semibold text-white/60">Rotate with ↺ ↻ buttons or drag perspective</span>
        </div>
      </div>

      {/* Selected Plot Micro-Details & Uploaded Produce Evidence */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-panel via-slate-900 to-panel p-5 shadow-2xl space-y-4">
        {/* Header Title & Produce Financial Yield */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedPlot.cropImage}
              alt={selectedPlot.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">{selectedPlot.name}</h3>
                <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/90">
                  {selectedPlot.size}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-mute font-semibold">
                Crop Variety: <span className="text-white">{selectedPlot.cropName}</span>
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="text-emerald-400 font-bold">🌾 Yield: {selectedPlot.expectedHarvest}</span>
                <span className="text-mute">·</span>
                <span className="text-amber-400 font-bold">💰 Est. Value: {selectedPlot.estRevenue}</span>
              </div>
            </div>
          </div>

          {/* Moisture Gauge */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 rounded-xl bg-black/50 px-3.5 py-2 border border-white/10 text-xs">
              <span className="text-mute font-medium">{isSwahili ? "Unyevu:" : "Plot Soil Moisture:"}</span>
              <span className="font-extrabold text-white text-sm">{selectedPlot.moisturePct}%</span>
              <div className="h-2 w-12 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedPlot.moisturePct}%`, backgroundColor: selectedPlot.color }}
                />
              </div>
            </div>
            <span className="text-[10px] font-bold text-mute uppercase tracking-wider">{selectedPlot.moistureStatus}</span>
          </div>
        </div>

        {/* Pest Prediction & Agronomic Actionable Box */}
        <div
          className={`rounded-2xl p-4 border shadow-lg ${
            selectedPlot.pestRisk === "high"
              ? "bg-rose-500/15 border-rose-500/40 text-rose-100"
              : selectedPlot.pestRisk === "moderate"
              ? "bg-amber-500/15 border-amber-500/40 text-amber-100"
              : "bg-emerald-500/15 border-emerald-500/40 text-emerald-100"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">
              {selectedPlot.pestRisk === "high" ? "🚨" : selectedPlot.pestRisk === "moderate" ? "⚠️" : "🟢"}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">
                {isSwahili ? selectedPlot.pestNameSw : selectedPlot.pestNameEn}
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-white">
                {isSwahili ? selectedPlot.predictionSw : selectedPlot.predictionEn}
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Farmer Produce Photo Verification Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📸</span>
              <h4 className="text-sm font-bold text-white">
                {isSwahili ? "Picha ya Mkulima ya Shamba Hili" : "Uploaded Produce Verification Photo"}
              </h4>
            </div>
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
              ✓ {selectedPlot.uploadedDate}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Uploaded Image Thumbnail */}
            <div className="relative group overflow-hidden rounded-xl border border-white/15">
              <img
                src={selectedPlot.cropImage}
                alt="Farmer uploaded produce photo"
                className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                Geo-Tagged Photo
              </span>
            </div>

            {/* AI Crop Analysis Notes */}
            <div className="sm:col-span-2 space-y-2 text-xs flex flex-col justify-center">
              <div className="flex items-center justify-between rounded-lg bg-black/30 p-2 border border-white/5">
                <span className="text-mute font-medium">{isSwahili ? "Uchambuzi wa AI:" : "AI Crop Health Score:"}</span>
                <span className="font-bold text-emerald-400">{selectedPlot.aiHealthScore}</span>
              </div>
              <p className="text-white/80 leading-relaxed italic">
                "{selectedPlot.uploadedNote}"
              </p>
              <p className="text-[10px] text-mute">
                Verified by KTDA Co-operative Field Inspector · Photo hash recorded on platform ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
