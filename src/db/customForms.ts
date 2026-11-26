/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { and, count, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  customForms,
  customFormSubmissions,
  type SchemaCustomFormField,
} from './schema.ts';
import { isValidSecurityRole, type SecurityRole } from '../lib/roles.ts';

const VALID_FIELD_TYPES = new Set([
  'text',
  'number',
  'date',
  'select',
  'textarea',
  'checkbox',
]);

export function sanitizeFormFields(input: unknown): SchemaCustomFormField[] {
  if (!Array.isArray(input)) return [];
  const result: SchemaCustomFormField[] = [];
  for (let i = 0; i < input.length && i < 60; i++) {
    const raw = input[i] as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') continue;
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label) continue;
    const type =
      typeof raw.type === 'string' && VALID_FIELD_TYPES.has(raw.type)
        ? (raw.type as SchemaCustomFormField['type'])
        : 'text';
    const id =
      typeof raw.id === 'string' && raw.id.trim()
        ? raw.id.trim().slice(0, 64)
        : `field_${i + 1}_${Math.random().toString(36).slice(2, 7)}`;
    const required = Boolean(raw.required);
    const placeholder =
      typeof raw.placeholder === 'string' && raw.placeholder.trim()
        ? raw.placeholder.trim()
        : undefined;
    const options =
      type === 'select' && Array.isArray(raw.options)
        ? raw.options
            .map((o) => (typeof o === 'string' ? o.trim() : ''))
            .filter(Boolean)
        : undefined;

    result.push({
      id,
      label,
      type,
      required,
      ...(placeholder ? { placeholder } : {}),
      ...(options ? { options } : {}),
    });
  }
  return result;
}

function serializeForm(
  row: typeof customForms.$inferSelect,
  submissionCount = 0
) {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    fields: Array.isArray(row.fields) ? row.fields : [],
    isActive: row.isActive,
    expiresAt: row.expiresAt,
    createdByUid: row.createdByUid,
    createdByEmail: row.createdByEmail,
    createdByRole: (isValidSecurityRole(row.createdByRole)
      ? row.createdByRole
      : 'project_manager') as SecurityRole,
    submissionCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeSubmission(row: typeof customFormSubmissions.$inferSelect) {
  return {
    id: row.id,
    formId: row.formId,
    projectId: row.projectId,
    village: row.village,
    responses:
      row.responses && typeof row.responses === 'object' ? row.responses : {},
    submittedByUid: row.submittedByUid,
    submittedByEmail: row.submittedByEmail,
    submittedByRole: (isValidSecurityRole(row.submittedByRole)
      ? row.submittedByRole
      : 'field_worker') as SecurityRole,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCustomFormsWithCounts(includeInactive: boolean) {
  try {
    const formRows = includeInactive
      ? await db.select().from(customForms).orderBy(desc(customForms.createdAt))
      : await db
          .select()
          .from(customForms)
          .where(eq(customForms.isActive, true))
          .orderBy(desc(customForms.createdAt));

    const counts = await db
      .select({
        formId: customFormSubmissions.formId,
        total: count(),
      })
      .from(customFormSubmissions)
      .groupBy(customFormSubmissions.formId);

    const countMap = new Map<number, number>();
    for (const c of counts) {
      countMap.set(c.formId, Number(c.total) || 0);
    }

    return formRows.map((row) => serializeForm(row, countMap.get(row.id) || 0));
  } catch (error) {
    console.error('Failed to list custom forms:', error);
    throw new Error('Unable to load temporary forms.', { cause: error });
  }
}

export async function getCustomFormById(id: number) {
  try {
    const rows = await db
      .select()
      .from(customForms)
      .where(eq(customForms.id, id))
      .limit(1);
    return rows[0] ? serializeForm(rows[0]) : null;
  } catch (error) {
    console.error('Failed to get custom form:', error);
    throw new Error('Unable to look up form.', { cause: error });
  }
}

export async function createCustomFormRecord(params: {
  projectId: number | null;
  title: string;
  description: string;
  fields: SchemaCustomFormField[];
  isActive: boolean;
  expiresAt: string | null;
  createdByUid: string;
  createdByEmail: string;
  createdByRole: SecurityRole;
}) {
  try {
    const [inserted] = await db
      .insert(customForms)
      .values({
        projectId: params.projectId,
        title: params.title.trim(),
        description: params.description.trim(),
        fields: params.fields,
        isActive: params.isActive,
        expiresAt: params.expiresAt ? params.expiresAt.trim() : null,
        createdByUid: params.createdByUid,
        createdByEmail: params.createdByEmail,
        createdByRole: params.createdByRole,
      })
      .returning();

    return serializeForm(inserted, 0);
  } catch (error) {
    console.error('Failed to create custom form:', error);
    throw new Error('Unable to create temporary form.', { cause: error });
  }
}

export async function updateCustomFormRecord(
  id: number,
  updates: {
    projectId?: number | null;
    title?: string;
    description?: string;
    fields?: SchemaCustomFormField[];
    isActive?: boolean;
    expiresAt?: string | null;
  }
) {
  try {
    const existing = await db
      .select()
      .from(customForms)
      .where(eq(customForms.id, id))
      .limit(1);
    if (existing.length === 0) return null;

    const current = existing[0];
    const [updated] = await db
      .update(customForms)
      .set({
        projectId:
          updates.projectId !== undefined ? updates.projectId : current.projectId,
        title: updates.title !== undefined ? updates.title.trim() : current.title,
        description:
          updates.description !== undefined
            ? updates.description.trim()
            : current.description,
        fields: updates.fields !== undefined ? updates.fields : current.fields,
        isActive: updates.isActive !== undefined ? updates.isActive : current.isActive,
        expiresAt:
          updates.expiresAt !== undefined
            ? updates.expiresAt
              ? updates.expiresAt.trim()
              : null
            : current.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(customForms.id, id))
      .returning();

    return serializeForm(updated);
  } catch (error) {
    console.error('Failed to update custom form:', error);
    throw new Error('Unable to update temporary form.', { cause: error });
  }
}

export async function deleteCustomFormRecord(id: number): Promise<boolean> {
  try {
    const deleted = await db
      .delete(customForms)
      .where(eq(customForms.id, id))
      .returning({ id: customForms.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete custom form:', error);
    throw new Error('Unable to delete temporary form.', { cause: error });
  }
}

export async function listCustomFormSubmissions(
  formId: number,
  onlySubmittedByUid?: string
) {
  try {
    const rows = onlySubmittedByUid
      ? await db
          .select()
          .from(customFormSubmissions)
          .where(
            and(
              eq(customFormSubmissions.formId, formId),
              eq(customFormSubmissions.submittedByUid, onlySubmittedByUid)
            )
          )
          .orderBy(desc(customFormSubmissions.createdAt))
      : await db
          .select()
          .from(customFormSubmissions)
          .where(eq(customFormSubmissions.formId, formId))
          .orderBy(desc(customFormSubmissions.createdAt));

    return rows.map(serializeSubmission);
  } catch (error) {
    console.error('Failed to list custom form submissions:', error);
    throw new Error('Unable to load form submissions.', { cause: error });
  }
}

export async function createCustomFormSubmissionRecord(params: {
  formId: number;
  projectId: number | null;
  village: string;
  responses: Record<string, string | number | boolean>;
  submittedByUid: string;
  submittedByEmail: string;
  submittedByRole: SecurityRole;
}) {
  try {
    const [inserted] = await db
      .insert(customFormSubmissions)
      .values({
        formId: params.formId,
        projectId: params.projectId,
        village: params.village.trim(),
        responses: params.responses,
        submittedByUid: params.submittedByUid,
        submittedByEmail: params.submittedByEmail,
        submittedByRole: params.submittedByRole,
      })
      .returning();

    return serializeSubmission(inserted);
  } catch (error) {
    console.error('Failed to save form submission:', error);
    throw new Error('Unable to submit temporary form entry.', { cause: error });
  }
}

export async function bulkCreateCustomFormSubmissionRecords(params: {
  formId: number;
  projectId: number | null;
  rows: Array<{
    village: string;
    responses: Record<string, string | number | boolean>;
  }>;
  submittedByUid: string;
  submittedByEmail: string;
  submittedByRole: SecurityRole;
}): Promise<number> {
  if (!params.rows.length) return 0;
  try {
    const values = params.rows.map((r) => ({
      formId: params.formId,
      projectId: params.projectId,
      village: r.village.trim(),
      responses: r.responses,
      submittedByUid: params.submittedByUid,
      submittedByEmail: params.submittedByEmail,
      submittedByRole: params.submittedByRole,
    }));

    // Insert in chunks of 100 for safe PostgreSQL parameter limits
    let insertedCount = 0;
    for (let i = 0; i < values.length; i += 100) {
      const chunk = values.slice(i, i + 100);
      const inserted = await db
        .insert(customFormSubmissions)
        .values(chunk)
        .returning({ id: customFormSubmissions.id });
      insertedCount += inserted.length;
    }
    return insertedCount;
  } catch (error) {
    console.error('Failed to bulk import form submissions:', error);
    throw new Error('Unable to bulk import spreadsheet rows.', { cause: error });
  }
}

export async function deleteCustomFormSubmissionRecord(id: number): Promise<boolean> {
  try {
    const deleted = await db
      .delete(customFormSubmissions)
      .where(eq(customFormSubmissions.id, id))
      .returning({ id: customFormSubmissions.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete form submission:', error);
    throw new Error('Unable to delete submission.', { cause: error });
  }
}
