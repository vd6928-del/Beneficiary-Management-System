/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Form3HealthNutrition, Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import { PlusCircle, Search, Edit2, Trash2, Download, Check, Heart, RefreshCw } from 'lucide-react';

interface HealthNutritionProps {
  nutritionLogs: Form3HealthNutrition[];
  beneficiaries: Beneficiary[];
  onAdd: (hn: Form3HealthNutrition) => void;
  onUpdate: (hn: Form3HealthNutrition) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function HealthNutrition({
  nutritionLogs,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: HealthNutritionProps) {
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
  const [season, setSeason] = useState('Whole Year');
  const [theme, setTheme] = useState('Nutri-Kitchen Garden');
  const [activityName, setActivityName] = useState('');
  const [areaHa, setAreaHa] = useState<number | ''>('');
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

  const handleEdit = (hn: Form3HealthNutrition) => {
    setIsEditing(true);
    setEditId(hn.id);
    setCluster(hn.cluster);
    setVillage(hn.village);
    setUniqueId(hn.uniqueId);
    setNameOfFarmer(hn.nameOfFarmer);
    setFatherHusbandName(hn.fatherHusbandName);
    setGender(hn.gender);
    setBeneficiaryType(hn.beneficiaryType);
    setYear(hn.year);
    setSeason(hn.season);
    setTheme(hn.theme);
    setActivityName(hn.activityName);
    setAreaHa(hn.areaHa);
    setRemark(hn.remark || '');

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
    setSeason('Whole Year');
    setTheme('Nutri-Kitchen Garden');
    setActivityName('');
    setAreaHa('');
    setRemark('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOfFarmer || !uniqueId || !activityName || areaHa === '') {
      alert("Farmer Name, Unique ID, Activity, and Area (ha) are required.");
      return;
    }

    const nutritionData: Form3HealthNutrition = {
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
      areaHa: Number(areaHa) || 0,
      remark: remark.trim() || undefined,
      createdAt: isEditing && editId 
        ? (nutritionLogs.find(n => n.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(nutritionData);
    } else {
      onAdd(nutritionData);
    }
    resetForm();
  };

  const filtered = nutritionLogs.filter(hn => 
    hn.nameOfFarmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hn.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hn.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hn.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Health & Nutrition' : 'Record Health & Nutrition'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Form 3: Circular nutri-gardens and village dietary health interventions.
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                        ? 'bg-rose-600 text-white border-rose-600' 
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
                        ? 'bg-rose-600 text-white border-rose-600' 
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                placeholder="Cluster Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                placeholder="e.g., Nutri-Kitchen Garden"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                placeholder="e.g., Backyard Seed kit distribution"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Area Covered (Hectares) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={areaHa}
              onChange={(e) => setAreaHa(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 0.02"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Remark</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Health status, species planted, remarks..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update Entry' : 'Record Interventions'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: List Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-gray-900">Health & Nutrition Records</h2>
            <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2 py-0.5 rounded-full">
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, village, or activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          />
        </div>

        {/* Table view */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <th className="p-3">Farmer & ID</th>
                <th className="p-3">Location</th>
                <th className="p-3">Activity & Details</th>
                <th className="p-3">Area (Ha)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((hn) => (
                  <tr key={hn.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{hn.nameOfFarmer}</div>
                      <div className="font-mono text-[10px] text-gray-400">{hn.uniqueId}</div>
                      <div className="text-[10px] text-gray-500">Gender: {hn.gender} • {hn.beneficiaryType}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{hn.village}</div>
                      <div className="text-[10px] text-gray-400">{hn.cluster}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-rose-900">{hn.activityName}</div>
                      <div className="text-[10px] text-gray-500">{hn.theme} • {hn.season} • {hn.year}</div>
                      {hn.remark && <div className="text-[10px] text-gray-400 italic mt-0.5" title={hn.remark}>{hn.remark}</div>}
                    </td>
                    <td className="p-3 font-semibold text-gray-700 font-mono">
                      {hn.areaHa} ha
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(hn)}
                          className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this record?')) {
                              onDelete(hn.id);
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
