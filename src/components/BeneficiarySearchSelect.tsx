/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Beneficiary } from '../types';
import { Search, UserCheck } from 'lucide-react';

interface BeneficiarySearchSelectProps {
  beneficiaries: Beneficiary[];
  onSelect: (beneficiary: Beneficiary) => void;
  label?: string;
}

export default function BeneficiarySearchSelect({
  beneficiaries,
  onSelect,
  label = "Quick Autofill: Search & Select Master Beneficiary"
}: BeneficiarySearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = searchTerm.trim() === '' 
    ? [] 
    : beneficiaries.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.mobileNo && b.mobileNo.includes(searchTerm)) ||
        b.village.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);

  return (
    <div className="relative mb-6 p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
      <label className="block text-sm font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
        <UserCheck className="w-4 h-4 text-emerald-600" />
        {label}
      </label>
      <p className="text-xs text-emerald-700/80 mb-2">
        Type beneficiary name, village, mobile, or Unique ID to auto-fill this form instantly.
      </p>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-emerald-500" />
        <input
          type="text"
          placeholder="Type to search (e.g., 'Ramesh' or 'Sushila')..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-emerald-300"
        />
      </div>

      {isOpen && searchTerm.trim() !== '' && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-emerald-100 rounded-lg shadow-xl divide-y divide-gray-100">
          {filtered.length > 0 ? (
            filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onSelect(b);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/50 transition-colors flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-semibold text-gray-900">{b.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({b.uniqueId})</span>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Father/Husband: {b.fatherHusbandName} • Village: <span className="text-emerald-700 font-medium">{b.village}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    {b.gender}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No matching registered beneficiaries found. 
              <br />
              <span className="text-xs text-emerald-600">You can still type the values manually.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
