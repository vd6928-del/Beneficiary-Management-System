/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import type { CustomFieldType, CustomFormField } from '../types';

export interface ParsedSpreadsheetRow {
  village: string;
  responses: Record<string, string | number | boolean>;
}

export interface ParsedSheetDraft {
  sheetName: string;
  suggestedTitle: string;
  headerRowIndex: number; // 0-based index in raw matrix
  maxHeaderCandidateRow: number;
  fields: CustomFormField[];
  rows: ParsedSpreadsheetRow[];
  detectedVillageColumnLabel: string | null;
  totalRawRows: number;
}

export interface LoadedWorkbookContext {
  fileName: string;
  workbook: XLSX.WorkBook;
  sheetNames: string[];
}

const DATE_HEADER_RE = /\b(date|dob|tarikh|dinank|dt|day|month_year)\b|date$/i;
const TEXTAREA_HEADER_RE =
  /\b(remark|remarks|note|notes|comment|comments|agenda|decision|address|description|detail|details|feedback|observation)\b/i;
const ID_OR_PHONE_HEADER_RE =
  /\b(mobile|phone|contact|whatsapp|aadhaar|aadhar|samagra|khasra|pin|pincode|code|id|unique|receipt|no|number|sl|sr|s\.?no)\b/i;
const SELECT_HEADER_RE =
  /\b(gender|sex|season|category|caste|status|type|block|tehsil|cluster|scheme|department|crop|theme|activity)\b/i;
const VILLAGE_HEADER_RE = /^(village|village\s*name|gram|gaon|vill\.?)$/i;
const SERIAL_ONLY_HEADER_RE = /^(s\.?\s*no\.?|sr\.?\s*no\.?|sl\.?\s*no\.?|serial(\s*no\.?)?|#)$/i;

const BOOL_TRUE_SET = new Set(['yes', 'true', 'y', 'haan', 'ha', 'हाँ', 'हां']);
const BOOL_FALSE_SET = new Set(['no', 'false', 'n', 'nahi', 'nahin', 'नहीं']);

function toIsoDate(val: unknown): string | null {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val !== 'string') return null;
  const s = val.trim();
  if (!s) return null;

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return null;
}

function isNumericValue(val: unknown): boolean {
  if (typeof val === 'number') return Number.isFinite(val);
  if (typeof val !== 'string') return false;
  const cleaned = val.replace(/,/g, '').trim();
  if (!cleaned) return false;
  return /^-?\d+(\.\d+)?$/.test(cleaned);
}

function cleanFormTitle(fileName: string, sheetName: string, multipleSheets: boolean): string {
  const base = fileName
    .replace(/\.(xlsx|xls|csv)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanSheet = sheetName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const isGenericSheet = /^sheet\s*\d*$/i.test(cleanSheet);
  if (multipleSheets && cleanSheet && !isGenericSheet) {
    return `${base} - ${cleanSheet}`.slice(0, 100);
  }
  return (base || cleanSheet || 'Imported Form').slice(0, 100);
}

function makeFieldId(label: string, usedIds: Set<string>, index: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 32);
  let candidate = slug || `col_${index + 1}`;
  let suffix = 2;
  while (usedIds.has(candidate)) {
    candidate = `${slug || 'col'}_${suffix}`;
    suffix++;
  }
  usedIds.add(candidate);
  return candidate;
}

function detectBestHeaderRowIndex(matrix: unknown[][]): number {
  const scanLimit = Math.min(matrix.length, 12);
  let bestIdx = 0;
  let bestScore = -1;

  for (let r = 0; r < scanLimit; r++) {
    const row = matrix[r];
    if (!Array.isArray(row)) continue;
    let nonEmptyText = 0;
    let nonEmptyAny = 0;

    for (const cell of row) {
      if (cell === null || cell === undefined) continue;
      const str = String(cell).trim();
      if (!str) continue;
      nonEmptyAny++;
      if (typeof cell === 'string' && !isNumericValue(str) && str.length <= 80) {
        nonEmptyText++;
      }
    }

    // Prefer rows with multiple string headers over single merged title banners
    const score = nonEmptyText * 2 + nonEmptyAny;
    if (nonEmptyAny >= 2 && score > bestScore) {
      bestScore = score;
      bestIdx = r;
    } else if (bestScore < 0 && nonEmptyAny > 0) {
      bestScore = score;
      bestIdx = r;
    }
  }

  return bestIdx;
}

function inferFieldMeta(
  headerLabel: string,
  sampleValues: unknown[]
): { type: CustomFieldType; options?: string[]; placeholder?: string } {
  const nonEmpty = sampleValues.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  );

  // 1. Date check
  if (DATE_HEADER_RE.test(headerLabel)) {
    return { type: 'date' };
  }
  if (nonEmpty.length > 0) {
    const dateMatches = nonEmpty.filter((v) => toIsoDate(v) !== null).length;
    if (dateMatches / nonEmpty.length >= 0.8) {
      return { type: 'date' };
    }
  }

  // 2. Boolean / Yes-No checkbox check
  if (nonEmpty.length > 0) {
    const allBoolLike = nonEmpty.every((v) => {
      if (typeof v === 'boolean') return true;
      const low = String(v).trim().toLowerCase();
      return BOOL_TRUE_SET.has(low) || BOOL_FALSE_SET.has(low);
    });
    if (allBoolLike) {
      return { type: 'checkbox' };
    }
  }

  // 3. Long text / remarks check
  if (TEXTAREA_HEADER_RE.test(headerLabel)) {
    return { type: 'textarea', placeholder: `Enter ${headerLabel.toLowerCase()}` };
  }
  if (nonEmpty.length > 0) {
    const avgLen =
      nonEmpty.reduce<number>((sum, v) => sum + String(v).trim().length, 0) /
      nonEmpty.length;
    if (avgLen >= 65) {
      return { type: 'textarea', placeholder: `Enter ${headerLabel.toLowerCase()}` };
    }
  }

  // 4. Number check (skip ID / phone / Samagra / Aadhaar columns)
  if (nonEmpty.length > 0 && !ID_OR_PHONE_HEADER_RE.test(headerLabel)) {
    const numericMatches = nonEmpty.filter((v) => isNumericValue(v)).length;
    if (numericMatches / nonEmpty.length >= 0.8) {
      return { type: 'number', placeholder: `Enter ${headerLabel.toLowerCase()}` };
    }
  }

  // 5. Dropdown / Select check (categorical repeated values)
  if (nonEmpty.length >= 2 && !ID_OR_PHONE_HEADER_RE.test(headerLabel)) {
    const uniqueStrings = Array.from(
      new Set(nonEmpty.map((v) => String(v).trim()).filter(Boolean))
    );
    const maxOptionLen = Math.max(...uniqueStrings.map((s) => s.length));
    const looksCategorical =
      uniqueStrings.length >= 2 &&
      uniqueStrings.length <= 12 &&
      maxOptionLen <= 45 &&
      (SELECT_HEADER_RE.test(headerLabel) ||
        (nonEmpty.length >= 4 && uniqueStrings.length <= Math.ceil(nonEmpty.length * 0.5)));

    if (looksCategorical) {
      return { type: 'select', options: uniqueStrings };
    }
  }

  // Default: Short text
  return { type: 'text', placeholder: `Enter ${headerLabel.toLowerCase()}` };
}

export async function loadSpreadsheetFile(file: File): Promise<LoadedWorkbookContext> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    raw: true,
  });
  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('This file does not contain any readable sheets.');
  }
  return {
    fileName: file.name,
    workbook,
    sheetNames,
  };
}

export function parseSheetToFormDraft(
  ctx: LoadedWorkbookContext,
  sheetName: string,
  headerRowOverride?: number
): ParsedSheetDraft {
  const sheet = ctx.workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" could not be read.`);
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (matrix.length === 0) {
    throw new Error('The selected sheet is empty.');
  }

  const maxHeaderCandidateRow = Math.min(matrix.length - 1, 9);
  const headerRowIndex =
    typeof headerRowOverride === 'number' &&
    headerRowOverride >= 0 &&
    headerRowOverride <= maxHeaderCandidateRow
      ? headerRowOverride
      : detectBestHeaderRowIndex(matrix);

  const headerRow = Array.isArray(matrix[headerRowIndex]) ? matrix[headerRowIndex] : [];
  const dataRows = matrix.slice(headerRowIndex + 1);

  const usedIds = new Set<string>();
  const fields: CustomFormField[] = [];
  const colBindings: Array<{
    colIndex: number;
    fieldId: string;
    type: CustomFieldType;
  }> = [];

  let villageColIndex: number | null = null;
  let detectedVillageColumnLabel: string | null = null;

  const maxCols = Math.min(headerRow.length, 60);

  for (let c = 0; c < maxCols; c++) {
    const rawHeader = headerRow[c];
    const label = rawHeader !== null && rawHeader !== undefined
      ? String(rawHeader).replace(/\s+/g, ' ').trim()
      : '';

    if (!label) continue;
    // Skip pure serial-number columns like "S.No" / "Sr. No."
    if (SERIAL_ONLY_HEADER_RE.test(label)) continue;

    // Remember village column so imported rows also populate the native Village field
    if (villageColIndex === null && VILLAGE_HEADER_RE.test(label)) {
      villageColIndex = c;
      detectedVillageColumnLabel = label;
    }

    const colSamples = dataRows
      .slice(0, 200)
      .map((row) => (Array.isArray(row) ? row[c] : undefined));

    const inferred = inferFieldMeta(label, colSamples);
    const fieldId = makeFieldId(label, usedIds, fields.length);

    fields.push({
      id: fieldId,
      label,
      type: inferred.type,
      required: fields.length < 2, // Mark first couple primary fields required by default, editable by owner
      ...(inferred.placeholder ? { placeholder: inferred.placeholder } : {}),
      ...(inferred.options ? { options: inferred.options } : {}),
    });

    colBindings.push({
      colIndex: c,
      fieldId,
      type: inferred.type,
    });
  }

  if (fields.length === 0) {
    throw new Error(
      'No column headers were found in the selected row. Try selecting a different Header Row.'
    );
  }

  // Convert up to 500 data rows for optional one-click import
  const parsedRows: ParsedSpreadsheetRow[] = [];
  const maxImportRows = Math.min(dataRows.length, 500);

  for (let r = 0; r < maxImportRows; r++) {
    const rawRow = dataRows[r];
    if (!Array.isArray(rawRow)) continue;

    const village =
      villageColIndex !== null && rawRow[villageColIndex] !== undefined && rawRow[villageColIndex] !== null
        ? String(rawRow[villageColIndex]).trim()
        : '';

    const responses: Record<string, string | number | boolean> = {};
    let hasValue = Boolean(village);

    for (const binding of colBindings) {
      const cell = rawRow[binding.colIndex];
      if (cell === null || cell === undefined || String(cell).trim() === '') {
        responses[binding.fieldId] = binding.type === 'checkbox' ? false : '';
        continue;
      }

      hasValue = true;
      if (binding.type === 'date') {
        responses[binding.fieldId] = toIsoDate(cell) ?? String(cell).trim();
      } else if (binding.type === 'checkbox') {
        const low = String(cell).trim().toLowerCase();
        responses[binding.fieldId] =
          typeof cell === 'boolean' ? cell : BOOL_TRUE_SET.has(low);
      } else if (binding.type === 'number') {
        const cleaned = String(cell).replace(/,/g, '').trim();
        const num = Number(cleaned);
        responses[binding.fieldId] = Number.isFinite(num) ? num : '';
      } else {
        responses[binding.fieldId] = String(cell).trim();
      }
    }

    if (hasValue) {
      parsedRows.push({ village, responses });
    }
  }

  return {
    sheetName,
    suggestedTitle: cleanFormTitle(ctx.fileName, sheetName, ctx.sheetNames.length > 1),
    headerRowIndex,
    maxHeaderCandidateRow,
    fields,
    rows: parsedRows,
    detectedVillageColumnLabel,
    totalRawRows: dataRows.length,
  };
}
