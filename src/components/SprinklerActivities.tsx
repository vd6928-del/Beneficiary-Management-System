/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Form5SprinklerActivity, Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import { PlusCircle, Search, Edit2, Trash2, Download, Check, Droplets, RefreshCw } from 'lucide-react';

interface SprinklerActivitiesProps {
  sprinklers: Form5SprinklerActivity[];
  beneficiaries: Beneficiary[];
  onAdd: (s: Form5SprinklerActivity) => void;
  onUpdate: (s: Form5SprinklerActivity) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function SprinklerActivities({
  sprinklers,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: SprinklerActivitiesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [cluster, setCluster] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [village, setVillage] = useState<VillageType>('Sukhram');
  const [year, setYear] = useState('2025-26');
  const [nameOfFarmer, setNameOfFarmer] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [theme, setTheme] = useState('Micro Irrigation');
  const [activity, setActivity] = useState('');
  const [beneficiaryType, setBeneficiaryType] = useState<'Direct' | 'Indirect'>('Direct');
  const [khasraNo, setKhasraNo] = useState('');
  const [contributionAmount, setContributionAmount] = useState<number | ''>('');
  const [receiptNo, setReceiptNo] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [areaCoveredHac, setAreaCoveredHac] = useState<number | ''>('');
  const [photo1, setPhoto1] = useState('Available');
  const [photo2, setPhoto2] = useState('Available');
  const [relatedDocuments, setRelatedDocuments] = useState('');

  // Table Search
  const [searchTerm, setSearchTerm] = useState('');

  const handleAutofill = (b: Beneficiary) => {
    setUniqueId(b.uniqueId);
    setNameOfFarmer(b.name);
    setFatherHusbandName(b.fatherHusbandName);
    setGender(b.gender);
    setVillage(b.village);
    if (b.cluster) setCluster(b.cluster);
    if (b.gramPanchayat) setGramPanchayat(b.gramPanchayat);
    if (b.mobileNo) setMobileNo(b.mobileNo);
  };

  const handleEdit = (s: Form5SprinklerActivity) => {
    setIsEditing(true);
    setEditId(s.id);
    setCluster(s.cluster);
    setGramPanchayat(s.gramPanchayat);
    setVillage(s.village);
    setYear(s.year);
    setNameOfFarmer(s.nameOfFarmer);
    setFatherHusbandName(s.fatherHusbandName);
    setGender(s.gender);
    setTheme(s.theme);
    setActivity(s.activity);
    setBeneficiaryType(s.beneficiaryType);
    setKhasraNo(s.khasraNo);
    setContributionAmount(s.contributionAmount);
    setReceiptNo(s.receiptNo);
    setUniqueId(s.uniqueId);
    setMobileNo(s.mobileNo);
    setAreaCoveredHac(s.areaCoveredHac);
    setPhoto1(s.photo1 || 'Available');
    setPhoto2(s.photo2 || 'Available');
    setRelatedDocuments(s.relatedDocuments || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setCluster('');
    setGramPanchayat('');
    setVillage('Sukhram');
    setYear('2025-26');
    setNameOfFarmer('');
    setFatherHusbandName('');
    setGender('Male');
    setTheme('Micro Irrigation');
    setActivity('');
    setBeneficiaryType('Direct');
    setKhasraNo('');
    setContributionAmount('');
    setReceiptNo('');
    setUniqueId('');
    setMobileNo('');
    setAreaCoveredHac('');
    setPhoto1('Available');
    setPhoto2('Available');
    setRelatedDocuments('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOfFarmer || !uniqueId || !activity || contributionAmount === '' || areaCoveredHac === '') {
      alert("Farmer Name, Unique ID, Activity, Contribution, and Area Covered are required.");
      return;
    }

    const sprinklerData: Form5SprinklerActivity = {
      id: isEditing && editId ? editId : generateId(),
      cluster: cluster.trim() || `${village} Cluster`,
      gramPanchayat: gramPanchayat.trim() || `${village} GP`,
      village,
      year,
      nameOfFarmer: nameOfFarmer.trim(),
      fatherHusbandName: fatherHusbandName.trim(),
      gender,
      theme,
      activity: activity.trim(),
      beneficiaryType,
      khasraNo: khasraNo.trim(),
      contributionAmount: Number(contributionAmount),
      receiptNo: receiptNo.trim() || 'N/A',
      uniqueId: uniqueId.trim(),
      mobileNo: mobileNo.trim(),
      areaCoveredHac: Number(areaCoveredHac),
      photo1,
      photo2,
      relatedDocuments: relatedDocuments.trim() || undefined,
      createdAt: isEditing && editId 
        ? (sprinklers.find(sp => sp.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(sprinklerData);
    } else {
      onAdd(sprinklerData);
    }
    resetForm();
  };

  const filtered = sprinklers.filter(s => 
    s.nameOfFarmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Sprinkler Activity' : 'Record Sprinkler Activity'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Form 5: Micro irrigation, sprinkler sets, subsidies, and farmer shares.
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                        ? 'bg-sky-600 text-white border-sky-600' 
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
                placeholder="Mobile Number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                placeholder="GP"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Activity / Intervention <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g., Sprinkler installation (15 nozzles)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Beneficiary type
              </label>
              <div className="flex gap-2">
                {(['Direct', 'Indirect'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBeneficiaryType(t)}
                    className={`flex-1 py-1.5 px-3 text-xs border rounded-lg font-medium transition-all ${
                      beneficiaryType === t 
                        ? 'bg-sky-600 text-white border-sky-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Khasra No.
              </label>
              <input
                type="text"
                value={khasraNo}
                onChange={(e) => setKhasraNo(e.target.value)}
                placeholder="Land Survey No."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contribution (Rs) *</label>
              <input
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contribution Amount"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Receipt No.</label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="Receipt No."
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Area Covered (ha) *</label>
              <input
                type="number"
                step="any"
                value={areaCoveredHac}
                onChange={(e) => setAreaCoveredHac(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Area in Hectare"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Photo-1 Status</label>
              <select
                value={photo1}
                onChange={(e) => setPhoto1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Photo-2 Status</label>
              <select
                value={photo2}
                onChange={(e) => setPhoto2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Related Documents & Verification remarks</label>
            <input
              type="text"
              value={relatedDocuments}
              onChange={(e) => setRelatedDocuments(e.target.value)}
              placeholder="e.g., Land map attached, subsidy verified"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update Sprinkler Activity' : 'Add Sprinkler Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Submitted Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-bold text-gray-900">Sprinkler Projects Directory</h2>
            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded-full">
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
            placeholder="Search by farmer, receipt no, activity, or village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>

        {/* Table view */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <th className="p-3">Farmer Details</th>
                <th className="p-3">Location & ID</th>
                <th className="p-3">Activity & Theme</th>
                <th className="p-3">Financials</th>
                <th className="p-3">Evidences</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{s.nameOfFarmer}</div>
                      <div className="text-[10px] text-gray-500">Father: {s.fatherHusbandName || 'N/A'}</div>
                      <div className="text-[10px] text-gray-400">Gender: {s.gender} • Mobile: {s.mobileNo || 'N/A'}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{s.village}</div>
                      <div className="text-[10px] text-gray-400">GP: {s.gramPanchayat}</div>
                      <div className="font-mono text-[9px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded inline-block mt-0.5">{s.uniqueId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-sky-900">{s.activity}</div>
                      <div className="text-[10px] text-gray-500">{s.theme} • {s.year} • {s.beneficiaryType}</div>
                      {s.khasraNo && <div className="text-[10px] text-gray-400 font-mono">Khasra: {s.khasraNo}</div>}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-700">Contr: ₹{s.contributionAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500 font-mono">Receipt: {s.receiptNo}</div>
                      <div className="text-[10px] text-sky-700 font-bold mt-0.5">Area: {s.areaCoveredHac} ha</div>
                    </td>
                    <td className="p-3 space-y-0.5">
                      <div className="text-[10px]">Photo-1: <span className={`font-semibold ${s.photo1 === 'Available' ? 'text-green-600' : 'text-amber-600'}`}>{s.photo1}</span></div>
                      <div className="text-[10px]">Photo-2: <span className={`font-semibold ${s.photo2 === 'Available' ? 'text-green-600' : 'text-amber-600'}`}>{s.photo2}</span></div>
                      {s.relatedDocuments && <div className="text-[9px] text-gray-400 truncate max-w-[100px]" title={s.relatedDocuments}>{s.relatedDocuments}</div>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 bg-gray-50 hover:bg-sky-50 text-gray-500 hover:text-sky-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this sprinkler record?')) {
                              onDelete(s.id);
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
