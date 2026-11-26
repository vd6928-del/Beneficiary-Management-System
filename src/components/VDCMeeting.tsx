/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Form7VDCMeetingRecord, Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import { PlusCircle, Search, Edit2, Trash2, Download, Check, MessageSquare, RefreshCw } from 'lucide-react';

interface VDCMeetingProps {
  vdcMeetings: Form7VDCMeetingRecord[];
  beneficiaries: Beneficiary[];
  onAdd: (v: Form7VDCMeetingRecord) => void;
  onUpdate: (v: Form7VDCMeetingRecord) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function VDCMeeting({
  vdcMeetings,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: VDCMeetingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [village, setVillage] = useState<VillageType>('Sukhram');
  const [placeOfMeeting, setPlaceOfMeeting] = useState('');
  const [year, setYear] = useState('2025-26');
  const [date, setDate] = useState('');
  const [nameOfParticipant, setNameOfParticipant] = useState('');
  const [headOfHH, setHeadOfHH] = useState<'Yes' | 'No'>('Yes');
  const [hamletTola, setHamletTola] = useState('');
  const [samagraIdNo, setSamagraIdNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [meetingsAttended, setMeetingsAttended] = useState<number | ''>('');
  const [agenda, setAgenda] = useState('');
  const [decisionTaken, setDecisionTaken] = useState('');
  const [activityImplementation, setActivityImplementation] = useState('');

  // Table Search
  const [searchTerm, setSearchTerm] = useState('');

  const handleAutofill = (b: Beneficiary) => {
    setNameOfParticipant(b.name);
    setVillage(b.village);
    setHeadOfHH(b.headOfHH || 'Yes');
    if (b.hamletTola) setHamletTola(b.hamletTola);
    if (b.samagraId) setSamagraIdNo(b.samagraId);
    if (b.mobileNo) setMobileNo(b.mobileNo);
  };

  const handleEdit = (v: Form7VDCMeetingRecord) => {
    setIsEditing(true);
    setEditId(v.id);
    setVillage(v.village);
    setPlaceOfMeeting(v.placeOfMeeting);
    setYear(v.year);
    setDate(v.date);
    setNameOfParticipant(v.nameOfParticipant);
    setHeadOfHH(v.headOfHH);
    setHamletTola(v.hamletTola);
    setSamagraIdNo(v.samagraIdNo);
    setMobileNo(v.mobileNo);
    setMeetingsAttended(v.meetingsAttended);
    setAgenda(v.agenda);
    setDecisionTaken(v.decisionTaken);
    setActivityImplementation(v.activityImplementation);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setVillage('Sukhram');
    setPlaceOfMeeting('');
    setYear('2025-26');
    setDate('');
    setNameOfParticipant('');
    setHeadOfHH('Yes');
    setHamletTola('');
    setSamagraIdNo('');
    setMobileNo('');
    setMeetingsAttended('');
    setAgenda('');
    setDecisionTaken('');
    setActivityImplementation('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOfParticipant || !placeOfMeeting || !agenda || !date) {
      alert("Participant Name, Meeting Place, Agenda, and Date are required.");
      return;
    }

    const vdcData: Form7VDCMeetingRecord = {
      id: isEditing && editId ? editId : generateId(),
      village,
      placeOfMeeting: placeOfMeeting.trim(),
      year,
      date,
      nameOfParticipant: nameOfParticipant.trim(),
      headOfHH,
      hamletTola: hamletTola.trim() || 'Main Hamlet',
      samagraIdNo: samagraIdNo.trim() || 'N/A',
      mobileNo: mobileNo.trim() || 'N/A',
      meetingsAttended: Number(meetingsAttended) || 1,
      agenda: agenda.trim(),
      decisionTaken: decisionTaken.trim(),
      activityImplementation: activityImplementation.trim(),
      createdAt: isEditing && editId 
        ? (vdcMeetings.find(vd => vd.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(vdcData);
    } else {
      onAdd(vdcData);
    }
    resetForm();
  };

  const filtered = vdcMeetings.filter(v => 
    v.nameOfParticipant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.placeOfMeeting.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.agenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.decisionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-h-[1000px] overflow-y-auto pr-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-sans">
              {isEditing ? 'Edit VDC Meeting Record' : 'Record VDC Meeting'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Form 7: Village Development Committee deliberations, agendas and decisions.
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {VILLAGES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Meeting <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Place of Meeting <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={placeOfMeeting}
                onChange={(e) => setPlaceOfMeeting(e.target.value)}
                placeholder="e.g., GP Bhawan, Community Hall"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none"
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Participant details</h3>
            
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Head of Household (HH)?
                </label>
                <div className="flex gap-2">
                  {(['Yes', 'No'] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHeadOfHH(h)}
                      className={`flex-1 py-1.5 px-3 text-xs border rounded-lg font-medium transition-all ${
                        headOfHH === h 
                          ? 'bg-orange-600 text-white border-orange-600' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Hamlet / Tola
                </label>
                <input
                  type="text"
                  value={hamletTola}
                  onChange={(e) => setHamletTola(e.target.value)}
                  placeholder="e.g., Gond Tola"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Samagra ID No.
                </label>
                <input
                  type="text"
                  value={samagraIdNo}
                  onChange={(e) => setSamagraIdNo(e.target.value)}
                  placeholder="Samagra ID"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  placeholder="Mobile"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  No. of meetings attended *
                </label>
                <input
                  type="number"
                  value={meetingsAttended}
                  onChange={(e) => setMeetingsAttended(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Count"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Minutes & decisions</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Agenda of Meeting <span className="text-red-500">*</span>
              </label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="What was the core topic of the meeting..."
                rows={2.5}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Decision taken by group <span className="text-red-500">*</span>
              </label>
              <textarea
                value={decisionTaken}
                onChange={(e) => setDecisionTaken(e.target.value)}
                placeholder="Key agreements and approvals..."
                rows={2.5}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Activity implementation related to meeting agenda <span className="text-red-500">*</span>
              </label>
              <textarea
                value={activityImplementation}
                onChange={(e) => setActivityImplementation(e.target.value)}
                placeholder="How will this decision be actioned in the field..."
                rows={2.5}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                required
              />
            </div>
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
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update VDC Log' : 'Add VDC Meeting Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Submitted Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900 font-sans">VDC Meeting Deliberation Logs</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {filtered.length} entries
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by participant, place, agenda, decision, or village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <th className="p-3">Participant details</th>
                <th className="p-3">Meeting details</th>
                <th className="p-3">Minutes & Agendas</th>
                <th className="p-3">Decisions & Implementations</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No VDC meeting records found.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{v.nameOfParticipant}</div>
                      <div className="text-[10px] text-gray-500">Head of HH: {v.headOfHH} • {v.hamletTola}</div>
                      <div className="text-[10px] text-gray-400">Samagra: {v.samagraIdNo} | Mob: {v.mobileNo}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-orange-950">{v.village}</div>
                      <div className="text-[10px] text-gray-500">{v.placeOfMeeting}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{v.date} ({v.year})</div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-1">Attended: {v.meetingsAttended} meets</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-gray-800 max-w-[150px] truncate" title={v.agenda}>
                        Agenda: <span className="font-normal text-gray-600">{v.agenda}</span>
                      </div>
                    </td>
                    <td className="p-3 space-y-1">
                      <div className="text-[10px] font-medium text-gray-900 max-w-[180px]" title={v.decisionTaken}>
                        <span className="font-bold text-emerald-800">Decision:</span> {v.decisionTaken}
                      </div>
                      <div className="text-[10px] text-orange-850 max-w-[180px]" title={v.activityImplementation}>
                        <span className="font-bold">Implementation:</span> {v.activityImplementation}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(v)}
                          className="p-1.5 bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this VDC meeting entry?')) {
                              onDelete(v.id);
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
