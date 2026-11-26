/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Beneficiary,
  Form1CRAActivity,
  Form2TrainingMeeting,
  Form3HealthNutrition,
  Form4Convergence,
  Form5SprinklerActivity,
  Form6FarmerFieldSchool,
  Form7VDCMeetingRecord,
  VillageType
} from './types';

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substring(2, 11).toUpperCase();

// Seed data
export const SEED_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'B001',
    uniqueId: 'BEN-SUK-001',
    name: 'Ramesh Kumar Patel',
    fatherHusbandName: 'Harkesh Patel',
    gender: 'Male',
    village: 'Sukhram',
    cluster: 'Cluster-A',
    gramPanchayat: 'Sukhram GP',
    samagraId: '102938475',
    mobileNo: '9876543210',
    hamletTola: 'Patel Tola',
    headOfHH: 'Yes',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'B002',
    uniqueId: 'BEN-GHU-002',
    name: 'Sushila Devi',
    fatherHusbandName: 'Sanjay Kumar',
    gender: 'Female',
    village: 'Ghughri',
    cluster: 'Cluster-A',
    gramPanchayat: 'Ghughri GP',
    samagraId: '192837465',
    mobileNo: '9123456789',
    hamletTola: 'Ghughri Kalan',
    headOfHH: 'No',
    createdAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'B003',
    uniqueId: 'BEN-MAL-003',
    name: 'Manoj Singh Yadav',
    fatherHusbandName: 'Ramnath Yadav',
    gender: 'Male',
    village: 'Maldha',
    cluster: 'Cluster-B',
    gramPanchayat: 'Maldha GP',
    samagraId: '201938475',
    mobileNo: '9988776655',
    hamletTola: 'Yadav Basti',
    headOfHH: 'Yes',
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'B004',
    uniqueId: 'BEN-BAN-004',
    name: 'Kamla Bai Markam',
    fatherHusbandName: 'Raju Singh Markam',
    gender: 'Female',
    village: 'Banar',
    cluster: 'Cluster-B',
    gramPanchayat: 'Banar GP',
    samagraId: '394857612',
    mobileNo: '8877665544',
    hamletTola: 'Adivasi Tola',
    headOfHH: 'No',
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'B005',
    uniqueId: 'BEN-MAJ-005',
    name: 'Rajendra Prasad Dwivedi',
    fatherHusbandName: 'Hari Prasad Dwivedi',
    gender: 'Male',
    village: 'Majhgoan',
    cluster: 'Cluster-C',
    gramPanchayat: 'Majhgoan GP',
    samagraId: '485761239',
    mobileNo: '7766554433',
    hamletTola: 'Brahmin Mohalla',
    headOfHH: 'Yes',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'B006',
    uniqueId: 'BEN-GAD-006',
    name: 'Anita Tekam',
    fatherHusbandName: 'Shivpal Tekam',
    gender: 'Female',
    village: 'Gadadeori',
    cluster: 'Cluster-C',
    gramPanchayat: 'Gadadeori GP',
    samagraId: '576123948',
    mobileNo: '6655443322',
    hamletTola: 'Panchayat Tola',
    headOfHH: 'Yes',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'B007',
    uniqueId: 'BEN-JEO-007',
    name: 'Vijay Vishwakarma',
    fatherHusbandName: 'Phoolchand Vishwakarma',
    gender: 'Male',
    village: 'Jeora',
    cluster: 'Cluster-D',
    gramPanchayat: 'Jeora GP',
    samagraId: '612394857',
    mobileNo: '9564738291',
    hamletTola: 'Vishwakarma Ward',
    headOfHH: 'Yes',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'B008',
    uniqueId: 'BEN-BHA-008',
    name: 'Sunita Gond',
    fatherHusbandName: 'Dinesh Gond',
    gender: 'Female',
    village: 'Bhaiswahi',
    cluster: 'Cluster-D',
    gramPanchayat: 'Bhaiswahi GP',
    samagraId: '723948561',
    mobileNo: '8473920192',
    hamletTola: 'Tola No. 2',
    headOfHH: 'No',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_CRA_ACTIVITIES: Form1CRAActivity[] = [
  {
    id: 'CRA-001',
    cluster: 'Cluster-A',
    village: 'Sukhram',
    uniqueId: 'BEN-SUK-001',
    nameOfFarmer: 'Ramesh Kumar Patel',
    fatherHusbandName: 'Harkesh Patel',
    gender: 'Male',
    beneficiaryType: 'Direct',
    year: '2025-26',
    season: 'Rabi',
    theme: 'Climate Resilient Agriculture',
    activityName: 'Zero Tillage Wheat Sowing',
    unit1Name: 'Area Covered (Acre)',
    unit1Value: 2.5,
    unit2Name: 'Seed Quantity (Kg)',
    unit2Value: 100,
    unit3Name: 'Yield Increase (%)',
    unit3Value: 15,
    remark: 'Excellent germination observed. Low weed density.',
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'CRA-002',
    cluster: 'Cluster-A',
    village: 'Ghughri',
    uniqueId: 'BEN-GHU-002',
    nameOfFarmer: 'Sushila Devi',
    fatherHusbandName: 'Sanjay Kumar',
    gender: 'Female',
    beneficiaryType: 'Direct',
    year: '2025-26',
    season: 'Kharif',
    theme: 'Water Harvesting',
    activityName: 'Ridge and Furrow Land Configuration',
    unit1Name: 'Area Covered (Acre)',
    unit1Value: 1.5,
    unit2Name: 'Cost Savings (INR)',
    unit2Value: 3500,
    unit3Name: 'Water Saved (Hours)',
    unit3Value: 12,
    remark: 'Helped sustain crop during dry spell of August.',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_TRAININGS: Form2TrainingMeeting[] = [
  {
    id: 'TR-001',
    cluster: 'Cluster-A',
    gramPanchayat: 'Sukhram GP',
    village: 'Sukhram',
    uniqueId: 'BEN-SUK-001',
    nameOfParticipant: 'Ramesh Kumar Patel',
    fatherHusbandName: 'Harkesh Patel',
    gender: 'Male',
    mobileNo: '9876543210',
    theme: 'Organic Farming',
    activityName: 'Preparation of Vermicompost & Jeevamrit',
    dateOfTrainingMeeting: '2026-05-12',
    year: '2025-26',
    beneficiaryType: 'Direct',
    agenda: 'Hands-on training on preparing natural fertilizer to reduce cost of chemical inputs.',
    remarks: 'Farmer highly motivated. Built vermicompost bed in his home backyard.',
    createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TR-002',
    cluster: 'Cluster-C',
    gramPanchayat: 'Gadadeori GP',
    village: 'Gadadeori',
    uniqueId: 'BEN-GAD-006',
    nameOfParticipant: 'Anita Tekam',
    fatherHusbandName: 'Shivpal Tekam',
    gender: 'Female',
    mobileNo: '6655443322',
    theme: 'Maternal Nutrition',
    activityName: 'Nutri-garden Setup Training',
    dateOfTrainingMeeting: '2026-06-01',
    year: '2026-27',
    beneficiaryType: 'Direct',
    agenda: 'Promoting backyard organic vegetable cultivation for dietary diversity.',
    remarks: 'Distributed 8 types of vegetable seed kits during training.',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_HEALTH_NUTRITION: Form3HealthNutrition[] = [
  {
    id: 'HN-001',
    cluster: 'Cluster-B',
    village: 'Banar',
    uniqueId: 'BEN-BAN-004',
    nameOfFarmer: 'Kamla Bai Markam',
    fatherHusbandName: 'Raju Singh Markam',
    gender: 'Female',
    beneficiaryType: 'Direct',
    year: '2025-26',
    season: 'Kharif',
    theme: 'Nutri-Kitchen Garden',
    activityName: 'Establishment of Circular Nutri-Garden',
    areaHa: 0.02,
    remark: 'Harvesting fresh spinach, okra, and tomatoes for family daily diet.',
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_CONVERGENCE: Form4Convergence[] = [
  {
    id: 'CONV-001',
    cluster: 'Cluster-C',
    village: 'Majhgoan',
    samagraId: '485761239',
    nameOfBeneficiary: 'Rajendra Prasad Dwivedi',
    fatherHusbandName: 'Hari Prasad Dwivedi',
    gender: 'Male',
    beneficiaryType: 'Direct',
    theme: 'Water Security',
    khasraNo: '344/2',
    areaPlannedHa: 0.40,
    nameOfDepartment: 'MGNREGS & Department of Agriculture',
    typesOfActivitiesWork: 'Farm Pond Construction',
    activityName: 'Kapil Dhara Farm Pond',
    length: 15,
    width: 15,
    height: 3,
    volumeCum: 675,
    capacityCrLiter: 0.0675,
    lat: 22.8456,
    long: 80.3421,
    implementationBy: 'Gram Panchayat Majhgoan',
    scheme: 'MGNREGS Convergence',
    estimatedAmount: 180000,
    planSubmittedDate: '2025-11-10',
    sanctionDate: '2026-01-15',
    tsAs: 'TS-ENG/AG-2026/45',
    areaCoveredHa: 0.40,
    workStatus: 'Completed',
    workStartingDate: '2026-02-01',
    workCompletionDate: '2026-04-20',
    completionYear: '2026',
    actualExpenses: 172500,
    evidencePhoto: 'Yes',
    evidenceProceedings: 'Yes',
    evidenceLetter: 'Yes',
    createdAt: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_SPRINKLER: Form5SprinklerActivity[] = [
  {
    id: 'SPR-001',
    cluster: 'Cluster-A',
    gramPanchayat: 'Sukhram GP',
    village: 'Sukhram',
    year: '2025-26',
    nameOfFarmer: 'Ramesh Kumar Patel',
    fatherHusbandName: 'Harkesh Patel',
    gender: 'Male',
    theme: 'Micro Irrigation',
    activity: 'Sprinkler Set Installation (15 Nozzles)',
    beneficiaryType: 'Direct',
    khasraNo: '112/4',
    contributionAmount: 2500,
    receiptNo: 'REC-2026-402',
    uniqueId: 'BEN-SUK-001',
    mobileNo: '9876543210',
    areaCoveredHac: 1.0,
    photo1: 'Available',
    photo2: 'Available',
    relatedDocuments: 'Verified subsidy invoice and land map.',
    createdAt: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_FFS: Form6FarmerFieldSchool[] = [
  {
    id: 'FFS-001',
    nameOfProject: 'CRA Sustainable Farming',
    dist: 'Mandla',
    block: 'Ghughri',
    cluster: 'Cluster-A',
    gramPanchayat: 'Ghughri GP',
    village: 'Ghughri',
    theme: 'Integrated Pest Management (IPM)',
    activityName: 'FFS Session 1 to 5',
    year: '2025-26',
    season: 'Rabi',
    dateOfFFS: '2026-05-20',
    nameOfFarmer: 'Sushila Devi',
    fatherHusbandName: 'Sanjay Kumar',
    gender: 'Female',
    uniqueId: 'BEN-GHU-002',
    beneficiaryType: 'Direct',
    mobileNo: '9123456789',
    totalPresenceIncludingPrevious: 5,
    totalPresenceInExposureVisit: 1,
    nameOfCrop: 'Gram (Chickpea)',
    topicOfFFS: 'Identification of Trichogramma cards and pheromone traps setup.',
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEED_VDC_MEETINGS: Form7VDCMeetingRecord[] = [
  {
    id: 'VDC-001',
    village: 'Jeora',
    placeOfMeeting: 'Community Hall Jeora',
    year: '2025-26',
    date: '2026-06-15',
    nameOfParticipant: 'Vijay Vishwakarma',
    headOfHH: 'Yes',
    hamletTola: 'Vishwakarma Mohalla',
    samagraIdNo: '612394857',
    mobileNo: '9564738291',
    meetingsAttended: 4,
    agenda: 'Planning for next season water management and scheduling sprinkler demo shifts.',
    decisionTaken: 'Decided to establish a common pump sharing calendar and clean local irrigation canal before monsoon.',
    activityImplementation: 'Community voluntary labor (Shramdaan) scheduled for cleaning canal on 20th June.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  }
];

// LocalStorage helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Export to CSV helper
export const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const val = row[header];
      if (val === undefined || val === null) return '""';
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape double quotes
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (data: any[], filename: string) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
