import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, UserPlus, Key, Shield, ShieldAlert, 
  CheckCircle, XCircle, MoreVertical, Copy, Check, AlertTriangle, 
  Mail, Phone, Clock, BadgeCheck, Power
} from 'lucide-react';
import { UserAccount, UserRole, UserStatus } from '../types';

interface UserManagementProps {
  users: UserAccount[];
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (userId: string, tempPassword: string) => void;
  onAddUser: (newUser: UserAccount) => void;
  currentAdminRole: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUpdateRole,
  onToggleStatus,
  onResetPassword,
  onAddUser,
  currentAdminRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  
  // Password Reset Modal State
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
  const [generatedTempPassword, setGeneratedTempPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('field_investigator');
  const [newUserBadge, setNewUserBadge] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Counts
  const counts = useMemo(() => {
    return {
      all: users.length,
      active: users.filter(u => u.status === 'active').length,
      disabled: users.filter(u => u.status === 'disabled').length,
      admins: users.filter(u => u.role === 'admin').length,
      moderators: users.filter(u => u.role === 'moderator').length,
      investigators: users.filter(u => u.role === 'field_investigator').length,
      reporters: users.filter(u => u.role === 'reporter').length,
    };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches = 
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.badgeNumber && u.badgeNumber.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Trigger password reset generator
  const handleInitiatePasswordReset = (user: UserAccount) => {
    // Generate secure random alphanumeric password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let tempPass = 'Omaha#';
    for (let i = 0; i < 10; i++) {
      tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedTempPassword(tempPass);
    setResettingUser(user);
    setCopiedPassword(false);
    onResetPassword(user.id, tempPass);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedTempPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Add User submit
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
      badgeNumber: newUserBadge.trim() || undefined,
      phone: newUserPhone.trim() || undefined,
      assignedCasesCount: 0,
      dateJoined: new Date().toISOString().substring(0, 10),
      lastLogin: 'Never logged in'
    };

    onAddUser(newUser);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserBadge('');
    setNewUserPhone('');
  };

  const isAdmin = currentAdminRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Total Registered Users</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{counts.all}</span>
            <span className="text-xs text-slate-500">Omaha Chapter Roster</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-cyan-800/40 p-4 rounded-xl">
          <div className="text-xs text-cyan-400 font-medium">Field Investigators (FIs)</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-cyan-300">{counts.investigators}</span>
            <span className="text-xs text-cyan-400/70">Certified Badges</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-indigo-800/40 p-4 rounded-xl">
          <div className="text-xs text-indigo-400 font-medium">Moderators & Admins</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-indigo-300">{counts.admins + counts.moderators}</span>
            <span className="text-xs text-indigo-400/70">Triage Operators</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-emerald-800/40 p-4 rounded-xl">
          <div className="text-xs text-emerald-400 font-medium">Active Accounts</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-300">{counts.active}</span>
            <span className="text-xs text-slate-500">{counts.disabled} Disabled</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-0 w-full sm:min-w-[240px] max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, email, badge #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Role & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Roles ({counts.all})</option>
              <option value="admin">Administrators ({counts.admins})</option>
              <option value="moderator">Moderators ({counts.moderators})</option>
              <option value="field_investigator">Field Investigators ({counts.investigators})</option>
              <option value="reporter">Reporters / Members ({counts.reporters})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only ({counts.active})</option>
              <option value="disabled">Disabled Only ({counts.disabled})</option>
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision User</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">User / Investigator</th>
                <th className="py-3.5 px-4 font-semibold">Role & Permissions</th>
                <th className="py-3.5 px-4 font-semibold">Account Status</th>
                <th className="py-3.5 px-4 font-semibold">Badge & Cases</th>
                <th className="py-3.5 px-4 font-semibold">Activity</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No users match your search or filter parameters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUserActive = user.status === 'active';

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-850/50 transition-colors ${!isUserActive ? 'opacity-65 bg-slate-950/40' : ''}`}
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border ${
                            user.role === 'admin'
                              ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                              : user.role === 'moderator'
                              ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                              : user.role === 'field_investigator'
                              ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.badgeNumber && (
                                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                                  {user.badgeNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Role Selector */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <select
                            value={user.role}
                            onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                            className={`bg-slate-950 border rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer ${
                              user.role === 'admin'
                                ? 'text-amber-400 border-amber-800/80'
                                : user.role === 'moderator'
                                ? 'text-indigo-400 border-indigo-800/80'
                                : user.role === 'field_investigator'
                                ? 'text-cyan-400 border-cyan-800/80'
                                : 'text-slate-300 border-slate-700'
                            }`}
                          >
                            <option value="admin">Administrator (Full Access)</option>
                            <option value="moderator">Moderator (Triage & PII Redaction)</option>
                            <option value="field_investigator">Field Investigator (Assigned Cases)</option>
                            <option value="reporter">Reporter (Public Submitter)</option>
                          </select>
                        ) : (
                          <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200">
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleStatus(user.id)}
                            disabled={!isAdmin}
                            title={isUserActive ? 'Click to disable account' : 'Click to enable account'}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                              isUserActive
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900'
                                : 'bg-rose-950/80 text-rose-300 border-rose-800/60 hover:bg-rose-900'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span>{isUserActive ? 'Active' : 'Disabled'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Cases count */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300">
                          <span className="font-mono font-bold text-white">{user.assignedCasesCount}</span>
                          <span className="text-slate-500 ml-1">cases</span>
                        </div>
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div>Last: <span className="text-slate-300">{user.lastLogin}</span></div>
                        <div className="text-slate-500">Joined: {user.dateJoined}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleInitiatePasswordReset(user)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                            title="Generate temporary password reset credentials"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reset Password</span>
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => onToggleStatus(user.id)}
                              className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                isUserActive
                                  ? 'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 border-slate-700'
                                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border-emerald-800'
                              }`}
                              title={isUserActive ? 'Disable account' : 'Enable account'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Information Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Omaha MUFON Role-Based Permissions Reference</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <span>Administrator</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
              Full rights: user provisioning, role elevation, password resets, report approvals, PII unmasking, public site syncing, and Codex configurations.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <span>Moderator</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
              Triage officer: review incoming public sightings, classify IFO/Starlink/drone hoaxes, perform witness PII redaction, and approve for public feed.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <span>Field Investigator (FI)</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
              Assigned case investigator: access confidential witness phone/email, conduct on-site interviews, log radar FOIA data, and record case field notes.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Reporter / Member</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
              Public member access: submit sighting reports, track status of their own case, and view published sightings on mufonomaha.space.
            </p>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Key className="w-5 h-5" />
              <h3 className="text-base font-semibold text-white">Temporary Password Generated</h3>
            </div>

            <p className="text-xs text-slate-400">
              A temporary password has been generated for <strong className="text-slate-200">{resettingUser.name}</strong> ({resettingUser.email}).
              Provide this credential to the user; they will be prompted to change it upon their next sign-in at <code className="text-cyan-300 font-mono">admin.mufonomaha.space</code>.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
                {generatedTempPassword}
              </span>
              <button
                onClick={handleCopyPassword}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="bg-slate-950/60 p-3 rounded border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-medium">Notification Details:</div>
              <div>· Password expiration: 24 hours</div>
              <div>· Session invalidation: All active sessions revoked</div>
              <div>· Delivery: Sent to {resettingUser.email}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setResettingUser(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                Done & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision New User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Provision User Account</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new administrator, moderator, or field investigator to the Omaha MUFON team.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. investigator@mufonnebraska.org"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="field_investigator">Field Investigator (Assigned cases, witness phone/email)</option>
                  <option value="moderator">Moderator (Triage queue & PII redaction)</option>
                  <option value="admin">Administrator (Full control)</option>
                  <option value="reporter">Reporter / Public Submitter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">MUFON Badge # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. NE-015"
                    value={newUserBadge}
                    onChange={(e) => setNewUserBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="(402) 555-..."
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
