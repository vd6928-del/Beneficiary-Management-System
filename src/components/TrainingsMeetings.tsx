/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Form2TrainingMeeting, Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import { PlusCircle, Search, Edit2, Trash2, Download, Check, Users, RefreshCw } from 'lucide-react';

interface TrainingsMeetingsProps {
  trainings: Form2TrainingMeeting[];
  beneficiaries: Beneficiary[];
  onAdd: (t: Form2TrainingMeeting) => void;
  onUpdate: (t: Form2TrainingMeeting) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function TrainingsMeetings({
  trainings,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: TrainingsMeetingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [cluster, setCluster] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [village, setVillage] = useState<VillageType>('Sukhram');
  const [uniqueId, setUniqueId] = useState('');
  const [nameOfParticipant, setNameOfParticipant] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobileNo, setMobileNo] = useState('');
  const [theme, setTheme] = useState('');
  const [activityName, setActivityName] = useState('');
  const [dateOfTrainingMeeting, setDateOfTrainingMeeting] = useState('');
  const [year, setYear] = useState('2025-26');
  const [beneficiaryType, setBeneficiaryType] = useState<'Direct' | 'Indirect'>('Direct');
  const [agenda, setAgenda] = useState('');
  const [remarks, setRemarks] = useState('');

  // Table Search
  const [searchTerm, setSearchTerm] = useState('');

  const handleAutofill = (b: Beneficiary) => {
    setUniqueId(b.uniqueId);
    setNameOfParticipant(b.name);
    setFatherHusbandName(b.fatherHusbandName);
    setGender(b.gender);
    setVillage(b.village);
    if (b.cluster) setCluster(b.cluster);
    if (b.gramPanchayat) setGramPanchayat(b.gramPanchayat);
    if (b.mobileNo) setMobileNo(b.mobileNo);
  };

  const handleEdit = (t: Form2TrainingMeeting) => {
    setIsEditing(true);
    setEditId(t.id);
    setCluster(t.cluster);
    setGramPanchayat(t.gramPanchayat);
    setVillage(t.village);
    setUniqueId(t.uniqueId);
    setNameOfParticipant(t.nameOfParticipant);
    setFatherHusbandName(t.fatherHusbandName);
    setGender(t.gender);
    setMobileNo(t.mobileNo);
    setTheme(t.theme);
    setActivityName(t.activityName);
    setDateOfTrainingMeeting(t.dateOfTrainingMeeting);
    setYear(t.year);
    setBeneficiaryType(t.beneficiaryType);
    setAgenda(t.agenda);
    setRemarks(t.remarks || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setCluster('');
    setGramPanchayat('');
    setVillage('Sukhram');
    setUniqueId('');
    setNameOfParticipant('');
    setFatherHusbandName('');
    setGender('Male');
    setMobileNo('');
    setTheme('');
    setActivityName('');
    setDateOfTrainingMeeting('');
    setYear('2025-26');
    setBeneficiaryType('Direct');
    setAgenda('');
    setRemarks('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOfParticipant || !uniqueId || !activityName || !dateOfTrainingMeeting) {
      alert("Participant Name, Unique ID, Activity, and Date are required.");
      return;
    }

    const trainingData: Form2TrainingMeeting = {
      id: isEditing && editId ? editId : generateId(),
      cluster: cluster.trim() || `${village} Cluster`,
      gramPanchayat: gramPanchayat.trim() || `${village} GP`,
      village,
      uniqueId: uniqueId.trim(),
      nameOfParticipant: nameOfParticipant.trim(),
      fatherHusbandName: fatherHusbandName.trim(),
      gender,
      mobileNo: mobileNo.trim(),
      theme: theme.trim() || 'General Capacity Building',
      activityName: activityName.trim(),
      dateOfTrainingMeeting,
      year,
      beneficiaryType,
      agenda: agenda.trim(),
      remarks: remarks.trim() || undefined,
      createdAt: isEditing && editId 
        ? (trainings.find(tr => tr.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(trainingData);
    } else {
      onAdd(trainingData);
    }
    resetForm();
  };

  const filtered = trainings.filter(t => 
    t.nameOfParticipant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.agenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Training/Meeting' : 'Record Training/Meeting'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Form 2: Tracks farmer presence, agenda, and outcomes of key events.
            </p>
          </div>
        </div>

        {!isEditing && (
          <BeneficiarySearchSelect beneficiaries={beneficiaries} onSelect={handleAutofill} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Village <span className="text-red-500">*</span>
              </label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value as VillageType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {VILLAGES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Unique ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="BEN-SUK-123"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Name of Participant <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameOfParticipant}
                onChange={(e) => setNameOfParticipant(e.target.value)}
                placeholder="Participant Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Father / Husband Name
              </label>
              <input
                type="text"
                value={fatherHusbandName}
                onChange={(e) => setFatherHusbandName(e.target.value)}
                placeholder="Relative's Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex gap-2">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-1.5 px-3 text-xs border rounded-lg font-medium transition-all ${
                      gender === g 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cluster
              </label>
              <input
                type="text"
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                placeholder="Cluster"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gram Panchayat
              </label>
              <input
                type="text"
                value={gramPanchayat}
                onChange={(e) => setGramPanchayat(e.target.value)}
                placeholder="GP Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Theme
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Organic Farming"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Activity Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="e.g., Vermicomposting Training"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateOfTrainingMeeting}
                onChange={(e) => setDateOfTrainingMeeting(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                User Group type
              </label>
              <div className="flex gap-2">
                {(['Direct', 'Indirect'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBeneficiaryType(t)}
                    className={`flex-1 py-1.5 px-3 text-xs border rounded-lg font-medium transition-all ${
                      beneficiaryType === t 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Agenda of Training/Meeting <span className="text-red-500">*</span>
            </label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Provide a detailed description of topics covered..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Outcome, next actions, feedback..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 flex gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update Training' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Submitted Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 font-sans">Trainings & Meetings Attendance</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {filtered.length} attendees
            </span>
          </div>

          <button
            onClick={onExportCSV}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search attendees, activities, agendas, or villages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <th className="p-3">Participant</th>
                <th className="p-3">Location & Mob</th>
                <th className="p-3">Activity & Agenda</th>
                <th className="p-3">Theme & Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No attendee records found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{t.nameOfParticipant}</div>
                      <div className="font-mono text-[10px] text-gray-400">{t.uniqueId}</div>
                      <div className="text-[10px] text-gray-500">Rel: {t.fatherHusbandName}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{t.village}</div>
                      <div className="text-[10px] text-gray-400">GP: {t.gramPanchayat}</div>
                      {t.mobileNo && <div className="text-[10px] text-gray-500 font-mono">{t.mobileNo}</div>}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-indigo-900">{t.activityName}</div>
                      <p className="text-[10px] text-gray-500 font-medium max-w-[200px]" title={t.agenda}>
                        Agenda: <span className="text-gray-600 font-normal">{t.agenda}</span>
                      </p>
                      {t.remarks && (
                        <div className="text-[9px] text-gray-400 italic max-w-[200px] truncate" title={t.remarks}>
                          * {t.remarks}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{t.theme}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{t.dateOfTrainingMeeting}</div>
                      <div className="text-[10px] text-gray-500 font-semibold">{t.year} • {t.beneficiaryType}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this attendance record?')) {
                              onDelete(t.id);
                            }
                          }}
                          className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-700 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
