/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FilePlus2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ClipboardCheck,
  Table2,
  Download,
  RefreshCw,
  AlertCircle,
  Power,
  Calendar,
  Send,
  Upload,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { downloadCSV } from '../utils';
import {
  loadSpreadsheetFile,
  parseSheetToFormDraft,
  type LoadedWorkbookContext,
  type ParsedSpreadsheetRow,
} from '../utils/excelFormParser';
import {
  VILLAGES,
  type CustomFieldType,
  type CustomForm,
  type CustomFormField,
  type CustomFormSubmission,
  type ProjectLocation,
  type ProjectRecord,
} from '../types';

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Short Text',
  number: 'Number',
  date: 'Date',
  select: 'Dropdown Options',
  textarea: 'Long Text / Notes',
  checkbox: 'Yes / No Checkbox',
};

export interface TempFormBuilderProps {
  initialFormId?: number | null;
  initialMode?: 'list' | 'design' | 'fill' | 'responses' | 'import';
  navigationKey?: number;
  onFormsChanged?: () => void;
}

export default function TempFormBuilder({
  initialFormId = null,
  initialMode = 'list',
  navigationKey = 0,
  onFormsChanged,
}: TempFormBuilderProps) {
  const { permissions, isAppOwner, authFetch } = useAuth();
  const canDesign = Boolean(permissions?.canDesignTempForms);
  const canExport = Boolean(permissions?.canExportData);

  const [forms, setForms] = useState<CustomForm[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [projectLocations, setProjectLocations] = useState<ProjectLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active mode: list | design | fill | responses
  const [mode, setMode] = useState<'list' | 'design' | 'fill' | 'responses'>('list');
  const [activeForm, setActiveForm] = useState<CustomForm | null>(null);

  // Designer State (Admin & Project Manager)
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [fields, setFields] = useState<CustomFormField[]>([]);
  const [savingForm, setSavingForm] = useState(false);

  // New Field Draft inside Designer
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<CustomFieldType>('text');
  const [newRequired, setNewRequired] = useState(true);
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('');

  // Fill Form State
  const [fillVillage, setFillVillage] = useState('');
  const [fillValues, setFillValues] = useState<Record<string, string | number | boolean>>({});
  const [submittingEntry, setSubmittingEntry] = useState(false);

  // Submissions View State
  const [submissions, setSubmissions] = useState<CustomFormSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Delete Confirmation Modal
  const [deleteFormTarget, setDeleteFormTarget] = useState<CustomForm | null>(null);

  // App-Owner-Only Excel / CSV Auto-Form Designer State
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [workbookCtx, setWorkbookCtx] = useState<LoadedWorkbookContext | null>(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [maxHeaderRowIndex, setMaxHeaderRowIndex] = useState(0);
  const [parsedExcelRows, setParsedExcelRows] = useState<ParsedSpreadsheetRow[]>([]);
  const [totalExcelRawRows, setTotalExcelRawRows] = useState(0);
  const [detectedVillageCol, setDetectedVillageCol] = useState<string | null>(null);
  const [importExcelRowsOnPublish, setImportExcelRowsOnPublish] = useState(false);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const [formsRes, projRes] = await Promise.all([
        authFetch('/api/custom-forms'),
        authFetch('/api/projects'),
      ]);
      if (formsRes.ok) {
        const fData = await formsRes.json();
        setForms(Array.isArray(fData) ? fData : []);
      }
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(Array.isArray(pData.projects) ? pData.projects : []);
        setProjectLocations(Array.isArray(pData.locations) ? pData.locations : []);
      }
    } catch (err) {
      console.error('Failed to load temporary forms:', err);
      setNotice({ type: 'error', text: 'Unable to load temporary forms.' });
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Sync external dropdown selection (open specific temporary form or designer)
  const lastHandledNavKeyRef = useRef<number>(-1);

  useEffect(() => {
    if (loading) return;
    if (lastHandledNavKeyRef.current === navigationKey) return;
    lastHandledNavKeyRef.current = navigationKey;

    if (initialMode === 'import' && isAppOwner) {
      setEditingFormId(null);
      setFormTitle('');
      setFormDescription('');
      setFormProjectId('');
      setFormExpiresAt('');
      setFormIsActive(true);
      setFields([]);
      setWorkbookCtx(null);
      setSelectedSheet('');
      setHeaderRowIndex(0);
      setMaxHeaderRowIndex(0);
      setParsedExcelRows([]);
      setTotalExcelRawRows(0);
      setDetectedVillageCol(null);
      setImportExcelRowsOnPublish(false);
      setEditingFieldId(null);
      if (excelInputRef.current) excelInputRef.current.value = '';
      setNotice(null);
      setMode('design');
      return;
    }

    if (initialMode === 'design' && canDesign) {
      setEditingFormId(null);
      setFormTitle('');
      setFormDescription('');
      setFormProjectId('');
      setFormExpiresAt('');
      setFormIsActive(true);
      setWorkbookCtx(null);
      setSelectedSheet('');
      setParsedExcelRows([]);
      setTotalExcelRawRows(0);
      setDetectedVillageCol(null);
      setImportExcelRowsOnPublish(false);
      setEditingFieldId(null);
      if (excelInputRef.current) excelInputRef.current.value = '';
      setFields([
        {
          id: 'respondent_name',
          label: 'Respondent / Farmer Name',
          type: 'text',
          required: true,
          placeholder: 'Enter full name',
        },
        {
          id: 'mobile_number',
          label: 'Mobile Number',
          type: 'text',
          required: false,
          placeholder: '10-digit mobile number',
        },
      ]);
      setNotice(null);
      setMode('design');
      return;
    }

    if (initialMode === 'fill' && initialFormId != null) {
      const target = forms.find((f) => f.id === initialFormId);
      if (target) {
        const isExpired =
          Boolean(target.expiresAt) &&
          target.expiresAt! < new Date().toISOString().slice(0, 10);
        if (target.isActive && !isExpired) {
          setActiveForm(target);
          setFillVillage('');
          const initial: Record<string, string | number | boolean> = {};
          target.fields.forEach((f) => {
            initial[f.id] = f.type === 'checkbox' ? false : '';
          });
          setFillValues(initial);
          setNotice(null);
          setMode('fill');
        } else {
          setMode('list');
          setNotice({
            type: 'error',
            text: `"${target.title}" is currently closed or expired.`,
          });
        }
        return;
      }
    }

    if (initialMode === 'list' || (initialMode === 'import' && !isAppOwner)) {
      setMode('list');
    }
  }, [initialFormId, initialMode, navigationKey, loading, forms, canDesign, isAppOwner]);

  const projectMap = useMemo(() => {
    const map = new Map<number, ProjectRecord>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  const availableVillagesForActiveForm = useMemo(() => {
    const set = new Set<string>(VILLAGES);
    if (activeForm?.projectId) {
      projectLocations
        .filter((l) => l.projectId === activeForm.projectId)
        .forEach((l) => set.add(l.village));
    } else {
      projectLocations.forEach((l) => set.add(l.village));
    }
    return Array.from(set);
  }, [activeForm, projectLocations]);

  const clearExcelUpload = () => {
    setWorkbookCtx(null);
    setSelectedSheet('');
    setHeaderRowIndex(0);
    setMaxHeaderRowIndex(0);
    setParsedExcelRows([]);
    setTotalExcelRawRows(0);
    setDetectedVillageCol(null);
    setImportExcelRowsOnPublish(false);
    setEditingFieldId(null);
    if (excelInputRef.current) {
      excelInputRef.current.value = '';
    }
  };

  const openDesignerNew = () => {
    setEditingFormId(null);
    setFormTitle('');
    setFormDescription('');
    setFormProjectId('');
    setFormExpiresAt('');
    setFormIsActive(true);
    clearExcelUpload();
    setFields([
      {
        id: 'respondent_name',
        label: 'Respondent / Farmer Name',
        type: 'text',
        required: true,
        placeholder: 'Enter full name',
      },
      {
        id: 'mobile_number',
        label: 'Mobile Number',
        type: 'text',
        required: false,
        placeholder: '10-digit mobile number',
      },
    ]);
    setNotice(null);
    setMode('design');
  };

  const openExcelImportDesigner = () => {
    if (!isAppOwner) return;
    setEditingFormId(null);
    setFormTitle('');
    setFormDescription('');
    setFormProjectId('');
    setFormExpiresAt('');
    setFormIsActive(true);
    clearExcelUpload();
    setFields([]);
    setNotice(null);
    setMode('design');
  };

  const openDesignerEdit = (form: CustomForm) => {
    setEditingFormId(form.id);
    setFormTitle(form.title);
    setFormDescription(form.description || '');
    setFormProjectId(form.projectId ? String(form.projectId) : '');
    setFormExpiresAt(form.expiresAt || '');
    setFormIsActive(form.isActive);
    clearExcelUpload();
    setFields(form.fields || []);
    setNotice(null);
    setMode('design');
  };

  const applySheetDraft = (
    ctx: LoadedWorkbookContext,
    sheetName: string,
    headerOverride?: number
  ) => {
    try {
      const draft = parseSheetToFormDraft(ctx, sheetName, headerOverride);
      setSelectedSheet(draft.sheetName);
      setHeaderRowIndex(draft.headerRowIndex);
      setMaxHeaderRowIndex(draft.maxHeaderCandidateRow);
      setFields(draft.fields);
      setParsedExcelRows(draft.rows);
      setTotalExcelRawRows(draft.totalRawRows);
      setDetectedVillageCol(draft.detectedVillageColumnLabel);
      setFormTitle(draft.suggestedTitle);
      setEditingFieldId(null);
      setNotice({
        type: 'success',
        text: `Detected ${draft.fields.length} form fields${
          draft.rows.length > 0
            ? ` and ${draft.rows.length} data row${draft.rows.length === 1 ? '' : 's'}`
            : ''
        } from "${ctx.fileName}" (${draft.sheetName}). Review or edit fields below before publishing.`,
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err?.message || 'Could not parse the selected sheet.',
      });
    }
  };

  const handleExcelFileSelected = async (file: File | null | undefined) => {
    if (!file || !isAppOwner) return;
    const lowerName = file.name.toLowerCase();
    if (
      !lowerName.endsWith('.xlsx') &&
      !lowerName.endsWith('.xls') &&
      !lowerName.endsWith('.csv')
    ) {
      setNotice({
        type: 'error',
        text: 'Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.',
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotice({
        type: 'error',
        text: 'File is too large. Please upload a file under 10 MB.',
      });
      return;
    }

    setParsingExcel(true);
    setNotice(null);
    try {
      const ctx = await loadSpreadsheetFile(file);
      setWorkbookCtx(ctx);
      setImportExcelRowsOnPublish(false);
      applySheetDraft(ctx, ctx.sheetNames[0]);
    } catch (err: any) {
      console.error('Excel/CSV parse failed:', err);
      setNotice({
        type: 'error',
        text: err?.message || 'Could not read the uploaded Excel/CSV file.',
      });
    } finally {
      setParsingExcel(false);
    }
  };

  const handleUpdateFieldInline = (
    fieldId: string,
    patch: Partial<CustomFormField>
  ) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        const next: CustomFormField = { ...f, ...patch };
        if (next.type !== 'select') {
          delete next.options;
        } else if (!next.options) {
          next.options = [];
        }
        return next;
      })
    );
  };

  const handleAddFieldToDraft = () => {
    if (!newLabel.trim()) return;
    const slug = newLabel
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 32);
    const id = `${slug || 'field'}_${Math.random().toString(36).slice(2, 6)}`;
    const options =
      newType === 'select'
        ? newOptionsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    if (newType === 'select' && (!options || options.length === 0)) {
      setNotice({
        type: 'error',
        text: 'Please provide comma-separated options for a Dropdown field.',
      });
      return;
    }

    setFields((prev) => [
      ...prev,
      {
        id,
        label: newLabel.trim(),
        type: newType,
        required: newRequired,
        placeholder: newPlaceholder.trim() || undefined,
        options,
      },
    ]);
    setNewLabel('');
    setNewType('text');
    setNewRequired(true);
    setNewPlaceholder('');
    setNewOptionsText('');
    setNotice(null);
  };

  const moveField = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= fields.length) return;
    setFields((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleSaveFormDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || fields.length === 0) {
      setNotice({
        type: 'error',
        text: 'Please provide a Form Title and at least one field.',
      });
      return;
    }

    setSavingForm(true);
    setNotice(null);
    try {
      const url = editingFormId
        ? `/api/custom-forms/${editingFormId}`
        : '/api/custom-forms';
      const method = editingFormId ? 'PATCH' : 'POST';
      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          projectId: formProjectId ? Number(formProjectId) : null,
          expiresAt: formExpiresAt || null,
          isActive: formIsActive,
          fields,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not save temporary form.' });
        return;
      }

      let importedRowCount = 0;
      let importWarning = '';
      if (
        isAppOwner &&
        !editingFormId &&
        importExcelRowsOnPublish &&
        parsedExcelRows.length > 0 &&
        data?.id
      ) {
        try {
          const importRes = await authFetch(`/api/custom-forms/${data.id}/bulk-import`, {
            method: 'POST',
            body: JSON.stringify({ rows: parsedExcelRows }),
          });
          const importData = await importRes.json().catch(() => ({}));
          if (importRes.ok) {
            importedRowCount = Number(importData.importedCount) || 0;
          } else {
            importWarning = ` (Row import skipped: ${importData.error || 'failed'})`;
          }
        } catch {
          importWarning = ' (Form created, but row import failed.)';
        }
      }

      setNotice({
        type: 'success',
        text: editingFormId
          ? `Temporary form "${data.title}" updated.`
          : importedRowCount > 0
            ? `Temporary form "${data.title}" published with ${importedRowCount} imported row${importedRowCount === 1 ? '' : 's'}.${importWarning}`
            : `Temporary form "${data.title}" published for data collection.${importWarning}`,
      });
      clearExcelUpload();
      await loadWorkspace();
      onFormsChanged?.();
      setMode('list');
    } catch {
      setNotice({ type: 'error', text: 'Failed to save temporary form.' });
    } finally {
      setSavingForm(false);
    }
  };

  const handleToggleFormStatus = async (form: CustomForm) => {
    setNotice(null);
    try {
      const res = await authFetch(`/api/custom-forms/${form.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !form.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not toggle form status.' });
        return;
      }
      setForms((prev) =>
        prev.map((f) =>
          f.id === form.id ? { ...f, isActive: data.isActive } : f
        )
      );
      onFormsChanged?.();
      setNotice({
        type: 'success',
        text: `"${form.title}" is now ${data.isActive ? 'Active' : 'Closed'}.`,
      });
    } catch {
      setNotice({ type: 'error', text: 'Failed to update form status.' });
    }
  };

  const handleConfirmDeleteForm = async () => {
    if (!deleteFormTarget) return;
    setNotice(null);
    try {
      const res = await authFetch(`/api/custom-forms/${deleteFormTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice({ type: 'error', text: data.error || 'Could not delete form.' });
      } else {
        setForms((prev) => prev.filter((f) => f.id !== deleteFormTarget.id));
        onFormsChanged?.();
        setNotice({ type: 'success', text: `Deleted "${deleteFormTarget.title}".` });
      }
    } catch {
      setNotice({ type: 'error', text: 'Failed to delete form.' });
    } finally {
      setDeleteFormTarget(null);
    }
  };

  const openFillForm = (form: CustomForm) => {
    setActiveForm(form);
    setFillVillage('');
    const initial: Record<string, string | number | boolean> = {};
    form.fields.forEach((f) => {
      initial[f.id] = f.type === 'checkbox' ? false : '';
    });
    setFillValues(initial);
    setNotice(null);
    setMode('fill');
  };

  const handleSubmitTempFormEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;
    setSubmittingEntry(true);
    setNotice(null);
    try {
      const res = await authFetch(`/api/custom-forms/${activeForm.id}/submissions`, {
        method: 'POST',
        body: JSON.stringify({
          village: fillVillage,
          responses: fillValues,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'error', text: data.error || 'Could not submit entry.' });
        return;
      }
      setNotice({
        type: 'success',
        text: `Entry submitted to "${activeForm.title}".`,
      });
      // Reset inputs for fast continuous field data collection
      const cleared: Record<string, string | number | boolean> = {};
      activeForm.fields.forEach((f) => {
        cleared[f.id] = f.type === 'checkbox' ? false : '';
      });
      setFillValues(cleared);
      await loadWorkspace();
    } catch {
      setNotice({ type: 'error', text: 'Failed to submit response.' });
    } finally {
      setSubmittingEntry(false);
    }
  };

  const openResponses = async (form: CustomForm) => {
    setActiveForm(form);
    setMode('responses');
    setLoadingSubmissions(true);
    setNotice(null);
    try {
      const res = await authFetch(`/api/custom-forms/${form.id}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch {
      setNotice({ type: 'error', text: 'Could not load responses.' });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    try {
      const res = await authFetch(`/api/custom-forms/submissions/${submissionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice({ type: 'error', text: data.error || 'Could not delete submission.' });
        return;
      }
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      await loadWorkspace();
      setNotice({ type: 'success', text: 'Submission deleted.' });
    } catch {
      setNotice({ type: 'error', text: 'Failed to delete submission.' });
    }
  };

  const handleExportResponsesCSV = () => {
    if (!activeForm || !canExport || submissions.length === 0) return;
    const rows = submissions.map((s) => {
      const flat: Record<string, any> = {
        Submission_ID: s.id,
        Village: s.village || '',
        Submitted_By: s.submittedByEmail,
        Submitted_At: new Date(s.createdAt).toLocaleString(),
      };
      activeForm.fields.forEach((f) => {
        const v = s.responses?.[f.id];
        flat[f.label] = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v ?? '';
      });
      return flat;
    });
    const safeName = activeForm.title.replace(/[^a-zA-Z0-9_-]+/g, '_');
    downloadCSV(rows, `TempForm_${safeName}_Responses`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <FilePlus2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Temporary Data Collection Forms
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {canDesign
                ? 'Design custom temporary survey or field data collection forms on the fly, link them to projects, and collect live entries from field teams.'
                : 'Fill and submit active temporary data collection forms assigned by your Project Manager or Administrator.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mode !== 'list' && (
            <button
              onClick={() => setMode('list')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              ← Back to All Forms
            </button>
          )}
          {mode === 'list' && (
            <button
              onClick={loadWorkspace}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
          {isAppOwner && mode !== 'design' && (
            <button
              onClick={openExcelImportDesigner}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1.5"
              title="Owner Only: Design a temporary form directly from an Excel or CSV file"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Import Excel / CSV
            </button>
          )}
          {canDesign && mode !== 'design' && (
            <button
              onClick={openDesignerNew}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Design New Form
            </button>
          )}
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

      {/* MODE 1: FORM LIST */}
      {mode === 'list' && (
        <div>
          {forms.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <FilePlus2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">
                No Temporary Forms Available
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {canDesign
                  ? 'Need quick data collection for a seasonal drive, survey, or baseline check? Click "Design New Form" to build and publish a custom form in seconds.'
                  : 'No active temporary data collection forms are published right now.'}
              </p>
              {canDesign && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {isAppOwner && (
                    <button
                      onClick={openExcelImportDesigner}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Import from Excel / CSV
                    </button>
                  )}
                  <button
                    onClick={openDesignerNew}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Temporary Form
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {forms.map((form) => {
                const linkedProject = form.projectId ? projectMap.get(form.projectId) : null;
                const isExpired =
                  Boolean(form.expiresAt) &&
                  form.expiresAt! < new Date().toISOString().slice(0, 10);
                const canFill = form.isActive && !isExpired;

                return (
                  <div
                    key={form.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-200 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              canFill
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isExpired ? 'Expired' : form.isActive ? 'Active' : 'Closed'}
                          </span>
                          {linkedProject && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {linkedProject.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {form.fields.length} fields · {form.submissionCount || 0} entries
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{form.title}</h3>
                      {form.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {form.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>By {form.createdByEmail}</span>
                        {form.expiresAt && (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <Calendar className="w-3 h-3" />
                            Valid till {form.expiresAt}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openFillForm(form)}
                          disabled={!canFill}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Fill Form
                        </button>
                        <button
                          onClick={() => openResponses(form)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Table2 className="w-3.5 h-3.5" />
                          Responses ({form.submissionCount || 0})
                        </button>
                      </div>

                      {canDesign && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFormStatus(form)}
                            title={form.isActive ? 'Close form' : 'Re-open form'}
                            className="p-1.5 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 rounded transition"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDesignerEdit(form)}
                            title="Edit form fields"
                            className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteFormTarget(form)}
                            title="Delete form"
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: TEMPORARY FORM DESIGNER (Admin & Project Manager ONLY) */}
      {mode === 'design' && canDesign && (
        <form onSubmit={handleSaveFormDesign} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* App-Owner-Only Direct Excel (.xlsx/.xls) / CSV Upload Panel */}
          {isAppOwner && !editingFormId && (
            <div className="lg:col-span-12 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-white rounded-xl border border-emerald-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">
                        Design Form Directly from Excel (.xlsx / .xls) or CSV
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold uppercase">
                        <Lock className="w-2.5 h-2.5" />
                        Owner Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Upload any spreadsheet to automatically generate form columns, input types (Date, Number, Dropdown, Checkbox, Text), and optionally import existing rows.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={excelInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                    onChange={(e) => handleExcelFileSelected(e.target.files?.[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={parsingExcel}
                    onClick={() => excelInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {parsingExcel
                      ? 'Reading File...'
                      : workbookCtx
                        ? 'Choose Another File'
                        : 'Upload .xlsx / .csv File'}
                  </button>
                  {workbookCtx && (
                    <button
                      type="button"
                      onClick={clearExcelUpload}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {workbookCtx && (
                <div className="bg-white rounded-lg border border-emerald-200/80 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">Uploaded File</div>
                      <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {workbookCtx.fileName}
                      </div>
                    </div>

                    {workbookCtx.sheetNames.length > 1 ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Select Excel Sheet
                        </label>
                        <select
                          value={selectedSheet}
                          onChange={(e) => applySheetDraft(workbookCtx, e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                        >
                          {workbookCtx.sheetNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">Sheet</div>
                        <div className="text-xs font-semibold text-slate-800 mt-0.5">
                          {selectedSheet}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Column Header Row
                      </label>
                      <select
                        value={headerRowIndex}
                        onChange={(e) =>
                          applySheetDraft(workbookCtx, selectedSheet, Number(e.target.value))
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        {Array.from({ length: maxHeaderRowIndex + 1 }, (_, i) => (
                          <option key={i} value={i}>
                            Row {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {parsedExcelRows.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={importExcelRowsOnPublish}
                          onChange={(e) => setImportExcelRowsOnPublish(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>
                          Also import {parsedExcelRows.length} existing data row
                          {parsedExcelRows.length === 1 ? '' : 's'} into this form after publishing
                          {totalExcelRawRows > 500 ? ' (first 500 rows)' : ''}
                        </span>
                      </label>
                      {detectedVillageCol && (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Village mapped from &ldquo;{detectedVillageCol}&rdquo;
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Left: Metadata & Add Field Controls */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingFormId ? 'Edit Temporary Form Settings' : '1. Form Details'}
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Form Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Kharif Seed Distribution Rapid Survey"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Briefly explain what data field workers should collect..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link to Project (Optional)
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">General / All Projects</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Auto-Close / Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Publish form as Active immediately
              </label>
            </div>

            {/* Add Custom Field Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">2. Add Custom Question / Field</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g., Crop Area (Acre)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Input Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CustomFieldType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {(Object.keys(FIELD_TYPE_LABELS) as CustomFieldType[]).map((t) => (
                      <option key={t} value={t}>
                        {FIELD_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newType === 'select' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dropdown Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newOptionsText}
                    onChange={(e) => setNewOptionsText(e.target.value)}
                    placeholder="e.g., Paddy, Wheat, Maize, Pulses"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              ) : (
                newType !== 'checkbox' &&
                newType !== 'date' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Helper Placeholder (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPlaceholder}
                      onChange={(e) => setNewPlaceholder(e.target.value)}
                      placeholder="Short hint shown inside the input"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequired}
                    onChange={(e) => setNewRequired(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  Required field
                </label>

                <button
                  type="button"
                  onClick={handleAddFieldToDraft}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Structure & Publish */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  3. Form Structure Preview ({fields.length} fields)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Village field is included automatically
                </span>
              </div>

              {fields.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  Add fields from the left panel to build your temporary data collection form.
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {fields.map((field, idx) => {
                    const isEditing = editingFieldId === field.id;
                    return (
                      <div
                        key={field.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-800">
                                {idx + 1}. {field.label}
                              </span>
                              {field.required && (
                                <span className="text-[10px] font-bold text-rose-600">
                                  *Required
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {FIELD_TYPE_LABELS[field.type]}
                              {field.options && field.options.length > 0 && (
                                <span> · Options: {field.options.join(', ')}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingFieldId(isEditing ? null : field.id)
                              }
                              title="Edit field settings"
                              className={`p-1 rounded transition ${
                                isEditing
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'text-slate-400 hover:text-indigo-700'
                              }`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(idx, 1)}
                              disabled={idx === fields.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFields((prev) => prev.filter((f) => f.id !== field.id))
                              }
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-2.5 rounded-lg">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Field Label
                              </label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  handleUpdateFieldInline(field.id, {
                                    label: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Input Type
                              </label>
                              <select
                                value={field.type}
                                onChange={(e) =>
                                  handleUpdateFieldInline(field.id, {
                                    type: e.target.value as CustomFieldType,
                                  })
                                }
                                className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                              >
                                {(Object.keys(FIELD_TYPE_LABELS) as CustomFieldType[]).map(
                                  (t) => (
                                    <option key={t} value={t}>
                                      {FIELD_TYPE_LABELS[t]}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                            {field.type === 'select' && (
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                  Dropdown Options (comma-separated)
                                </label>
                                <input
                                  type="text"
                                  value={(field.options || []).join(', ')}
                                  onChange={(e) =>
                                    handleUpdateFieldInline(field.id, {
                                      options: e.target.value
                                        .split(',')
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                />
                              </div>
                            )}
                            <div className="sm:col-span-2 flex items-center justify-between">
                              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) =>
                                    handleUpdateFieldInline(field.id, {
                                      required: e.target.checked,
                                    })
                                  }
                                  className="rounded border-slate-300 text-indigo-600"
                                />
                                Required field
                              </label>
                              <button
                                type="button"
                                onClick={() => setEditingFieldId(null)}
                                className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingForm || fields.length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {savingForm
                  ? 'Saving...'
                  : editingFormId
                    ? 'Save Form Changes'
                    : 'Publish Temporary Form'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODE 3: FILL TEMPORARY FORM */}
      {mode === 'fill' && activeForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto">
          <div className="mb-5 pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">{activeForm.title}</h3>
            {activeForm.description && (
              <p className="text-xs text-slate-500 mt-1">{activeForm.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmitTempFormEntry} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Village / Location
              </label>
              <input
                list="temp-form-villages"
                value={fillVillage}
                onChange={(e) => setFillVillage(e.target.value)}
                placeholder="Select or type village name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="temp-form-villages">
                {availableVillagesForActiveForm.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            {activeForm.fields.map((field) => (
              <div key={field.id}>
                {field.type !== 'checkbox' && (
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {field.label}{' '}
                    {field.required && <span className="text-rose-500">*</span>}
                  </label>
                )}

                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={String(fillValues[field.id] ?? '')}
                    onChange={(e) =>
                      setFillValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    step="any"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={String(fillValues[field.id] ?? '')}
                    onChange={(e) =>
                      setFillValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                {field.type === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    value={String(fillValues[field.id] ?? '')}
                    onChange={(e) =>
                      setFillValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    required={field.required}
                    value={String(fillValues[field.id] ?? '')}
                    onChange={(e) =>
                      setFillValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select an option --</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={String(fillValues[field.id] ?? '')}
                    onChange={(e) =>
                      setFillValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                {field.type === 'checkbox' && (
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(fillValues[field.id])}
                      onChange={(e) =>
                        setFillValues((prev) => ({ ...prev, [field.id]: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      {field.label}{' '}
                      {field.required && <span className="text-rose-500">*</span>}
                    </span>
                  </label>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEntry}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingEntry ? 'Submitting...' : 'Submit Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODE 4: VIEW COLLECTED RESPONSES */}
      {mode === 'responses' && activeForm && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Collected Responses · {activeForm.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {submissions.length} record{submissions.length !== 1 ? 's' : ''} collected
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canExport && submissions.length > 0 && (
                <button
                  onClick={handleExportResponsesCSV}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {loadingSubmissions ? (
            <div className="p-10 text-center text-xs text-slate-400">Loading responses...</div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No responses submitted for this form yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-bold whitespace-nowrap">Date & By</th>
                    <th className="py-2.5 px-4 font-bold whitespace-nowrap">Village</th>
                    {activeForm.fields.map((f) => (
                      <th key={f.id} className="py-2.5 px-4 font-bold whitespace-nowrap">
                        {f.label}
                      </th>
                    ))}
                    {canDesign && (
                      <th className="py-2.5 px-4 font-bold text-right">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">
                          {sub.submittedByEmail}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(sub.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-blue-700 whitespace-nowrap">
                        {sub.village || '—'}
                      </td>
                      {activeForm.fields.map((f) => {
                        const val = sub.responses?.[f.id];
                        return (
                          <td key={f.id} className="py-2.5 px-4 text-slate-700">
                            {typeof val === 'boolean'
                              ? val
                                ? 'Yes'
                                : 'No'
                              : val !== undefined && val !== ''
                                ? String(val)
                                : '—'}
                          </td>
                        );
                      })}
                      {canDesign && (
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Form Confirmation Modal */}
      {deleteFormTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Temporary Form?</h3>
            <p className="text-xs text-slate-600">
              Delete <strong>{deleteFormTarget.title}</strong> and all of its collected
              responses? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteFormTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteForm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Delete Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
