/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FolderKanban,
  Plus,
  MapPin,
  Users,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Building2,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  ROLE_HIERARCHY,
  SECURITY_ROLES,
  getRoleMetadata,
  type SecurityRole,
} from '../lib/roles';
import type {
  ProjectLocation,
  ProjectRecord,
  ProjectTeamMember,
} from '../types';

interface StaffSuggestion {
  displayName: string;
  email: string;
  role: SecurityRole;
}

export default function ProjectManagement() {
  const { profile, authFetch } = useAuth();
  const actorLevel = profile ? ROLE_HIERARCHY[profile.role].level : 1;

  const assignableRoles = useMemo(
    () => SECURITY_ROLES.filter((r) => ROLE_HIERARCHY[r].level <= actorLevel),
    [actorLevel]
  );

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [locations, setLocations] = useState<ProjectLocation[]>([]);
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [staffList, setStaffList] = useState<StaffSuggestion[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<'locations' | 'team'>('locations');

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create / Edit Project Form State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projState, setProjState] = useState(profile?.stateName || 'Madhya Pradesh');
  const [projDistrict, setProjDistrict] = useState(profile?.districtName || 'Mandla');
  const [projStatus, setProjStatus] = useState<'Active' | 'Completed' | 'On Hold'>('Active');
  const [projDesc, setProjDesc] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  // Add Location Form State (Tehsil -> Block -> Cluster -> Village)
  const [tehsil, setTehsil] = useState('');
  const [block, setBlock] = useState('');
  const [cluster, setCluster] = useState('');
  const [village, setVillage] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  // Add Team Member Form State
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<SecurityRole>('field_worker');
  const [assignedTehsil, setAssignedTehsil] = useState('');
  const [assignedBlock, setAssignedBlock] = useState('');
  const [assignedCluster, setAssignedCluster] = useState('');
  const [assignedVillage, setAssignedVillage] = useState('');
  const [savingTeam, setSavingTeam] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'project' | 'location' | 'team';
    id: number;
    label: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, staffRes] = await Promise.all([
        authFetch('/api/projects'),
        authFetch('/api/projects/staff-suggestions'),
      ]);
      if (projRes.ok) {
        const data = await projRes.json();
        const nextProjects: ProjectRecord[] = data.projects || [];
        setProjects(nextProjects);
        setLocations(data.locations || []);
        setTeamMembers(data.teamMembers || []);
        setSelectedProjectId((prev) => {
          if (prev && nextProjects.some((p) => p.id === prev)) return prev;
          return nextProjects[0]?.id ?? null;
        });
      }
      if (staffRes.ok) {
        const sData = await staffRes.json();
        setStaffList(Array.isArray(sData) ? sData : []);
      }
    } catch (err) {
      console.error('Failed to load project workspace:', err);
      setNotice({ type: 'error', text: 'Unable to load projects right now.' });
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const projectLocations = useMemo(
    () => locations.filter((l) => l.projectId === selectedProjectId),
    [locations, selectedProjectId]
  );

  const projectTeam = useMemo(
    () => teamMembers.filter((t) => t.projectId === selectedProjectId),
    [teamMembers, selectedProjectId]
  );

  // Unique hierarchy values from current project locations for quick dropdowns
  const uniqueTehsils = useMemo(
    () => Array.from(new Set(projectLocations.map((l) => l.tehsil))),
    [projectLocations]
  );
  const uniqueBlocks = useMemo(
    () =>
      Array.from(
        new Set(
          projectLocations
            .filter((l) => !assignedTehsil || l.tehsil === assignedTehsil)
            .map((l) => l.block)
        )
      ),
    [projectLocations, assignedTehsil]
  );
  const uniqueClusters = useMemo(
    () =>
      Array.from(
        new Set(
          projectLocations
            .filter(
              (l) =>
                (!assignedTehsil || l.tehsil === assignedTehsil) &&
                (!assignedBlock || l.block === assignedBlock)
            )
            .map((l) => l.cluster)
        )
      ),
    [projectLocations, assignedTehsil, assignedBlock]
  );
  const uniqueVillages = useMemo(
    () =>
      Array.from(
        new Set(
          projectLocations
            .filter(
              (l) =>
                (!assignedTehsil || l.tehsil === assignedTehsil) &&
                (!assignedBlock || l.block === assignedBlock) &&
                (!assignedCluster || l.cluster === assignedCluster)
            )
            .map((l) => l.village)
        )
      ),
    [projectLocations, assignedTehsil, assignedBlock, assignedCluster]
  );

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjName('');
    setProjCode('');
    setProjState(profile?.stateName || 'Madhya Pradesh');
    setProjDistrict(profile?.districtName || 'Mandla');
    setProjStatus('Active');
    setProjDesc('');
    setShowProjectForm(false);
  };

  const openEditProject = (p: ProjectRecord) => {
    setEditingProjectId(p.id);
    setProjName(p.name);
    setProjCode(p.code);
    setProjState(p.stateName);
    setProjDistrict(p.districtName);
    setProjStatus(p.status);
    setProjDesc(p.description);
    setShowProjectForm(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    setSavingProject(true);
    setNotice(null);

    try {
      const url = editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects';
      const method = editingProjectId ? 'PATCH' : 'POST';
      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          name: projName.trim(),
          code: projCode.trim(),
          stateName: projState.trim(),
          districtName: projDistrict.trim(),
          status: projStatus,
          description: projDesc.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not save project.' });
        return;
      }
      setNotice({
        type: 'success',
        text: editingProjectId
          ? `Project "${data.name}" updated.`
          : `Project "${data.name}" created successfully.`,
      });
      resetProjectForm();
      await loadData();
      if (data.id) setSelectedProjectId(data.id);
    } catch {
      setNotice({ type: 'error', text: 'Failed to save project.' });
    } finally {
      setSavingProject(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSavingLocation(true);
    setNotice(null);
    try {
      const res = await authFetch(`/api/projects/${selectedProjectId}/locations`, {
        method: 'POST',
        body: JSON.stringify({
          tehsil: tehsil.trim(),
          block: block.trim(),
          cluster: cluster.trim(),
          village: village.trim(),
          gramPanchayat: gramPanchayat.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not add location entry.' });
        return;
      }
      setLocations((prev) => [data, ...prev]);
      setVillage('');
      setGramPanchayat('');
      setNotice({
        type: 'success',
        text: `Added ${data.village} (${data.cluster} / ${data.block} / ${data.tehsil}).`,
      });
    } catch {
      setNotice({ type: 'error', text: 'Failed to save location entry.' });
    } finally {
      setSavingLocation(false);
    }
  };

  const handleAssignTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSavingTeam(true);
    setNotice(null);
    try {
      const res = await authFetch(`/api/projects/${selectedProjectId}/team`, {
        method: 'POST',
        body: JSON.stringify({
          memberName: memberName.trim(),
          memberEmail: memberEmail.trim(),
          role: memberRole,
          assignedTehsil,
          assignedBlock,
          assignedCluster,
          assignedVillage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not assign team member.' });
        return;
      }
      setTeamMembers((prev) => [data, ...prev]);
      setMemberName('');
      setMemberEmail('');
      setMemberRole('field_worker');
      setAssignedTehsil('');
      setAssignedBlock('');
      setAssignedCluster('');
      setAssignedVillage('');
      setNotice({
        type: 'success',
        text: `Assigned ${data.memberName} as ${getRoleMetadata(data.role).label}.`,
      });
    } catch {
      setNotice({ type: 'error', text: 'Failed to assign team member.' });
    } finally {
      setSavingTeam(false);
    }
  };

  const handleUpdateMemberRole = async (member: ProjectTeamMember, nextRole: SecurityRole) => {
    setNotice(null);
    try {
      const res = await authFetch(`/api/projects/team/${member.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not update role.' });
        return;
      }
      setTeamMembers((prev) => prev.map((m) => (m.id === member.id ? data : m)));
      setNotice({
        type: 'success',
        text: `Updated ${member.memberName}'s project role to ${getRoleMetadata(nextRole).label}.`,
      });
    } catch {
      setNotice({ type: 'error', text: 'Failed to update role.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setNotice(null);
    try {
      const url =
        deleteTarget.type === 'project'
          ? `/api/projects/${deleteTarget.id}`
          : deleteTarget.type === 'location'
            ? `/api/projects/locations/${deleteTarget.id}`
            : `/api/projects/team/${deleteTarget.id}`;

      const res = await authFetch(url, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not delete entry.' });
        setDeleteTarget(null);
        return;
      }

      if (deleteTarget.type === 'project') {
        await loadData();
      } else if (deleteTarget.type === 'location') {
        setLocations((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      } else {
        setTeamMembers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      }
      setNotice({ type: 'success', text: `Removed "${deleteTarget.label}".` });
    } catch {
      setNotice({ type: 'error', text: 'Delete request failed.' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Project, Location & Team Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create new projects, register <strong>Tehsil → Block → Cluster → Village</strong>{' '}
              hierarchies, and assign project team members with security roles.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              resetProjectForm();
              setShowProjectForm(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-500 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New / Edit Project Form Drawer */}
      {showProjectForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingProjectId ? 'Edit Project Details' : 'Create New Project'}
            </h3>
            <button
              onClick={resetProjectForm}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSaveProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g., Climate Resilient Watershed Phase II"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Code (Auto if blank)
                </label>
                <input
                  type="text"
                  value={projCode}
                  onChange={(e) => setProjCode(e.target.value)}
                  placeholder="e.g., PRJ-MP-2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={projState}
                  onChange={(e) => setProjState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={projDistrict}
                  onChange={(e) => setProjDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={projStatus}
                  onChange={(e) =>
                    setProjStatus(e.target.value as 'Active' | 'Completed' | 'On Hold')
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Description / Scope
              </label>
              <textarea
                rows={2}
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                placeholder="Objectives, donor/program details, or target geography..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetProjectForm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {savingProject
                  ? 'Saving...'
                  : editingProjectId
                    ? 'Update Project'
                    : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Projects List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              All Projects ({projects.length})
            </h3>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No projects created yet</p>
              <p className="text-[11px] text-slate-400">
                Click "New Project" above to create your first project and configure Tehsil,
                Block, Cluster, Village, and Team assignments.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                const locCount = locations.filter((l) => l.projectId === p.id).length;
                const teamCount = teamMembers.filter((t) => t.projectId === p.id).length;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {p.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5 truncate">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.districtName}, {p.stateName}
                    </p>
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {locCount} Locations
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-600" />
                        {teamCount} Team
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Project Locations & Team */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedProject ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Select or Create a Project</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose a project from the left list to manage Tehsil, Block, Cluster, Village
                entries and assign Team Members & Roles.
              </p>
            </div>
          ) : (
            <>
              {/* Selected Project Overview Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {selectedProject.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        {selectedProject.districtName}, {selectedProject.stateName}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {selectedProject.name}
                    </h3>
                    {selectedProject.description && (
                      <p className="text-xs text-slate-600 mt-1">{selectedProject.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditProject(selectedProject)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Name
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'project',
                          id: selectedProject.id,
                          label: selectedProject.name,
                        })
                      }
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inner Tabs */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setDetailTab('locations')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                      detailTab === 'locations'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Tehsil, Block, Cluster & Village ({projectLocations.length})
                  </button>
                  <button
                    onClick={() => setDetailTab('team')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                      detailTab === 'team'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Team & Role Assignment ({projectTeam.length})
                  </button>
                </div>
              </div>

              {/* TAB A: TEHSIL, BLOCK, CLUSTER, VILLAGE ENTRY */}
              {detailTab === 'locations' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Add Location Hierarchy Entry
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-4">
                      Register Tehsil, Block, Cluster, Gram Panchayat, and Village under{' '}
                      <strong>{selectedProject.name}</strong>.
                    </p>
                    <form onSubmit={handleAddLocation} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Tehsil <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={tehsil}
                            onChange={(e) => setTehsil(e.target.value)}
                            placeholder="e.g., Ghughri"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Block <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={block}
                            onChange={(e) => setBlock(e.target.value)}
                            placeholder="e.g., Ghughri Block"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Cluster <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={cluster}
                            onChange={(e) => setCluster(e.target.value)}
                            placeholder="e.g., Cluster-A"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Village <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                            placeholder="e.g., Sukhram"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Gram Panchayat (Optional)
                          </label>
                          <input
                            type="text"
                            value={gramPanchayat}
                            onChange={(e) => setGramPanchayat(e.target.value)}
                            placeholder="e.g., Sukhram GP"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={savingLocation}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {savingLocation ? 'Adding...' : 'Add Location'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Locations Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Registered Geographic Hierarchy
                      </h4>
                      <span className="text-xs text-slate-400">
                        {projectLocations.length} entries
                      </span>
                    </div>
                    {projectLocations.length === 0 ? (
                      <div className="p-10 text-center text-xs text-slate-400">
                        No Tehsil/Block/Cluster/Village entries added to this project yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                              <th className="py-2.5 px-4 font-bold">Tehsil</th>
                              <th className="py-2.5 px-4 font-bold">Block</th>
                              <th className="py-2.5 px-4 font-bold">Cluster</th>
                              <th className="py-2.5 px-4 font-bold">Village</th>
                              <th className="py-2.5 px-4 font-bold">Gram Panchayat</th>
                              <th className="py-2.5 px-4 font-bold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {projectLocations.map((loc) => (
                              <tr key={loc.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-4 font-semibold text-slate-800">
                                  {loc.tehsil}
                                </td>
                                <td className="py-2.5 px-4 text-slate-700">{loc.block}</td>
                                <td className="py-2.5 px-4 text-slate-700">{loc.cluster}</td>
                                <td className="py-2.5 px-4 font-semibold text-blue-700">
                                  {loc.village}
                                </td>
                                <td className="py-2.5 px-4 text-slate-500">
                                  {loc.gramPanchayat || '—'}
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                  <button
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: 'location',
                                        id: loc.id,
                                        label: `${loc.village} (${loc.tehsil})`,
                                      })
                                    }
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                    title="Remove location"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB B: PROJECT TEAM & ROLE ASSIGNMENT */}
              {detailTab === 'team' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Assign Team Member & Role
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4">
                      Assign staff to <strong>{selectedProject.name}</strong> with their role and
                      optional Tehsil/Block/Cluster/Village responsibility.
                    </p>

                    <form onSubmit={handleAssignTeamMember} className="space-y-3">
                      {staffList.length > 0 && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            Quick Fill from Registered Portal Users (Optional)
                          </label>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const picked = staffList.find((s) => s.email === e.target.value);
                              if (picked) {
                                setMemberName(picked.displayName || picked.email.split('@')[0]);
                                setMemberEmail(picked.email);
                                if (
                                  ROLE_HIERARCHY[picked.role].level <= actorLevel
                                ) {
                                  setMemberRole(picked.role);
                                }
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Select registered user to autofill --</option>
                            {staffList.map((s) => (
                              <option key={s.email} value={s.email}>
                                {s.displayName || s.email} ({s.email}) —{' '}
                                {getRoleMetadata(s.role).label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Member Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            placeholder="member@gmail.com"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Project Role <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value as SecurityRole)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {assignableRoles.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_HIERARCHY[r].shortLabel}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Optional Location Assignment linked to project's locations */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Tehsil (Optional)
                          </label>
                          <input
                            list="project-tehsils"
                            value={assignedTehsil}
                            onChange={(e) => setAssignedTehsil(e.target.value)}
                            placeholder="All / Specific Tehsil"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                          <datalist id="project-tehsils">
                            {uniqueTehsils.map((t) => (
                              <option key={t} value={t} />
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Block (Optional)
                          </label>
                          <input
                            list="project-blocks"
                            value={assignedBlock}
                            onChange={(e) => setAssignedBlock(e.target.value)}
                            placeholder="All / Specific Block"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                          <datalist id="project-blocks">
                            {uniqueBlocks.map((b) => (
                              <option key={b} value={b} />
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Cluster (Optional)
                          </label>
                          <input
                            list="project-clusters"
                            value={assignedCluster}
                            onChange={(e) => setAssignedCluster(e.target.value)}
                            placeholder="All / Specific Cluster"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                          <datalist id="project-clusters">
                            {uniqueClusters.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Village (Optional)
                          </label>
                          <input
                            list="project-villages"
                            value={assignedVillage}
                            onChange={(e) => setAssignedVillage(e.target.value)}
                            placeholder="All / Specific Village"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                          <datalist id="project-villages">
                            {uniqueVillages.map((v) => (
                              <option key={v} value={v} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={savingTeam}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {savingTeam ? 'Assigning...' : 'Assign to Project'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Team Roster Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Project Team Roster
                      </h4>
                      <span className="text-xs text-slate-400">{projectTeam.length} members</span>
                    </div>
                    {projectTeam.length === 0 ? (
                      <div className="p-10 text-center text-xs text-slate-400">
                        No team members assigned to this project yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                              <th className="py-2.5 px-4 font-bold">Member</th>
                              <th className="py-2.5 px-4 font-bold">Role</th>
                              <th className="py-2.5 px-4 font-bold">Assigned Area</th>
                              <th className="py-2.5 px-4 font-bold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {projectTeam.map((member) => {
                              const meta = getRoleMetadata(member.role);
                              const canEditThisRole =
                                ROLE_HIERARCHY[member.role].level <= actorLevel;
                              const areaParts = [
                                member.assignedTehsil && `Tehsil: ${member.assignedTehsil}`,
                                member.assignedBlock && `Block: ${member.assignedBlock}`,
                                member.assignedCluster && `Cluster: ${member.assignedCluster}`,
                                member.assignedVillage && `Village: ${member.assignedVillage}`,
                              ].filter(Boolean);
                              return (
                                <tr key={member.id} className="hover:bg-slate-50">
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-800">
                                      {member.memberName}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      {member.memberEmail}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {canEditThisRole ? (
                                      <select
                                        value={member.role}
                                        onChange={(e) =>
                                          handleUpdateMemberRole(
                                            member,
                                            e.target.value as SecurityRole
                                          )
                                        }
                                        className={`px-2 py-1 rounded border text-[11px] font-bold bg-white ${meta.badgeColor}`}
                                      >
                                        {assignableRoles.map((r) => (
                                          <option key={r} value={r}>
                                            {ROLE_HIERARCHY[r].shortLabel}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span
                                        className={`px-2 py-0.5 rounded border text-[10px] font-bold ${meta.badgeColor}`}
                                      >
                                        {meta.shortLabel}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-[11px] text-slate-600">
                                    {areaParts.length > 0
                                      ? areaParts.join(' · ')
                                      : 'Entire Project Area'}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      onClick={() =>
                                        setDeleteTarget({
                                          type: 'team',
                                          id: member.id,
                                          label: member.memberName,
                                        })
                                      }
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                      title="Remove team member"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Removal</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong>{deleteTarget.label}</strong>?
              {deleteTarget.type === 'project' &&
                ' All locations and team assignments under this project will also be removed.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
