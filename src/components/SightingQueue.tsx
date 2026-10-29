import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, CheckCircle2, XCircle, Edit3, Eye, AlertTriangle, 
  MapPin, Clock, Calendar, ShieldAlert, Sparkles, Check, ChevronRight,
  ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { SightingReport, ReportStatus, HynekScale, RejectionReason } from '../types';

interface SightingQueueProps {
  reports: SightingReport[];
  onApprove: (reportId: string) => void;
  onReject: (reportId: string, reason: RejectionReason, notes?: string) => void;
  onSelectReport: (report: SightingReport) => void;
  onEditReport: (report: SightingReport) => void;
  onOpenNewReport: () => void;
  userRole: string;
}

export const SightingQueue: React.FC<SightingQueueProps> = ({
  reports,
  onApprove,
  onReject,
  onSelectReport,
  onEditReport,
  onOpenNewReport,
  userRole
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [hynekFilter, setHynekFilter] = useState<'all' | HynekScale>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingReportId, setRejectingReportId] = useState<string | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<RejectionReason>('Identified as Starlink');
  const [rejectNotes, setRejectNotes] = useState('');

  // Counts
  const counts = useMemo(() => {
    return {
      all: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
    };
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (statusFilter !== 'all' && report.status !== statusFilter) return false;
      if (hynekFilter !== 'all' && report.classification.hynek !== hynekFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches = 
          report.caseNumber.toLowerCase().includes(q) ||
          report.title.toLowerCase().includes(q) ||
          report.location.city.toLowerCase().includes(q) ||
          report.location.landmarkProximity.toLowerCase().includes(q) ||
          report.description.toLowerCase().includes(q) ||
          report.witness.name.toLowerCase().includes(q) ||
          report.classification.shape.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [reports, statusFilter, hynekFilter, searchQuery]);

  const handleConfirmReject = () => {
    if (rejectingReportId) {
      onReject(rejectingReportId, selectedRejectReason, rejectNotes);
      setRejectingReportId(null);
      setRejectNotes('');
    }
  };

  const canModerate = userRole === 'admin' || userRole === 'moderator';

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Total Sighting Cases</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{counts.all}</span>
            <span className="text-xs text-slate-500">Omaha & E. Nebraska</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-amber-500/30 p-4 rounded-xl">
          <div className="text-xs text-amber-400 font-medium flex items-center justify-between">
            <span>Pending Triage</span>
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-300">{counts.pending}</span>
            <span className="text-xs text-amber-400/70">Awaiting FI Review</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-emerald-500/30 p-4 rounded-xl">
          <div className="text-xs text-emerald-400 font-medium">Approved & Public</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-300">{counts.approved}</span>
            <span className="text-xs text-emerald-400/70">Synced to mufonomaha.space</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-rose-500/30 p-4 rounded-xl">
          <div className="text-xs text-rose-400 font-medium">Identified IFO / Rejected</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-300">{counts.rejected}</span>
            <span className="text-xs text-rose-400/70">Starlink / Drone / Hoax</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Reports ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Pending Triage</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300">
              {counts.pending}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'approved'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rejected / IFO ({counts.rejected})
          </button>
        </div>

        {/* Search & Hynek Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search case #, location, witness, shape..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Hynek:</span>
            <select
              value={hynekFilter}
              onChange={(e) => setHynekFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Scales</option>
              <option value="NL">NL - Nocturnal Light</option>
              <option value="DD">DD - Daylight Disc</option>
              <option value="RV">RV - Radar-Visual</option>
              <option value="CE-I">CE-I - Close Encounter 1st</option>
              <option value="CE-II">CE-II - Physical Traces</option>
              <option value="CE-III">CE-III - Occupants</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No sighting reports match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query, status tab, or Hynek scale filter. Or manually intake a new sighting report.
          </p>
          <button
            onClick={onOpenNewReport}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Intake New Report Manually
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`bg-slate-900/70 border rounded-xl p-4 sm:p-5 transition-all hover:border-slate-700 ${
                report.status === 'pending'
                  ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/10 via-slate-900/70 to-slate-900/70'
                  : report.status === 'approved'
                  ? 'border-emerald-500/30'
                  : 'border-slate-800 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Case Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60">
                      {report.caseNumber}
                    </span>

                    {/* Status Label */}
                    {report.status === 'pending' && (
                      <span className="font-mono font-medium text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        PENDING TRIAGE
                      </span>
                    )}
                    {report.status === 'approved' && (
                      <span className="font-mono font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        APPROVED & PUBLISHED
                      </span>
                    )}
                    {report.status === 'rejected' && (
                      <span className="font-mono font-medium text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        IDENTIFIED IFO / REJECTED
                      </span>
                    )}

                    {/* Classification metadata */}
                    <span className="text-slate-500 font-mono">·</span>
                    <span className="text-slate-300 font-mono font-semibold">
                      Hynek: {report.classification.hynek}
                    </span>
                    <span className="text-slate-500 font-mono">·</span>
                    <span className="text-slate-400">
                      Shape: <strong className="text-slate-200">{report.classification.shape}</strong>
                    </span>
                    <span className="text-slate-500 font-mono">·</span>
                    <span className="text-slate-400">
                      Score: <strong className="text-cyan-400 font-mono">{report.credibilityScore}%</strong>
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectReport(report)}
                    className="text-base font-semibold text-white hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Geolocation & Time Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{report.location.city}, {report.location.state}</span>
                      <span className="text-slate-600">({report.location.landmarkProximity})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{report.date}</span>
                      <span className="text-slate-600">at</span>
                      <span className="font-mono">{report.time}</span>
                    </div>

                    {report.assignedInvestigatorName && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                        <span>FI: {report.assignedInvestigatorName}</span>
                      </div>
                    )}

                    {report.media.length > 0 && (
                      <div className="text-xs text-cyan-400 font-mono">
                        [{report.media.length} Evidence File{report.media.length > 1 ? 's' : ''}]
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {/* View Details */}
                    <button
                      onClick={() => onSelectReport(report)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspect</span>
                    </button>

                    {/* Edit Details */}
                    <button
                      onClick={() => onEditReport(report)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Moderate Buttons */}
                  {canModerate && (
                    <div className="flex items-center gap-2">
                      {report.status !== 'approved' && (
                        <button
                          onClick={() => onApprove(report.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      )}

                      {report.status !== 'rejected' && (
                        <button
                          onClick={() => setRejectingReportId(report.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject / IFO</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection / Moderation reason banner if rejected */}
              {report.status === 'rejected' && report.rejectionReason && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Disposition: <strong>{report.rejectionReason}</strong>
                    {report.moderationNotes ? ` — ${report.moderationNotes}` : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectingReportId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <XCircle className="w-5 h-5" />
              <h3 className="text-base font-semibold text-white">Reject Sighting / Classify as IFO</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select the identified conventional source or reason for rejecting this sighting report from the public feed.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Identified Flying Object (IFO) Reason
                </label>
                <select
                  value={selectedRejectReason}
                  onChange={(e) => setSelectedRejectReason(e.target.value as RejectionReason)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="Identified as Starlink">Identified as Starlink (Satellite Train)</option>
                  <option value="Identified as Aircraft / Drone">Identified as Aircraft / Consumer Drone</option>
                  <option value="Military Flight (Offutt AFB)">Military Flight (Offutt AFB RC-135 / KC-135)</option>
                  <option value="Astronomical / Venus / Meteor">Astronomical (Venus / Jupiter / Bolide Meteor)</option>
                  <option value="Insufficient Evidence">Insufficient Evidence / Incomplete Witness Narrative</option>
                  <option value="Hoax / Fabricated">Hoax / Fabricated Evidence</option>
                  <option value="Duplicate Report">Duplicate Report</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Investigation & Moderation Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="e.g. Cross-checked with Heavens-Above ephemeris; Starlink group 10-12 passed overhead at 20:05 CST..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReportId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
