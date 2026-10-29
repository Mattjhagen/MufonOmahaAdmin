import React, { useState } from 'react';
import { Radio, MapPin, Eye, AlertCircle, Compass, Layers, Shield } from 'lucide-react';
import { SightingReport } from '../types';

interface OmahaRadarMapProps {
  reports: SightingReport[];
  onSelectReport: (report: SightingReport) => void;
}

export const OmahaRadarMap: React.FC<OmahaRadarMapProps> = ({
  reports,
  onSelectReport
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showOffuttAirspace, setShowOffuttAirspace] = useState(true);
  const [showEppleyAirspace, setShowEppleyAirspace] = useState(true);

  // Key Omaha coordinates normalized to canvas grid (relative percentages)
  // Omaha bbox roughly: Lat 41.0 to 41.35, Lng -96.25 to -95.80
  const minLat = 40.98;
  const maxLat = 41.36;
  const minLng = -96.25;
  const maxLng = -95.82;

  const toMapCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const selectedReport = reports.find(r => r.id === selectedCaseId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>Omaha Metro Geospatial & Radar Correlator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial mapping of sighting clusters relative to Offutt AFB controlled airspace (Class C) and Eppley Airfield approach sectors.
          </p>
        </div>

        {/* Airspace Layer Toggles */}
        <div className="flex items-center gap-3 text-xs bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showOffuttAirspace}
              onChange={(e) => setShowOffuttAirspace(e.target.checked)}
              className="rounded border-slate-700 text-cyan-600 bg-slate-900"
            />
            <span className="text-amber-400">Offutt AFB Airspace (55th Wing)</span>
          </label>

          <span className="text-slate-700">|</span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showEppleyAirspace}
              onChange={(e) => setShowEppleyAirspace(e.target.checked)}
              className="rounded border-slate-700 text-cyan-600 bg-slate-900"
            />
            <span className="text-cyan-400">Eppley KOMA Corridor</span>
          </label>
        </div>
      </div>

      {/* Grid Layout: Radar Canvas + Case Details sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Map Canvas */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* Subtle Radar Ring Background */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-cyan-500/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-cyan-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-cyan-500/10" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/15" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/15" />
          </div>

          {/* Map Top Status */}
          <div className="flex items-center justify-between text-xs text-slate-400 z-10 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 font-bold">RADAR SWEEP ACTIVE</span>
              <span className="text-slate-600">·</span>
              <span>OMAHA TRACON / SECTOR NE-008</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-slate-500" />
              <span>N 41.2586° / W 95.9375°</span>
            </div>
          </div>

          {/* Interactive Geographic Canvas */}
          <div className="relative w-full h-[400px] my-4 rounded-xl border border-slate-900/60 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950 overflow-hidden">
            {/* Missouri River Representation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path
                d="M 72 0 Q 75 120 74 200 T 78 300 T 80 400"
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
                className="absolute rounded-full border border-amber-500/40 bg-amber-500/10 pointer-events-none flex items-center justify-center"
                style={{
                  left: '68%',
                  top: '64%',
                  width: '130px',
                  height: '130px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-[10px] font-mono text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/50">
                  OFFUTT AFB (Class C)
                </div>
              </div>
            )}

            {/* Eppley Airfield Airspace Zone */}
            {showEppleyAirspace && (
              <div 
                className="absolute rounded-full border border-cyan-500/40 bg-cyan-500/10 pointer-events-none flex items-center justify-center"
                style={{
                  left: '73%',
                  top: '28%',
                  width: '110px',
                  height: '110px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-[10px] font-mono text-cyan-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/50">
                  EPPLEY AIRFIELD
                </div>
              </div>
            )}

            {/* Landmark Markers */}
            <div className="absolute text-[10px] font-mono text-slate-500" style={{ left: '26%', top: '16%' }}>
              ▲ Standing Bear Lake
            </div>
            <div className="absolute text-[10px] font-mono text-slate-500" style={{ left: '46%', top: '56%' }}>
              ▲ Chalco Hills / Papillion
            </div>
            <div className="absolute text-[10px] font-mono text-slate-500" style={{ left: '62%', top: '38%' }}>
              ▲ Downtown Omaha / RiverFront
            </div>
            <div className="absolute text-[10px] font-mono text-slate-500" style={{ left: '12%', top: '82%' }}>
              ▲ Platte River State Park
            </div>

            {/* Plot Sighting Case Markers */}
            {reports.map((rep) => {
              const coords = toMapCoords(rep.location.lat, rep.location.lng);
              const isSelected = rep.id === selectedCaseId;

              let markerColor = 'bg-cyan-500 text-white';
              if (rep.status === 'pending') markerColor = 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse';
              if (rep.status === 'approved') markerColor = 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300';
              if (rep.status === 'rejected') markerColor = 'bg-rose-500 text-white';

              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedCaseId(rep.id)}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute cursor-pointer z-20 group"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg transition-transform ${
                    isSelected ? 'scale-125 ring-4 ring-cyan-400' : 'group-hover:scale-110'
                  } ${markerColor}`}>
                    {rep.classification.hynek}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-950 border border-slate-800 text-white text-[11px] px-2.5 py-1.5 rounded shadow-2xl whitespace-nowrap z-30 font-sans pointer-events-none">
                    <div className="font-bold font-mono text-cyan-400">{rep.caseNumber}</div>
                    <div className="text-slate-300">{rep.title}</div>
                    <div className="text-[10px] text-slate-400">{rep.location.city} · {rep.classification.shape}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Footer Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400 border-t border-slate-900 pt-3 z-10">
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

            <div className="font-mono text-slate-500">
              Click any pin to inspect case telemetry
            </div>
          </div>
        </div>

        {/* Selected Case Telemetry Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
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
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {selectedReport.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {selectedReport.title}
                </h3>
                <p className="text-slate-400 line-clamp-4 leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="text-cyan-400 font-semibold mb-1">Geospatial Telemetry:</div>
                <div className="text-slate-300">Location: {selectedReport.location.city}, {selectedReport.location.state}</div>
                <div className="text-slate-400">Proximity: {selectedReport.location.landmarkProximity}</div>
                <div className="text-slate-400">Coordinates: {selectedReport.location.lat}° N, {selectedReport.location.lng}° W</div>
                <div className="text-slate-400">Altitude: {selectedReport.classification.estimatedAltitude}</div>
                <div className="text-slate-400">Hynek: {selectedReport.classification.hynek} · Shape: {selectedReport.classification.shape}</div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onSelectReport(selectedReport)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Case Dossier</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-600" />
              <div className="font-semibold text-slate-300 text-xs">Select a Sighting Pin</div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Click on any radar contact on the map to review airspace correlation, proximity to Offutt AFB, and witness statement.
              </p>
            </div>
          )}

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>Omaha Sector Note:</span>
            </div>
            <p className="text-slate-500">
              Sightings within a 15-nautical-mile radius of Offutt AFB require priority ADS-B flight transponder cross-checking before public approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
