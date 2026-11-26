/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Form6FarmerFieldSchool, Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import { PlusCircle, Search, Edit2, Trash2, Download, Check, BookOpen, RefreshCw } from 'lucide-react';

interface FarmerFieldSchoolProps {
  ffsLogs: Form6FarmerFieldSchool[];
  beneficiaries: Beneficiary[];
  onAdd: (f: Form6FarmerFieldSchool) => void;
  onUpdate: (f: Form6FarmerFieldSchool) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function FarmerFieldSchool({
  ffsLogs,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: FarmerFieldSchoolProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [nameOfProject, setNameOfProject] = useState('Sustainable Agriculture & CRA');
  const [dist, setDist] = useState('Mandla');
  const [block, setBlock] = useState('Ghughri');
  const [cluster, setCluster] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [village, setVillage] = useState<VillageType>('Sukhram');
  const [theme, setTheme] = useState('Integrated Pest Management');
  const [activityName, setActivityName] = useState('FFS Regular Sessions');
  const [year, setYear] = useState('2025-26');
  const [season, setSeason] = useState('Rabi');
  const [dateOfFFS, setDateOfFFS] = useState('');
  const [nameOfFarmer, setNameOfFarmer] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [uniqueId, setUniqueId] = useState('');
  const [beneficiaryType, setBeneficiaryType] = useState<'Direct' | 'Indirect'>('Direct');
  const [mobileNo, setMobileNo] = useState('');
  const [totalPresenceIncludingPrevious, setTotalPresenceIncludingPrevious] = useState<number | ''>('');
  const [totalPresenceInExposureVisit, setTotalPresenceInExposureVisit] = useState<number | ''>('');
  const [nameOfCrop, setNameOfCrop] = useState('');
  const [topicOfFFS, setTopicOfFFS] = useState('');

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

  const handleEdit = (f: Form6FarmerFieldSchool) => {
    setIsEditing(true);
    setEditId(f.id);
    setNameOfProject(f.nameOfProject);
    setDist(f.dist);
    setBlock(f.block);
    setCluster(f.cluster);
    setGramPanchayat(f.gramPanchayat);
    setVillage(f.village);
    setTheme(f.theme);
    setActivityName(f.activityName);
    setYear(f.year);
    setSeason(f.season);
    setDateOfFFS(f.dateOfFFS);
    setNameOfFarmer(f.nameOfFarmer);
    setFatherHusbandName(f.fatherHusbandName);
    setGender(f.gender);
    setUniqueId(f.uniqueId);
    setBeneficiaryType(f.beneficiaryType);
    setMobileNo(f.mobileNo);
    setTotalPresenceIncludingPrevious(f.totalPresenceIncludingPrevious);
    setTotalPresenceInExposureVisit(f.totalPresenceInExposureVisit);
    setNameOfCrop(f.nameOfCrop);
    setTopicOfFFS(f.topicOfFFS);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setNameOfProject('Sustainable Agriculture & CRA');
    setDist('Mandla');
    setBlock('Ghughri');
    setCluster('');
    setGramPanchayat('');
    setVillage('Sukhram');
    setTheme('Integrated Pest Management');
    setActivityName('FFS Regular Sessions');
    setYear('2025-26');
    setSeason('Rabi');
    setDateOfFFS('');
    setNameOfFarmer('');
    setFatherHusbandName('');
    setGender('Male');
    setUniqueId('');
    setBeneficiaryType('Direct');
    setMobileNo('');
    setTotalPresenceIncludingPrevious('');
    setTotalPresenceInExposureVisit('');
    setNameOfCrop('');
    setTopicOfFFS('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOfFarmer || !uniqueId || !topicOfFFS || !nameOfCrop || !dateOfFFS) {
      alert("Farmer Name, Unique ID, FFS Date, Crop Name, and FFS Topic are required.");
      return;
    }

    const ffsData: Form6FarmerFieldSchool = {
      id: isEditing && editId ? editId : generateId(),
      nameOfProject: nameOfProject.trim(),
      dist: dist.trim(),
      block: block.trim(),
      cluster: cluster.trim() || `${village} Cluster`,
      gramPanchayat: gramPanchayat.trim() || `${village} GP`,
      village,
      theme: theme.trim(),
      activityName: activityName.trim(),
      year,
      season,
      dateOfFFS,
      nameOfFarmer: nameOfFarmer.trim(),
      fatherHusbandName: fatherHusbandName.trim(),
      gender,
      uniqueId: uniqueId.trim(),
      beneficiaryType,
      mobileNo: mobileNo.trim(),
      totalPresenceIncludingPrevious: Number(totalPresenceIncludingPrevious) || 1,
      totalPresenceInExposureVisit: Number(totalPresenceInExposureVisit) || 0,
      nameOfCrop: nameOfCrop.trim(),
      topicOfFFS: topicOfFFS.trim(),
      createdAt: isEditing && editId 
        ? (ffsLogs.find(ff => ff.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(ffsData);
    } else {
      onAdd(ffsData);
    }
    resetForm();
  };

  const filtered = ffsLogs.filter(f => 
    f.nameOfFarmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.topicOfFFS.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.nameOfCrop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-h-[1000px] overflow-y-auto pr-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-sans">
              {isEditing ? 'Edit FFS Session Log' : 'Record Farmer Field School (FFS)'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Form 6: Field-level practical farming school sessions and attendance.
            </p>
          </div>
        </div>

        {!isEditing && (
          <BeneficiarySearchSelect beneficiaries={beneficiaries} onSelect={handleAutofill} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Administrative details</h3>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500">Project</label>
                <input
                  type="text"
                  value={nameOfProject}
                  onChange={(e) => setNameOfProject(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 bg-white rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500">District</label>
                <input
                  type="text"
                  value={dist}
                  onChange={(e) => setDist(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 bg-white rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500">Block</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 bg-white rounded text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Village <span className="text-red-500">*</span>
              </label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value as VillageType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="Farmer Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        ? 'bg-emerald-600 text-white border-emerald-600' 
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
                placeholder="Mobile"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-sans"
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                FFS Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateOfFFS}
                onChange={(e) => setDateOfFFS(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                required
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
                placeholder="e.g., Pest management"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Activity Name
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="FFS regular session"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cluster
              </label>
              <input
                type="text"
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                placeholder="Cluster Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
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
                        ? 'bg-emerald-600 text-white border-emerald-600' 
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
                Name of Crop <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameOfCrop}
                onChange={(e) => setNameOfCrop(e.target.value)}
                placeholder="e.g., Gram, Wheat, Rice"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total Presence (inc. Prev) *</label>
              <input
                type="number"
                value={totalPresenceIncludingPrevious}
                onChange={(e) => setTotalPresenceIncludingPrevious(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="No. of sessions"
                className="w-full px-3 py-1.5 border border-gray-200 bg-white rounded text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Exposure Visit Presence *</label>
              <input
                type="number"
                value={totalPresenceInExposureVisit}
                onChange={(e) => setTotalPresenceInExposureVisit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Exposure visit count"
                className="w-full px-3 py-1.5 border border-gray-200 bg-white rounded text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Topic of FFS Session <span className="text-red-500">*</span>
            </label>
            <textarea
              value={topicOfFFS}
              onChange={(e) => setTopicOfFFS(e.target.value)}
              placeholder="e.g., Trichogramma cards placement and pheromone traps setup demonstration..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              required
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
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update FFS Log' : 'Add FFS Session'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Submitted Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900 font-sans">Farmer Field School Registry</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full">
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
            placeholder="Search by farmer, crop, session topic, or village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <th className="p-3">Farmer & ID</th>
                <th className="p-3">Location details</th>
                <th className="p-3">Crop & Topic</th>
                <th className="p-3">Attendance Stats</th>
                <th className="p-3">Theme & Date</th>
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
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{f.nameOfFarmer}</div>
                      <div className="text-[10px] text-gray-500">F/H: {f.fatherHusbandName || 'N/A'}</div>
                      <div className="font-mono text-[9px] text-gray-400 mt-0.5">{f.uniqueId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{f.village}</div>
                      <div className="text-[10px] text-gray-400">{f.cluster} • {f.block}</div>
                      {f.mobileNo && <div className="text-[10px] text-gray-500 font-mono">{f.mobileNo}</div>}
                    </td>
                    <td className="p-3">
                      <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 mb-1">
                        Crop: {f.nameOfCrop}
                      </div>
                      <div className="font-bold text-gray-800 max-w-[200px]" title={f.topicOfFFS}>{f.topicOfFFS}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{f.nameOfProject}</div>
                    </td>
                    <td className="p-3 space-y-1">
                      <div className="text-[10px]">
                        Total Attended: <span className="font-bold text-gray-700">{f.totalPresenceIncludingPrevious}</span>
                      </div>
                      <div className="text-[10px]">
                        Exposures: <span className="font-bold text-emerald-700">{f.totalPresenceInExposureVisit}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-700">{f.theme}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{f.dateOfFFS}</div>
                      <div className="text-[10px] text-gray-500">{f.season} • {f.year} • {f.beneficiaryType}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(f)}
                          className="p-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this FFS session?')) {
                              onDelete(f.id);
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
