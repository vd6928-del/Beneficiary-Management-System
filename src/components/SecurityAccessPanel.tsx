/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Shield,
  UserPlus,
  Users,
  Activity,
  Check,
  X,
  Trash2,
  MapPin,
  AlertCircle,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  ROLE_HIERARCHY,
  SECURITY_ROLES,
  getRoleMetadata,
  type SecurityRole,
} from '../lib/roles';
import {
  VILLAGES,
  type AuditLogEntry,
  type RoleInvitation,
  type UserProfile,
} from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function SecurityAccessPanel() {
  const { profile, permissions, authFetch, refreshProfile } = useAuth();
  const canManageUsers = Boolean(permissions?.canManageUsers);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<RoleInvitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sub-tab inside Security Panel
  const [subTab, setSubTab] = useState<'team' | 'matrix' | 'audit'>('team');

  // Invite / Pre-assign Role Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<SecurityRole>('field_worker');
  const [inviteState, setInviteState] = useState('Madhya Pradesh');
  const [inviteDistrict, setInviteDistrict] = useState('Mandla');
  const [inviteVillages, setInviteVillages] = useState<string[]>([]);
  const [savingInvite, setSavingInvite] = useState(false);

  // Editing existing user's village scope
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<SecurityRole>('field_worker');
  const [editState, setEditState] = useState('Madhya Pradesh');
  const [editDistrict, setEditDistrict] = useState('Mandla');
  const [editVillages, setEditVillages] = useState<string[]>([]);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);

  const fetchSecurityData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        authFetch('/api/admin/users'),
        authFetch('/api/admin/audit-logs'),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
        setInvitations(uData.invitations || []);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setAuditLogs(Array.isArray(lData) ? lData : []);
      }
    } catch (err) {
      console.error('Failed to load security data:', err);
      setStatusMessage({
        type: 'error',
        text: 'Unable to load security directory right now.',
      });
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const toggleVillage = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    village: string
  ) => {
    if (list.includes(village)) {
      setter(list.filter((v) => v !== village));
    } else {
      setter([...list, village]);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSavingInvite(true);
    setStatusMessage(null);

    try {
      const res = await authFetch('/api/admin/users/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail.trim(),
          displayName: inviteName.trim(),
          role: inviteRole,
          stateName: inviteState.trim() || 'Madhya Pradesh',
          districtName: inviteDistrict.trim() || 'Mandla',
          assignedVillages:
            inviteRole === 'admin' || inviteRole === 'state_incharge' ? [] : inviteVillages,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Could not assign security level.' });
        return;
      }

      setStatusMessage({
        type: 'success',
        text:
          data.kind === 'user_updated'
            ? `Updated security level for ${inviteEmail.trim()}.`
            : `Pre-authorized ${inviteEmail.trim()} as ${getRoleMetadata(inviteRole).label}.`,
      });
      setInviteEmail('');
      setInviteName('');
      setInviteRole('field_worker');
      setInviteVillages([]);
      await fetchSecurityData();
      await refreshProfile();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to save security assignment.' });
    } finally {
      setSavingInvite(false);
    }
  };

  const startEditingUser = (u: UserProfile) => {
    setEditingUserId(u.id);
    setEditRole(u.role);
    setEditState(u.stateName || 'Madhya Pradesh');
    setEditDistrict(u.districtName || 'Mandla');
    setEditVillages(u.assignedVillages || []);
  };

  const handleSaveUserEdit = async (targetUser: UserProfile) => {
    setSavingUserId(targetUser.id);
    setStatusMessage(null);
    try {
      const res = await authFetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: editRole,
          stateName: editState,
          districtName: editDistrict,
          assignedVillages:
            editRole === 'admin' || editRole === 'state_incharge' ? [] : editVillages,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Could not update user role.' });
        return;
      }
      setEditingUserId(null);
      setStatusMessage({
        type: 'success',
        text: `Updated ${targetUser.email} to ${getRoleMetadata(editRole).label}.`,
      });
      await fetchSecurityData();
      await refreshProfile();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update user.' });
    } finally {
      setSavingUserId(null);
    }
  };

  const handleToggleActive = async (targetUser: UserProfile) => {
    setSavingUserId(targetUser.id);
    setStatusMessage(null);
    try {
      const res = await authFetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !targetUser.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Could not update status.' });
        return;
      }
      setStatusMessage({
        type: 'success',
        text: `${targetUser.email} is now ${!targetUser.isActive ? 'Active' : 'Suspended'}.`,
      });
      await fetchSecurityData();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update account status.' });
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDeleteInvitation = async (id: number) => {
    setStatusMessage(null);
    try {
      const res = await authFetch(`/api/admin/users/invite/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusMessage({ type: 'error', text: data.error || 'Could not remove invitation.' });
        return;
      }
      setStatusMessage({ type: 'success', text: 'Pending role invitation removed.' });
      await fetchSecurityData();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to remove invitation.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Security Levels & Access Control
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage 4-tier security access across <strong>Admin</strong>,{' '}
              <strong>State Incharge</strong>, <strong>Project Manager</strong>, and{' '}
              <strong>Field Worker</strong> roles with village-level scoping and audit logging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchSecurityData}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('team')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            subTab === 'team'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Team & Role Assignments ({users.length})
        </button>
        <button
          onClick={() => setSubTab('matrix')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            subTab === 'matrix'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          4-Level Permission Matrix
        </button>
        <button
          onClick={() => setSubTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            subTab === 'audit'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* SUB-TAB 1: TEAM & ROLE ASSIGNMENTS */}
      {subTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Assign / Pre-Authorize Form (Admin Only) */}
          {canManageUsers && (
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assign Security Level
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pre-authorize a Google email or update an existing team member.
                  </p>
                </div>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@gmail.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g., Rajesh Verma"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Security Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as SecurityRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SECURITY_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_HIERARCHY[r].shortLabel} — {ROLE_HIERARCHY[r].scopeSummary}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={inviteState}
                      onChange={(e) => setInviteState(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={inviteDistrict}
                      onChange={(e) => setInviteDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {(inviteRole === 'project_manager' || inviteRole === 'field_worker') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Assigned Villages (leave empty for all 8 villages)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {VILLAGES.map((v) => {
                        const selected = inviteVillages.includes(v);
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleVillage(inviteVillages, setInviteVillages, v)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition ${
                              selected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingInvite}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {savingInvite ? 'Saving Assignment...' : 'Save Security Assignment'}
                </button>
              </form>
            </div>
          )}

          {/* Active Users + Pending Invitations */}
          <div
            className={`${
              canManageUsers ? 'lg:col-span-7' : 'lg:col-span-12'
            } space-y-6`}
          >
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registered Accounts ({users.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {canManageUsers
                      ? 'Update any account role, village boundary, or active status.'
                      : 'Read-only State Incharge oversight of registered portal accounts.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {users.map((u) => {
                  const meta = getRoleMetadata(u.role);
                  const isEditing = editingUserId === u.id;
                  const isSelf = profile?.uid === u.uid;

                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-xl border transition ${
                        u.isActive
                          ? 'border-slate-200 bg-white'
                          : 'border-rose-200 bg-rose-50/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {u.displayName || u.email}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                You
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${meta.badgeColor}`}
                            >
                              {meta.shortLabel}
                            </span>
                            {!u.isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                                Suspended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{u.email}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                            <span>
                              {u.districtName}, {u.stateName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-blue-500" />
                              {meta.permissions.canViewAllVillages || u.assignedVillages.length === 0
                                ? 'All 8 Villages'
                                : u.assignedVillages.join(', ')}
                            </span>
                          </div>
                        </div>

                        {canManageUsers && !isEditing && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => startEditingUser(u)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                            >
                              Edit Access
                            </button>
                            <button
                              onClick={() => handleToggleActive(u)}
                              disabled={savingUserId === u.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                u.isActive
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        )}
                      </div>

                      {canManageUsers && isEditing && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Security Level
                              </label>
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value as SecurityRole)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                              >
                                {SECURITY_ROLES.map((r) => (
                                  <option key={r} value={r}>
                                    {ROLE_HIERARCHY[r].shortLabel}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                value={editState}
                                onChange={(e) => setEditState(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                District
                              </label>
                              <input
                                type="text"
                                value={editDistrict}
                                onChange={(e) => setEditDistrict(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          {(editRole === 'project_manager' || editRole === 'field_worker') && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                                Assigned Villages (empty = all villages)
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {VILLAGES.map((v) => {
                                  const selected = editVillages.includes(v);
                                  return (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => toggleVillage(editVillages, setEditVillages, v)}
                                      className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
                                        selected
                                          ? 'bg-blue-600 text-white border-blue-600'
                                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {v}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={savingUserId === u.id}
                              onClick={() => handleSaveUserEdit(u)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Pre-Authorized Invitations */}
            {invitations.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Pre-Authorized Role Invitations ({invitations.length})
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  Automatically applied the moment these users sign in with Google.
                </p>
                <div className="space-y-2.5">
                  {invitations.map((inv) => {
                    const meta = getRoleMetadata(inv.role);
                    return (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {inv.email}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${meta.badgeColor}`}
                            >
                              {meta.shortLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {inv.displayName ? `${inv.displayName} · ` : ''}
                            Villages:{' '}
                            {inv.assignedVillages.length === 0
                              ? 'All Villages'
                              : inv.assignedVillages.join(', ')}
                          </p>
                        </div>
                        {canManageUsers && (
                          <button
                            onClick={() => handleDeleteInvitation(inv.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Remove invitation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: 4-LEVEL PERMISSION MATRIX */}
      {subTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              4-Tier Security Capability Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every permission below is strictly verified on the backend server on every API call.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold">Capability</th>
                  {SECURITY_ROLES.map((r) => (
                    <th key={r} className="py-3 px-4 font-bold text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-[10px] ${ROLE_HIERARCHY[r].badgeColor}`}
                      >
                        {ROLE_HIERARCHY[r].shortLabel}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    label: 'State-Wide Village Access (All 8 Villages)',
                    key: 'canViewAllVillages' as const,
                  },
                  {
                    label: 'Register Beneficiaries & Submit Forms 1–7',
                    key: 'canCreateRecords' as const,
                  },
                  {
                    label: 'Edit Own Submitted Records',
                    key: 'canEditOwnRecords' as const,
                  },
                  {
                    label: 'Edit Any Record in Scope',
                    key: 'canEditAnyRecord' as const,
                  },
                  {
                    label: 'Delete Erroneous Records',
                    key: 'canDeleteRecords' as const,
                  },
                  {
                    label: 'Create Projects, Assign Teams & Add Tehsil/Block/Cluster/Village',
                    key: 'canManageProjects' as const,
                  },
                  {
                    label: 'Design & Manage Temporary Data Collection Forms',
                    key: 'canDesignTempForms' as const,
                  },
                  {
                    label: 'Export Module CSV Reports',
                    key: 'canExportData' as const,
                  },
                  {
                    label: 'Download Master Database Backup',
                    key: 'canBackupDatabase' as const,
                  },
                  {
                    label: 'View Team Directory & Audit Logs',
                    key: 'canViewAuditLogs' as const,
                  },
                  {
                    label: 'Assign & Modify User Security Levels',
                    key: 'canManageUsers' as const,
                  },
                  {
                    label: 'Populate Initial Demo Data',
                    key: 'canSeedOrReset' as const,
                  },
                ].map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-800">{row.label}</td>
                    {SECURITY_ROLES.map((r) => {
                      const allowed = ROLE_HIERARCHY[r].permissions[row.key];
                      return (
                        <td key={r} className="py-3 px-4 text-center">
                          {allowed ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SECURITY AUDIT LOGS */}
      {subTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Security & Data Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable server-side record of data changes and security level updates.
            </p>
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No audit entries recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-bold">Time</th>
                    <th className="py-2.5 px-4 font-bold">User & Role</th>
                    <th className="py-2.5 px-4 font-bold">Action</th>
                    <th className="py-2.5 px-4 font-bold">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => {
                    const meta = getRoleMetadata(log.actorRole);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-800">{log.actorEmail}</div>
                          <span
                            className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.badgeColor}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">{log.summary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
