/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  requireAppOwner,
  requireAuth,
  requireRole,
  type AuthRequest,
} from './src/middleware/auth.ts';
import {
  canAccessVillage,
  canModifyRecord,
  getRoleMetadata,
  isValidSecurityRole,
} from './src/lib/roles.ts';
import {
  deleteRoleInvitationById,
  inviteOrUpdateUserRole,
  isAppOwnerUser,
  listAllUsers,
  listAuditLogs,
  listRoleInvitations,
  recordAuditLog,
  updateUserSecurityProfile,
} from './src/db/users.ts';
import {
  createModuleRecord,
  deleteModuleRecord,
  getAllModuleDataForUser,
  getRecordMetaById,
  isValidModuleKey,
  seedAllModuleData,
  updateModuleRecord,
} from './src/db/records.ts';
import {
  addProjectLocationRecord,
  addProjectTeamMemberRecord,
  createProjectRecord,
  deleteProjectLocationRecord,
  deleteProjectRecord,
  deleteProjectTeamMemberRecord,
  listProjectsBundle,
  updateProjectRecord,
  updateProjectTeamMemberRecord,
} from './src/db/projects.ts';
import {
  bulkCreateCustomFormSubmissionRecords,
  createCustomFormRecord,
  createCustomFormSubmissionRecord,
  deleteCustomFormRecord,
  deleteCustomFormSubmissionRecord,
  getCustomFormById,
  listCustomFormsWithCounts,
  listCustomFormSubmissions,
  sanitizeFormFields,
  updateCustomFormRecord,
} from './src/db/customForms.ts';
import { VILLAGES } from './src/types.ts';
import { ROLE_HIERARCHY, type SecurityRole } from './src/lib/roles.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

function sanitizeVillages(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const validSet = new Set<string>(VILLAGES);
  return Array.from(
    new Set(
      input.filter((v): v is string => typeof v === 'string' && validSet.has(v))
    )
  );
}

// --- PUBLIC HEALTH CHECK ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// --- AUTHENTICATED USER PROFILE & PERMISSIONS ---
app.get('/api/me', requireAuth, (req: AuthRequest, res) => {
  const user = req.dbUser!;
  const roleMeta = getRoleMetadata(user.role);
  res.json({
    user,
    roleMeta,
    permissions: roleMeta.permissions,
    isAppOwner: isAppOwnerUser(user),
  });
});

// --- SCOPED MASTER DATA RETRIEVAL ---
app.get('/api/data', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getAllModuleDataForUser(req.dbUser!);
    res.json(data);
  } catch (error: any) {
    console.error('GET /api/data error:', error);
    res.status(500).json({ error: error?.message || 'Failed to load data' });
  }
});

// --- GRANULAR RBAC-PROTECTED MODULE CRUD ---
app.post('/api/records/:module', requireAuth, async (req: AuthRequest, res) => {
  const { module } = req.params;
  if (!isValidModuleKey(module)) {
    return res.status(400).json({ error: 'Invalid module identifier.' });
  }

  const user = req.dbUser!;
  const perms = getRoleMetadata(user.role).permissions;
  if (!perms.canCreateRecords) {
    return res.status(403).json({ error: 'Your role cannot create records.' });
  }

  const body = req.body as Record<string, unknown>;
  const village = typeof body?.village === 'string' ? body.village.trim() : '';
  if (!village || !VILLAGES.includes(village as any)) {
    return res.status(400).json({ error: 'A valid village must be selected.' });
  }

  if (!canAccessVillage(user.role, user.assignedVillages, village)) {
    return res.status(403).json({
      error: `Access denied. Your account is not authorized to submit records for ${village}.`,
    });
  }

  try {
    const created = await createModuleRecord(module, body, user);
    await recordAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'CREATE',
      resourceType: module,
      resourceId: String((created as any).id || ''),
      village,
      summary: `Created ${module} entry in ${village}`,
    });
    res.status(201).json(created);
  } catch (error: any) {
    console.error(`POST /api/records/${module} error:`, error);
    const status = error?.message?.includes('already exists') ? 409 : 500;
    res.status(status).json({ error: error?.message || 'Failed to create record.' });
  }
});

app.put('/api/records/:module/:id', requireAuth, async (req: AuthRequest, res) => {
  const { module, id } = req.params;
  if (!isValidModuleKey(module) || !id) {
    return res.status(400).json({ error: 'Invalid module or record ID.' });
  }

  const user = req.dbUser!;
  const body = req.body as Record<string, unknown>;
  const targetVillage = typeof body?.village === 'string' ? body.village.trim() : '';

  try {
    const existing = await getRecordMetaById(module, id);
    if (!existing) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    if (
      !canModifyRecord(
        user.role,
        user.uid,
        user.assignedVillages,
        existing.village,
        existing.createdByUid
      )
    ) {
      return res.status(403).json({
        error:
          user.role === 'field_worker'
            ? 'Field Workers can only edit records they personally submitted.'
            : 'Access denied. You cannot modify records outside your assigned villages.',
      });
    }

    if (
      targetVillage &&
      (!VILLAGES.includes(targetVillage as any) ||
        !canAccessVillage(user.role, user.assignedVillages, targetVillage))
    ) {
      return res.status(403).json({
        error: `You are not authorized to move this record to ${targetVillage}.`,
      });
    }

    const updated = await updateModuleRecord(module, id, body);
    if (!updated) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    await recordAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'UPDATE',
      resourceType: module,
      resourceId: id,
      village: targetVillage || existing.village,
      summary: `Updated ${module} entry (${id}) in ${targetVillage || existing.village}`,
    });

    res.json(updated);
  } catch (error: any) {
    console.error(`PUT /api/records/${module}/${id} error:`, error);
    const status = error?.message?.includes('already exists') ? 409 : 500;
    res.status(status).json({ error: error?.message || 'Failed to update record.' });
  }
});

app.delete('/api/records/:module/:id', requireAuth, async (req: AuthRequest, res) => {
  const { module, id } = req.params;
  if (!isValidModuleKey(module) || !id) {
    return res.status(400).json({ error: 'Invalid module or record ID.' });
  }

  const user = req.dbUser!;
  const perms = getRoleMetadata(user.role).permissions;
  if (!perms.canDeleteRecords) {
    return res.status(403).json({
      error: 'Access denied. Field Workers do not have permission to delete records.',
    });
  }

  try {
    const existing = await getRecordMetaById(module, id);
    if (!existing) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    if (!canAccessVillage(user.role, user.assignedVillages, existing.village)) {
      return res.status(403).json({
        error: 'Access denied. You cannot delete records outside your assigned villages.',
      });
    }

    const deleted = await deleteModuleRecord(module, id);
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    await recordAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'DELETE',
      resourceType: module,
      resourceId: id,
      village: existing.village,
      summary: `Deleted ${module} entry (${id}) from ${existing.village}`,
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error(`DELETE /api/records/${module}/${id} error:`, error);
    res.status(500).json({ error: error?.message || 'Failed to delete record.' });
  }
});

// --- ADMIN DATA LIFECYCLE (SEED & RESET) ---
app.post('/api/admin/seed', requireAuth, requireRole(['admin']), async (req: AuthRequest, res) => {
  const user = req.dbUser!;
  try {
    await seedAllModuleData(req.body || {}, user);
    await recordAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'SEED_DATA',
      resourceType: 'system',
      summary: 'Populated demo dataset across all modules',
    });
    const refreshed = await getAllModuleDataForUser(user);
    res.json({ success: true, data: refreshed });
  } catch (error: any) {
    console.error('POST /api/admin/seed error:', error);
    const statusCode = error?.message?.includes('when the catalog is empty') ? 409 : 500;
    res.status(statusCode).json({ error: error?.message || 'Failed to populate demo data.' });
  }
});

// --- SECURITY & ROLE MANAGEMENT ENDPOINTS ---
app.get(
  '/api/admin/users',
  requireAuth,
  requireRole(['admin', 'state_incharge']),
  async (_req: AuthRequest, res) => {
    try {
      const [userList, invitations] = await Promise.all([
        listAllUsers(),
        listRoleInvitations(),
      ]);
      res.json({ users: userList, invitations });
    } catch (error: any) {
      console.error('GET /api/admin/users error:', error);
      res.status(500).json({ error: error?.message || 'Failed to load team directory.' });
    }
  }
);

app.post(
  '/api/admin/users/invite',
  requireAuth,
  requireRole(['admin']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const { email, displayName, role, stateName, districtName, assignedVillages } = req.body || {};

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!isValidSecurityRole(role)) {
      return res.status(400).json({ error: 'Please select a valid security level.' });
    }

    const cleanVillages =
      role === 'admin' || role === 'state_incharge' ? [] : sanitizeVillages(assignedVillages);

    try {
      const result = await inviteOrUpdateUserRole({
        email: email.trim().toLowerCase(),
        displayName: typeof displayName === 'string' ? displayName : '',
        role,
        stateName: typeof stateName === 'string' ? stateName : 'Madhya Pradesh',
        districtName: typeof districtName === 'string' ? districtName : 'Mandla',
        assignedVillages: cleanVillages,
        invitedByUid: user.uid,
      });

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'INVITE_USER',
        resourceType: 'user_security',
        resourceId: email.trim().toLowerCase(),
        summary: `Assigned ${getRoleMetadata(role).label} access to ${email.trim().toLowerCase()}`,
      });

      res.status(201).json(result);
    } catch (error: any) {
      if (error?.message === 'LAST_ADMIN_GUARD') {
        return res.status(400).json({
          error: 'At least one active Admin must remain in the system.',
        });
      }
      console.error('POST /api/admin/users/invite error:', error);
      res.status(500).json({ error: error?.message || 'Failed to save role assignment.' });
    }
  }
);

app.delete(
  '/api/admin/users/invite/:id',
  requireAuth,
  requireRole(['admin']),
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid invitation ID.' });
    }

    try {
      const deleted = await deleteRoleInvitationById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Invitation not found.' });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('DELETE /api/admin/users/invite/:id error:', error);
      res.status(500).json({ error: error?.message || 'Failed to remove invitation.' });
    }
  }
);

app.patch(
  '/api/admin/users/:id',
  requireAuth,
  requireRole(['admin']),
  async (req: AuthRequest, res) => {
    const actor = req.dbUser!;
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const { role, stateName, districtName, assignedVillages, isActive, displayName } =
      req.body || {};

    if (role !== undefined && !isValidSecurityRole(role)) {
      return res.status(400).json({ error: 'Invalid security level specified.' });
    }

    const cleanVillages =
      assignedVillages !== undefined
        ? role === 'admin' || role === 'state_incharge'
          ? []
          : sanitizeVillages(assignedVillages)
        : undefined;

    try {
      const updated = await updateUserSecurityProfile(targetId, {
        role,
        stateName: typeof stateName === 'string' ? stateName : undefined,
        districtName: typeof districtName === 'string' ? districtName : undefined,
        assignedVillages: cleanVillages,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        displayName: typeof displayName === 'string' ? displayName : undefined,
      });

      if (!updated) {
        return res.status(404).json({ error: 'User not found.' });
      }

      await recordAuditLog({
        actorUid: actor.uid,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: 'ROLE_CHANGE',
        resourceType: 'user_security',
        resourceId: String(updated.id),
        summary: `Updated ${updated.email} → ${getRoleMetadata(updated.role).label} (${
          updated.isActive ? 'Active' : 'Suspended'
        })`,
      });

      res.json(updated);
    } catch (error: any) {
      if (error?.message === 'LAST_ADMIN_GUARD') {
        return res.status(400).json({
          error: 'At least one active Admin must remain in the system.',
        });
      }
      console.error('PATCH /api/admin/users/:id error:', error);
      res.status(500).json({ error: error?.message || 'Failed to update user security profile.' });
    }
  }
);

app.get(
  '/api/admin/audit-logs',
  requireAuth,
  requireRole(['admin', 'state_incharge']),
  async (_req: AuthRequest, res) => {
    try {
      const logs = await listAuditLogs(100);
      res.json(logs);
    } catch (error: any) {
      console.error('GET /api/admin/audit-logs error:', error);
      res.status(500).json({ error: error?.message || 'Failed to load audit logs.' });
    }
  }
);

// --- PROJECT, TEAM & LOCATION HIERARCHY ROUTES (Admin, State Incharge, Project Manager) ---
function canAssignProjectRole(actorRole: SecurityRole, targetRole: SecurityRole): boolean {
  return ROLE_HIERARCHY[actorRole].level >= ROLE_HIERARCHY[targetRole].level;
}

app.get('/api/projects', requireAuth, async (req: AuthRequest, res) => {
  const user = req.dbUser!;
  const includeTeam = getRoleMetadata(user.role).permissions.canManageProjects;
  try {
    const bundle = await listProjectsBundle(includeTeam);
    res.json(bundle);
  } catch (error: any) {
    console.error('GET /api/projects error:', error);
    res.status(500).json({ error: error?.message || 'Failed to load projects.' });
  }
});

app.get(
  '/api/projects/staff-suggestions',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (_req: AuthRequest, res) => {
    try {
      const all = await listAllUsers();
      res.json(
        all
          .filter((u) => u.isActive)
          .map((u) => ({
            displayName: u.displayName,
            email: u.email,
            role: u.role,
          }))
      );
    } catch (error: any) {
      console.error('GET /api/projects/staff-suggestions error:', error);
      res.status(500).json({ error: 'Failed to load staff list.' });
    }
  }
);

app.post(
  '/api/projects',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const { name, code, stateName, districtName, description, status } = req.body || {};

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required.' });
    }
    const cleanCode =
      typeof code === 'string' && code.trim()
        ? code.trim().toUpperCase()
        : `PRJ-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const safeStatus =
      status === 'Completed' || status === 'On Hold' ? status : 'Active';

    try {
      const created = await createProjectRecord({
        name: name.trim(),
        code: cleanCode,
        stateName: typeof stateName === 'string' ? stateName : user.stateName,
        districtName: typeof districtName === 'string' ? districtName : user.districtName,
        description: typeof description === 'string' ? description : '',
        status: safeStatus,
        createdByUid: user.uid,
        createdByEmail: user.email,
      });

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'CREATE_PROJECT',
        resourceType: 'project',
        resourceId: String(created.id),
        summary: `Created project "${created.name}" (${created.code})`,
      });

      res.status(201).json(created);
    } catch (error: any) {
      const statusCode = error?.message?.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({ error: error?.message || 'Failed to create project.' });
    }
  }
);

app.patch(
  '/api/projects/:id',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    const { name, code, stateName, districtName, description, status } = req.body || {};
    const safeStatus =
      status === 'Active' || status === 'Completed' || status === 'On Hold'
        ? status
        : undefined;

    try {
      const updated = await updateProjectRecord(projectId, {
        name: typeof name === 'string' && name.trim() ? name : undefined,
        code: typeof code === 'string' && code.trim() ? code : undefined,
        stateName: typeof stateName === 'string' ? stateName : undefined,
        districtName: typeof districtName === 'string' ? districtName : undefined,
        description: typeof description === 'string' ? description : undefined,
        status: safeStatus,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'UPDATE_PROJECT',
        resourceType: 'project',
        resourceId: String(updated.id),
        summary: `Updated project "${updated.name}" (${updated.code})`,
      });

      res.json(updated);
    } catch (error: any) {
      const statusCode = error?.message?.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({ error: error?.message || 'Failed to update project.' });
    }
  }
);

app.delete(
  '/api/projects/:id',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    try {
      const deleted = await deleteProjectRecord(projectId);
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'DELETE_PROJECT',
        resourceType: 'project',
        resourceId: String(projectId),
        summary: `Deleted project #${projectId}`,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete project.' });
    }
  }
);

app.post(
  '/api/projects/:id/locations',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    const { tehsil, block, cluster, village, gramPanchayat } = req.body || {};
    if (
      typeof tehsil !== 'string' ||
      !tehsil.trim() ||
      typeof block !== 'string' ||
      !block.trim() ||
      typeof cluster !== 'string' ||
      !cluster.trim() ||
      typeof village !== 'string' ||
      !village.trim()
    ) {
      return res.status(400).json({
        error: 'Tehsil, Block, Cluster, and Village are all required.',
      });
    }

    try {
      const created = await addProjectLocationRecord({
        projectId,
        tehsil,
        block,
        cluster,
        village,
        gramPanchayat: typeof gramPanchayat === 'string' ? gramPanchayat : '',
        createdByUid: user.uid,
      });

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'ADD_PROJECT_LOCATION',
        resourceType: 'project_location',
        resourceId: String(created.id),
        village: created.village,
        summary: `Added ${created.tehsil} → ${created.block} → ${created.cluster} → ${created.village} to project #${projectId}`,
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to add location.' });
    }
  }
);

app.delete(
  '/api/projects/locations/:locationId',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const locationId = Number(req.params.locationId);
    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({ error: 'Invalid location ID.' });
    }

    try {
      const deleted = await deleteProjectLocationRecord(locationId);
      if (!deleted) {
        return res.status(404).json({ error: 'Location entry not found.' });
      }
      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'DELETE_PROJECT_LOCATION',
        resourceType: 'project_location',
        resourceId: String(locationId),
        summary: `Removed project location #${locationId}`,
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete location.' });
    }
  }
);

app.post(
  '/api/projects/:id/team',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    const {
      memberName,
      memberEmail,
      role,
      assignedTehsil,
      assignedBlock,
      assignedCluster,
      assignedVillage,
    } = req.body || {};

    if (typeof memberName !== 'string' || !memberName.trim()) {
      return res.status(400).json({ error: 'Team member name is required.' });
    }
    if (
      typeof memberEmail !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail.trim())
    ) {
      return res.status(400).json({ error: 'A valid team member email is required.' });
    }
    if (!isValidSecurityRole(role)) {
      return res.status(400).json({ error: 'Please select a valid role.' });
    }
    if (!canAssignProjectRole(user.role, role)) {
      return res.status(403).json({
        error: `Your security level (${getRoleMetadata(user.role).label}) cannot assign the ${getRoleMetadata(role).label} role.`,
      });
    }

    try {
      const created = await addProjectTeamMemberRecord({
        projectId,
        memberName,
        memberEmail,
        role,
        assignedTehsil: typeof assignedTehsil === 'string' ? assignedTehsil : '',
        assignedBlock: typeof assignedBlock === 'string' ? assignedBlock : '',
        assignedCluster: typeof assignedCluster === 'string' ? assignedCluster : '',
        assignedVillage: typeof assignedVillage === 'string' ? assignedVillage : '',
        assignedByUid: user.uid,
      });

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'ASSIGN_PROJECT_TEAM',
        resourceType: 'project_team',
        resourceId: String(created.id),
        village: created.assignedVillage || null,
        summary: `Assigned ${created.memberName} (${getRoleMetadata(role).label}) to project #${projectId}`,
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to assign team member.' });
    }
  }
);

app.patch(
  '/api/projects/team/:memberId',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const memberId = Number(req.params.memberId);
    if (!Number.isInteger(memberId) || memberId <= 0) {
      return res.status(400).json({ error: 'Invalid team assignment ID.' });
    }

    const { role, assignedTehsil, assignedBlock, assignedCluster, assignedVillage } =
      req.body || {};

    if (role !== undefined) {
      if (!isValidSecurityRole(role)) {
        return res.status(400).json({ error: 'Invalid role selected.' });
      }
      if (!canAssignProjectRole(user.role, role)) {
        return res.status(403).json({
          error: `Your security level cannot assign the ${getRoleMetadata(role).label} role.`,
        });
      }
    }

    try {
      const updated = await updateProjectTeamMemberRecord(memberId, {
        role,
        assignedTehsil: typeof assignedTehsil === 'string' ? assignedTehsil : undefined,
        assignedBlock: typeof assignedBlock === 'string' ? assignedBlock : undefined,
        assignedCluster: typeof assignedCluster === 'string' ? assignedCluster : undefined,
        assignedVillage: typeof assignedVillage === 'string' ? assignedVillage : undefined,
      });
      if (!updated) {
        return res.status(404).json({ error: 'Team assignment not found.' });
      }

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'UPDATE_PROJECT_TEAM',
        resourceType: 'project_team',
        resourceId: String(updated.id),
        summary: `Updated team assignment for ${updated.memberEmail} → ${getRoleMetadata(updated.role).label}`,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to update team member.' });
    }
  }
);

app.delete(
  '/api/projects/team/:memberId',
  requireAuth,
  requireRole(['admin', 'state_incharge', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const memberId = Number(req.params.memberId);
    if (!Number.isInteger(memberId) || memberId <= 0) {
      return res.status(400).json({ error: 'Invalid team assignment ID.' });
    }

    try {
      const deleted = await deleteProjectTeamMemberRecord(memberId);
      if (!deleted) {
        return res.status(404).json({ error: 'Team assignment not found.' });
      }
      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'REMOVE_PROJECT_TEAM',
        resourceType: 'project_team',
        resourceId: String(memberId),
        summary: `Removed project team member #${memberId}`,
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to remove team member.' });
    }
  }
);

// --- TEMPORARY DATA COLLECTION FORM DESIGNER & SUBMISSIONS (Designer: Admin & Project Manager ONLY) ---
app.get('/api/custom-forms', requireAuth, async (req: AuthRequest, res) => {
  const user = req.dbUser!;
  const includeInactive =
    user.role === 'admin' || user.role === 'project_manager' || user.role === 'state_incharge';
  try {
    const forms = await listCustomFormsWithCounts(includeInactive);
    res.json(forms);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load temporary forms.' });
  }
});

app.post(
  '/api/custom-forms',
  requireAuth,
  requireRole(['admin', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const { title, description, projectId, fields, isActive, expiresAt } = req.body || {};

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Form title is required.' });
    }
    const cleanFields = sanitizeFormFields(fields);
    if (cleanFields.length === 0) {
      return res.status(400).json({ error: 'Add at least one field to the temporary form.' });
    }

    const parsedProjectId =
      projectId !== undefined && projectId !== null && projectId !== ''
        ? Number(projectId)
        : null;
    if (parsedProjectId !== null && (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0)) {
      return res.status(400).json({ error: 'Invalid project selected.' });
    }

    try {
      const created = await createCustomFormRecord({
        projectId: parsedProjectId,
        title,
        description: typeof description === 'string' ? description : '',
        fields: cleanFields,
        isActive: isActive !== false,
        expiresAt: typeof expiresAt === 'string' && expiresAt.trim() ? expiresAt : null,
        createdByUid: user.uid,
        createdByEmail: user.email,
        createdByRole: user.role,
      });

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'CREATE_TEMP_FORM',
        resourceType: 'custom_form',
        resourceId: String(created.id),
        summary: `Designed temporary form "${created.title}" (${cleanFields.length} fields)`,
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to create temporary form.' });
    }
  }
);

app.patch(
  '/api/custom-forms/:id',
  requireAuth,
  requireRole(['admin', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const formId = Number(req.params.id);
    if (!Number.isInteger(formId) || formId <= 0) {
      return res.status(400).json({ error: 'Invalid form ID.' });
    }

    const { title, description, projectId, fields, isActive, expiresAt } = req.body || {};
    const cleanFields = fields !== undefined ? sanitizeFormFields(fields) : undefined;
    if (cleanFields !== undefined && cleanFields.length === 0) {
      return res.status(400).json({ error: 'Form must have at least one field.' });
    }

    let parsedProjectId: number | null | undefined = undefined;
    if (projectId !== undefined) {
      if (projectId === null || projectId === '') {
        parsedProjectId = null;
      } else {
        const num = Number(projectId);
        if (!Number.isInteger(num) || num <= 0) {
          return res.status(400).json({ error: 'Invalid project selected.' });
        }
        parsedProjectId = num;
      }
    }

    try {
      const updated = await updateCustomFormRecord(formId, {
        projectId: parsedProjectId,
        title: typeof title === 'string' && title.trim() ? title : undefined,
        description: typeof description === 'string' ? description : undefined,
        fields: cleanFields,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        expiresAt:
          expiresAt !== undefined
            ? typeof expiresAt === 'string' && expiresAt.trim()
              ? expiresAt
              : null
            : undefined,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Temporary form not found.' });
      }

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'UPDATE_TEMP_FORM',
        resourceType: 'custom_form',
        resourceId: String(updated.id),
        summary: `Updated temporary form "${updated.title}" (${updated.isActive ? 'Active' : 'Closed'})`,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to update temporary form.' });
    }
  }
);

app.delete(
  '/api/custom-forms/:id',
  requireAuth,
  requireRole(['admin', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const formId = Number(req.params.id);
    if (!Number.isInteger(formId) || formId <= 0) {
      return res.status(400).json({ error: 'Invalid form ID.' });
    }

    try {
      const deleted = await deleteCustomFormRecord(formId);
      if (!deleted) {
        return res.status(404).json({ error: 'Temporary form not found.' });
      }
      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'DELETE_TEMP_FORM',
        resourceType: 'custom_form',
        resourceId: String(formId),
        summary: `Deleted temporary form #${formId}`,
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete temporary form.' });
    }
  }
);

app.get('/api/custom-forms/:id/submissions', requireAuth, async (req: AuthRequest, res) => {
  const user = req.dbUser!;
  const formId = Number(req.params.id);
  if (!Number.isInteger(formId) || formId <= 0) {
    return res.status(400).json({ error: 'Invalid form ID.' });
  }

  try {
    const onlyOwnUid = user.role === 'field_worker' ? user.uid : undefined;
    const submissions = await listCustomFormSubmissions(formId, onlyOwnUid);
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load form submissions.' });
  }
});

app.post('/api/custom-forms/:id/submissions', requireAuth, async (req: AuthRequest, res) => {
  const user = req.dbUser!;
  const formId = Number(req.params.id);
  if (!Number.isInteger(formId) || formId <= 0) {
    return res.status(400).json({ error: 'Invalid form ID.' });
  }

  try {
    const form = await getCustomFormById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Temporary form not found.' });
    }
    if (!form.isActive) {
      return res.status(403).json({ error: 'This temporary form is currently closed.' });
    }
    if (form.expiresAt) {
      const today = new Date().toISOString().slice(0, 10);
      if (form.expiresAt < today) {
        return res.status(403).json({ error: 'This temporary form has expired.' });
      }
    }

    const rawResponses =
      req.body?.responses && typeof req.body.responses === 'object'
        ? (req.body.responses as Record<string, unknown>)
        : {};
    const village = typeof req.body?.village === 'string' ? req.body.village.trim() : '';

    const sanitizedResponses: Record<string, string | number | boolean> = {};
    for (const field of form.fields) {
      const rawVal = rawResponses[field.id];
      if (field.type === 'checkbox') {
        const boolVal = Boolean(rawVal);
        if (field.required && !boolVal) {
          return res.status(400).json({ error: `"${field.label}" is required.` });
        }
        sanitizedResponses[field.id] = boolVal;
      } else if (field.type === 'number') {
        const isEmpty = rawVal === undefined || rawVal === null || rawVal === '';
        if (field.required && isEmpty) {
          return res.status(400).json({ error: `"${field.label}" is required.` });
        }
        if (!isEmpty) {
          const num = Number(rawVal);
          if (!Number.isFinite(num)) {
            return res.status(400).json({ error: `"${field.label}" must be a valid number.` });
          }
          sanitizedResponses[field.id] = num;
        } else {
          sanitizedResponses[field.id] = '';
        }
      } else {
        const strVal = typeof rawVal === 'string' ? rawVal.trim() : rawVal != null ? String(rawVal) : '';
        if (field.required && !strVal) {
          return res.status(400).json({ error: `"${field.label}" is required.` });
        }
        sanitizedResponses[field.id] = strVal;
      }
    }

    const created = await createCustomFormSubmissionRecord({
      formId: form.id,
      projectId: form.projectId,
      village,
      responses: sanitizedResponses,
      submittedByUid: user.uid,
      submittedByEmail: user.email,
      submittedByRole: user.role,
    });

    await recordAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'SUBMIT_TEMP_FORM',
      resourceType: 'custom_form_submission',
      resourceId: String(created.id),
      village: village || null,
      summary: `Submitted response to temporary form "${form.title}"`,
    });

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to submit form response.' });
  }
});

// App Owner Only: Bulk import Excel/CSV rows into a temporary form
app.post(
  '/api/custom-forms/:id/bulk-import',
  requireAuth,
  requireAppOwner,
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const formId = Number(req.params.id);
    if (!Number.isInteger(formId) || formId <= 0) {
      return res.status(400).json({ error: 'Invalid form ID.' });
    }

    const rawRows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (rawRows.length === 0) {
      return res.status(400).json({ error: 'No rows provided for import.' });
    }
    if (rawRows.length > 500) {
      return res.status(400).json({
        error: 'A maximum of 500 rows can be imported per upload.',
      });
    }

    try {
      const form = await getCustomFormById(formId);
      if (!form) {
        return res.status(404).json({ error: 'Temporary form not found.' });
      }

      const sanitizedBatch: Array<{
        village: string;
        responses: Record<string, string | number | boolean>;
      }> = [];

      for (const rawRow of rawRows) {
        if (!rawRow || typeof rawRow !== 'object') continue;
        const rowObj = rawRow as Record<string, unknown>;
        const village =
          typeof rowObj.village === 'string' ? rowObj.village.trim().slice(0, 120) : '';
        const rawResponses =
          rowObj.responses && typeof rowObj.responses === 'object'
            ? (rowObj.responses as Record<string, unknown>)
            : {};

        const sanitizedResponses: Record<string, string | number | boolean> = {};
        let hasAnyValue = Boolean(village);

        for (const field of form.fields) {
          const val = rawResponses[field.id];
          if (field.type === 'checkbox') {
            const lower = String(val ?? '').trim().toLowerCase();
            const boolVal =
              typeof val === 'boolean'
                ? val
                : ['yes', 'true', '1', 'y', 'haan', 'ha'].includes(lower);
            sanitizedResponses[field.id] = boolVal;
            if (val !== undefined && val !== null && val !== '') hasAnyValue = true;
          } else if (field.type === 'number') {
            if (val === undefined || val === null || String(val).trim() === '') {
              sanitizedResponses[field.id] = '';
            } else {
              const num = Number(String(val).replace(/,/g, '').trim());
              if (Number.isFinite(num)) {
                sanitizedResponses[field.id] = num;
                hasAnyValue = true;
              } else {
                sanitizedResponses[field.id] = '';
              }
            }
          } else {
            const strVal =
              val !== undefined && val !== null ? String(val).trim().slice(0, 2000) : '';
            sanitizedResponses[field.id] = strVal;
            if (strVal) hasAnyValue = true;
          }
        }

        if (hasAnyValue) {
          sanitizedBatch.push({ village, responses: sanitizedResponses });
        }
      }

      const importedCount = await bulkCreateCustomFormSubmissionRecords({
        formId: form.id,
        projectId: form.projectId,
        rows: sanitizedBatch,
        submittedByUid: user.uid,
        submittedByEmail: user.email,
        submittedByRole: user.role,
      });

      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'BULK_IMPORT_TEMP_FORM',
        resourceType: 'custom_form_submission',
        resourceId: String(form.id),
        summary: `Owner imported ${importedCount} rows from Excel/CSV into "${form.title}"`,
      });

      res.status(201).json({ importedCount });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to bulk import rows.' });
    }
  }
);

app.delete(
  '/api/custom-forms/submissions/:submissionId',
  requireAuth,
  requireRole(['admin', 'project_manager']),
  async (req: AuthRequest, res) => {
    const user = req.dbUser!;
    const submissionId = Number(req.params.submissionId);
    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      return res.status(400).json({ error: 'Invalid submission ID.' });
    }

    try {
      const deleted = await deleteCustomFormSubmissionRecord(submissionId);
      if (!deleted) {
        return res.status(404).json({ error: 'Submission not found.' });
      }
      await recordAuditLog({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'DELETE_TEMP_SUBMISSION',
        resourceType: 'custom_form_submission',
        resourceId: String(submissionId),
        summary: `Deleted temporary form submission #${submissionId}`,
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete submission.' });
    }
  }
);

// --- VITE MIDDLEWARE AND STATIC SERVING ---
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Server bootstrapping failed:', err);
});
