import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SightingQueue } from './components/SightingQueue';
import { UserManagement } from './components/UserManagement';
import { CaseDetailModal } from './components/CaseDetailModal';
import { NewReportModal } from './components/NewReportModal';
import { CodexStudio } from './components/CodexStudio';
import { OmahaRadarMap } from './components/OmahaRadarMap';
import { PublicSyncPreview } from './components/PublicSyncPreview';
import { AuditLog } from './components/AuditLog';
import { SightingReport, UserAccount, UserRole, RejectionReason, AuditLogEntry, AuditActionType, AuditSeverity } from './types';
import { INITIAL_REPORTS, INITIAL_USERS, INITIAL_AUDIT_LOGS } from './data/mockData';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'reports' | 'users' | 'codex' | 'radar' | 'public_sync' | 'audit'>('reports');

  // Reports State with LocalStorage persistence
  const [reports, setReports] = useState<SightingReport[]>(() => {
    const saved = localStorage.getItem('omaha_mufon_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REPORTS;
  });

  // Users State with LocalStorage persistence
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('omaha_mufon_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  // Audit Logs State with LocalStorage persistence
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('omaha_mufon_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Active Authenticated User (Defaults to Matt Hagen - Admin)
  const [currentUserId, setCurrentUserId] = useState<string>('usr-001');

  // Modals
  const [selectedReport, setSelectedReport] = useState<SightingReport | null>(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync reports to LocalStorage
  useEffect(() => {
    localStorage.setItem('omaha_mufon_reports', JSON.stringify(reports));
  }, [reports]);

  // Sync users to LocalStorage
  useEffect(() => {
    localStorage.setItem('omaha_mufon_users', JSON.stringify(users));
  }, [users]);

  // Sync audit logs to LocalStorage
  useEffect(() => {
    localStorage.setItem('omaha_mufon_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Helper to record administrative actions into immutable audit trail
  const logAuditEvent = (
    action: AuditActionType,
    targetType: 'sighting_report' | 'user' | 'public_feed',
    targetId: string,
    targetLabel: string,
    details: string,
    previousValue?: string,
    newValue?: string,
    severity: AuditSeverity = 'info'
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' CST',
      actor: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
      },
      action,
      targetType,
      targetId,
      targetLabel,
      details,
      previousValue,
      newValue,
      severity
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Sighting Moderation Handlers
  const handleApproveReport = (reportId: string) => {
    const rep = reports.find(r => r.id === reportId);
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'approved',
          isPublishedToPublic: true,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));

    logAuditEvent(
      'APPROVE_REPORT',
      'sighting_report',
      reportId,
      `Case ${rep?.caseNumber || reportId}`,
      `Approved report for public feed on mufonomaha.space. Witness identity protected under sanitized label "${rep?.witness.redactedName || 'Witness'}".`,
      'Status: PENDING',
      'Status: APPROVED (Public Sync Active)',
      'info'
    );

    showToast(`Case ${rep?.caseNumber || ''} Approved & Published to mufonomaha.space`, 'success');
  };

  const handleRejectReport = (reportId: string, reason: RejectionReason, notes?: string) => {
    const rep = reports.find(r => r.id === reportId);
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'rejected',
          rejectionReason: reason,
          moderationNotes: notes || `Rejected and classified as ${reason}.`,
          isPublishedToPublic: false,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));

    logAuditEvent(
      'REJECT_REPORT',
      'sighting_report',
      reportId,
      `Case ${rep?.caseNumber || reportId}`,
      `Rejected report and classified as IFO: ${reason}.${notes ? ` Moderation note: ${notes}` : ''}`,
      'Status: PENDING',
      `Status: REJECTED (IFO: ${reason})`,
      'info'
    );

    showToast(`Case ${rep?.caseNumber || ''} Classified as IFO (${reason})`, 'info');
  };

  const handleSaveReportDetails = (updatedReport: SightingReport) => {
    setReports(prev => prev.map(rep => rep.id === updatedReport.id ? updatedReport : rep));
    setSelectedReport(updatedReport);

    logAuditEvent(
      'EDIT_REPORT',
      'sighting_report',
      updatedReport.id,
      `Case ${updatedReport.caseNumber}`,
      `Modified report parameters: Hynek scale (${updatedReport.classification.hynek}), shape (${updatedReport.classification.shape}), or field notes.`,
      undefined,
      undefined,
      'info'
    );

    showToast(`Saved updates for Case ${updatedReport.caseNumber}`, 'success');
  };

  const handleAddNewReport = (newReport: SightingReport) => {
    setReports(prev => [newReport, ...prev]);

    logAuditEvent(
      'CREATE_REPORT',
      'sighting_report',
      newReport.id,
      `Case ${newReport.caseNumber}`,
      `Manually intaked sighting: "${newReport.title}" in ${newReport.location.city}, ${newReport.location.state}.`,
      undefined,
      `Status: ${newReport.status.toUpperCase()}`,
      'info'
    );

    showToast(`New Sighting Case ${newReport.caseNumber} created in queue`, 'success');
  };

  // User Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    const oldRole = targetUser?.role || 'reporter';

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

    logAuditEvent(
      'UPDATE_USER_ROLE',
      'user',
      userId,
      `User: ${targetUser?.name || userId}`,
      `Modified user role permissions from ${oldRole.toUpperCase()} to ${newRole.toUpperCase()}.`,
      `Role: ${oldRole}`,
      `Role: ${newRole}`,
      'warning'
    );

    showToast(`Updated role for ${targetUser?.name || 'User'} to ${newRole.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    const nextStatus = targetUser?.status === 'active' ? 'disabled' : 'active';

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: nextStatus };
      }
      return u;
    }));

    logAuditEvent(
      'TOGGLE_USER_STATUS',
      'user',
      userId,
      `User: ${targetUser?.name || userId}`,
      `Account state changed to ${nextStatus.toUpperCase()}. ${nextStatus === 'disabled' ? 'Revoked active session tokens.' : 'Restored chapter system access.'}`,
      `Status: ${targetUser?.status || 'active'}`,
      `Status: ${nextStatus}`,
      'warning'
    );

    showToast(`Account for ${targetUser?.name} is now ${nextStatus === 'active' ? 'Activated' : 'Disabled'}`, 'info');
  };

  const handleResetUserPassword = (userId: string, tempPassword: string) => {
    const targetUser = users.find(u => u.id === userId);

    logAuditEvent(
      'RESET_PASSWORD',
      'user',
      userId,
      `User: ${targetUser?.name || userId}`,
      `Generated temporary 16-character credential and invalidated active session tokens for ${targetUser?.email}.`,
      undefined,
      undefined,
      'info'
    );

    showToast(`Temporary password generated for ${targetUser?.name}`, 'success');
  };

  const handleAddNewUser = (newUser: UserAccount) => {
    setUsers(prev => [newUser, ...prev]);

    logAuditEvent(
      'PROVISION_USER',
      'user',
      newUser.id,
      `User: ${newUser.name}`,
      `Provisioned account for ${newUser.name} (${newUser.email}) with initial role ${newUser.role.replace('_', ' ')}.`,
      undefined,
      `Role: ${newUser.role}`,
      'info'
    );

    showToast(`User ${newUser.name} provisioned as ${newUser.role.replace('_', ' ')}`, 'success');
  };

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-900 selection:text-cyan-200">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingCount={pendingReportsCount}
        currentUser={currentUser}
        onOpenNewReport={() => setIsNewReportOpen(true)}
        onSwitchUser={(id) => {
          setCurrentUserId(id);
          const u = users.find(x => x.id === id);
          showToast(`Switched active user to ${u?.name} (${u?.role})`, 'info');
        }}
        allUsers={users}
        auditLogsCount={auditLogs.length}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'reports' && (
          <SightingQueue
            reports={reports}
            onApprove={handleApproveReport}
            onReject={handleRejectReport}
            onSelectReport={(report) => {
              setSelectedReport(report);
              setIsEditingReport(false);
            }}
            onEditReport={(report) => {
              setSelectedReport(report);
              setIsEditingReport(true);
            }}
            onOpenNewReport={() => setIsNewReportOpen(true)}
            userRole={currentUser.role}
          />
        )}

        {currentTab === 'users' && (
          <UserManagement
            users={users}
            onUpdateRole={handleUpdateUserRole}
            onToggleStatus={handleToggleUserStatus}
            onResetPassword={handleResetUserPassword}
            onAddUser={handleAddNewUser}
            currentAdminRole={currentUser.role}
          />
        )}

        {currentTab === 'codex' && <CodexStudio />}

        {currentTab === 'radar' && (
          <OmahaRadarMap
            reports={reports}
            onSelectReport={(report) => {
              setSelectedReport(report);
              setIsEditingReport(false);
            }}
          />
        )}

        {currentTab === 'public_sync' && <PublicSyncPreview reports={reports} />}

        {currentTab === 'audit' && <AuditLog logs={auditLogs} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">admin.mufonomaha.space</span>
            <span>·</span>
            <span>Mutual UFO Network (MUFON) Nebraska Chapter #NE-008</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Repo: <a href="https://github.com/Mattjhagen/OmahaMufonRevised" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Mattjhagen/OmahaMufonRevised</a></span>
            <span>·</span>
            <span>Public Site: <a href="https://mufonomaha.space" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">mufonomaha.space</a></span>
          </div>
        </div>
      </footer>

      {/* Case Detail / Inspector / Editor Modal */}
      {selectedReport && (
        <CaseDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSave={handleSaveReportDetails}
          onApprove={handleApproveReport}
          onReject={handleRejectReport}
          allInvestigators={users.filter(u => u.role === 'field_investigator' || u.role === 'admin' || u.role === 'moderator')}
          userRole={currentUser.role}
        />
      )}

      {/* New Sighting Intake Modal */}
      {isNewReportOpen && (
        <NewReportModal
          onClose={() => setIsNewReportOpen(false)}
          onAddReport={handleAddNewReport}
          existingCount={reports.length}
        />
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
