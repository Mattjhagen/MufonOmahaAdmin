import React, { useState, useMemo } from 'react';
import { 
  Clock, Users, CheckCircle2, ShieldAlert, Zap, TrendingDown, 
  BarChart2, Award, ChevronRight, UserCheck, Shield, FileText,
  AlertCircle, ArrowUpRight, Sparkles, Filter, X, ChevronDown, 
  ChevronUp, Check, ExternalLink, Calendar
} from 'lucide-react';
import { SightingReport, UserAccount } from '../types';

interface QuickSummaryWidgetProps {
  reports: SightingReport[];
  users: UserAccount[];
  onFilterStatus?: (status: 'all' | 'pending' | 'approved' | 'rejected' | 'draft') => void;
  onSelectReport?: (report: SightingReport) => void;
}

export const QuickSummaryWidget: React.FC<QuickSummaryWidgetProps> = ({
  reports,
  users,
  onFilterStatus,
  onSelectReport
}) => {
  const [timeUnit, setTimeUnit] = useState<'days' | 'hours'>('days');
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showDispositionModal, setShowDispositionModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // 1. Calculate Disposition Metrics
  const dispositionStats = useMemo(() => {
    // Only finalized cases (approved or rejected)
    const dispositionedReports = reports.filter(r => r.status === 'approved' || r.status === 'rejected');
    
    if (dispositionedReports.length === 0) {
      return {
        totalResolved: 0,
        avgHours: 0,
        avgDays: 0,
        avgApprovalHours: 0,
        avgRejectionHours: 0,
        withinSlaPercent: 0,
        fastestCase: null as { report: SightingReport; hours: number } | null,
        slowestCase: null as { report: SightingReport; hours: number } | null,
        casesList: [] as Array<{ report: SightingReport; hours: number; days: number }>
      };
    }

    let totalDiffMs = 0;
    let approvalDiffMs = 0;
    let approvalCount = 0;
    let rejectionDiffMs = 0;
    let rejectionCount = 0;
    let withinSlaCount = 0; // SLA target: <= 48 hours (2 days)

    const casesWithTime: Array<{ report: SightingReport; hours: number; days: number }> = [];

    dispositionedReports.forEach(r => {
      const created = new Date(r.createdAt).getTime();
      const updated = new Date(r.updatedAt).getTime();
      // Calculate diff in hours, minimum 1 hour for display if timestamps identical
      let diffMs = Math.max(updated - created, 3600000);
      
      const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
      const days = Math.round((hours / 24) * 10) / 10;

      casesWithTime.push({ report: r, hours, days });
      totalDiffMs += diffMs;

      if (hours <= 48) {
        withinSlaCount++;
      }

      if (r.status === 'approved') {
        approvalDiffMs += diffMs;
        approvalCount++;
      } else if (r.status === 'rejected') {
        rejectionDiffMs += diffMs;
        rejectionCount++;
      }
    });

    // Sort to find fastest and slowest
    casesWithTime.sort((a, b) => a.hours - b.hours);

    const avgMs = totalDiffMs / dispositionedReports.length;
    const avgHours = Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;
    const avgDays = Math.round((avgHours / 24) * 10) / 10;

    const avgApprovalHours = approvalCount > 0 
      ? Math.round((approvalDiffMs / approvalCount / (1000 * 60 * 60)) * 10) / 10 
      : 0;

    const avgRejectionHours = rejectionCount > 0 
      ? Math.round((rejectionDiffMs / rejectionCount / (1000 * 60 * 60)) * 10) / 10 
      : 0;

    const withinSlaPercent = Math.round((withinSlaCount / dispositionedReports.length) * 100);

    return {
      totalResolved: dispositionedReports.length,
      avgHours,
      avgDays,
      avgApprovalHours,
      avgRejectionHours,
      withinSlaPercent,
      fastestCase: casesWithTime[0] || null,
      slowestCase: casesWithTime[casesWithTime.length - 1] || null,
      casesList: casesWithTime
    };
  }, [reports]);

  // 2. Calculate Active Investigators Metrics
  const investigatorStats = useMemo(() => {
    // Certified field investigators
    const activeFieldInvestigators = users.filter(
      u => u.status === 'active' && u.role === 'field_investigator'
    );
    
    // Total qualified investigation staff (FIs + Moderators + Admins)
    const allActiveInvestigativeStaff = users.filter(
      u => u.status === 'active' && (u.role === 'field_investigator' || u.role === 'moderator' || u.role === 'admin')
    );

    const pendingReports = reports.filter(r => r.status === 'pending');
    const unassignedCount = pendingReports.filter(r => !r.assignedInvestigatorId).length;

    // Active caseload per investigator
    const avgCaseload = allActiveInvestigativeStaff.length > 0 
      ? (pendingReports.length / allActiveInvestigativeStaff.length).toFixed(1) 
      : '0';

    return {
      fieldInvestigatorsCount: activeFieldInvestigators.length,
      totalActiveStaffCount: allActiveInvestigativeStaff.length,
      activeStaff: allActiveInvestigativeStaff,
      pendingCount: pendingReports.length,
      unassignedCount,
      avgCaseload
    };
  }, [users, reports]);

  // 3. Operational Clearance & Credibility
  const operationalStats = useMemo(() => {
    const nonDrafts = reports.filter(r => r.status !== 'draft');
    const approved = reports.filter(r => r.status === 'approved');
    const rejected = reports.filter(r => r.status === 'rejected');
    const drafts = reports.filter(r => r.status === 'draft');

    const clearanceRate = nonDrafts.length > 0 
      ? Math.round(((approved.length + rejected.length) / nonDrafts.length) * 100) 
      : 0;

    // Average credibility score across approved/vetted cases
    const avgCredibility = approved.length > 0
      ? Math.round(approved.reduce((acc, r) => acc + (r.credibilityScore || 0), 0) / approved.length)
      : 85;

    return {
      totalActiveCases: nonDrafts.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      draftsCount: drafts.length,
      clearanceRate,
      avgCredibility
    };
  }, [reports]);

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Quick Summary & Operational Oversight
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Omaha Chapter #NE-008 investigation throughput, investigator caseload & disposition metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time format toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTimeUnit('days')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                timeUnit === 'days' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Days
            </button>
            <button
              onClick={() => setTimeUnit('hours')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                timeUnit === 'hours' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hours
            </button>
          </div>

          {/* Quick Roster Modal trigger */}
          <button
            onClick={() => setShowRosterModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Inspect active field investigator roster"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Investigator Roster</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse Quick Summary' : 'Expand Quick Summary'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Average Time to Disposition */}
            <div 
              onClick={() => setShowDispositionModal(true)}
              className="group relative bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-xl transition-all cursor-pointer shadow-inner"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Avg. Time to Disposition
                    </span>
                    <div className="text-[10px] text-cyan-400/80 font-mono">
                      Intake to Final Ruling
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>

              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-cyan-300 tracking-tight">
                  {timeUnit === 'days' ? `${dispositionStats.avgDays}d` : `${dispositionStats.avgHours}h`}
                </span>
                <span className="text-xs text-slate-400">
                  {timeUnit === 'days' ? `(${dispositionStats.avgHours} hrs)` : `(${dispositionStats.avgDays} days)`}
                </span>
              </div>

              {/* Sub-metrics & SLA Target */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Standard Chapter SLA:</span>
                  <span className="text-emerald-400 font-medium">{'<'} 48 hrs</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cases in SLA Target:</span>
                  <span className="font-mono text-slate-200">{dispositionStats.withinSlaPercent}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Avg. Approval: {(dispositionStats.avgApprovalHours / 24).toFixed(1)}d</span>
                  <span>Avg. IFO Reject: {(dispositionStats.avgRejectionHours / 24).toFixed(1)}d</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-1 text-[10px] text-cyan-400 font-medium group-hover:underline">
                <span>View disposition timeline</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* KPI 2: Total Active Investigators */}
            <div 
              onClick={() => setShowRosterModal(true)}
              className="group relative bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-indigo-500/40 p-4 rounded-xl transition-all cursor-pointer shadow-inner"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Active Investigators
                    </span>
                    <div className="text-[10px] text-indigo-400/80 font-mono">
                      Field & Triage Staff
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-indigo-300 tracking-tight">
                  {investigatorStats.totalActiveStaffCount}
                </span>
                <span className="text-xs text-slate-400">
                  Staff Active
                </span>
              </div>

              {/* Investigator composition & caseload */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Field Investigators (FIs):</span>
                  <span className="font-mono text-indigo-300 font-semibold">{investigatorStats.fieldInvestigatorsCount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Active Caseload Ratio:</span>
                  <span className="font-mono text-slate-200">{investigatorStats.avgCaseload} cases/staff</span>
                </div>
                
                {/* Avatar / Badge chips */}
                <div className="flex items-center gap-1 pt-1 overflow-hidden">
                  {investigatorStats.activeStaff.slice(0, 4).map((u) => (
                    <span 
                      key={u.id}
                      title={`${u.name} (${u.role.replace('_', ' ')}) - ${u.badgeNumber || 'Badge N/A'}`}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      {u.badgeNumber || u.name.split(' ')[0]}
                    </span>
                  ))}
                  {investigatorStats.activeStaff.length > 4 && (
                    <span className="text-[10px] text-slate-500">+{investigatorStats.activeStaff.length - 4}</span>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-1 text-[10px] text-indigo-400 font-medium group-hover:underline">
                <span>Inspect caseload & badges</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* KPI 3: Triage Clearance & Resolution Rate */}
            <div 
              onClick={() => onFilterStatus && onFilterStatus('all')}
              className="group relative bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-emerald-500/40 p-4 rounded-xl transition-all cursor-pointer shadow-inner"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Clearance Rate
                    </span>
                    <div className="text-[10px] text-emerald-400/80 font-mono">
                      Finalized vs Total Cases
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>

              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-emerald-300 tracking-tight">
                  {operationalStats.clearanceRate}%
                </span>
                <span className="text-xs text-slate-400">
                  Resolved
                </span>
              </div>

              {/* Progress Bar & Breakdown */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2 text-xs">
                {/* Multi-segment progress bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${(operationalStats.approvedCount / Math.max(operationalStats.totalActiveCases, 1)) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Approved: ${operationalStats.approvedCount}`}
                  />
                  <div 
                    style={{ width: `${(operationalStats.rejectedCount / Math.max(operationalStats.totalActiveCases, 1)) * 100}%` }}
                    className="bg-rose-500 h-full"
                    title={`Rejected: ${operationalStats.rejectedCount}`}
                  />
                  <div 
                    style={{ width: `${(investigatorStats.pendingCount / Math.max(operationalStats.totalActiveCases, 1)) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title={`Pending: ${investigatorStats.pendingCount}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-medium">{operationalStats.approvedCount} Approved</span>
                  <span className="text-rose-400 font-medium">{operationalStats.rejectedCount} IFO</span>
                  <span className="text-amber-400 font-medium">{investigatorStats.pendingCount} Pending</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Avg Credibility: <strong className="text-emerald-400 font-mono">{operationalStats.avgCredibility}%</strong></span>
                <span className="text-emerald-400 font-medium group-hover:underline">Filter queue</span>
              </div>
            </div>

            {/* KPI 4: Pending Backlog & Staged Drafts */}
            <div 
              onClick={() => onFilterStatus && onFilterStatus('pending')}
              className="group relative bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-amber-500/40 p-4 rounded-xl transition-all cursor-pointer shadow-inner"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Pending Triage
                    </span>
                    <div className="text-[10px] text-amber-400/80 font-mono">
                      Queue Backlog & Drafts
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>

              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-amber-300 tracking-tight">
                  {investigatorStats.pendingCount}
                </span>
                <span className="text-xs text-slate-400">
                  Awaiting Review
                </span>
              </div>

              {/* Status details */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Assigned to Field Agent:</span>
                  <span className="font-mono text-amber-300">
                    {investigatorStats.pendingCount - investigatorStats.unassignedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Unassigned Alerts:</span>
                  <span className={`font-mono font-medium ${investigatorStats.unassignedCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {investigatorStats.unassignedCount} cases
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Draft Staging Cases:</span>
                  <span className="font-mono text-purple-300 font-medium">
                    {operationalStats.draftsCount} in prep
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-1 text-[10px] text-amber-400 font-medium group-hover:underline">
                <span>Jump to pending triage</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: Active Investigator Roster & Caseload Inspection */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Active Investigation Staff & Caseload</h3>
                  <p className="text-xs text-slate-400">
                    Omaha MUFON certified field investigators, chapter moderators & administrators
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Roster Overview Cards */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Active Staff</div>
                  <div className="text-xl font-bold font-mono text-indigo-300">{investigatorStats.totalActiveStaffCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Field Investigators</div>
                  <div className="text-xl font-bold font-mono text-cyan-300">{investigatorStats.fieldInvestigatorsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Active Caseload</div>
                  <div className="text-xl font-bold font-mono text-amber-300">{investigatorStats.pendingCount} Cases</div>
                </div>
              </div>

              {/* Investigator List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                  Active Investigation Personnel
                </h4>
                {investigatorStats.activeStaff.map((staff) => {
                  // Count cases assigned in current reports list
                  const assignedCases = reports.filter(r => r.assignedInvestigatorId === staff.id);
                  const pendingAssigned = assignedCases.filter(r => r.status === 'pending');
                  const approvedAssigned = assignedCases.filter(r => r.status === 'approved');

                  return (
                    <div 
                      key={staff.id}
                      className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold font-mono text-sm shrink-0">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{staff.name}</span>
                            {staff.badgeNumber && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                                {staff.badgeNumber}
                              </span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                              staff.role === 'admin' 
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                                : staff.role === 'moderator'
                                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {staff.role.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>{staff.email}</span>
                            {staff.phone && <span>· {staff.phone}</span>}
                            <span>· Last login: {staff.lastLogin}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 sm:border-l sm:border-slate-800 sm:pl-4">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-200">
                            {assignedCases.length} Assigned Cases
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 justify-end mt-0.5">
                            <span className="text-amber-400">{pendingAssigned.length} pending</span>
                            <span>·</span>
                            <span className="text-emerald-400">{approvedAssigned.length} vetted</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span>Chapter #NE-008 Certified Personnel Roster</span>
              <button
                onClick={() => setShowRosterModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Disposition Performance Breakdown */}
      {showDispositionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Time to Disposition Performance Log</h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive audit of turnaround times from witness report intake to final disposition
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDispositionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Disposition Stats Bar */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Average Turnaround</div>
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    {dispositionStats.avgDays} days <span className="text-xs text-slate-500">({dispositionStats.avgHours}h)</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Fastest Resolution</div>
                  <div className="text-xl font-bold font-mono text-emerald-300">
                    {dispositionStats.fastestCase ? `${dispositionStats.fastestCase.hours}h` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">SLA Compliance ({'<'}48h)</div>
                  <div className="text-xl font-bold font-mono text-emerald-300">
                    {dispositionStats.withinSlaPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Total Vetted Cases</div>
                  <div className="text-xl font-bold font-mono text-slate-200">
                    {dispositionStats.totalResolved} Cases
                  </div>
                </div>
              </div>

              {/* Disposition Cases Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                  Individual Case Disposition Breakdown
                </h4>
                
                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/70">
                  {dispositionStats.casesList.map(({ report, hours, days }) => {
                    const isApproved = report.status === 'approved';
                    return (
                      <div 
                        key={report.id}
                        onClick={() => {
                          if (onSelectReport) {
                            onSelectReport(report);
                            setShowDispositionModal(false);
                          }
                        }}
                        className="p-3 bg-slate-950/50 hover:bg-slate-900/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            isApproved 
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isApproved ? 'APPROVED' : 'IFO REJECT'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-cyan-400">{report.caseNumber}</span>
                              <span className="text-xs text-white font-medium group-hover:text-cyan-300 transition-colors">
                                {report.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>Intake: {new Date(report.createdAt).toLocaleDateString()}</span>
                              <span>·</span>
                              <span>Ruled: {new Date(report.updatedAt).toLocaleDateString()}</span>
                              {report.assignedInvestigatorName && (
                                <>
                                  <span>·</span>
                                  <span>FI: {report.assignedInvestigatorName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <div className="text-right">
                            <div className="font-mono text-xs font-bold text-slate-200">
                              {days} days <span className="text-slate-400 font-normal">({hours} hrs)</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {hours <= 48 ? (
                                <span className="text-emerald-400 font-medium flex items-center gap-0.5 justify-end">
                                  <Check className="w-3 h-3" /> Within SLA
                                </span>
                              ) : (
                                <span className="text-amber-400 font-medium">Extended Field Review</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span>Chapter Target: Average turnaround {'<'} 48 hours for rapid public sync</span>
              <button
                onClick={() => setShowDispositionModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
