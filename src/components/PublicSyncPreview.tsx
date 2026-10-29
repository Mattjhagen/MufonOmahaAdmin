import React, { useState } from 'react';
import { 
  Globe, ShieldCheck, CheckCircle2, Lock, Radio, Calendar, 
  ExternalLink, Copy, Check, Plus, Trash2, Edit3
} from 'lucide-react';
import { SightingReport, PublicAnnouncement } from '../types';
import { INITIAL_ANNOUNCEMENTS } from '../data/mockData';

interface PublicSyncPreviewProps {
  reports: SightingReport[];
}

export const PublicSyncPreview: React.FC<PublicSyncPreviewProps> = ({
  reports
}) => {
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [copiedApi, setCopiedApi] = useState(false);
  const [activeTab, setActiveTab] = useState<'sightings' | 'announcements' | 'api_schema'>('sightings');

  // Filter only approved reports that are syndicated to public
  const publicReports = reports.filter(r => r.status === 'approved' && r.isPublishedToPublic);

  const sampleApiJson = JSON.stringify(
    publicReports.map(r => ({
      caseNumber: r.caseNumber,
      title: r.title,
      description: r.description,
      date: r.date,
      time: r.time,
      location: {
        city: r.location.city,
        state: r.location.state,
        landmarkProximity: r.location.landmarkProximity
      },
      witness: {
        displayLabel: r.witness.redactedName,
        isVerifiedWitness: true
      },
      classification: {
        hynek: r.classification.hynek,
        shape: r.classification.shape,
        color: r.classification.color,
        duration: r.classification.duration
      },
      credibilityScore: r.credibilityScore,
      mediaCount: r.media.length
    })),
    null,
    2
  );

  const handleCopyApi = () => {
    navigator.clipboard.writeText(sampleApiJson);
    setCopiedApi(true);
    setTimeout(() => setCopiedApi(false), 2000);
  };

  const handleToggleAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPublished: !a.isPublished } : a));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Public Site Integration Preview</h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              mufonomaha.space
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time preview of data syndicated from <code className="text-cyan-300 font-mono">admin.mufonomaha.space</code> to the public Omaha MUFON portal.
          </p>
        </div>

        <a
          href="https://mufonomaha.space"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
        >
          <span>Visit Public Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('sightings')}
          className={`py-2.5 px-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sightings'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Sightings Feed ({publicReports.length} Approved)</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-2.5 px-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Chapter Meetings & Announcements</span>
        </button>

        <button
          onClick={() => setActiveTab('api_schema')}
          className={`py-2.5 px-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'api_schema'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Sanitized Public API JSON</span>
        </button>
      </div>

      {/* TAB 1: Public Sightings Feed */}
      {activeTab === 'sightings' && (
        <div className="space-y-4">
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-300">
                  PII Redaction Active & Enforced:
                </span>{' '}
                <span className="text-slate-300">
                  Private phone numbers, legal surnames, and exact street addresses are stripped from this feed.
                </span>
              </div>
            </div>
            <div className="font-mono text-emerald-400 font-bold">
              {publicReports.length} Live on mufonomaha.space
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicReports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 text-[11px]">
                    {report.caseNumber}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Hynek {report.classification.hynek}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {report.title}
                </h4>

                <p className="text-slate-400 line-clamp-3 leading-relaxed">
                  {report.description}
                </p>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Location: {report.location.city}, {report.location.state}</span>
                    <span className="text-slate-500">{report.date}</span>
                  </div>
                  <div className="text-emerald-400 font-mono">
                    Public Witness ID: {report.witness.redactedName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Public Meeting Schedule & Alerts</h3>
            <span className="text-xs text-slate-400 font-mono">Published to mufonomaha.space/events</span>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-slate-900/80 border rounded-xl p-4 sm:p-5 text-xs transition-colors ${
                  ann.isPublished ? 'border-slate-800' : 'border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {ann.category}
                      </span>
                      <span className="text-slate-400">{ann.date}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">{ann.location}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{ann.content}</p>

                    {ann.zoomLink && (
                      <div className="text-cyan-400 font-mono text-[11px] pt-1">
                        Virtual Hybrid Access: {ann.zoomLink}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAnnouncement(ann.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        ann.isPublished
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ann.isPublished ? 'Publicly Live' : 'Draft / Hidden'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: API Schema */}
      {activeTab === 'api_schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-5 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono font-bold text-cyan-400">GET /api/public/sightings</div>
              <p className="text-slate-400 text-[11px]">
                Endpoint consumed by the public client at https://mufonomaha.space
              </p>
            </div>
            <button
              onClick={handleCopyApi}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedApi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedApi ? 'Copied JSON' : 'Copy Sample Response'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
            {sampleApiJson}
          </pre>
        </div>
      )}
    </div>
  );
};
