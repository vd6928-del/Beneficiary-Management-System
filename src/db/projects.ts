/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  projectLocations,
  projects,
  projectTeamMembers,
} from './schema.ts';
import { isValidSecurityRole, type SecurityRole } from '../lib/roles.ts';

function serializeProject(row: typeof projects.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    stateName: row.stateName,
    districtName: row.districtName,
    description: row.description,
    status: row.status as 'Active' | 'Completed' | 'On Hold',
    createdByUid: row.createdByUid,
    createdByEmail: row.createdByEmail,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeLocation(row: typeof projectLocations.$inferSelect) {
  return {
    id: row.id,
    projectId: row.projectId,
    tehsil: row.tehsil,
    block: row.block,
    cluster: row.cluster,
    village: row.village,
    gramPanchayat: row.gramPanchayat,
    createdByUid: row.createdByUid,
    createdAt: row.createdAt.toISOString(),
  };
}

function serializeTeamMember(row: typeof projectTeamMembers.$inferSelect) {
  return {
    id: row.id,
    projectId: row.projectId,
    memberName: row.memberName,
    memberEmail: row.memberEmail,
    role: (isValidSecurityRole(row.role) ? row.role : 'field_worker') as SecurityRole,
    assignedTehsil: row.assignedTehsil,
    assignedBlock: row.assignedBlock,
    assignedCluster: row.assignedCluster,
    assignedVillage: row.assignedVillage,
    assignedByUid: row.assignedByUid,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listProjectsBundle(includeTeam: boolean) {
  try {
    const [projectRows, locationRows, teamRows] = await Promise.all([
      db.select().from(projects).orderBy(desc(projects.createdAt)),
      db.select().from(projectLocations).orderBy(desc(projectLocations.createdAt)),
      includeTeam
        ? db.select().from(projectTeamMembers).orderBy(desc(projectTeamMembers.createdAt))
        : Promise.resolve([]),
    ]);

    return {
      projects: projectRows.map(serializeProject),
      locations: locationRows.map(serializeLocation),
      teamMembers: teamRows.map(serializeTeamMember),
    };
  } catch (error) {
    console.error('Failed to list projects bundle:', error);
    throw new Error('Unable to load projects.', { cause: error });
  }
}

export async function createProjectRecord(params: {
  name: string;
  code: string;
  stateName: string;
  districtName: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdByUid: string;
  createdByEmail: string;
}) {
  try {
    const [inserted] = await db
      .insert(projects)
      .values({
        name: params.name.trim(),
        code: params.code.trim().toUpperCase(),
        stateName: params.stateName.trim() || 'Madhya Pradesh',
        districtName: params.districtName.trim() || 'Mandla',
        description: params.description.trim(),
        status: params.status,
        createdByUid: params.createdByUid,
        createdByEmail: params.createdByEmail,
      })
      .returning();

    return serializeProject(inserted);
  } catch (error: any) {
    console.error('Failed to create project:', error);
    if (error?.code === '23505') {
      throw new Error('A project with this code already exists.', { cause: error });
    }
    throw new Error('Unable to create project.', { cause: error });
  }
}

export async function updateProjectRecord(
  id: number,
  updates: {
    name?: string;
    code?: string;
    stateName?: string;
    districtName?: string;
    description?: string;
    status?: 'Active' | 'Completed' | 'On Hold';
  }
) {
  try {
    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (existing.length === 0) return null;

    const current = existing[0];
    const [updated] = await db
      .update(projects)
      .set({
        name: updates.name !== undefined ? updates.name.trim() : current.name,
        code: updates.code !== undefined ? updates.code.trim().toUpperCase() : current.code,
        stateName:
          updates.stateName !== undefined ? updates.stateName.trim() : current.stateName,
        districtName:
          updates.districtName !== undefined
            ? updates.districtName.trim()
            : current.districtName,
        description:
          updates.description !== undefined
            ? updates.description.trim()
            : current.description,
        status: updates.status !== undefined ? updates.status : current.status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    return serializeProject(updated);
  } catch (error: any) {
    console.error('Failed to update project:', error);
    if (error?.code === '23505') {
      throw new Error('A project with this code already exists.', { cause: error });
    }
    throw new Error('Unable to update project.', { cause: error });
  }
}

export async function deleteProjectRecord(id: number): Promise<boolean> {
  try {
    const deleted = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Unable to delete project.', { cause: error });
  }
}

export async function addProjectLocationRecord(params: {
  projectId: number;
  tehsil: string;
  block: string;
  cluster: string;
  village: string;
  gramPanchayat: string;
  createdByUid: string;
}) {
  try {
    const [inserted] = await db
      .insert(projectLocations)
      .values({
        projectId: params.projectId,
        tehsil: params.tehsil.trim(),
        block: params.block.trim(),
        cluster: params.cluster.trim(),
        village: params.village.trim(),
        gramPanchayat: params.gramPanchayat.trim(),
        createdByUid: params.createdByUid,
      })
      .returning();

    return serializeLocation(inserted);
  } catch (error) {
    console.error('Failed to add project location:', error);
    throw new Error('Unable to save location hierarchy entry.', { cause: error });
  }
}

export async function deleteProjectLocationRecord(id: number): Promise<boolean> {
  try {
    const deleted = await db
      .delete(projectLocations)
      .where(eq(projectLocations.id, id))
      .returning({ id: projectLocations.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete project location:', error);
    throw new Error('Unable to remove location entry.', { cause: error });
  }
}

export async function addProjectTeamMemberRecord(params: {
  projectId: number;
  memberName: string;
  memberEmail: string;
  role: SecurityRole;
  assignedTehsil: string;
  assignedBlock: string;
  assignedCluster: string;
  assignedVillage: string;
  assignedByUid: string;
}) {
  try {
    const [inserted] = await db
      .insert(projectTeamMembers)
      .values({
        projectId: params.projectId,
        memberName: params.memberName.trim(),
        memberEmail: params.memberEmail.trim().toLowerCase(),
        role: params.role,
        assignedTehsil: params.assignedTehsil.trim(),
        assignedBlock: params.assignedBlock.trim(),
        assignedCluster: params.assignedCluster.trim(),
        assignedVillage: params.assignedVillage.trim(),
        assignedByUid: params.assignedByUid,
      })
      .returning();

    return serializeTeamMember(inserted);
  } catch (error) {
    console.error('Failed to assign project team member:', error);
    throw new Error('Unable to assign team member to project.', { cause: error });
  }
}

export async function updateProjectTeamMemberRecord(
  id: number,
  updates: {
    role?: SecurityRole;
    assignedTehsil?: string;
    assignedBlock?: string;
    assignedCluster?: string;
    assignedVillage?: string;
  }
) {
  try {
    const existing = await db
      .select()
      .from(projectTeamMembers)
      .where(eq(projectTeamMembers.id, id))
      .limit(1);
    if (existing.length === 0) return null;

    const current = existing[0];
    const [updated] = await db
      .update(projectTeamMembers)
      .set({
        role: updates.role ?? current.role,
        assignedTehsil:
          updates.assignedTehsil !== undefined
            ? updates.assignedTehsil.trim()
            : current.assignedTehsil,
        assignedBlock:
          updates.assignedBlock !== undefined
            ? updates.assignedBlock.trim()
            : current.assignedBlock,
        assignedCluster:
          updates.assignedCluster !== undefined
            ? updates.assignedCluster.trim()
            : current.assignedCluster,
        assignedVillage:
          updates.assignedVillage !== undefined
            ? updates.assignedVillage.trim()
            : current.assignedVillage,
      })
      .where(eq(projectTeamMembers.id, id))
      .returning();

    return serializeTeamMember(updated);
  } catch (error) {
    console.error('Failed to update project team member:', error);
    throw new Error('Unable to update team assignment.', { cause: error });
  }
}

export async function deleteProjectTeamMemberRecord(id: number): Promise<boolean> {
  try {
    const deleted = await db
      .delete(projectTeamMembers)
      .where(eq(projectTeamMembers.id, id))
      .returning({ id: projectTeamMembers.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to remove project team member:', error);
    throw new Error('Unable to remove team member.', { cause: error });
  }
}
