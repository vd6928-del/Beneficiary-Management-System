/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import { 
  UserPlus, 
  Search, 
  Users, 
  Trash2, 
  Edit2, 
  Download, 
  Check, 
  RefreshCw, 
  MapPin, 
  Phone, 
  FileText 
} from 'lucide-react';

interface BeneficiaryMasterProps {
  beneficiaries: Beneficiary[];
  onAdd: (b: Beneficiary) => void;
  onUpdate: (b: Beneficiary) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function BeneficiaryMaster({
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: BeneficiaryMasterProps) {
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [uniqueId, setUniqueId] = useState('');
  const [name, setName] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [village, setVillage] = useState<VillageType>('Sukhram');
  const [cluster, setCluster] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [samagraId, setSamagraId] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [hamletTola, setHamletTola] = useState('');
  const [headOfHH, setHeadOfHH] = useState<'Yes' | 'No'>('Yes');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [villageFilter, setVillageFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');

  // Auto-generate Unique ID when village changes (only if not editing)
  useEffect(() => {
    if (!isEditing && village) {
      const prefix = village.substring(0, 3).toUpperCase();
      const num = Math.floor(100 + Math.random() * 900);
      setUniqueId(`BEN-${prefix}-${num}`);
    }
  }, [village, isEditing]);

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setFatherHusbandName('');
    setGender('Male');
    setVillage('Sukhram');
    setCluster('');
    setGramPanchayat('');
    setSamagraId('');
    setMobileNo('');
    setHamletTola('');
    setHeadOfHH('Yes');
  };

  const handleEdit = (b: Beneficiary) => {
    setIsEditing(true);
    setEditId(b.id);
    setUniqueId(b.uniqueId);
    setName(b.name);
    setFatherHusbandName(b.fatherHusbandName);
    setGender(b.gender);
    setVillage(b.village);
    setCluster(b.cluster);
    setGramPanchayat(b.gramPanchayat);
    setSamagraId(b.samagraId || '');
    setMobileNo(b.mobileNo || '');
    setHamletTola(b.hamletTola || '');
    setHeadOfHH(b.headOfHH || 'Yes');
    
    // Scroll to form nicely
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !uniqueId || !village) {
      alert("Please fill in Name, Unique ID, and Village.");
      return;
    }

    const beneficiaryData: Beneficiary = {
      id: isEditing && editId ? editId : generateId(),
      uniqueId: uniqueId.trim(),
      name: name.trim(),
      fatherHusbandName: fatherHusbandName.trim(),
      gender,
      village,
      cluster: cluster.trim() || `${village} Cluster`,
      gramPanchayat: gramPanchayat.trim() || `${village} GP`,
      samagraId: samagraId.trim() || undefined,
      mobileNo: mobileNo.trim() || undefined,
      hamletTola: hamletTola.trim() || undefined,
      headOfHH,
      createdAt: isEditing && editId 
        ? (beneficiaries.find(b => b.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(beneficiaryData);
    } else {
      // Check duplicate Unique ID
      if (beneficiaries.some(b => b.uniqueId.toLowerCase() === uniqueId.trim().toLowerCase())) {
        alert("A beneficiary with this Unique ID already exists. Please choose a different ID.");
        return;
      }
      onAdd(beneficiaryData);
    }
    resetForm();
  };

  // Filtered Beneficiaries
  const filtered = beneficiaries.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.fatherHusbandName && b.fatherHusbandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.mobileNo && b.mobileNo.includes(searchTerm)) ||
      (b.samagraId && b.samagraId.includes(searchTerm));

    const matchesVillage = villageFilter === 'All' || b.village === villageFilter;
    const matchesGender = genderFilter === 'All' || b.gender === genderFilter;

    return matchesSearch && matchesVillage && matchesGender;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Register / Edit Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Beneficiary' : 'Register Beneficiary'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing ? 'Modify the details of registered farmer.' : 'Create a master entry for a new farmer.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                Unique ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="e.g., BEN-SUK-001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Name of Farmer/Beneficiary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Father/Husband Name
              </label>
              <input
                type="text"
                value={fatherHusbandName}
                onChange={(e) => setFatherHusbandName(e.target.value)}
                placeholder="Father or Husband's Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
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
                Head of Household?
              </label>
              <div className="flex gap-2">
                {(['Yes', 'No'] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHeadOfHH(h)}
                    className={`flex-1 py-1.5 px-3 text-xs border rounded-lg font-medium transition-all ${
                      headOfHH === h 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cluster Name
              </label>
              <input
                type="text"
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                placeholder="e.g., Cluster-A"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gram Panchayat (GP)
              </label>
              <input
                type="text"
                value={gramPanchayat}
                onChange={(e) => setGramPanchayat(e.target.value)}
                placeholder="GP Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Samagra ID
              </label>
              <input
                type="text"
                value={samagraId}
                onChange={(e) => setSamagraId(e.target.value)}
                placeholder="9-digit Samagra ID"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="10-digit Mobile No."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Hamlet / Tola
            </label>
            <input
              type="text"
              value={hamletTola}
              onChange={(e) => setHamletTola(e.target.value)}
              placeholder="e.g., Patel Tola, Purana Ward"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              {isEditing ? 'Update Beneficiary' : 'Register Farmer'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Directory & Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Beneficiary Directory
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
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

        {/* Search & Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All Villages</option>
              {VILLAGES.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Directory List / Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-100 rounded-xl">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">No beneficiaries registered</p>
            <p className="text-xs text-gray-400 mt-1">Try registering a new farmer or resetting filters.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((b) => (
              <div 
                key={b.id} 
                className="p-4 border border-gray-100 hover:border-emerald-100 rounded-xl hover:shadow-sm transition bg-white flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{b.name}</span>
                    <span className="bg-gray-100 text-gray-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {b.uniqueId}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      b.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {b.gender}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="font-semibold">Father/Husband:</span> {b.fatherHusbandName || 'N/A'}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      Village: <span className="font-semibold text-gray-600">{b.village}</span>
                    </span>
                    {b.mobileNo && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {b.mobileNo}
                      </span>
                    )}
                    {b.samagraId && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-gray-400" />
                        Samagra: {b.samagraId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 rounded transition"
                    title="Edit Beneficiary"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if(confirm(`Are you sure you want to delete ${b.name}?`)) {
                        onDelete(b.id);
                      }
                    }}
                    className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-700 rounded transition"
                    title="Delete Beneficiary"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
