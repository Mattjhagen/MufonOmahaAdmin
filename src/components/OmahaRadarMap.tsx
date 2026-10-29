import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Radio, MapPin, Eye, AlertCircle, Compass, Layers, Shield, 
  Flame, Activity, Zap, SlidersHorizontal, Target, Info, Check,
  ArrowUpRight, ExternalLink, FileText, Sparkles
} from 'lucide-react';
import { SightingReport, ReportStatus } from '../types';

interface OmahaRadarMapProps {
  reports: SightingReport[];
  onSelectReport: (report: SightingReport) => void;
}

interface HotspotZone {
  id: string;
  name: string;
  subname: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  densityLevel: 'Critical' | 'Elevated' | 'Moderate' | 'Emerging';
  densityScore: number; // 0-100
  casesCount: number;
  description: string;
  proximityNote: string;
}

export const OmahaRadarMap: React.FC<OmahaRadarMapProps> = ({
  reports,
  onSelectReport
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showOffuttAirspace, setShowOffuttAirspace] = useState(true);
  const [showEppleyAirspace, setShowEppleyAirspace] = useState(true);
  
  // Heat Map Controls
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [heatMapIntensity, setHeatMapIntensity] = useState<'standard' | 'high' | 'ultra'>('high');
  const [heatMapRadius, setHeatMapRadius] = useState<'compact' | 'balanced' | 'wide'>('balanced');
  const [viewMode, setViewMode] = useState<'hybrid' | 'heatmap' | 'pins'>('hybrid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [focusedHotspotId, setFocusedHotspotId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'dossier' | 'pins' | 'hotspots'>('dossier');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Key Omaha coordinates normalized to canvas grid (relative percentages)
  // Omaha bbox roughly: Lat 40.98 to 41.36, Lng -96.25 to -95.82
  const minLat = 40.98;
  const maxLat = 41.36;
  const minLng = -96.25;
  const maxLng = -95.82;

  const toMapCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Filtered reports for map display
  const activeReports = useMemo(() => {
    return reports.filter(r => {
      if (statusFilter === 'all') return true;
      return r.status === statusFilter;
    });
  }, [reports, statusFilter]);

  // Defined Omaha Regional Hotspot Corridors
  const hotspotZones: HotspotZone[] = useMemo(() => {
    const zones: HotspotZone[] = [
      {
        id: 'zone-offutt',
        name: 'Offutt AFB / Bellevue Corridor',
        subname: 'USSTRATCOM & Runway 12/30 Approach Sector',
        centerLat: 41.115,
        centerLng: -95.925,
        radiusKm: 6.5,
        densityLevel: 'Critical',
        densityScore: 96,
        casesCount: 0,
        description: 'Persistent high-altitude and close-encounter clusters along the South Omaha/Bellevue military airspace boundary.',
        proximityNote: '1.4 - 3.8 miles from active Offutt AFB controlled perimeter'
      },
      {
        id: 'zone-riverfront',
        name: 'Downtown Omaha & Missouri River Corridor',
        subname: 'Eppley Airfield Commercial Inbound Vector',
        centerLat: 41.260,
        centerLng: -95.920,
        radiusKm: 5.0,
        densityLevel: 'Elevated',
        densityScore: 82,
        casesCount: 0,
        description: 'Maneuvering luminous orbs and daylight cylinders recorded over Gene Leahy Mall, Bob Kerrey Bridge, and Council Bluffs bluffs.',
        proximityNote: 'Class C Eppley radar corridor (0-5,000 ft MSL)'
      },
      {
        id: 'zone-papillion',
        name: 'Papillion & Chalco Hills Watershed',
        subname: 'Southwest Douglas / Sarpy County Basin',
        centerLat: 41.152,
        centerLng: -96.095,
        radiusKm: 7.0,
        densityLevel: 'Elevated',
        densityScore: 78,
        casesCount: 0,
        description: 'Frequent suburban nocturnal lights and low-altitude formations crossing Wehrspann Lake and Shadow Lake.',
        proximityNote: 'Low ambient light index, high visibility ridge'
      },
      {
        id: 'zone-standing-bear',
        name: 'Northwest Omaha & Standing Bear Lake',
        subname: 'Douglas County Northern High Ground',
        centerLat: 41.320,
        centerLng: -96.121,
        radiusKm: 5.5,
        densityLevel: 'Moderate',
        densityScore: 68,
        casesCount: 0,
        description: 'Stationary daylight disc/tic-tac hover events and high-velocity vertical climbs.',
        proximityNote: 'Adjacent to rural Washington County agricultural corridor'
      },
      {
        id: 'zone-platte-river',
        name: 'Platte River Valley Corridor',
        subname: 'Louisville / Mahoney State Park Ridge',
        centerLat: 41.018,
        centerLng: -96.220,
        radiusKm: 8.0,
        densityLevel: 'Moderate',
        densityScore: 64,
        casesCount: 0,
        description: 'Low-frequency hums and large triangular craft navigating tree-top level river topography.',
        proximityNote: 'Electromagnetic static reports along Hwy 66'
      }
    ];

    // Compute live case distribution per zone
    zones.forEach(zone => {
      const count = activeReports.filter(rep => {
        const dLat = Math.abs(rep.location.lat - zone.centerLat);
        const dLng = Math.abs(rep.location.lng - zone.centerLng);
        return dLat < 0.08 && dLng < 0.12;
      }).length;
      zone.casesCount = count;
    });

    return zones;
  }, [activeReports]);

  // Selected report object
  const selectedReport = reports.find(r => r.id === selectedCaseId);

  // Draw Heat Map on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showHeatMap || viewMode === 'pins') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Synchronize canvas resolution with display size
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Heat radius mapping
    let radius = 55;
    if (heatMapRadius === 'compact') radius = 38;
    if (heatMapRadius === 'wide') radius = 75;

    // Intensity alpha multiplier
    let intensityMultiplier = 1.0;
    if (heatMapIntensity === 'standard') intensityMultiplier = 0.75;
    if (heatMapIntensity === 'ultra') intensityMultiplier = 1.35;

    // Step 1: Create an offscreen canvas to accumulate density as grayscale alpha
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // Plot each active sighting as a radial Gaussian density blob
    activeReports.forEach(rep => {
      const coords = toMapCoords(rep.location.lat, rep.location.lng);
      const px = (coords.x / 100) * width;
      const py = (coords.y / 100) * height;

      // Bonus weight for high-credibility sightings or close encounters
      let weight = 1.0;
      if (rep.classification.hynek.startsWith('CE-')) weight = 1.3;
      if (rep.credibilityScore > 90) weight += 0.2;

      const radGrad = offCtx.createRadialGradient(px, py, 2, px, py, radius);
      radGrad.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1.0, 0.45 * weight * intensityMultiplier)})`);
      radGrad.addColorStop(0.35, `rgba(0, 0, 0, ${Math.min(1.0, 0.28 * weight * intensityMultiplier)})`);
      radGrad.addColorStop(0.7, `rgba(0, 0, 0, ${Math.min(1.0, 0.12 * weight * intensityMultiplier)})`);
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      offCtx.fillStyle = radGrad;
      offCtx.beginPath();
      offCtx.arc(px, py, radius, 0, Math.PI * 2);
      offCtx.fill();
    });

    // Also plot subtle background ambient density for established Omaha corridors
    // to reflect historical MUFON sighting archives
    hotspotZones.forEach(zone => {
      const coords = toMapCoords(zone.centerLat, zone.centerLng);
      const px = (coords.x / 100) * width;
      const py = (coords.y / 100) * height;
      const ambientRadius = radius * 1.25;

      const radGrad = offCtx.createRadialGradient(px, py, 0, px, py, ambientRadius);
      radGrad.addColorStop(0, `rgba(0, 0, 0, ${0.18 * intensityMultiplier})`);
      radGrad.addColorStop(0.5, `rgba(0, 0, 0, ${0.08 * intensityMultiplier})`);
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      offCtx.fillStyle = radGrad;
      offCtx.beginPath();
      offCtx.arc(px, py, ambientRadius, 0, Math.PI * 2);
      offCtx.fill();
    });

    // Step 2: Color-map the accumulated density to thermal radar palette
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Palette Lookup: 0 to 255 alpha -> [r, g, b, alpha]
    // Spectral progression:
    // Low: Deep Cyan / Teal -> Mid: Emerald / Yellow -> High: Radiant Orange / Crimson -> Ultra: Pure Hot White
    const outImg = ctx.createImageData(width, height);
    const outData = outImg.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        let r = 0, g = 0, b = 0, a = alpha;

        if (alpha < 45) {
          // Deep Navy / Cyan boundary
          const t = alpha / 45;
          r = Math.floor(6 * t);
          g = Math.floor(182 * t);
          b = Math.floor(212 * t);
          a = Math.floor(alpha * 0.9);
        } else if (alpha < 95) {
          // Cyan to Emerald transition
          const t = (alpha - 45) / 50;
          r = Math.floor(6 + (16 - 6) * t);
          g = Math.floor(182 + (185 - 182) * t);
          b = Math.floor(212 + (129 - 212) * t);
          a = Math.floor(130 + 50 * t);
        } else if (alpha < 155) {
          // Emerald to Vibrant Amber/Yellow
          const t = (alpha - 95) / 60;
          r = Math.floor(16 + (245 - 16) * t);
          g = Math.floor(185 + (158 - 185) * t);
          b = Math.floor(129 + (11 - 129) * t);
          a = Math.floor(180 + 35 * t);
        } else if (alpha < 215) {
          // Amber to Searing Red/Crimson
          const t = (alpha - 155) / 60;
          r = Math.floor(245 + (239 - 245) * t);
          g = Math.floor(158 + (68 - 158) * t);
          b = Math.floor(11 + (68 - 11) * t);
          a = Math.floor(215 + 25 * t);
        } else {
          // Critical Center: Crimson to Hot White/Magenta
          const t = (alpha - 215) / 40;
          r = Math.floor(239 + (255 - 239) * t);
          g = Math.floor(68 + (255 - 68) * t);
          b = Math.floor(68 + (255 - 68) * t);
          a = Math.min(255, Math.floor(240 + 15 * t));
        }

        outData[i] = r;
        outData[i + 1] = g;
        outData[i + 2] = b;
        outData[i + 3] = a;
      }
    }

    ctx.putImageData(outImg, 0, 0);
  }, [activeReports, showHeatMap, heatMapIntensity, heatMapRadius, viewMode, hotspotZones]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <span>Omaha Metro Geospatial Radar & Heat Map Correlator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Geographic frequency analysis correlating historical and active sightings with Offutt AFB Class C airspace and Eppley runway approaches.
            </p>
          </div>

          {/* Quick Heatmap & View Mode Pill Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('hybrid')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'hybrid'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hybrid (Heat + Pins)</span>
            </button>

            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'heatmap'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-200" />
              <span>Heat Map Only</span>
            </button>

            <button
              onClick={() => setViewMode('pins')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'pins'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Vector Pins Only</span>
            </button>
          </div>
        </div>

        {/* Heat Map Tuning & Airspace Layer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
          {/* Layer toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={showHeatMap}
                onChange={(e) => setShowHeatMap(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-900"
              />
              <span className="flex items-center gap-1 text-rose-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Density Heat Map Layer</span>
              </span>
            </label>

            <span className="text-slate-700">|</span>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showOffuttAirspace}
                onChange={(e) => setShowOffuttAirspace(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 bg-slate-900"
              />
              <span className="text-amber-400">Offutt AFB Airspace (55th Wing)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showEppleyAirspace}
                onChange={(e) => setShowEppleyAirspace(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 bg-slate-900"
              />
              <span className="text-cyan-400">Eppley KOMA Corridor</span>
            </label>
          </div>

          {/* Density Heat Intensity & Radius Settings */}
          {showHeatMap && viewMode !== 'pins' && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                <span>Intensity:</span>
                <select
                  value={heatMapIntensity}
                  onChange={(e) => setHeatMapIntensity(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="standard">Standard</option>
                  <option value="high">High Gain</option>
                  <option value="ultra">Ultra / Thermal Peak</option>
                </select>
              </div>

              <span className="text-slate-700">|</span>

              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Kernel Radius:</span>
                <select
                  value={heatMapRadius}
                  onChange={(e) => setHeatMapRadius(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="compact">Compact (38px)</option>
                  <option value="balanced">Balanced (55px)</option>
                  <option value="wide">Wide Dispersal (75px)</option>
                </select>
              </div>

              <span className="text-slate-700">|</span>

              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Data Scope:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="all">All Sighting Data</option>
                  <option value="approved">Approved & Public Only</option>
                  <option value="pending">Pending Triage Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout: Radar & Heatmap Canvas + Case Details sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar & Heatmap Map Canvas */}
        <div 
          ref={containerRef}
          className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between min-h-[560px]"
        >
          {/* Subtle Radar Ring Background */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-cyan-500/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-cyan-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-cyan-500/10" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/15" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/15" />
          </div>

          {/* Map Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 z-10 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 font-bold">RADAR SWEEP ACTIVE</span>
              <span className="text-slate-600">·</span>
              <span>OMAHA TRACON / SECTOR NE-008</span>
              {showHeatMap && viewMode !== 'pins' && (
                <span className="hidden sm:inline-flex items-center gap-1 font-sans text-[11px] px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold ml-2">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Density Overlay ON</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-sm">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>Click any pin to open CaseDetailModal</span>
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
                <Compass className="w-4 h-4" />
                <span>N 41.2586° / W 95.9375°</span>
              </div>
            </div>
          </div>

          {/* Interactive Geographic Canvas */}
          <div className="relative w-full h-[430px] my-4 rounded-xl border border-slate-900/60 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 overflow-hidden shadow-inner">
            {/* Layer 1: HTML5 Dynamic Heatmap Canvas */}
            {showHeatMap && viewMode !== 'pins' && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-85 transition-opacity"
              />
            )}

            {/* Layer 2: Missouri River SVG & Airspace Overlays */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-10">
              <path
                d="M 72 0 Q 75 120 74 200 T 78 300 T 80 430"
                fill="none"
                stroke="#0284c7"
                strokeWidth="4"
                strokeDasharray="6 3"
              />
              <text x="75%" y="15%" fill="#38bdf8" fontSize="10" fontFamily="monospace">Missouri River</text>
            </svg>

            {/* Offutt AFB Airspace Zone */}
            {showOffuttAirspace && (
              <div 
                className="absolute rounded-full border border-amber-500/50 bg-amber-500/10 pointer-events-none flex items-center justify-center z-15"
                style={{
                  left: '68%',
                  top: '64%',
                  width: '135px',
                  height: '135px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-[10px] font-mono text-amber-300 font-bold bg-slate-950/85 px-2 py-0.5 rounded border border-amber-500/50 shadow-lg">
                  OFFUTT AFB (Class C)
                </div>
              </div>
            )}

            {/* Eppley Airfield Airspace Zone */}
            {showEppleyAirspace && (
              <div 
                className="absolute rounded-full border border-cyan-500/50 bg-cyan-500/10 pointer-events-none flex items-center justify-center z-15"
                style={{
                  left: '73%',
                  top: '28%',
                  width: '115px',
                  height: '115px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-[10px] font-mono text-cyan-300 font-bold bg-slate-950/85 px-2 py-0.5 rounded border border-cyan-500/50 shadow-lg">
                  EPPLEY AIRFIELD
                </div>
              </div>
            )}

            {/* Dynamic Pulsing Hotspot Highlights for Peak Sectors */}
            {showHeatMap && viewMode !== 'pins' && (
              <>
                {/* Offutt AFB Hotspot Pulsing Halo */}
                <div 
                  className="absolute pointer-events-none z-15"
                  style={{ left: '68%', top: '64%', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-16 h-16 rounded-full bg-rose-500/25 animate-ping opacity-60" />
                </div>

                {/* Riverfront Hotspot Pulsing Halo */}
                <div 
                  className="absolute pointer-events-none z-15"
                  style={{ left: '63%', top: '38%', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 animate-ping opacity-40" />
                </div>
              </>
            )}

            {/* Focused Hotspot Target Reticle */}
            {focusedHotspotId && (() => {
              const zone = hotspotZones.find(z => z.id === focusedHotspotId);
              if (!zone) return null;
              const coords = toMapCoords(zone.centerLat, zone.centerLng);
              return (
                <div
                  className="absolute z-25 pointer-events-none"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-rose-400 animate-spin opacity-80" style={{ animationDuration: '10s' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500/30 border border-rose-400" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-slate-950/90 text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-800">
                    FOCUS: {zone.name}
                  </div>
                </div>
              );
            })()}

            {/* Landmark Markers */}
            <div className="absolute text-[10px] font-mono text-slate-500 z-15" style={{ left: '26%', top: '16%' }}>
              ▲ Standing Bear Lake
            </div>
            <div className="absolute text-[10px] font-mono text-slate-500 z-15" style={{ left: '46%', top: '56%' }}>
              ▲ Chalco Hills / Papillion
            </div>
            <div className="absolute text-[10px] font-mono text-slate-500 z-15" style={{ left: '62%', top: '38%' }}>
              ▲ Downtown Omaha / RiverFront
            </div>
            <div className="absolute text-[10px] font-mono text-slate-500 z-15" style={{ left: '12%', top: '82%' }}>
              ▲ Platte River State Park
            </div>

            {/* Plot Sighting Case Markers (Clickable Pins that open CaseDetailModal) */}
            {activeReports.map((rep) => {
              const coords = toMapCoords(rep.location.lat, rep.location.lng);
              const isSelected = rep.id === selectedCaseId;

              // Distinct theme colors based on report status
              let pinTheme = {
                bg: 'bg-emerald-600',
                border: 'border-emerald-300',
                text: 'text-white',
                glow: 'shadow-[0_0_12px_rgba(16,185,129,0.7)]',
                needle: 'bg-emerald-400',
                pulse: 'bg-emerald-400/40',
                ring: 'ring-emerald-400'
              };

              if (rep.status === 'pending') {
                pinTheme = {
                  bg: 'bg-amber-500',
                  border: 'border-amber-200',
                  text: 'text-slate-950 font-bold',
                  glow: 'shadow-[0_0_16px_rgba(245,158,11,0.8)]',
                  needle: 'bg-amber-400',
                  pulse: 'bg-amber-400/60',
                  ring: 'ring-amber-300'
                };
              } else if (rep.status === 'rejected') {
                pinTheme = {
                  bg: 'bg-rose-600',
                  border: 'border-rose-300',
                  text: 'text-white',
                  glow: 'shadow-[0_0_12px_rgba(244,63,94,0.7)]',
                  needle: 'bg-rose-400',
                  pulse: 'bg-rose-400/40',
                  ring: 'ring-rose-400'
                };
              } else if (rep.status === 'draft') {
                pinTheme = {
                  bg: 'bg-cyan-800',
                  border: 'border-cyan-400',
                  text: 'text-cyan-200',
                  glow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]',
                  needle: 'bg-cyan-400',
                  pulse: 'bg-cyan-400/40',
                  ring: 'ring-cyan-400'
                };
              }

              return (
                <button
                  type="button"
                  key={rep.id}
                  onClick={() => {
                    setSelectedCaseId(rep.id);
                    onSelectReport(rep);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCaseId(rep.id);
                      onSelectReport(rep);
                    }
                  }}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                  className={`absolute cursor-pointer z-30 group focus:outline-none transition-all duration-200 ${
                    isSelected ? 'z-40 scale-110' : 'hover:scale-115 hover:z-50'
                  }`}
                  title={`Click pin to open CaseDetailModal: ${rep.caseNumber} - ${rep.title}`}
                  aria-label={`Open CaseDetailModal for ${rep.caseNumber} (${rep.title})`}
                >
                  {/* Ground Coordinate Pulse & Blip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className={`w-2.5 h-2.5 rounded-full ${pinTheme.needle} ${pinTheme.glow}`} />
                    {rep.status === 'pending' && (
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${pinTheme.pulse} animate-ping`} />
                    )}
                  </div>

                  {/* Teardrop Pin Marker Body */}
                  <div className="flex flex-col items-center">
                    {/* Pin Head */}
                    <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-mono border shadow-2xl transition-all ${pinTheme.bg} ${pinTheme.border} ${pinTheme.text} ${pinTheme.glow} ${
                      isSelected ? `ring-2 ${pinTheme.ring}` : ''
                    }`}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="font-bold">{rep.classification.hynek}</span>
                      <span className="opacity-90 text-[9px] border-l border-white/30 pl-1 font-semibold">
                        {rep.caseNumber.split('-')[2] || rep.caseNumber}
                      </span>
                    </div>

                    {/* Pin Needle pointer pointing to coordinate */}
                    <div className={`w-0.5 h-2.5 ${pinTheme.needle} shadow-md`} />
                  </div>

                  {/* Rich Interactive Hover Card */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-950/95 border border-cyan-500/70 text-white text-[11px] p-3 rounded-xl shadow-2xl min-w-[250px] max-w-[280px] z-50 font-sans pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 text-left">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
                      <span className="font-bold font-mono text-cyan-400">{rep.caseNumber}</span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        rep.status === 'approved' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : rep.status === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : rep.status === 'draft'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-slate-100 font-semibold text-xs leading-snug line-clamp-2">
                      {rep.title}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1.5 space-y-0.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span>📍 {rep.location.city}, {rep.location.state}</span>
                        <span className="text-emerald-400 font-semibold">{rep.credibilityScore}% Score</span>
                      </div>
                      <div>⚡ {rep.classification.shape} · {rep.classification.duration}</div>
                      <div className="text-slate-500 truncate">{rep.location.landmarkProximity}</div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-semibold text-cyan-300 flex items-center justify-between bg-cyan-950/50 -mx-3 -mb-3 px-3 py-1.5 rounded-b-xl border-t border-cyan-500/30">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        Click to open CaseDetailModal
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map Footer: Thermal Density Legend & Contact Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400 border-t border-slate-900 pt-3 z-10">
            {/* Thermal Palette Heat Legend */}
            {showHeatMap && viewMode !== 'pins' ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Heat Density:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 via-amber-400 to-rose-600 shadow-inner" />
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-cyan-400">Low (1-2)</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-amber-400">Elevated</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-rose-400 font-bold">Critical Peak (4+)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Pending Triage</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Approved & Public</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Identified IFO</span>
                </span>
              </div>
            )}

            <div className="font-mono text-slate-500 text-right">
              {activeReports.length} Active Radar Return{activeReports.length !== 1 ? 's' : ''} Plotted
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Case Dossier, Plotted Pins Roster & Hotspot Zones */}
        <div className="space-y-4">
          {/* Sidebar Tab Navigator */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSidebarTab('dossier')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                sidebarTab === 'dossier'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Case Dossier</span>
            </button>

            <button
              onClick={() => setSidebarTab('pins')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                sidebarTab === 'pins'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Plotted Pins ({activeReports.length})</span>
            </button>

            <button
              onClick={() => setSidebarTab('hotspots')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                sidebarTab === 'hotspots'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hotspots ({hotspotZones.length})</span>
            </button>
          </div>

          {/* TAB 1: Selected Case Dossier Panel */}
          {sidebarTab === 'dossier' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
              {selectedReport ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                      {selectedReport.caseNumber}
                    </span>
                    <span className={`font-mono text-[11px] uppercase font-semibold px-2 py-0.5 rounded ${
                      selectedReport.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : selectedReport.status === 'pending'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : selectedReport.status === 'draft'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {selectedReport.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {selectedReport.title}
                    </h3>
                    <p className="text-slate-400 line-clamp-3 leading-relaxed">
                      {selectedReport.description}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                    <div className="text-cyan-400 font-semibold mb-1 flex items-center justify-between">
                      <span>Geospatial Telemetry:</span>
                      <span className="text-emerald-400 font-bold">{selectedReport.credibilityScore}% Score</span>
                    </div>
                    <div className="text-slate-300">Location: {selectedReport.location.city}, {selectedReport.location.state}</div>
                    <div className="text-slate-400">Proximity: {selectedReport.location.landmarkProximity}</div>
                    <div className="text-slate-400">Coordinates: {selectedReport.location.lat}° N, {selectedReport.location.lng}° W</div>
                    <div className="text-slate-400">Altitude: {selectedReport.classification.estimatedAltitude}</div>
                    <div className="text-slate-400">Hynek: {selectedReport.classification.hynek} · Shape: {selectedReport.classification.shape}</div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => onSelectReport(selectedReport)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Launch CaseDetailModal</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[10px] text-slate-500 text-center">
                      Opens full intake dossier, witness debrief, field notes & evidence analysis
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">Click Any Pin on the Radar Map</div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                      Click directly on any map pin or switch to the <strong className="text-cyan-400">Plotted Pins</strong> tab to open the full <span className="font-mono text-cyan-300">CaseDetailModal</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Plotted Sighting Pins Roster */}
          {sidebarTab === 'pins' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Plotted Sighting Pins ({activeReports.length})
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  1-Click Modal Launcher
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {activeReports.map((rep) => {
                  const isSelected = rep.id === selectedCaseId;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => {
                        setSelectedCaseId(rep.id);
                        onSelectReport(rep);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            {rep.caseNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {rep.classification.hynek}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                          rep.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : rep.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : rep.status === 'draft'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {rep.status}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {rep.title}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                        <span>📍 {rep.location.city} · Score: {rep.credibilityScore}%</span>
                        <span className="text-cyan-400 font-semibold flex items-center gap-0.5 group-hover:underline">
                          <span>Open Modal</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Top Omaha Sighting Hotspots List */}
          {sidebarTab === 'hotspots' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Highest Density Omaha Sectors</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  5 Active Sectors
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {hotspotZones.map(zone => {
                  const isFocused = focusedHotspotId === zone.id;
                  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (zone.densityLevel === 'Critical') badgeStyle = 'bg-rose-950 text-rose-300 border-rose-800 font-bold';
                  if (zone.densityLevel === 'Elevated') badgeStyle = 'bg-amber-950 text-amber-300 border-amber-800 font-bold';
                  if (zone.densityLevel === 'Moderate') badgeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-800';

                  return (
                    <div
                      key={zone.id}
                      onClick={() => setFocusedHotspotId(isFocused ? null : zone.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isFocused 
                          ? 'bg-slate-950 border-rose-500/80 ring-1 ring-rose-500/30' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <Target className={`w-3.5 h-3.5 ${isFocused ? 'text-rose-400' : 'text-slate-500'}`} />
                          <span>{zone.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeStyle}`}>
                          {zone.densityLevel} ({zone.densityScore}%)
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {zone.subname}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                        <span>Proximity: {zone.proximityNote}</span>
                        <span className="text-cyan-400 font-bold">
                          {isFocused ? 'FOCUS ACTIVE' : 'CLICK TO TARGET'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  Hotspots correlate proximity to military installations with prevailing flight corridors, highlighting anomalous electromagnetic and altitude distributions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
