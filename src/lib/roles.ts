/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SecurityRole =
  | 'admin'
  | 'state_incharge'
  | 'project_manager'
  | 'field_worker';

export const SECURITY_ROLES: SecurityRole[] = [
  'admin',
  'state_incharge',
  'project_manager',
  'field_worker',
];

export interface RoleMetadata {
  role: SecurityRole;
  level: 1 | 2 | 3 | 4;
  label: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
  scopeSummary: string;
  permissions: RolePermissions;
}

export interface RolePermissions {
  canViewAllVillages: boolean;
  canCreateRecords: boolean;
  canEditAnyRecord: boolean;
  canEditOwnRecords: boolean;
  canDeleteRecords: boolean;
  canExportData: boolean;
  canBackupDatabase: boolean;
  canManageUsers: boolean;
  canViewUsers: boolean;
  canViewAuditLogs: boolean;
  canSeedOrReset: boolean;
  canManageProjects: boolean;
  canDesignTempForms: boolean;
}

export const ROLE_HIERARCHY: Record<SecurityRole, RoleMetadata> = {
  admin: {
    role: 'admin',
    level: 4,
    label: 'Admin',
    shortLabel: 'L4 · Admin',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description:
      'Full system administrator with complete control over users, security levels, projects, temporary forms, village datasets, backups, and audit logs.',
    scopeSummary: 'All States, Projects, Temp Forms & Security Control',
    permissions: {
      canViewAllVillages: true,
      canCreateRecords: true,
      canEditAnyRecord: true,
      canEditOwnRecords: true,
      canDeleteRecords: true,
      canExportData: true,
      canBackupDatabase: true,
      canManageUsers: true,
      canViewUsers: true,
      canViewAuditLogs: true,
      canSeedOrReset: true,
      canManageProjects: true,
      canDesignTempForms: true,
    },
  },
  state_incharge: {
    role: 'state_incharge',
    level: 3,
    label: 'State Incharge',
    shortLabel: 'L3 · State Incharge',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description:
      'State-level supervisory authority with state-wide project, team, and location management, reporting exports, and audit log monitoring.',
    scopeSummary: 'State-Wide Projects, Locations & Monitoring',
    permissions: {
      canViewAllVillages: true,
      canCreateRecords: true,
      canEditAnyRecord: true,
      canEditOwnRecords: true,
      canDeleteRecords: true,
      canExportData: true,
      canBackupDatabase: true,
      canManageUsers: false,
      canViewUsers: true,
      canViewAuditLogs: true,
      canSeedOrReset: false,
      canManageProjects: true,
      canDesignTempForms: false,
    },
  },
  project_manager: {
    role: 'project_manager',
    level: 2,
    label: 'Project Manager',
    shortLabel: 'L2 · Project Manager',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description:
      'Project & cluster manager able to create projects, manage Tehsil/Block/Cluster/Village hierarchies, assign teams, design temporary data collection forms, and export CSV reports.',
    scopeSummary: 'Projects, Locations, Team & Temp Form Designer',
    permissions: {
      canViewAllVillages: false,
      canCreateRecords: true,
      canEditAnyRecord: true,
      canEditOwnRecords: true,
      canDeleteRecords: true,
      canExportData: true,
      canBackupDatabase: false,
      canManageUsers: false,
      canViewUsers: false,
      canViewAuditLogs: false,
      canSeedOrReset: false,
      canManageProjects: true,
      canDesignTempForms: true,
    },
  },
  field_worker: {
    role: 'field_worker',
    level: 1,
    label: 'Field Worker',
    shortLabel: 'L1 · Field Worker',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description:
      'Ground-level enumerator authorized to register beneficiaries, submit standard & active temporary forms in assigned villages, and edit only their own submissions.',
    scopeSummary: 'Assigned Villages · Data Entry & Own Edits Only',
    permissions: {
      canViewAllVillages: false,
      canCreateRecords: true,
      canEditAnyRecord: false,
      canEditOwnRecords: true,
      canDeleteRecords: false,
      canExportData: false,
      canBackupDatabase: false,
      canManageUsers: false,
      canViewUsers: false,
      canViewAuditLogs: false,
      canSeedOrReset: false,
      canManageProjects: false,
      canDesignTempForms: false,
    },
  },
};

export function isValidSecurityRole(value: unknown): value is SecurityRole {
  return (
    typeof value === 'string' &&
    SECURITY_ROLES.includes(value as SecurityRole)
  );
}

export function getRoleMetadata(role: SecurityRole): RoleMetadata {
  return ROLE_HIERARCHY[role] || ROLE_HIERARCHY.field_worker;
}

export function canAccessVillage(
  role: SecurityRole,
  assignedVillages: string[],
  village: string
): boolean {
  const perms = getRoleMetadata(role).permissions;
  if (perms.canViewAllVillages) return true;
  if (!assignedVillages || assignedVillages.length === 0) return true;
  return assignedVillages.includes(village);
}

export function canModifyRecord(
  role: SecurityRole,
  userUid: string,
  assignedVillages: string[],
  recordVillage: string,
  recordCreatedByUid?: string | null
): boolean {
  if (!canAccessVillage(role, assignedVillages, recordVillage)) {
    return false;
  }
  const perms = getRoleMetadata(role).permissions;
  if (perms.canEditAnyRecord) return true;
  if (perms.canEditOwnRecords && recordCreatedByUid && recordCreatedByUid === userUid) {
    return true;
  }
  return false;
}
