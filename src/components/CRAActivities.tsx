/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Form1CRAActivity, Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import { PlusCircle, Search, Edit2, Trash2, Download, Check, ClipboardList, RefreshCw } from 'lucide-react';

interface CRAActivitiesProps {
  activities: Form1CRAActivity[];
  beneficiaries: Beneficiary[];
  onAdd: (act: Form1CRAActivity) => void;
  onUpdate: (act: Form1CRAActivity) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function CRAActivities({
  activities,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: CRAActivitiesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [cluster, setCluster] = useState('');
  const [village, setVillage] = useState<VillageType>('Sukhram');
  const [uniqueId, setUniqueId] = useState('');
  const [nameOfFarmer, setNameOfFarmer] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [beneficiaryType, setBeneficiaryType] = useState<'Direct' | 'Indirect'>('Direct');
  const [year, setYear] = useState('2025-26');
  const [season, setSeason] = useState('Rabi');
  const [theme, setTheme] = useState('Climate Resilient Agriculture');
  const [activityName, setActivityName] = useState('');
  const [unit1Name, setUnit1Name] = useState('Area Covered (Acre)');
  const [unit1Value, setUnit1Value] = useState<number | ''>('');
  const [unit2Name, setUnit2Name] = useState('Seed Quantity (Kg)');
  const [unit2Value, setUnit2Value] = useState<number | ''>('');
  const [unit3Name, setUnit3Name] = useState('Yield Percentage (%)');
  const [unit3Value, setUnit3Value] = useState<number | ''>('');
  const [remark, setRemark] = useState('');

  // Table Search
  const [searchTerm, setSearchTerm] = useState('');

  const handleAutofill = (b: Beneficiary) => {
    setUniqueId(b.uniqueId);
    setNameOfFarmer(b.name);
    setFatherHusbandName(b.fatherHusbandName);
    setGender(b.gender);
    setVillage(b.village);
    if (b.cluster) setCluster(b.cluster);
  };

  const handleEdit = (act: Form1CRAActivity) => {
    setIsEditing(true);
    setEditId(act.id);
    setCluster(act.cluster);
    setVillage(act.village);
    setUniqueId(act.uniqueId);
    setNameOfFarmer(act.nameOfFarmer);
    setFatherHusbandName(act.fatherHusbandName);
    setGender(act.gender);
    setBeneficiaryType(act.beneficiaryType);
    setYear(act.year);
    setSeason(act.season);
    setTheme(act.theme);
    setActivityName(act.activityName);
    setUnit1Name(act.unit1Name);
    setUnit1Value(act.unit1Value);
    setUnit2Name(act.unit2Name || '');
    setUnit2Value(act.unit2Value !== undefined ? act.unit2Value : '');
    setUnit3Name(act.unit3Name || '');
    setUnit3Value(act.unit3Value !== undefined ? act.unit3Value : '');
    setRemark(act.remark || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setCluster('');
    setVillage('Sukhram');
    setUniqueId('');
    setNameOfFarmer('');
    setFatherHusbandName('');
    setGender('Male');
    setBeneficiaryType('Direct');
    setYear('2025-26');
    setSeason('Rabi');
    setTheme('Climate Resilient Agriculture');
    setActivityName('');
    setUnit1Name('Area Covered (Acre)');
    setUnit1Value('');
    setUnit2Name('Seed Quantity (Kg)');
    setUnit2Value('');
    setUnit3Name('Yield Percentage (%)');
    setUnit3Value('');
    setRemark('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOfFarmer || !uniqueId || !activityName) {
      alert("Farmer Name, Unique ID, and Activity Name are required.");
      return;
    }

    const activityData: Form1CRAActivity = {
      id: isEditing && editId ? editId : generateId(),
      cluster: cluster.trim() || `${village} Cluster`,
      village,
      uniqueId: uniqueId.trim(),
      nameOfFarmer: nameOfFarmer.trim(),
      fatherHusbandName: fatherHusbandName.trim(),
      gender,
      beneficiaryType,
      year,
      season,
      theme,
      activityName: activityName.trim(),
      unit1Name: unit1Name.trim(),
      unit1Value: Number(unit1Value) || 0,
      unit2Name: unit2Name.trim() || undefined,
      unit2Value: unit2Value !== '' ? Number(unit2Value) : undefined,
      unit3Name: unit3Name.trim() || undefined,
      unit3Value: unit3Value !== '' ? Number(unit3Value) : undefined,
      remark: remark.trim() || undefined,
      createdAt: isEditing && editId 
        ? (activities.find(a => a.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(activityData);
    } else {
      onAdd(activityData);
    }
    resetForm();
  };

  const filtered = activities.filter(act => 
    act.nameOfFarmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit CRA Activity' : 'Record CRA Activity'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Climate Resilient Agriculture intervention tracking.
            </p>
          </div>
        </div>

        {/* Master Beneficiary Autofill Section */}
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {VILLAGES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Farmer Unique ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="BEN-SUK-123"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Name of Farmer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameOfFarmer}
                onChange={(e) => setNameOfFarmer(e.target.value)}
                placeholder="Farmer's Full Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        ? 'bg-teal-600 text-white border-teal-600' 
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
                Beneficiary Type (User Group)
              </label>
              <div className="flex gap-2">
                {(['Direct', 'Indirect'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBeneficiaryType(t)}
                    className={`flex-1 py-1.5 px-3 text-xs border rounded-lg font-medium transition-all ${
                      beneficiaryType === t 
                        ? 'bg-teal-600 text-white border-teal-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
                <option value="Whole Year">Whole Year</option>
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
                placeholder="e.g., Cluster-A"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                placeholder="e.g., Crop diversification"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                placeholder="e.g., Ridge and Furrow sowing"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Unit Metric Grid */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Intervention Metrics</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Unit-1 Name</label>
                <input
                  type="text"
                  value={unit1Name}
                  onChange={(e) => setUnit1Name(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Unit-1 Value</label>
                <input
                  type="number"
                  step="any"
                  value={unit1Value}
                  onChange={(e) => setUnit1Value(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Unit-2 Name (Optional)</label>
                <input
                  type="text"
                  value={unit2Name}
                  onChange={(e) => setUnit2Name(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Unit-2 Value (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={unit2Value}
                  onChange={(e) => setUnit2Value(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Unit-3 Name (Optional)</label>
                <input
                  type="text"
                  value={unit3Name}
                  onChange={(e) => setUnit3Name(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Unit-3 Value (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={unit3Value}
                  onChange={(e) => setUnit3Value(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Observation, benefits, remarks..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update Intervention' : 'Add Intervention'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Submitted Table / Log */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-gray-900">Submitted CRA Records</h2>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {filtered.length} logs
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

        {/* Search row */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by farmer name, ID, village, or activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        {/* Table view */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <th className="p-3">Farmer & ID</th>
                <th className="p-3">Location</th>
                <th className="p-3">Activity</th>
                <th className="p-3">Theme & Season</th>
                <th className="p-3">Metrics</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No CRA activity records found.
                  </td>
                </tr>
              ) : (
                filtered.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{act.nameOfFarmer}</div>
                      <div className="font-mono text-[10px] text-gray-400">{act.uniqueId}</div>
                      <div className="text-[10px] text-gray-500">Gender: {act.gender} | Type: {act.beneficiaryType}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{act.village}</div>
                      <div className="text-[10px] text-gray-400">{act.cluster}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-teal-900">{act.activityName}</div>
                      {act.remark && <div className="text-[10px] text-gray-500 italic truncate max-w-[150px]" title={act.remark}>{act.remark}</div>}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{act.theme}</div>
                      <div className="text-[10px] text-gray-500">{act.season} • {act.year}</div>
                    </td>
                    <td className="p-3 space-y-0.5">
                      <div className="text-[10px]">
                        <span className="text-gray-400">{act.unit1Name}:</span> <span className="font-semibold text-gray-700">{act.unit1Value}</span>
                      </div>
                      {act.unit2Name && act.unit2Value !== undefined && (
                        <div className="text-[10px]">
                          <span className="text-gray-400">{act.unit2Name}:</span> <span className="font-semibold text-gray-700">{act.unit2Value}</span>
                        </div>
                      )}
                      {act.unit3Name && act.unit3Value !== undefined && (
                        <div className="text-[10px]">
                          <span className="text-gray-400">{act.unit3Name}:</span> <span className="font-semibold text-gray-700">{act.unit3Value}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(act)}
                          className="p-1.5 bg-gray-50 hover:bg-teal-50 text-gray-500 hover:text-teal-700 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this record?')) {
                              onDelete(act.id);
                            }
                          }}
                          className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-700 rounded transition"
                          title="Delete"
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
