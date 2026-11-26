/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SecurityRole, RolePermissions } from './lib/roles';

export type { SecurityRole, RolePermissions };

export type VillageType =
  | 'Sukhram'
  | 'Ghughri'
  | 'Maldha'
  | 'Banar'
  | 'Majhgoan'
  | 'Gadadeori'
  | 'Jeora'
  | 'Bhaiswahi';

export const VILLAGES: VillageType[] = [
  'Sukhram',
  'Ghughri',
  'Maldha',
  'Banar',
  'Majhgoan',
  'Gadadeori',
  'Jeora',
  'Bhaiswahi',
];

export type ModuleKey =
  | 'beneficiaries'
  | 'activities'
  | 'trainings'
  | 'nutritionLogs'
  | 'convergences'
  | 'sprinklers'
  | 'ffsLogs'
  | 'vdcMeetings'
  | 'cropDemoRecords';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string | null;
  role: SecurityRole;
  stateName: string;
  districtName: string;
  assignedVillages: string[];
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface RoleInvitation {
  id: number;
  email: string;
  displayName: string;
  role: SecurityRole;
  stateName: string;
  districtName: string;
  assignedVillages: string[];
  invitedByUid: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: number;
  actorUid: string;
  actorEmail: string;
  actorRole: SecurityRole;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  village?: string | null;
  summary: string;
  createdAt: string;
}

export interface ProjectRecord {
  id: number;
  name: string;
  code: string;
  stateName: string;
  districtName: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdByUid: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectLocation {
  id: number;
  projectId: number;
  tehsil: string;
  block: string;
  cluster: string;
  village: string;
  gramPanchayat: string;
  createdByUid: string;
  createdAt: string;
}

export interface ProjectTeamMember {
  id: number;
  projectId: number;
  memberName: string;
  memberEmail: string;
  role: SecurityRole;
  assignedTehsil: string;
  assignedBlock: string;
  assignedCluster: string;
  assignedVillage: string;
  assignedByUid: string;
  createdAt: string;
}

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox';

export interface CustomFormField {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface CustomForm {
  id: number;
  projectId: number | null;
  title: string;
  description: string;
  fields: CustomFormField[];
  isActive: boolean;
  expiresAt?: string | null;
  createdByUid: string;
  createdByEmail: string;
  createdByRole: SecurityRole;
  submissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFormSubmission {
  id: number;
  formId: number;
  projectId: number | null;
  village: string;
  responses: Record<string, string | number | boolean>;
  submittedByUid: string;
  submittedByEmail: string;
  submittedByRole: SecurityRole;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  uniqueId: string;
  name: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  village: VillageType;
  cluster: string;
  gramPanchayat: string;
  samagraId?: string;
  mobileNo?: string;
  hamletTola?: string;
  headOfHH?: 'Yes' | 'No';
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form1CRAActivity {
  id: string;
  cluster: string;
  village: VillageType;
  uniqueId: string;
  nameOfFarmer: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  beneficiaryType: 'Direct' | 'Indirect';
  year: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Whole Year' | string;
  theme: string;
  activityName: string;
  unit1Name: string;
  unit1Value: number;
  unit2Name?: string;
  unit2Value?: number;
  unit3Name?: string;
  unit3Value?: number;
  remark?: string;
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form2TrainingMeeting {
  id: string;
  cluster: string;
  gramPanchayat: string;
  village: VillageType;
  uniqueId: string;
  nameOfParticipant: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  mobileNo: string;
  theme: string;
  activityName: string;
  dateOfTrainingMeeting: string;
  year: string;
  beneficiaryType: 'Direct' | 'Indirect';
  agenda: string;
  remarks?: string;
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form3HealthNutrition {
  id: string;
  cluster: string;
  village: VillageType;
  uniqueId: string;
  nameOfFarmer: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  beneficiaryType: 'Direct' | 'Indirect';
  year: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Whole Year' | string;
  theme: string;
  activityName: string;
  areaHa: number;
  remark?: string;
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form4Convergence {
  id: string;
  cluster: string;
  village: VillageType;
  samagraId: string;
  nameOfBeneficiary: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  beneficiaryType: 'Direct' | 'Indirect';
  theme: string;
  khasraNo: string;
  areaPlannedHa: number;
  nameOfDepartment: string;
  typesOfActivitiesWork: string;
  activityName: string;
  length?: number;
  width?: number;
  height?: number;
  volumeCum?: number;
  capacityCrLiter?: number;
  lat?: number;
  long?: number;
  implementationBy: string;
  scheme: string;
  estimatedAmount: number;
  planSubmittedDate?: string;
  sanctionDate?: string;
  tsAs?: string;
  areaCoveredHa?: number;
  workStatus: 'Planned' | 'In Progress' | 'Completed' | 'Delayed';
  workStartingDate?: string;
  workCompletionDate?: string;
  completionYear?: string;
  actualExpenses?: number;
  evidencePhoto?: 'Yes' | 'No';
  evidenceProceedings?: 'Yes' | 'No';
  evidenceLetter?: 'Yes' | 'No';
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form5SprinklerActivity {
  id: string;
  cluster: string;
  gramPanchayat: string;
  village: VillageType;
  year: string;
  nameOfFarmer: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  theme: string;
  activity: string;
  beneficiaryType: 'Direct' | 'Indirect';
  khasraNo: string;
  contributionAmount: number;
  receiptNo: string;
  uniqueId: string;
  mobileNo: string;
  areaCoveredHac: number;
  photo1?: string;
  photo2?: string;
  relatedDocuments?: string;
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form6FarmerFieldSchool {
  id: string;
  nameOfProject: string;
  dist: string;
  block: string;
  cluster: string;
  gramPanchayat: string;
  village: VillageType;
  theme: string;
  activityName: string;
  year: string;
  season: string;
  dateOfFFS: string;
  nameOfFarmer: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  uniqueId: string;
  beneficiaryType: 'Direct' | 'Indirect';
  mobileNo: string;
  totalPresenceIncludingPrevious: number;
  totalPresenceInExposureVisit: number;
  nameOfCrop: string;
  topicOfFFS: string;
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form7VDCMeetingRecord {
  id: string;
  village: VillageType;
  placeOfMeeting: string;
  year: string;
  date: string;
  nameOfParticipant: string;
  headOfHH: 'Yes' | 'No';
  hamletTola: string;
  samagraIdNo: string;
  mobileNo: string;
  meetingsAttended: number;
  agenda: string;
  decisionTaken: string;
  activityImplementation: string;
  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Form8CropDemoRecord {
  id: string;
  // 1. Project details
  sn?: string;
  nameOfProject: string;
  dist: string;
  block: string;
  cluster: string;
  gramPanchayat: string;
  village: VillageType;
  theme: string;
  activityName: string;
  year: string;
  season: string;

  // 2. Farmer Details
  farmerIdSamagra: string;
  nameOfFarmer: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  beneficiaryType: 'Direct' | 'Indirect';
  totalAreaHa?: number;
  cultivableLandHa?: number;
  fallowLandHa?: number;
  areaInKharifHa?: number;
  areaInRabiHa?: number;
  demoAreaHa?: number;
  isSriSciDemoFarmer: 'Yes' | 'No';
  farmPreciseAppUser: 'Yes' | 'No';
  mobileNo: string;

  // 3. Crop Details
  mainCrop: string;
  demoCrop: string;
  sowingTransplantingDate?: string;
  nameOfIntercrop?: string;
  plantSpaceDetails?: string;

  // 4. Land Management
  soilTesting: 'Yes' | 'No';
  cropRotationHa?: number;
  mixedCroppingHa?: number;
  interCroppingHa?: number;

  // 5. Pest and disease management
  dashparniArkLiter?: number;
  nskeNeemarkLiter?: number;
  neemastraLiter?: number;
  trapCropName?: string;
  birdPerchesNo?: number;
  pheromoneTrapNo?: number;
  lightTrapNo?: number;
  yellowTrapNo?: number;

  // 6. Nutrient management
  greenManureCultivationHa?: number;
  useOfFym: 'Yes' | 'No';
  compostingPitsFym: 'Yes' | 'No';
  tetraVermiBed: 'Yes' | 'No';
  lowCostVermiBed: 'Yes' | 'No';
  nadep: 'Yes' | 'No';
  amrutKhadPits: 'Yes' | 'No';
  seedRootTreatment: 'Yes' | 'No';
  useOfWasteDecomposer: 'Yes' | 'No';
  jeevamrutLitre?: number;
  amrutPaniLitre?: number;
  vermiWashLitre?: number;

  // 7. Soil moisture conservation
  cropResidueMulching: 'Yes' | 'No';
  bbfAreaHa?: number;
  dripAreaHa?: number;
  sprinklerAreaHa?: number;
  waterBudgetingExercise?: string;

  // 8. Livestock
  livestockHealthCampGp?: string;
  goatRearing?: string;
  backyardPoultry?: string;
  cattleSheepPenning?: string;
  promotionOfFodderCrop?: string;
  silage?: string;

  // 9. Nutrition
  kitchenGardeningAreaHa?: number;
  multiLayerFarmingAreaHa?: number;
  cultivationOfMilletsAreaHa?: number;

  // 10. Capacity building
  beneficiaryFarmersExposure: 'Yes' | 'No';
  beneficiaryFfs: 'Yes' | 'No';
  beneficiaryAgroMetAdvisory: 'Yes' | 'No';
  beneficiaryBrc: 'Yes' | 'No';

  // 11. Expense details
  expOnSeed?: number;
  expOnSowing?: number;
  expOnFertilizer?: number;
  expOnWeeding?: number;
  expOnIrrigation?: number;
  expOnTools?: number;
  expOnIpm?: number;
  expOnNpm?: number;
  otherExp?: number;
  totalExp?: number;

  // 12. Harvesting details
  totalProductionKg?: number;
  sellValue?: number;
  netProfit?: number;

  // 13. Documentation
  photo1?: string;
  photo2?: string;
  relatedDocuments?: string;

  createdByUid?: string;
  createdByEmail?: string;
  createdAt: string;
}
