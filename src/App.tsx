import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SightingQueue } from './components/SightingQueue';
import { UserManagement } from './components/UserManagement';
import { CaseDetailModal } from './components/CaseDetailModal';
import { NewReportModal } from './components/NewReportModal';
import { CodexStudio } from './components/CodexStudio';
import { OmahaRadarMap } from './components/OmahaRadarMap';
import { PublicSyncPreview } from './components/PublicSyncPreview';
import { SightingReport, UserAccount, UserRole, RejectionReason } from './types';
import { INITIAL_REPORTS, INITIAL_USERS } from './data/mockData';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'reports' | 'users' | 'codex' | 'radar' | 'public_sync'>('reports');

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

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Sighting Moderation Handlers
  const handleApproveReport = (reportId: string) => {
    setReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        return {
          ...rep,
          status: 'approved',
          isPublishedToPublic: true,
          updatedAt: new Date().toISOString()
        };
      }
      return rep;
    }));

    const rep = reports.find(r => r.id === reportId);
    showToast(`Case ${rep?.caseNumber || ''} Approved & Published to mufonomaha.space`, 'success');
  };

  const handleRejectReport = (reportId: string, reason: RejectionReason, notes?: string) => {
    setReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        return {
          ...rep,
          status: 'rejected',
          rejectionReason: reason,
          moderationNotes: notes || `Rejected and classified as ${reason}.`,
          isPublishedToPublic: false,
          updatedAt: new Date().toISOString()
        };
      }
      return rep;
    }));

    const rep = reports.find(r => r.id === reportId);
    showToast(`Case ${rep?.caseNumber || ''} Classified as IFO (${reason})`, 'info');
  };

  const handleSaveReportDetails = (updatedReport: SightingReport) => {
    setReports(prev => prev.map(rep => rep.id === updatedReport.id ? updatedReport : rep));
    setSelectedReport(updatedReport);
    showToast(`Saved updates for Case ${updatedReport.caseNumber}`, 'success');
  };

  const handleAddNewReport = (newReport: SightingReport) => {
    setReports(prev => [newReport, ...prev]);
    showToast(`New Sighting Case ${newReport.caseNumber} created in queue`, 'success');
  };

  // User Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    const targetUser = users.find(u => u.id === userId);
    showToast(`Updated role for ${targetUser?.name || 'User'} to ${newRole.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'disabled' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    const targetUser = users.find(u => u.id === userId);
    const newStatus = targetUser?.status === 'active' ? 'Disabled' : 'Activated';
    showToast(`Account for ${targetUser?.name} is now ${newStatus}`, 'info');
  };

  const handleResetUserPassword = (userId: string, tempPassword: string) => {
    const targetUser = users.find(u => u.id === userId);
    showToast(`Temporary password generated for ${targetUser?.name}`, 'success');
  };

  const handleAddNewUser = (newUser: UserAccount) => {
    setUsers(prev => [newUser, ...prev]);
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
