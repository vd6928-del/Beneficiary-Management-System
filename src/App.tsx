/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Beneficiary,
  Form1CRAActivity,
  Form2TrainingMeeting,
  Form3HealthNutrition,
  Form4Convergence,
  Form5SprinklerActivity,
  Form6FarmerFieldSchool,
  Form7VDCMeetingRecord,
  Form8CropDemoRecord,
  type CustomForm,
  type ModuleKey,
} from './types';
import {
  downloadCSV,
  SEED_BENEFICIARIES,
  SEED_CRA_ACTIVITIES,
  SEED_TRAININGS,
  SEED_HEALTH_NUTRITION,
  SEED_CONVERGENCE,
  SEED_SPRINKLER,
  SEED_FFS,
  SEED_VDC_MEETINGS,
} from './utils';
import { useAuth } from './contexts/AuthContext';

// Components
import DashboardOverview from './components/DashboardOverview';
import BeneficiaryMaster from './components/BeneficiaryMaster';
import CRAActivities from './components/CRAActivities';
import TrainingsMeetings from './components/TrainingsMeetings';
import HealthNutrition from './components/HealthNutrition';
import Convergence from './components/Convergence';
import SprinklerActivities from './components/SprinklerActivities';
import FarmerFieldSchool from './components/FarmerFieldSchool';
import VDCMeeting from './components/VDCMeeting';
import CropDemoRegister from './components/CropDemoRegister';
import LoginScreen from './components/LoginScreen';
import SecurityAccessPanel from './components/SecurityAccessPanel';
import ProjectManagement from './components/ProjectManagement';
import TempFormBuilder from './components/TempFormBuilder';

// Icons
import {
  LayoutDashboard,
  Users,
  Sprout,
  Users2,
  Heart,
  Network,
  Droplets,
  BookOpen,
  MessageSquare,
  FolderDown,
  Shield,
  LogOut,
  AlertCircle,
  CheckCircle2,
  X,
  MapPin,
  FolderKanban,
  FilePlus2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Plus,
  FileText,
  FileSpreadsheet,
  Wheat,
} from 'lucide-react';

type ActiveTab =
  | 'dashboard'
  | 'directory'
  | 'projects'
  | 'tempForms'
  | 'cra'
  | 'trainings'
  | 'nutrition'
  | 'convergence'
  | 'sprinkler'
  | 'ffs'
  | 'vdc'
  | 'cropDemo'
  | 'security';

export default function App() {
  const {
    firebaseUser,
    profile,
    roleMeta,
    permissions,
    isAppOwner,
    loading: authLoading,
    authError,
    signInWithGoogle,
    logout,
    authFetch,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Domain States (Loaded from authenticated PostgreSQL API)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [activities, setActivities] = useState<Form1CRAActivity[]>([]);
  const [trainings, setTrainings] = useState<Form2TrainingMeeting[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<Form3HealthNutrition[]>([]);
  const [convergences, setConvergences] = useState<Form4Convergence[]>([]);
  const [sprinklers, setSprinklers] = useState<Form5SprinklerActivity[]>([]);
  const [ffsLogs, setFfsLogs] = useState<Form6FarmerFieldSchool[]>([]);
  const [vdcMeetings, setVdcMeetings] = useState<Form7VDCMeetingRecord[]>([]);
  const [cropDemoRecords, setCropDemoRecords] = useState<Form8CropDemoRecord[]>([]);

  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Two Separate Form Dropdown States
  const [predefinedDropdownOpen, setPredefinedDropdownOpen] = useState<boolean>(false);
  const [tempFormsDropdownOpen, setTempFormsDropdownOpen] = useState<boolean>(false);
  const [sidebarTempForms, setSidebarTempForms] = useState<CustomForm[]>([]);
  const [selectedTempFormId, setSelectedTempFormId] = useState<number | null>(null);
  const [tempFormInitialMode, setTempFormInitialMode] = useState<
    'list' | 'design' | 'fill' | 'import'
  >('list');
  const [tempFormNavKey, setTempFormNavKey] = useState<number>(0);

  const showNotice = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const applyServerPayload = useCallback((data: any) => {
    setBeneficiaries(Array.isArray(data?.beneficiaries) ? data.beneficiaries : []);
    setActivities(Array.isArray(data?.activities) ? data.activities : []);
    setTrainings(Array.isArray(data?.trainings) ? data.trainings : []);
    setNutritionLogs(Array.isArray(data?.nutritionLogs) ? data.nutritionLogs : []);
    setConvergences(Array.isArray(data?.convergences) ? data.convergences : []);
    setSprinklers(Array.isArray(data?.sprinklers) ? data.sprinklers : []);
    setFfsLogs(Array.isArray(data?.ffsLogs) ? data.ffsLogs : []);
    setVdcMeetings(Array.isArray(data?.vdcMeetings) ? data.vdcMeetings : []);
    setCropDemoRecords(Array.isArray(data?.cropDemoRecords) ? data.cropDemoRecords : []);
  }, []);

  const loadMasterData = useCallback(async () => {
    if (!profile) return;
    setDataLoading(true);
    try {
      const res = await authFetch('/api/data');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showNotice('error', data.error || 'Could not load records.');
        return;
      }
      applyServerPayload(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      showNotice('error', 'Unable to load records right now. Please refresh.');
    } finally {
      setDataLoading(false);
    }
  }, [profile, authFetch, applyServerPayload, showNotice]);

  const loadSidebarTempForms = useCallback(async () => {
    if (!profile) {
      setSidebarTempForms([]);
      return;
    }
    try {
      const res = await authFetch('/api/custom-forms');
      if (res.ok) {
        const list = await res.json();
        setSidebarTempForms(Array.isArray(list) ? list : []);
      }
    } catch {
      // Non-blocking sidebar list refresh
    }
  }, [profile, authFetch]);

  useEffect(() => {
    if (profile) {
      loadMasterData();
      loadSidebarTempForms();
    } else {
      applyServerPayload({});
      setSidebarTempForms([]);
    }
  }, [profile, loadMasterData, loadSidebarTempForms, applyServerPayload]);

  const openTempFormsSection = (
    mode: 'list' | 'design' | 'fill' | 'import',
    formId: number | null = null
  ) => {
    setSelectedTempFormId(formId);
    setTempFormInitialMode(mode);
    setTempFormNavKey((k) => k + 1);
    setActiveTab('tempForms');
  };

  // Redirect away from restricted tabs if user role does not allow viewing them
  useEffect(() => {
    if (activeTab === 'security' && permissions && !permissions.canViewUsers) {
      setActiveTab('dashboard');
    }
    if (activeTab === 'projects' && permissions && !permissions.canManageProjects) {
      setActiveTab('dashboard');
    }
  }, [activeTab, permissions]);

  // Generic RBAC-checked CRUD helpers
  const handleCreateRecord = async <T extends { id: string }>(
    module: ModuleKey,
    item: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    try {
      const res = await authFetch(`/api/records/${module}`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showNotice('error', data.error || 'Could not save entry.');
        return;
      }
      setter((prev) => [data as T, ...prev]);
      showNotice('success', 'Record saved successfully.');
    } catch {
      showNotice('error', 'Failed to save entry.');
    }
  };

  const handleUpdateRecord = async <T extends { id: string }>(
    module: ModuleKey,
    updated: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    try {
      const res = await authFetch(`/api/records/${module}/${encodeURIComponent(updated.id)}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showNotice('error', data.error || 'You do not have permission to update this entry.');
        return;
      }
      setter((prev) => prev.map((row) => (row.id === updated.id ? (data as T) : row)));
      showNotice('success', 'Record updated successfully.');
    } catch {
      showNotice('error', 'Failed to update entry.');
    }
  };

  const handleDeleteRecord = async <T extends { id: string }>(
    module: ModuleKey,
    id: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (!permissions?.canDeleteRecords) {
      showNotice(
        'error',
        'Access denied: Field Workers do not have permission to delete records.'
      );
      return;
    }
    try {
      const res = await authFetch(`/api/records/${module}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showNotice('error', data.error || 'You do not have permission to delete this entry.');
        return;
      }
      setter((prev) => prev.filter((row) => row.id !== id));
      showNotice('success', 'Record deleted.');
    } catch {
      showNotice('error', 'Failed to delete entry.');
    }
  };

  const handleExportCSV = (rows: any[], filename: string) => {
    if (!permissions?.canExportData) {
      showNotice(
        'error',
        'Access denied: CSV exports require Project Manager, State Incharge, or Admin level.'
      );
      return;
    }
    downloadCSV(rows, filename);
  };

  // Admin-only Seed Data helper
  const handleLoadSeedData = async () => {
    if (!permissions?.canSeedOrReset) {
      showNotice('error', 'Only Administrators can populate demo data.');
      return;
    }
    try {
      const res = await authFetch('/api/admin/seed', {
        method: 'POST',
        body: JSON.stringify({
          beneficiaries: SEED_BENEFICIARIES,
          activities: SEED_CRA_ACTIVITIES,
          trainings: SEED_TRAININGS,
          nutritionLogs: SEED_HEALTH_NUTRITION,
          convergences: SEED_CONVERGENCE,
          sprinklers: SEED_SPRINKLER,
          ffsLogs: SEED_FFS,
          vdcMeetings: SEED_VDC_MEETINGS,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        showNotice('error', result.error || 'Could not populate demo data.');
        return;
      }
      if (result.data) {
        applyServerPayload(result.data);
      } else {
        await loadMasterData();
      }
      showNotice('success', 'Demo dataset populated across all modules.');
    } catch {
      showNotice('error', 'Failed to populate demo data.');
    }
  };

  // Authentication Gates
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-slate-300">Verifying security session...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !profile || !roleMeta || !permissions) {
    return (
      <LoginScreen
        onSignIn={signInWithGoogle}
        onSignOut={firebaseUser ? logout : undefined}
        error={authError}
        isSignedInButBlocked={Boolean(firebaseUser && !profile)}
        userEmail={firebaseUser?.email}
      />
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Farmer Catalog', icon: Users },
    { id: 'cra', label: 'CRA Activities', icon: Sprout },
    { id: 'trainings', label: 'Trainings & meets', icon: Users2 },
    { id: 'nutrition', label: 'Health & nutrition', icon: Heart },
    { id: 'convergence', label: 'Convergence', icon: Network },
    { id: 'sprinkler', label: 'Sprinklers', icon: Droplets },
    { id: 'ffs', label: 'FFS training', icon: BookOpen },
    { id: 'vdc', label: 'VDC meetings', icon: MessageSquare },
    { id: 'cropDemo', label: 'Crop Demo Sheet', icon: Wheat },
  ] as const;

  const villageScopeLabel =
    permissions.canViewAllVillages || profile.assignedVillages.length === 0
      ? 'All Villages'
      : `${profile.assignedVillages.length} Village${profile.assignedVillages.length > 1 ? 's' : ''}`;

  return (
    <div className="h-screen w-screen bg-slate-100 flex overflow-hidden font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 h-full border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-blue-400">
                Beneficiary Master
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
                RBAC Portal v3.0
              </p>
            </div>
          </div>

          {/* Signed-in User Role Card */}
          <div className="mt-4 p-3 rounded-lg bg-slate-800/70 border border-slate-700/70 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white truncate">
                {profile.displayName || profile.email}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{profile.email}</p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleMeta.badgeColor}`}
              >
                {roleMeta.shortLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                <MapPin className="w-2.5 h-2.5 text-blue-400" />
                {villageScopeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-4">
          {/* Core Views Section */}
          <div>
            <div className="px-6 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Core Systems
            </div>
            <div className="mt-1.5 space-y-0.5">
              {tabs.slice(0, 2).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-6 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}

              {permissions.canManageProjects && (
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full flex items-center gap-3 px-6 py-2.5 text-left transition-colors ${
                    activeTab === 'projects'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FolderKanban className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-xs font-medium">Projects & Locations</span>
                </button>
              )}

              {permissions.canViewUsers && (
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-6 py-2.5 text-left transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Shield className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-xs font-medium">Security & Access</span>
                </button>
              )}
            </div>
          </div>

          {/* DROPDOWN 1: Pre-defined Data Entry Forms */}
          <div className="px-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setPredefinedDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                  tabs.slice(2).some((t) => t.id === activeTab)
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <ClipboardList className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-bold truncate">Pre-defined Forms</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {tabs.length - 2}
                  </span>
                  {predefinedDropdownOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </span>
              </button>

              {predefinedDropdownOpen && (
                <div className="border-t border-slate-800 py-1.5 space-y-0.5 bg-slate-900/50">
                  {tabs.slice(2).map((tab, idx) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-medium truncate">
                          Form {idx + 1}: {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* DROPDOWN 2: Temporary Data Collection Forms */}
          <div className="px-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setTempFormsDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                  activeTab === 'tempForms'
                    ? 'bg-indigo-600/25 text-indigo-300'
                    : 'text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <FilePlus2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold truncate">Temporary Forms</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {sidebarTempForms.length}
                  </span>
                  {tempFormsDropdownOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </span>
              </button>

              {tempFormsDropdownOpen && (
                <div className="border-t border-slate-800 py-1.5 space-y-0.5 bg-slate-900/50">
                  <button
                    onClick={() => openTempFormsSection('list', null)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                      activeTab === 'tempForms' && tempFormInitialMode === 'list'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-semibold">All Temporary Forms</span>
                  </button>

                  {permissions.canDesignTempForms && (
                    <button
                      onClick={() => openTempFormsSection('design', null)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                        activeTab === 'tempForms' && tempFormInitialMode === 'design'
                          ? 'bg-indigo-600 text-white'
                          : 'text-indigo-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-semibold">Design New Temp Form</span>
                    </button>
                  )}

                  {isAppOwner && (
                    <button
                      onClick={() => openTempFormsSection('import', null)}
                      className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-left transition-colors ${
                        activeTab === 'tempForms' && tempFormInitialMode === 'import'
                          ? 'bg-emerald-600 text-white'
                          : 'text-emerald-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title="Owner Only: Upload .xlsx or .csv file to design a form"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-semibold truncate">
                          Upload Excel / CSV
                        </span>
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-900/70 text-emerald-200 border border-emerald-700/60 shrink-0">
                        Owner
                      </span>
                    </button>
                  )}

                  {sidebarTempForms.length === 0 ? (
                    <div className="px-4 py-2 text-[10px] text-slate-500 italic">
                      No temporary forms created yet
                    </div>
                  ) : (
                    <div className="pt-1 mt-1 border-t border-slate-800/80 max-h-48 overflow-y-auto space-y-0.5">
                      {sidebarTempForms.map((tf) => {
                        const isSelected =
                          activeTab === 'tempForms' &&
                          tempFormInitialMode === 'fill' &&
                          selectedTempFormId === tf.id;
                        return (
                          <button
                            key={tf.id}
                            onClick={() => openTempFormsSection('fill', tf.id)}
                            className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-left transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                            title={tf.title}
                          >
                            <span className="text-[11px] font-medium truncate">
                              {tf.title}
                            </span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                tf.isActive ? 'bg-emerald-400' : 'bg-slate-500'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-900 space-y-2">
          <button
            onClick={logout}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {activeTab === 'dashboard'
                ? 'SYS-DB'
                : activeTab === 'directory'
                  ? 'CAT-01'
                  : activeTab === 'projects'
                    ? 'PRJ-MGR'
                    : activeTab === 'tempForms'
                      ? 'TMP-FRM'
                      : activeTab === 'security'
                        ? 'SEC-RBAC'
                        : `CRA-0${tabs.findIndex((t) => t.id === activeTab) - 1}`}
            </span>
            <h2 className="text-base font-bold text-slate-800">
              {activeTab === 'dashboard' && 'System Dashboard & Metrics'}
              {activeTab === 'directory' && 'Master Beneficiary Catalog Directory'}
              {activeTab === 'projects' && 'Project, Team & Tehsil/Block/Cluster/Village Setup'}
              {activeTab === 'tempForms' && 'Temporary Data Collection Forms'}
              {activeTab === 'security' && 'Security Levels, Users & Audit Logs'}
              {activeTab === 'cra' && 'Form 1: Climate Resilient Agriculture Activities'}
              {activeTab === 'trainings' && 'Form 2: Trainings & Meetings Record'}
              {activeTab === 'nutrition' && 'Form 3: Health & Nutrition Monitoring'}
              {activeTab === 'convergence' && 'Form 4: Convergence Project Records'}
              {activeTab === 'sprinkler' && 'Form 5: Sprinkler Intervention Details'}
              {activeTab === 'ffs' && 'Form 6: Farmer Field School training Logs'}
              {activeTab === 'vdc' && 'Form 7: VDC Meeting Minutes'}
              {activeTab === 'cropDemo' && 'Form 8: Comprehensive Crop Demo & Farmer Progress Sheet'}
            </h2>
          </div>

          {/* Header Controls & Role Indicator */}
          <div className="flex items-center space-x-3 text-xs">
            <span
              className={`px-2.5 py-1 rounded border text-[11px] font-bold ${roleMeta.badgeColor}`}
              title={roleMeta.description}
            >
              {roleMeta.shortLabel}
            </span>

            {permissions.canBackupDatabase && (
              <>
                <span className="h-4 w-px bg-slate-200" />
                <button
                  onClick={() => {
                    const dataGroup = {
                      beneficiaries,
                      cra_activities: activities,
                      trainings_meetings: trainings,
                      health_nutrition: nutritionLogs,
                      convergences,
                      sprinklers,
                      ffsLogs,
                      vdcMeetings,
                      cropDemoRecords,
                    };
                    const blob = new Blob([JSON.stringify(dataGroup, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `CRA_MasterBackup_${new Date().toISOString().slice(0, 10)}.json`;
                    link.click();
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition flex items-center gap-1"
                  title="Download full dataset backup"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Backup Data</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Inline Toast Banner */}
        {toast && (
          <div className="px-8 pt-4 bg-slate-50">
            <div
              className={`max-w-6xl mx-auto p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Workspace Wrapper */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto pb-12">
            {dataLoading &&
              activeTab !== 'security' &&
              activeTab !== 'projects' &&
              activeTab !== 'tempForms' && (
                <div className="mb-4 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <span>Loading authorized records...</span>
                </div>
              )}

            {activeTab === 'dashboard' && (
              <DashboardOverview
                beneficiaries={beneficiaries}
                activities={activities}
                trainings={trainings}
                nutritionLogs={nutritionLogs}
                convergences={convergences}
                sprinklers={sprinklers}
                ffsLogs={ffsLogs}
                vdcMeetings={vdcMeetings}
                onLoadSeedData={handleLoadSeedData}
                canSeedOrReset={permissions.canSeedOrReset}
                roleLabel={`${roleMeta.shortLabel} · ${villageScopeLabel}`}
              />
            )}

            {activeTab === 'projects' && permissions.canManageProjects && <ProjectManagement />}

            {activeTab === 'tempForms' && (
              <TempFormBuilder
                initialFormId={selectedTempFormId}
                initialMode={tempFormInitialMode}
                navigationKey={tempFormNavKey}
                onFormsChanged={loadSidebarTempForms}
              />
            )}

            {activeTab === 'security' && permissions.canViewUsers && <SecurityAccessPanel />}

            {activeTab === 'directory' && (
              <BeneficiaryMaster
                beneficiaries={beneficiaries}
                onAdd={(b) => handleCreateRecord('beneficiaries', b, setBeneficiaries)}
                onUpdate={(updated) =>
                  handleUpdateRecord('beneficiaries', updated, setBeneficiaries)
                }
                onDelete={(id) => handleDeleteRecord('beneficiaries', id, setBeneficiaries)}
                onExportCSV={() => handleExportCSV(beneficiaries, 'Beneficiary_Master_Directory')}
              />
            )}

            {activeTab === 'cra' && (
              <CRAActivities
                activities={activities}
                beneficiaries={beneficiaries}
                onAdd={(a) => handleCreateRecord('activities', a, setActivities)}
                onUpdate={(updated) => handleUpdateRecord('activities', updated, setActivities)}
                onDelete={(id) => handleDeleteRecord('activities', id, setActivities)}
                onExportCSV={() => handleExportCSV(activities, 'CRA_Activities_Form1')}
              />
            )}

            {activeTab === 'trainings' && (
              <TrainingsMeetings
                trainings={trainings}
                beneficiaries={beneficiaries}
                onAdd={(t) => handleCreateRecord('trainings', t, setTrainings)}
                onUpdate={(updated) => handleUpdateRecord('trainings', updated, setTrainings)}
                onDelete={(id) => handleDeleteRecord('trainings', id, setTrainings)}
                onExportCSV={() => handleExportCSV(trainings, 'Trainings_Meetings_Form2')}
              />
            )}

            {activeTab === 'nutrition' && (
              <HealthNutrition
                nutritionLogs={nutritionLogs}
                beneficiaries={beneficiaries}
                onAdd={(n) => handleCreateRecord('nutritionLogs', n, setNutritionLogs)}
                onUpdate={(updated) =>
                  handleUpdateRecord('nutritionLogs', updated, setNutritionLogs)
                }
                onDelete={(id) => handleDeleteRecord('nutritionLogs', id, setNutritionLogs)}
                onExportCSV={() => handleExportCSV(nutritionLogs, 'Health_Nutrition_Form3')}
              />
            )}

            {activeTab === 'convergence' && (
              <Convergence
                convergences={convergences}
                beneficiaries={beneficiaries}
                onAdd={(c) => handleCreateRecord('convergences', c, setConvergences)}
                onUpdate={(updated) => handleUpdateRecord('convergences', updated, setConvergences)}
                onDelete={(id) => handleDeleteRecord('convergences', id, setConvergences)}
                onExportCSV={() => handleExportCSV(convergences, 'Convergences_Form4')}
              />
            )}

            {activeTab === 'sprinkler' && (
              <SprinklerActivities
                sprinklers={sprinklers}
                beneficiaries={beneficiaries}
                onAdd={(s) => handleCreateRecord('sprinklers', s, setSprinklers)}
                onUpdate={(updated) => handleUpdateRecord('sprinklers', updated, setSprinklers)}
                onDelete={(id) => handleDeleteRecord('sprinklers', id, setSprinklers)}
                onExportCSV={() => handleExportCSV(sprinklers, 'Sprinkler_Interventions_Form5')}
              />
            )}

            {activeTab === 'ffs' && (
              <FarmerFieldSchool
                ffsLogs={ffsLogs}
                beneficiaries={beneficiaries}
                onAdd={(f) => handleCreateRecord('ffsLogs', f, setFfsLogs)}
                onUpdate={(updated) => handleUpdateRecord('ffsLogs', updated, setFfsLogs)}
                onDelete={(id) => handleDeleteRecord('ffsLogs', id, setFfsLogs)}
                onExportCSV={() => handleExportCSV(ffsLogs, 'Farmer_Field_School_Form6')}
              />
            )}

            {activeTab === 'vdc' && (
              <VDCMeeting
                vdcMeetings={vdcMeetings}
                beneficiaries={beneficiaries}
                onAdd={(v) => handleCreateRecord('vdcMeetings', v, setVdcMeetings)}
                onUpdate={(updated) => handleUpdateRecord('vdcMeetings', updated, setVdcMeetings)}
                onDelete={(id) => handleDeleteRecord('vdcMeetings', id, setVdcMeetings)}
                onExportCSV={() => handleExportCSV(vdcMeetings, 'VDC_Meeting_Minutes_Form7')}
              />
            )}

            {activeTab === 'cropDemo' && (
              <CropDemoRegister
                records={cropDemoRecords}
                beneficiaries={beneficiaries}
                onAdd={(r) => handleCreateRecord('cropDemoRecords', r, setCropDemoRecords)}
                onUpdate={(updated) =>
                  handleUpdateRecord('cropDemoRecords', updated, setCropDemoRecords)
                }
                onDelete={(id) => handleDeleteRecord('cropDemoRecords', id, setCropDemoRecords)}
                onExportCSV={(rows, filename) => handleExportCSV(rows, filename)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
