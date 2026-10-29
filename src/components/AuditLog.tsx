import React, { useState, useMemo } from 'react';
import { 
  History, Search, Filter, Shield, User, FileText, CheckCircle2, 
  XCircle, Key, UserCheck, UserX, Download, AlertTriangle, 
  Clock, ArrowRight, ShieldAlert, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { AuditLogEntry, AuditActionType, AuditSeverity } from '../types';

interface AuditLogProps {
  logs: AuditLogEntry[];
  onSelectCaseNumber?: (caseNumber: string) => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs, onSelectCaseNumber }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | AuditActionType>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditSeverity>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Distinct actors
  const distinctActors = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach(l => map.set(l.actor.id, l.actor.name));
    return Array.from(map.entries());
  }, [logs]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: logs.length,
      approvals: logs.filter(l => l.action === 'APPROVE_REPORT').length,
      rejections: logs.filter(l => l.action === 'REJECT_REPORT').length,
      roleChanges: logs.filter(l => l.action === 'UPDATE_USER_ROLE').length,
      statusToggles: logs.filter(l => l.action === 'TOGGLE_USER_STATUS').length,
      passwordResets: logs.filter(l => l.action === 'RESET_PASSWORD').length,
    };
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
      if (actorFilter !== 'all' && log.actor.id !== actorFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          log.actor.name.toLowerCase().includes(q) ||
          log.targetLabel.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [logs, actionFilter, severityFilter, actorFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Target Type', 'Target Label', 'Details', 'Previous Value', 'New Value', 'Severity'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actor.name}"`,
      l.actor.role,
      l.action,
      l.targetType,
      `"${l.targetLabel}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.previousValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      l.severity
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMAHA_MUFON_AUDIT_LOG_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMAHA_MUFON_AUDIT_LOG_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'APPROVE_REPORT':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>APPROVE REPORT</span>
          </span>
        );
      case 'REJECT_REPORT':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>REJECT / IFO</span>
          </span>
        );
      case 'UPDATE_USER_ROLE':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>ROLE MODIFIED</span>
          </span>
        );
      case 'TOGGLE_USER_STATUS':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
            <UserX className="w-3 h-3 text-amber-400" />
            <span>ACCOUNT STATUS</span>
          </span>
        );
      case 'RESET_PASSWORD':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
            <Key className="w-3 h-3 text-cyan-400" />
            <span>PASSWORD RESET</span>
          </span>
        );
      case 'EDIT_REPORT':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-400" />
            <span>EDIT REPORT</span>
          </span>
        );
      case 'CREATE_REPORT':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>MANUAL INTAKE</span>
          </span>
        );
      case 'PROVISION_USER':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-blue-400" />
            <span>USER PROVISIONED</span>
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Logged Admin Actions</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{counts.all}</span>
            <span className="text-xs text-slate-500">Immutable Audit Trail</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-emerald-800/40 p-4 rounded-xl">
          <div className="text-xs text-emerald-400 font-medium">Sighting Approvals</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-300">{counts.approvals}</span>
            <span className="text-xs text-emerald-400/70">{counts.rejections} IFO Rejections</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-indigo-800/40 p-4 rounded-xl">
          <div className="text-xs text-indigo-400 font-medium">Role Modifications</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-indigo-300">{counts.roleChanges}</span>
            <span className="text-xs text-indigo-400/70">RBAC Changes</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-amber-800/40 p-4 rounded-xl">
          <div className="text-xs text-amber-400 font-medium">Status & Security</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-300">{counts.statusToggles + counts.passwordResets}</span>
            <span className="text-xs text-amber-400/70">{counts.passwordResets} Passwords Reset</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by actor, case #, user, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Actions ({counts.all})</option>
              <option value="APPROVE_REPORT">Approvals ({counts.approvals})</option>
              <option value="REJECT_REPORT">Rejections / IFO ({counts.rejections})</option>
              <option value="UPDATE_USER_ROLE">Role Changes ({counts.roleChanges})</option>
              <option value="TOGGLE_USER_STATUS">Account Status ({counts.statusToggles})</option>
              <option value="RESET_PASSWORD">Password Resets ({counts.passwordResets})</option>
              <option value="EDIT_REPORT">Report Edits</option>
              <option value="CREATE_REPORT">Manual Intake</option>
              <option value="PROVISION_USER">User Provisioning</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Actor:</span>
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Administrators</option>
              {distinctActors.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Export filtered log as CSV file"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Export filtered log as JSON file"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp (CST)</th>
                <th className="py-3.5 px-4 font-semibold">Administrator</th>
                <th className="py-3.5 px-4 font-semibold">Action Performed</th>
                <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                <th className="py-3.5 px-4 font-semibold">Audit Details & Value Diff</th>
                <th className="py-3.5 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-400">No audit log entries match your filters</div>
                    <p className="text-xs text-slate-600 mt-1">Try resetting the action or actor filter.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-850/50 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{log.timestamp}</span>
                          </div>
                        </td>

                        {/* Actor */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] uppercase text-cyan-300">
                              {log.actor.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{log.actor.name}</div>
                              <div className="text-[10px] font-mono text-cyan-400 uppercase">
                                {log.actor.role.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Target Entity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-200">
                            {log.targetLabel}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono capitalize">
                            Type: {log.targetType.replace('_', ' ')}
                          </div>
                        </td>

                        {/* Details narrative & diff */}
                        <td className="py-3.5 px-4 max-w-md">
                          <p className="text-slate-300 leading-relaxed text-xs">
                            {log.details}
                          </p>

                          {(log.previousValue || log.newValue) && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px]">
                              {log.previousValue && (
                                <span className="px-2 py-0.5 rounded bg-slate-950 text-rose-400 border border-slate-800">
                                  {log.previousValue}
                                </span>
                              )}
                              {log.previousValue && log.newValue && (
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                              )}
                              {log.newValue && (
                                <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                                  {log.newValue}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Expand button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Inspect log JSON payload"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Raw Audit JSON */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 space-y-1">
                              <div className="text-cyan-400 font-semibold mb-1 flex items-center justify-between">
                                <span>Audit Event Signature: {log.id}</span>
                                <span className="text-slate-500">Immutable Hash / Local Verified</span>
                              </div>
                              <pre className="overflow-x-auto whitespace-pre-wrap text-slate-300">
                                {JSON.stringify(log, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Information Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 text-xs">
        <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>MUFON Section #008 Compliance & Accountability Policy</span>
        </h4>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          All administrative decisions—including report publication, witness anonymity overrides, IFO classifications, investigator role elevations, and account suspension events—are cryptographically attributed to the logged-in administrator with timestamped records. This log cannot be modified by non-admin users and is subject to quarterly review by the Nebraska State Section Director.
        </p>
      </div>
    </div>
  );
};
