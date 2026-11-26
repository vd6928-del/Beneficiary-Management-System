/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Beneficiary,
  Form1CRAActivity,
  Form2TrainingMeeting,
  Form3HealthNutrition,
  Form4Convergence,
  Form5SprinklerActivity,
  Form6FarmerFieldSchool,
  Form7VDCMeetingRecord,
  VILLAGES
} from '../types';
import { 
  Users, 
  TrendingUp, 
  Database, 
  Award, 
  MapPin, 
  Droplets, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  UserCheck, 
  ChevronRight,
  RefreshCcw,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardOverviewProps {
  beneficiaries: Beneficiary[];
  activities: Form1CRAActivity[];
  trainings: Form2TrainingMeeting[];
  nutritionLogs: Form3HealthNutrition[];
  convergences: Form4Convergence[];
  sprinklers: Form5SprinklerActivity[];
  ffsLogs: Form6FarmerFieldSchool[];
  vdcMeetings: Form7VDCMeetingRecord[];
  onLoadSeedData: () => void;
  canSeedOrReset?: boolean;
  roleLabel?: string;
}

export default function DashboardOverview({
  beneficiaries,
  activities,
  trainings,
  nutritionLogs,
  convergences,
  sprinklers,
  ffsLogs,
  vdcMeetings,
  onLoadSeedData,
  canSeedOrReset = false,
  roleLabel
}: DashboardOverviewProps) {
  
  // Counts & Calculations
  const totalBeneficiaries = beneficiaries.length;
  
  const totalInterventions = 
    activities.length + 
    trainings.length + 
    nutritionLogs.length + 
    convergences.length + 
    sprinklers.length + 
    ffsLogs.length + 
    vdcMeetings.length;

  const totalVillagesCount = VILLAGES.filter(v => 
    beneficiaries.some(b => b.village === v) ||
    activities.some(a => a.village === v) ||
    convergences.some(c => c.village === v)
  ).length;

  // Financial Estimation
  const estimatedConvergenceFund = convergences.reduce((acc, curr) => acc + curr.estimatedAmount, 0);
  const actualConvergenceFund = convergences.reduce((acc, curr) => acc + (curr.actualExpenses || 0), 0);
  const sprinklerFarmerShares = sprinklers.reduce((acc, curr) => acc + curr.contributionAmount, 0);
  const totalFundingPower = estimatedConvergenceFund + sprinklerFarmerShares;

  // Village Wise Beneficiaries Count
  const villageData = VILLAGES.map(v => {
    const benCount = beneficiaries.filter(b => b.village === v).length;
    const actCount = 
      activities.filter(a => a.village === v).length +
      trainings.filter(t => t.village === v).length +
      nutritionLogs.filter(n => n.village === v).length +
      convergences.filter(c => c.village === v).length +
      sprinklers.filter(s => s.village === v).length +
      ffsLogs.filter(f => f.village === v).length +
      vdcMeetings.filter(vd => vd.village === v).length;

    return {
      name: v,
      Beneficiaries: benCount,
      Interventions: actCount
    };
  });

  // Gender Distribution
  const maleCount = beneficiaries.filter(b => b.gender === 'Male').length;
  const femaleCount = beneficiaries.filter(b => b.gender === 'Female').length;
  const otherCount = beneficiaries.filter(b => b.gender === 'Other').length;

  const genderData = [
    { name: 'Male', value: maleCount, color: '#2563eb' }, // Blue 600
    { name: 'Female', value: femaleCount, color: '#ec4899' }, // Pink 500
    { name: 'Other', value: otherCount, color: '#64748b' } // Slate 500
  ].filter(g => g.value > 0);

  // Default display if genderData is empty to make charts look great
  const displayGenderData = genderData.length > 0 ? genderData : [
    { name: 'Male', value: 1, color: '#2563eb' },
    { name: 'Female', value: 1, color: '#ec4899' }
  ];

  // User type count (Direct vs Indirect across forms that record it)
  let directCount = 0;
  let indirectCount = 0;

  const addDirectIndirect = (list: any[]) => {
    list.forEach(item => {
      if (item.beneficiaryType === 'Direct') directCount++;
      else if (item.beneficiaryType === 'Indirect') indirectCount++;
    });
  };

  addDirectIndirect(activities);
  addDirectIndirect(trainings);
  addDirectIndirect(nutritionLogs);
  addDirectIndirect(convergences);
  addDirectIndirect(sprinklers);
  addDirectIndirect(ffsLogs);

  const totalCategorized = directCount + indirectCount;
  const directPercentage = totalCategorized > 0 ? Math.round((directCount / totalCategorized) * 100) : 75;
  const indirectPercentage = totalCategorized > 0 ? Math.round((indirectCount / totalCategorized) * 100) : 25;

  // Recent Activity Feed
  const recentActivities = [
    ...activities.map(a => ({ name: a.nameOfFarmer, type: 'CRA Intervention', date: a.createdAt, detail: a.activityName, village: a.village, color: 'text-blue-600 bg-blue-50 border-blue-100' })),
    ...trainings.map(t => ({ name: t.nameOfParticipant, type: 'Training/Meeting', date: t.createdAt, detail: t.activityName, village: t.village, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' })),
    ...nutritionLogs.map(n => ({ name: n.nameOfFarmer, type: 'Health & Nutrition', date: n.createdAt, detail: n.activityName, village: n.village, color: 'text-rose-600 bg-rose-50 border-rose-100' })),
    ...convergences.map(c => ({ name: c.nameOfBeneficiary, type: 'Convergence Project', date: c.createdAt, detail: c.activityName, village: c.village, color: 'text-violet-600 bg-violet-50 border-violet-100' })),
    ...sprinklers.map(s => ({ name: s.nameOfFarmer, type: 'Sprinkler Setup', date: s.createdAt, detail: s.activity, village: s.village, color: 'text-sky-600 bg-sky-50 border-sky-100' })),
    ...ffsLogs.map(f => ({ name: f.nameOfFarmer, type: 'FFS Session', date: f.createdAt, detail: f.topicOfFFS, village: f.village, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' })),
    ...vdcMeetings.map(vd => ({ name: vd.nameOfParticipant, type: 'VDC Meeting', date: vd.createdAt, detail: vd.agenda, village: vd.village, color: 'text-slate-600 bg-slate-50 border-slate-200' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Visual Header / Welcome Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 to-blue-950 text-white p-8 shadow-md">
        <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none flex items-center justify-center p-8">
          <Sparkles className="w-64 h-64 text-blue-300" />
        </div>
        <div className="relative max-w-xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/60 rounded-full text-xs font-semibold tracking-wider text-blue-300 uppercase border border-slate-700">
              <Award className="w-3.5 h-3.5" />
              Rural Development Office
            </span>
            {roleLabel && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-200 border border-blue-400/30">
                {roleLabel}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-sans text-blue-400">
            Beneficiary & Activity Dashboard
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to the master data monitoring portal. Select the tabs on the sidebar to manage the master beneficiary catalog or submit entries for any of the seven community forms.
          </p>
        </div>

        {/* Admin-only Demo Data Quick Button (Only when empty) */}
        {canSeedOrReset && totalBeneficiaries === 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onLoadSeedData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Populate Demo Data (Highly Recommended)
            </button>
          </div>
        )}
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Beneficiaries Registered</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalBeneficiaries}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Master catalog directory</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Form Submissions</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalInterventions}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Across all 7 tracking modules</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Villages</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalVillagesCount} <span className="text-xs text-slate-400">/ 8</span></h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Participating communities</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Convergence & Share</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{totalFundingPower.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Infrastructural investment</p>
          </div>
        </div>
      </div>

      {/* Main Graph & Demographics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: Village Wise Analysis */}
        <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Village Wise Performance</h3>
            <p className="text-xs text-slate-400">Distribution of registered beneficiaries and activity submissions across villages.</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Beneficiaries" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Interventions" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Grid: Gender Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Farmer Demographics</h3>
            <p className="text-xs text-slate-400">Gender distribution from master registration logs.</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative my-4">
            {beneficiaries.length === 0 ? (
              <div className="text-center text-slate-300">
                <Users className="w-12 h-12 mx-auto mb-1 text-gray-200" />
                <span className="text-xs">No catalog logs to chart</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayGenderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {displayGenderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Absolute center text inside donut chart */}
            {beneficiaries.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
                <span className="text-2xl font-bold text-slate-800 font-mono">{totalBeneficiaries}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Farmers</span>
              </div>
            )}
          </div>

          {/* Gender Legend Cards */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
            <div className="p-1.5 rounded bg-blue-50 border border-blue-100/50">
              <span className="block text-[10px] text-blue-700 font-bold">Male</span>
              <span className="text-base font-extrabold text-blue-950 font-mono">{maleCount}</span>
            </div>
            <div className="p-1.5 rounded bg-pink-50 border border-pink-100/50">
              <span className="block text-[10px] text-pink-700 font-bold">Female</span>
              <span className="text-base font-extrabold text-pink-950 font-mono">{femaleCount}</span>
            </div>
            <div className="p-1.5 rounded bg-slate-50 border border-slate-200/50">
              <span className="block text-[10px] text-slate-600 font-bold">Other</span>
              <span className="text-base font-extrabold text-slate-800 font-mono">{otherCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct vs Indirect & Recent Activity Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Direct vs Indirect visual block */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">User Group Categorization</h3>
            <p className="text-xs text-slate-400">Direct vs. Indirect beneficiary proportion across activity records.</p>
          </div>

          <div className="space-y-4 my-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Direct Beneficiary
                </span>
                <span className="font-bold text-slate-800">{directPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all" style={{ width: `${directPercentage}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block">Farmers directly enrolled, subsidized, or trained.</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                  Indirect Beneficiary
                </span>
                <span className="font-bold text-slate-800">{indirectPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full transition-all" style={{ width: `${indirectPercentage}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block">Villagers benefiting from shared assets or overall VDC actions.</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded border border-blue-100 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-950 font-medium leading-relaxed">
              <strong>Tip:</strong> Submitting Forms 1 to 6 automatically checks the Master Directory. Use search select for seamless, click-free entry.
            </p>
          </div>
        </div>

        {/* Recent Submissions Feed */}
        <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Submissions Log</h3>
            <p className="text-xs text-slate-400">The last five interventions submitted across all active forms.</p>
          </div>

          <div className="mt-6 space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No recent submissions logged. Submit a form to start tracking.</p>
              </div>
            ) : (
              recentActivities.map((act, index) => (
                <div 
                  key={index} 
                  className="p-3 border border-slate-100 hover:border-blue-100/50 rounded-lg hover:bg-blue-50/10 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded border uppercase tracking-wider ${act.color}`}>
                      {act.type}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{act.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{act.detail}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {act.village}
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">{new Date(act.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
