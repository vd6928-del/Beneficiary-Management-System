/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Form4Convergence, Beneficiary, VILLAGES, VillageType } from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import { PlusCircle, Search, Edit2, Trash2, Download, Check, Layers, Compass, BarChart, Calendar } from 'lucide-react';

interface ConvergenceProps {
  convergences: Form4Convergence[];
  beneficiaries: Beneficiary[];
  onAdd: (c: Form4Convergence) => void;
  onUpdate: (c: Form4Convergence) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export default function Convergence({
  convergences,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV
}: ConvergenceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [cluster, setCluster] = useState('');
  const [village, setVillage] = useState<VillageType>('Sukhram');
  const [samagraId, setSamagraId] = useState('');
  const [nameOfBeneficiary, setNameOfBeneficiary] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [beneficiaryType, setBeneficiaryType] = useState<'Direct' | 'Indirect'>('Direct');
  const [theme, setTheme] = useState('');
  const [khasraNo, setKhasraNo] = useState('');
  const [areaPlannedHa, setAreaPlannedHa] = useState<number | ''>('');
  const [nameOfDepartment, setNameOfDepartment] = useState('');
  const [typesOfActivitiesWork, setTypesOfActivitiesWork] = useState('');
  const [activityName, setActivityName] = useState('');
  
  // Dimensions
  const [length, setLength] = useState<number | ''>('');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [volumeCum, setVolumeCum] = useState<number | ''>('');
  const [capacityCrLiter, setCapacityCrLiter] = useState<number | ''>('');

  // Location Coordinates
  const [lat, setLat] = useState<number | ''>('');
  const [long, setLong] = useState<number | ''>('');

  // Implementation / Schemes
  const [implementationBy, setImplementationBy] = useState('');
  const [scheme, setScheme] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState<number | ''>('');
  const [planSubmittedDate, setPlanSubmittedDate] = useState('');
  const [sanctionDate, setSanctionDate] = useState('');
  const [tsAs, setTsAs] = useState('');
  
  // Progress
  const [areaCoveredHa, setAreaCoveredHa] = useState<number | ''>('');
  const [workStatus, setWorkStatus] = useState<Form4Convergence['workStatus']>('Planned');
  const [workStartingDate, setWorkStartingDate] = useState('');
  const [workCompletionDate, setWorkCompletionDate] = useState('');
  const [completionYear, setCompletionYear] = useState('');
  const [actualExpenses, setActualExpenses] = useState<number | ''>('');

  // Evidence Checkbox states (converted to Yes/No in payload)
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasProceedings, setHasProceedings] = useState(false);
  const [hasLetter, setHasLetter] = useState(false);

  // Table Search
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-calculate Volume (length * width * height)
  useEffect(() => {
    if (length !== '' && width !== '' && height !== '') {
      const vol = Number(length) * Number(width) * Number(height);
      setVolumeCum(Number(vol.toFixed(3)));
      // Standard conversion: 1 Cubic Meter = 1000 Liters = 1e-7 Crore Liters
      const capCr = (vol * 1000) / 10000000;
      setCapacityCrLiter(Number(capCr.toFixed(6)));
    }
  }, [length, width, height]);

  const handleAutofill = (b: Beneficiary) => {
    setNameOfBeneficiary(b.name);
    setFatherHusbandName(b.fatherHusbandName);
    setGender(b.gender);
    setVillage(b.village);
    if (b.cluster) setCluster(b.cluster);
    if (b.samagraId) setSamagraId(b.samagraId);
  };

  const handleEdit = (c: Form4Convergence) => {
    setIsEditing(true);
    setEditId(c.id);
    setCluster(c.cluster);
    setVillage(c.village);
    setSamagraId(c.samagraId);
    setNameOfBeneficiary(c.nameOfBeneficiary);
    setFatherHusbandName(c.fatherHusbandName);
    setGender(c.gender);
    setBeneficiaryType(c.beneficiaryType);
    setTheme(c.theme);
    setKhasraNo(c.khasraNo);
    setAreaPlannedHa(c.areaPlannedHa);
    setNameOfDepartment(c.nameOfDepartment);
    setTypesOfActivitiesWork(c.typesOfActivitiesWork);
    setActivityName(c.activityName);
    
    setLength(c.length !== undefined ? c.length : '');
    setWidth(c.width !== undefined ? c.width : '');
    setHeight(c.height !== undefined ? c.height : '');
    setVolumeCum(c.volumeCum !== undefined ? c.volumeCum : '');
    setCapacityCrLiter(c.capacityCrLiter !== undefined ? c.capacityCrLiter : '');

    setLat(c.lat !== undefined ? c.lat : '');
    setLong(c.long !== undefined ? c.long : '');

    setImplementationBy(c.implementationBy);
    setScheme(c.scheme);
    setEstimatedAmount(c.estimatedAmount);
    setPlanSubmittedDate(c.planSubmittedDate || '');
    setSanctionDate(c.sanctionDate || '');
    setTsAs(c.tsAs || '');

    setAreaCoveredHa(c.areaCoveredHa !== undefined ? c.areaCoveredHa : '');
    setWorkStatus(c.workStatus);
    setWorkStartingDate(c.workStartingDate || '');
    setWorkCompletionDate(c.workCompletionDate || '');
    setCompletionYear(c.completionYear || '');
    setActualExpenses(c.actualExpenses !== undefined ? c.actualExpenses : '');

    setHasPhoto(c.evidencePhoto === 'Yes');
    setHasProceedings(c.evidenceProceedings === 'Yes');
    setHasLetter(c.evidenceLetter === 'Yes');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setCluster('');
    setVillage('Sukhram');
    setSamagraId('');
    setNameOfBeneficiary('');
    setFatherHusbandName('');
    setGender('Male');
    setBeneficiaryType('Direct');
    setTheme('');
    setKhasraNo('');
    setAreaPlannedHa('');
    setNameOfDepartment('');
    setTypesOfActivitiesWork('');
    setActivityName('');
    setLength('');
    setWidth('');
    setHeight('');
    setVolumeCum('');
    setCapacityCrLiter('');
    setLat('');
    setLong('');
    setImplementationBy('');
    setScheme('');
    setEstimatedAmount('');
    setPlanSubmittedDate('');
    setSanctionDate('');
    setTsAs('');
    setAreaCoveredHa('');
    setWorkStatus('Planned');
    setWorkStartingDate('');
    setWorkCompletionDate('');
    setCompletionYear('');
    setActualExpenses('');
    setHasPhoto(false);
    setHasProceedings(false);
    setHasLetter(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOfBeneficiary || !samagraId || !activityName || estimatedAmount === '') {
      alert("Beneficiary Name, Samagra ID, Activity Name, and Estimated Amount are required.");
      return;
    }

    const convData: Form4Convergence = {
      id: isEditing && editId ? editId : generateId(),
      cluster: cluster.trim() || `${village} Cluster`,
      village,
      samagraId: samagraId.trim(),
      nameOfBeneficiary: nameOfBeneficiary.trim(),
      fatherHusbandName: fatherHusbandName.trim(),
      gender,
      beneficiaryType,
      theme: theme.trim() || 'Convergence Infrastructure',
      khasraNo: khasraNo.trim(),
      areaPlannedHa: Number(areaPlannedHa) || 0,
      nameOfDepartment: nameOfDepartment.trim(),
      typesOfActivitiesWork: typesOfActivitiesWork.trim(),
      activityName: activityName.trim(),
      
      length: length !== '' ? Number(length) : undefined,
      width: width !== '' ? Number(width) : undefined,
      height: height !== '' ? Number(height) : undefined,
      volumeCum: volumeCum !== '' ? Number(volumeCum) : undefined,
      capacityCrLiter: capacityCrLiter !== '' ? Number(capacityCrLiter) : undefined,
      
      lat: lat !== '' ? Number(lat) : undefined,
      long: long !== '' ? Number(long) : undefined,
      
      implementationBy: implementationBy.trim() || 'Gram Panchayat',
      scheme: scheme.trim() || 'Convergence Scheme',
      estimatedAmount: Number(estimatedAmount),
      planSubmittedDate: planSubmittedDate || undefined,
      sanctionDate: sanctionDate || undefined,
      tsAs: tsAs || undefined,
      
      areaCoveredHa: areaCoveredHa !== '' ? Number(areaCoveredHa) : undefined,
      workStatus,
      workStartingDate: workStartingDate || undefined,
      workCompletionDate: workCompletionDate || undefined,
      completionYear: completionYear || undefined,
      actualExpenses: actualExpenses !== '' ? Number(actualExpenses) : undefined,
      
      evidencePhoto: hasPhoto ? 'Yes' : 'No',
      evidenceProceedings: hasProceedings ? 'Yes' : 'No',
      evidenceLetter: hasLetter ? 'Yes' : 'No',
      
      createdAt: isEditing && editId 
        ? (convergences.find(co => co.id === editId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (isEditing) {
      onUpdate(convData);
    } else {
      onAdd(convData);
    }
    resetForm();
  };

  const filtered = convergences.filter(c => 
    c.nameOfBeneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.samagraId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nameOfDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-h-[1000px] overflow-y-auto pr-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-sans">
              {isEditing ? 'Edit Convergence Activity' : 'Record Convergence Activity'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Form 4: MGNREGS, Dept of Ag, and other departmental convergences.
            </p>
          </div>
        </div>

        {!isEditing && (
          <BeneficiarySearchSelect beneficiaries={beneficiaries} onSelect={handleAutofill} />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Base Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">General Information</h3>
            
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
                  Samagra ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={samagraId}
                  onChange={(e) => setSamagraId(e.target.value)}
                  placeholder="9-digit Samagra ID"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Name of Beneficiary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameOfBeneficiary}
                  onChange={(e) => setNameOfBeneficiary(e.target.value)}
                  placeholder="Beneficiary Name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  placeholder="Father/Husband's Name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                          ? 'bg-orange-600 text-white border-orange-600' 
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
                          ? 'bg-orange-600 text-white border-orange-600' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cluster</label>
                <input
                  type="text"
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  placeholder="Cluster-A"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Khasra No.</label>
                <input
                  type="text"
                  value={khasraNo}
                  onChange={(e) => setKhasraNo(e.target.value)}
                  placeholder="e.g., 102/4"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Area Planned (ha)</label>
                <input
                  type="number"
                  step="any"
                  value={areaPlannedHa}
                  onChange={(e) => setAreaPlannedHa(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g., 0.5"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Activity / Work Details */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department & Work Description</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name of Department</label>
                <input
                  type="text"
                  value={nameOfDepartment}
                  onChange={(e) => setNameOfDepartment(e.target.value)}
                  placeholder="e.g., Dept of Agriculture / GP"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Theme</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., Water Security / Soil Health"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type of Work</label>
                <input
                  type="text"
                  value={typesOfActivitiesWork}
                  onChange={(e) => setTypesOfActivitiesWork(e.target.value)}
                  placeholder="e.g., Land configuration"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  placeholder="e.g., Farm Pond Construction"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Geometry / Engineering Details */}
          <div className="space-y-3 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Infrastructure Dimensions & Coordinates
            </h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-orange-800 mb-0.5">Length (m)</label>
                <input
                  type="number"
                  step="any"
                  value={length}
                  onChange={(e) => setLength(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Length"
                  className="w-full px-2 py-1.5 border border-orange-200 rounded bg-white text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-orange-800 mb-0.5">Width (m)</label>
                <input
                  type="number"
                  step="any"
                  value={width}
                  onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Width"
                  className="w-full px-2 py-1.5 border border-orange-200 rounded bg-white text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-orange-800 mb-0.5">Height (m)</label>
                <input
                  type="number"
                  step="any"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Height"
                  className="w-full px-2 py-1.5 border border-orange-200 rounded bg-white text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-orange-800 mb-0.5">Volume (Cum) [Auto]</label>
                <input
                  type="text"
                  value={volumeCum}
                  disabled
                  placeholder="Auto calculated"
                  className="w-full px-2 py-1.5 border border-orange-100 rounded bg-orange-100/50 text-xs text-orange-950 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-orange-800 mb-0.5">Capacity (Cr Ltr) [Auto]</label>
                <input
                  type="text"
                  value={capacityCrLiter}
                  disabled
                  placeholder="Auto calculated"
                  className="w-full px-2 py-1.5 border border-orange-100 rounded bg-orange-100/50 text-xs text-orange-950 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-orange-100">
              <div>
                <label className="block text-[10px] font-semibold text-orange-800 mb-0.5">Latitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g., 22.8456"
                  className="w-full px-2 py-1.5 border border-orange-200 rounded bg-white text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-orange-800 mb-0.5">Longitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={long}
                  onChange={(e) => setLong(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g., 80.3421"
                  className="w-full px-2 py-1.5 border border-orange-200 rounded bg-white text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Scheme, Estimates & Submissions */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financials & Project Timeline</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Implementation Agency</label>
                <input
                  type="text"
                  value={implementationBy}
                  onChange={(e) => setImplementationBy(e.target.value)}
                  placeholder="e.g., Gram Panchayat"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Scheme Name</label>
                <input
                  type="text"
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value)}
                  placeholder="e.g., MGNREGA / DPAP"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Estimated Amt (INR) *</label>
                <input
                  type="number"
                  value={estimatedAmount}
                  onChange={(e) => setEstimatedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Est Rs."
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Actual Exp (INR)</label>
                <input
                  type="number"
                  value={actualExpenses}
                  onChange={(e) => setActualExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Actual Rs."
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">TS / AS Reference</label>
                <input
                  type="text"
                  value={tsAs}
                  onChange={(e) => setTsAs(e.target.value)}
                  placeholder="Order No."
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Submitted Date</label>
                <input
                  type="date"
                  value={planSubmittedDate}
                  onChange={(e) => setPlanSubmittedDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sanction Date</label>
                <input
                  type="date"
                  value={sanctionDate}
                  onChange={(e) => setSanctionDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Status & Work Execution */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Execution & Progress</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Work Status</label>
                <select
                  value={workStatus}
                  onChange={(e) => setWorkStatus(e.target.value as Form4Convergence['workStatus'])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Area Covered (ha)</label>
                <input
                  type="number"
                  step="any"
                  value={areaCoveredHa}
                  onChange={(e) => setAreaCoveredHa(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g., 0.45"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Work Start Date</label>
                <input
                  type="date"
                  value={workStartingDate}
                  onChange={(e) => setWorkStartingDate(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Work Completion Date</label>
                <input
                  type="date"
                  value={workCompletionDate}
                  onChange={(e) => setWorkCompletionDate(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Completion Year</label>
                <input
                  type="text"
                  value={completionYear}
                  onChange={(e) => setCompletionYear(e.target.value)}
                  placeholder="e.g., 2026"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1"
                />
              </div>
            </div>
          </div>

          {/* Evidence Checkboxes */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Type of Evidence Submitted</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm select-none text-gray-600">
                <input
                  type="checkbox"
                  checked={hasPhoto}
                  onChange={(e) => setHasPhoto(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                Evidence Photo
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm select-none text-gray-600">
                <input
                  type="checkbox"
                  checked={hasProceedings}
                  onChange={(e) => setHasProceedings(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                Meeting Proceedings Document
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm select-none text-gray-600">
                <input
                  type="checkbox"
                  checked={hasLetter}
                  onChange={(e) => setHasLetter(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                Sanction/Official Letter
              </label>
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
              {isEditing ? 'Update Convergence Entry' : 'Add Convergence Project'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Submitted Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Convergence Projects Registry</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {filtered.length} projects
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
            placeholder="Search by beneficiary, Samagra, department, activity..."
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
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Infrastructure / activity</th>
                <th className="p-3">Status & Dates</th>
                <th className="p-3">Estimates & Expenses</th>
                <th className="p-3">Technical (Dimensions)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No convergence project records found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{c.nameOfBeneficiary}</div>
                      <div className="font-mono text-[10px] text-gray-400">Samagra: {c.samagraId}</div>
                      <div className="text-[10px] text-gray-500">Gender: {c.gender} • {c.village}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-orange-950">{c.activityName}</div>
                      <div className="text-[10px] text-gray-500">Dept: <span className="text-gray-700 font-medium">{c.nameOfDepartment}</span></div>
                      <div className="text-[10px] text-gray-400">Scheme: {c.scheme} • Khasra: {c.khasraNo}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.workStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                        c.workStatus === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        c.workStatus === 'Delayed' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.workStatus}
                      </span>
                      {c.workStartingDate && (
                        <div className="text-[9px] text-gray-400 mt-1 font-mono">Start: {c.workStartingDate}</div>
                      )}
                      {c.workCompletionDate && (
                        <div className="text-[9px] text-gray-400 font-mono font-semibold text-green-700">End: {c.workCompletionDate}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">Est: ₹{c.estimatedAmount.toLocaleString()}</div>
                      {c.actualExpenses !== undefined && (
                        <div className="text-[10px] text-teal-700 font-medium">Spent: ₹{c.actualExpenses.toLocaleString()}</div>
                      )}
                      {c.tsAs && <div className="text-[9px] text-gray-400 font-mono mt-0.5">TS/AS: {c.tsAs}</div>}
                    </td>
                    <td className="p-3 space-y-0.5">
                      {c.length !== undefined && (
                        <div className="text-[10px] font-medium text-gray-600">
                          {c.length}m × {c.width}m × {c.height}m
                        </div>
                      )}
                      {c.volumeCum !== undefined && (
                        <div className="text-[10px] text-orange-950">
                          Vol: <span className="font-bold">{c.volumeCum} Cum</span>
                        </div>
                      )}
                      {c.capacityCrLiter !== undefined && (
                        <div className="text-[9px] text-orange-800 font-semibold">
                          Cap: {c.capacityCrLiter} Cr Ltr
                        </div>
                      )}
                      {(c.lat || c.long) && (
                        <div className="text-[9px] text-gray-400 font-mono">
                          {c.lat}, {c.long}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-700 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this convergence project?')) {
                              onDelete(c.id);
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
