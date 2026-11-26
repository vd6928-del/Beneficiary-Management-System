/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { count, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { auditLogs, roleInvitations, users } from './schema.ts';
import { isValidSecurityRole, type SecurityRole } from '../lib/roles.ts';

export const APP_OWNER_EMAIL = (
  process.env.APP_OWNER_EMAIL || 'vd6928@gmail.com'
)
  .trim()
  .toLowerCase();

const INITIAL_ADMIN_EMAIL = APP_OWNER_EMAIL;

export function isAppOwnerUser(
  user: { email?: string | null; role?: SecurityRole | string | null; isActive?: boolean } | null | undefined
): boolean {
  if (!user || !user.email) return false;
  if (user.isActive === false) return false;
  return (
    user.role === 'admin' &&
    user.email.trim().toLowerCase() === APP_OWNER_EMAIL
  );
}

export interface DbUser {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  role: SecurityRole;
  stateName: string;
  districtName: string;
  assignedVillages: string[];
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

function serializeUser(row: typeof users.$inferSelect): DbUser {
  const safeRole: SecurityRole = isValidSecurityRole(row.role)
    ? row.role
    : 'field_worker';
  return {
    id: row.id,
    uid: row.uid,
    email: row.email,
    displayName: row.displayName,
    photoUrl: row.photoUrl,
    role: safeRole,
    stateName: row.stateName,
    districtName: row.districtName,
    assignedVillages: Array.isArray(row.assignedVillages) ? row.assignedVillages : [],
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getOrCreateUser(params: {
  uid: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
}): Promise<DbUser> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const displayName = (params.displayName || normalizedEmail.split('@')[0] || 'User').trim();
  const photoUrl = params.photoUrl || null;

  try {
    // Check if user already exists by UID
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, params.uid))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          email: normalizedEmail,
          displayName: existing[0].displayName || displayName,
          photoUrl: photoUrl ?? existing[0].photoUrl,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.uid, params.uid))
        .returning();

      return serializeUser(updated[0]);
    }

    // Determine initial role for first-time login:
    // 1) Pre-configured invitation takes precedence
    // 2) Initial owner email or very first user in DB becomes 'admin'
    // 3) Otherwise least-privilege 'field_worker'
    const invitations = await db
      .select()
      .from(roleInvitations)
      .where(eq(roleInvitations.email, normalizedEmail))
      .limit(1);

    let initialRole: SecurityRole = 'field_worker';
    let stateName = 'Madhya Pradesh';
    let districtName = 'Mandla';
    let assignedVillages: string[] = [];
    let resolvedDisplayName = displayName;

    if (invitations.length > 0) {
      const inv = invitations[0];
      initialRole = isValidSecurityRole(inv.role) ? inv.role : 'field_worker';
      stateName = inv.stateName || stateName;
      districtName = inv.districtName || districtName;
      assignedVillages = Array.isArray(inv.assignedVillages) ? inv.assignedVillages : [];
      if (inv.displayName) resolvedDisplayName = inv.displayName;
    } else if (normalizedEmail === INITIAL_ADMIN_EMAIL) {
      initialRole = 'admin';
    } else {
      const [{ total }] = await db.select({ total: count() }).from(users);
      if (total === 0) {
        initialRole = 'admin';
      }
    }

    const inserted = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: normalizedEmail,
        displayName: resolvedDisplayName,
        photoUrl,
        role: initialRole,
        stateName,
        districtName,
        assignedVillages,
        isActive: true,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: normalizedEmail,
          photoUrl,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (invitations.length > 0) {
      await db
        .delete(roleInvitations)
        .where(eq(roleInvitations.email, normalizedEmail));
    }

    return serializeUser(inserted[0]);
  } catch (error) {
    console.error('Failed to sync authenticated user:', error);
    throw new Error('Unable to verify user profile. Please try again.', { cause: error });
  }
}

export async function listAllUsers(): Promise<DbUser[]> {
  try {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    return rows.map(serializeUser);
  } catch (error) {
    console.error('Failed to list users:', error);
    throw new Error('Unable to load user directory.', { cause: error });
  }
}

export async function listRoleInvitations() {
  try {
    const rows = await db
      .select()
      .from(roleInvitations)
      .orderBy(desc(roleInvitations.createdAt));

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      role: (isValidSecurityRole(row.role) ? row.role : 'field_worker') as SecurityRole,
      stateName: row.stateName,
      districtName: row.districtName,
      assignedVillages: Array.isArray(row.assignedVillages) ? row.assignedVillages : [],
      invitedByUid: row.invitedByUid,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to list invitations:', error);
    throw new Error('Unable to load role invitations.', { cause: error });
  }
}

export async function inviteOrUpdateUserRole(params: {
  email: string;
  displayName: string;
  role: SecurityRole;
  stateName: string;
  districtName: string;
  assignedVillages: string[];
  invitedByUid: string;
}) {
  const normalizedEmail = params.email.trim().toLowerCase();
  try {
    // If user already signed in previously, update their user record directly
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      if (current.role === 'admin' && current.isActive && params.role !== 'admin') {
        const allUsers = await db.select().from(users);
        const otherActiveAdmins = allUsers.filter(
          (u) => u.id !== current.id && u.role === 'admin' && u.isActive
        );
        if (otherActiveAdmins.length === 0) {
          throw new Error('LAST_ADMIN_GUARD');
        }
      }

      const updated = await db
        .update(users)
        .set({
          displayName: params.displayName.trim() || current.displayName,
          role: params.role,
          stateName: params.stateName.trim() || 'Madhya Pradesh',
          districtName: params.districtName.trim() || 'Mandla',
          assignedVillages: params.assignedVillages,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, current.id))
        .returning();

      return { kind: 'user_updated' as const, user: serializeUser(updated[0]) };
    }

    // Otherwise upsert a pre-assigned role invitation
    const inserted = await db
      .insert(roleInvitations)
      .values({
        email: normalizedEmail,
        displayName: params.displayName.trim(),
        role: params.role,
        stateName: params.stateName.trim() || 'Madhya Pradesh',
        districtName: params.districtName.trim() || 'Mandla',
        assignedVillages: params.assignedVillages,
        invitedByUid: params.invitedByUid,
      })
      .onConflictDoUpdate({
        target: roleInvitations.email,
        set: {
          displayName: params.displayName.trim(),
          role: params.role,
          stateName: params.stateName.trim() || 'Madhya Pradesh',
          districtName: params.districtName.trim() || 'Mandla',
          assignedVillages: params.assignedVillages,
          invitedByUid: params.invitedByUid,
        },
      })
      .returning();

    const row = inserted[0];
    return {
      kind: 'invitation_saved' as const,
      invitation: {
        id: row.id,
        email: row.email,
        displayName: row.displayName,
        role: params.role,
        stateName: row.stateName,
        districtName: row.districtName,
        assignedVillages: Array.isArray(row.assignedVillages) ? row.assignedVillages : [],
        invitedByUid: row.invitedByUid,
        createdAt: row.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    if (error?.message === 'LAST_ADMIN_GUARD') {
      throw error;
    }
    console.error('Failed to invite or update user role:', error);
    throw new Error('Unable to save user security assignment.', { cause: error });
  }
}

export async function deleteRoleInvitationById(id: number): Promise<boolean> {
  try {
    const deleted = await db
      .delete(roleInvitations)
      .where(eq(roleInvitations.id, id))
      .returning();
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete role invitation:', error);
    throw new Error('Unable to revoke role invitation.', { cause: error });
  }
}

export async function updateUserSecurityProfile(
  targetUserId: number,
  updates: {
    role?: SecurityRole;
    stateName?: string;
    districtName?: string;
    assignedVillages?: string[];
    isActive?: boolean;
    displayName?: string;
  }
): Promise<DbUser | null> {
  try {
    const existingRows = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (existingRows.length === 0) {
      return null;
    }

    const current = existingRows[0];
    const nextRole = updates.role ?? (current.role as SecurityRole);
    const nextActive = updates.isActive ?? current.isActive;

    // Safeguard: never demote or deactivate the last active admin
    if (current.role === 'admin' && current.isActive && (nextRole !== 'admin' || !nextActive)) {
      const allUsers = await db.select().from(users);
      const otherActiveAdmins = allUsers.filter(
        (u) => u.id !== targetUserId && u.role === 'admin' && u.isActive
      );
      if (otherActiveAdmins.length === 0) {
        throw new Error('LAST_ADMIN_GUARD');
      }
    }

    const updated = await db
      .update(users)
      .set({
        role: nextRole,
        stateName: updates.stateName !== undefined ? updates.stateName.trim() : current.stateName,
        districtName:
          updates.districtName !== undefined ? updates.districtName.trim() : current.districtName,
        assignedVillages:
          updates.assignedVillages !== undefined
            ? updates.assignedVillages
            : current.assignedVillages,
        isActive: nextActive,
        displayName:
          updates.displayName !== undefined ? updates.displayName.trim() : current.displayName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetUserId))
      .returning();

    return serializeUser(updated[0]);
  } catch (error: any) {
    if (error?.message === 'LAST_ADMIN_GUARD') {
      throw error;
    }
    console.error('Failed to update user security profile:', error);
    throw new Error('Unable to update user security level.', { cause: error });
  }
}

export async function recordAuditLog(params: {
  actorUid: string;
  actorEmail: string;
  actorRole: SecurityRole;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  village?: string | null;
  summary: string;
}) {
  try {
    await db.insert(auditLogs).values({
      actorUid: params.actorUid,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      village: params.village ?? null,
      summary: params.summary,
    });
  } catch (error) {
    // Audit log failure should never crash the primary action
    console.error('Failed to write audit log:', error);
  }
}

export async function listAuditLogs(limitCount = 100) {
  try {
    const rows = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limitCount);

    return rows.map((row) => ({
      id: row.id,
      actorUid: row.actorUid,
      actorEmail: row.actorEmail,
      actorRole: (isValidSecurityRole(row.actorRole) ? row.actorRole : 'field_worker') as SecurityRole,
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      village: row.village,
      summary: row.summary,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to list audit logs:', error);
    throw new Error('Unable to load security audit logs.', { cause: error });
  }
}
