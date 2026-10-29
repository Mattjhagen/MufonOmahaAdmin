import React from 'react';
import { Shield, Radio, Users, FileText, Code, Globe, Plus, LogOut, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  currentTab: 'reports' | 'users' | 'codex' | 'radar' | 'public_sync';
  setCurrentTab: (tab: 'reports' | 'users' | 'codex' | 'radar' | 'public_sync') => void;
  pendingCount: number;
  currentUser: UserAccount;
  onOpenNewReport: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: UserAccount[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  pendingCount,
  currentUser,
  onOpenNewReport,
  onSwitchUser,
  allUsers
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Top System Status Banner */}
      <div className="bg-slate-900/80 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-cyan-400 font-semibold">admin.mufonomaha.space</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Omaha MUFON Chapter #NE-008</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">Douglas · Sarpy · Lancaster Sector</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">Offutt AFB Airspace Correlated</span>
          </div>
          <a
            href="https://mufonomaha.space"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>mufonomaha.space</span>
          </a>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-800/50 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Omaha MUFON
                <span className="text-xs font-normal font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  ADMIN BACKEND
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Field Investigation Moderation & Codex Integration
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'reports'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sighting Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('users')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'users'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setCurrentTab('codex')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'codex'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Codex Prompt Studio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            onClick={() => setCurrentTab('radar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'radar'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Omaha Radar Map</span>
          </button>

          <button
            onClick={() => setCurrentTab('public_sync')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'public_sync'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site Sync</span>
          </button>
        </nav>

        {/* Right Action: Intake & User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Report Intake</span>
          </button>

          {/* User Profile Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <div className="text-right hidden md:block">
              <div className="text-slate-200 font-medium flex items-center justify-end gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentUser.badgeNumber ? `Badge ${currentUser.badgeNumber}` : currentUser.email}
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => onSwitchUser(e.target.value)}
              title="Switch user account for testing permissions"
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
