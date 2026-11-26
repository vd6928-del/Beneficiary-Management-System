/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Users table (linked to Firebase Auth UID + 4-tier RBAC Security Level)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull().default(''),
  photoUrl: text('photo_url'),
  role: text('role').notNull().default('field_worker'), // 'admin' | 'state_incharge' | 'project_manager' | 'field_worker'
  stateName: text('state_name').notNull().default('Madhya Pradesh'),
  districtName: text('district_name').notNull().default('Mandla'),
  assignedVillages: jsonb('assigned_villages').$type<string[]>().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Role Invitations (Admin pre-assigns roles & villages before user's first Google Sign-In)
export const roleInvitations = pgTable('role_invitations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull().default(''),
  role: text('role').notNull().default('field_worker'),
  stateName: text('state_name').notNull().default('Madhya Pradesh'),
  districtName: text('district_name').notNull().default('Mandla'),
  assignedVillages: jsonb('assigned_villages').$type<string[]>().notNull().default([]),
  invitedByUid: text('invited_by_uid').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Master Beneficiary Catalog
export const beneficiaries = pgTable('beneficiaries', {
  id: text('id').primaryKey(),
  uniqueId: text('unique_id').notNull().unique(),
  name: text('name').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull(),
  village: text('village').notNull(),
  cluster: text('cluster').notNull().default(''),
  gramPanchayat: text('gram_panchayat').notNull().default(''),
  samagraId: text('samagra_id'),
  mobileNo: text('mobile_no'),
  hamletTola: text('hamlet_tola'),
  headOfHH: text('head_of_hh'),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Form 1: CRA Activities
export const craActivities = pgTable('cra_activities', {
  id: text('id').primaryKey(),
  cluster: text('cluster').notNull().default(''),
  village: text('village').notNull(),
  uniqueId: text('unique_id').notNull(),
  nameOfFarmer: text('name_of_farmer').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull(),
  beneficiaryType: text('beneficiary_type').notNull(),
  year: text('year').notNull(),
  season: text('season').notNull(),
  theme: text('theme').notNull(),
  activityName: text('activity_name').notNull(),
  unit1Name: text('unit1_name').notNull(),
  unit1Value: doublePrecision('unit1_value').notNull(),
  unit2Name: text('unit2_name'),
  unit2Value: doublePrecision('unit2_value'),
  unit3Name: text('unit3_name'),
  unit3Value: doublePrecision('unit3_value'),
  remark: text('remark'),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Form 2: Trainings & Meetings
export const trainingsMeetings = pgTable('trainings_meetings', {
  id: text('id').primaryKey(),
  cluster: text('cluster').notNull().default(''),
  gramPanchayat: text('gram_panchayat').notNull().default(''),
  village: text('village').notNull(),
  uniqueId: text('unique_id').notNull(),
  nameOfParticipant: text('name_of_participant').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull(),
  mobileNo: text('mobile_no').notNull().default(''),
  theme: text('theme').notNull(),
  activityName: text('activity_name').notNull(),
  dateOfTrainingMeeting: text('date_of_training_meeting').notNull(),
  year: text('year').notNull(),
  beneficiaryType: text('beneficiary_type').notNull(),
  agenda: text('agenda').notNull().default(''),
  remarks: text('remarks'),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Form 3: Health & Nutrition
export const healthNutrition = pgTable('health_nutrition', {
  id: text('id').primaryKey(),
  cluster: text('cluster').notNull().default(''),
  village: text('village').notNull(),
  uniqueId: text('unique_id').notNull(),
  nameOfFarmer: text('name_of_farmer').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull(),
  beneficiaryType: text('beneficiary_type').notNull(),
  year: text('year').notNull(),
  season: text('season').notNull(),
  theme: text('theme').notNull(),
  activityName: text('activity_name').notNull(),
  areaHa: doublePrecision('area_ha').notNull(),
  remark: text('remark'),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Form 4: Convergence Records
export const convergences = pgTable('convergences', {
  id: text('id').primaryKey(),
  cluster: text('cluster').notNull().default(''),
  village: text('village').notNull(),
  samagraId: text('samagra_id').notNull().default(''),
  nameOfBeneficiary: text('name_of_beneficiary').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull(),
  beneficiaryType: text('beneficiary_type').notNull(),
  theme: text('theme').notNull(),
  khasraNo: text('khasra_no').notNull().default(''),
  areaPlannedHa: doublePrecision('area_planned_ha').notNull().default(0),
  nameOfDepartment: text('name_of_department').notNull().default(''),
  typesOfActivitiesWork: text('types_of_activities_work').notNull().default(''),
  activityName: text('activity_name').notNull(),
  length: doublePrecision('length'),
  width: doublePrecision('width'),
  height: doublePrecision('height'),
  volumeCum: doublePrecision('volume_cum'),
  capacityCrLiter: doublePrecision('capacity_cr_liter'),
  lat: doublePrecision('lat'),
  long: doublePrecision('long'),
  implementationBy: text('implementation_by').notNull().default(''),
  scheme: text('scheme').notNull().default(''),
  estimatedAmount: doublePrecision('estimated_amount').notNull().default(0),
  planSubmittedDate: text('plan_submitted_date'),
  sanctionDate: text('sanction_date'),
  tsAs: text('ts_as'),
  areaCoveredHa: doublePrecision('area_covered_ha'),
  workStatus: text('work_status').notNull().default('Planned'),
  workStartingDate: text('work_starting_date'),
  workCompletionDate: text('work_completion_date'),
  completionYear: text('completion_year'),
  actualExpenses: doublePrecision('actual_expenses'),
  evidencePhoto: text('evidence_photo'),
  evidenceProceedings: text('evidence_proceedings'),
  evidenceLetter: text('evidence_letter'),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Form 5: Sprinkler Interventions
export const sprinklers = pgTable('sprinklers', {
  id: text('id').primaryKey(),
  cluster: text('cluster').notNull().default(''),
  gramPanchayat: text('gram_panchayat').notNull().default(''),
  village: text('village').notNull(),
  year: text('year').notNull(),
  nameOfFarmer: text('name_of_farmer').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull(),
  theme: text('theme').notNull(),
  activity: text('activity').notNull(),
  beneficiaryType: text('beneficiary_type').notNull(),
  khasraNo: text('khasra_no').notNull().default(''),
  contributionAmount: doublePrecision('contribution_amount').notNull().default(0),
  receiptNo: text('receipt_no').notNull().default(''),
  uniqueId: text('unique_id').notNull(),
  mobileNo: text('mobile_no').notNull().default(''),
  areaCoveredHac: doublePrecision('area_covered_hac').notNull().default(0),
  photo1: text('photo1'),
  photo2: text('photo2'),
  relatedDocuments: text('related_documents'),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 9. Form 6: Farmer Field School
export const ffsLogs = pgTable('ffs_logs', {
  id: text('id').primaryKey(),
  nameOfProject: text('name_of_project').notNull().default(''),
  dist: text('dist').notNull().default(''),
  block: text('block').notNull().default(''),
  cluster: text('cluster').notNull().default(''),
  gramPanchayat: text('gram_panchayat').notNull().default(''),
  village: text('village').notNull(),
  theme: text('theme').notNull(),
  activityName: text('activity_name').notNull(),
  year: text('year').notNull(),
  season: text('season').notNull(),
  dateOfFFS: text('date_of_ffs').notNull(),
  nameOfFarmer: text('name_of_farmer').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull(),
  uniqueId: text('unique_id').notNull(),
  beneficiaryType: text('beneficiary_type').notNull(),
  mobileNo: text('mobile_no').notNull().default(''),
  totalPresenceIncludingPrevious: integer('total_presence_including_previous').notNull().default(0),
  totalPresenceInExposureVisit: integer('total_presence_in_exposure_visit').notNull().default(0),
  nameOfCrop: text('name_of_crop').notNull().default(''),
  topicOfFFS: text('topic_of_ffs').notNull().default(''),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10. Form 7: VDC Meetings
export const vdcMeetings = pgTable('vdc_meetings', {
  id: text('id').primaryKey(),
  village: text('village').notNull(),
  placeOfMeeting: text('place_of_meeting').notNull().default(''),
  year: text('year').notNull(),
  date: text('date').notNull(),
  nameOfParticipant: text('name_of_participant').notNull(),
  headOfHH: text('head_of_hh').notNull().default('Yes'),
  hamletTola: text('hamlet_tola').notNull().default(''),
  samagraIdNo: text('samagra_id_no').notNull().default(''),
  mobileNo: text('mobile_no').notNull().default(''),
  meetingsAttended: integer('meetings_attended').notNull().default(1),
  agenda: text('agenda').notNull().default(''),
  decisionTaken: text('decision_taken').notNull().default(''),
  activityImplementation: text('activity_implementation').notNull().default(''),
  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10b. Form 8: Comprehensive Crop Demo & Farmer Progress Sheet
export const cropDemoRecords = pgTable('crop_demo_records', {
  id: text('id').primaryKey(),
  // Project details
  sn: text('sn'),
  nameOfProject: text('name_of_project').notNull().default(''),
  dist: text('dist').notNull().default(''),
  block: text('block').notNull().default(''),
  cluster: text('cluster').notNull().default(''),
  gramPanchayat: text('gram_panchayat').notNull().default(''),
  village: text('village').notNull(),
  theme: text('theme').notNull().default(''),
  activityName: text('activity_name').notNull().default(''),
  year: text('year').notNull().default(''),
  season: text('season').notNull().default(''),

  // Farmer details
  farmerIdSamagra: text('farmer_id_samagra').notNull().default(''),
  nameOfFarmer: text('name_of_farmer').notNull(),
  fatherHusbandName: text('father_husband_name').notNull().default(''),
  gender: text('gender').notNull().default('Male'),
  beneficiaryType: text('beneficiary_type').notNull().default('Direct'),
  totalAreaHa: doublePrecision('total_area_ha'),
  cultivableLandHa: doublePrecision('cultivable_land_ha'),
  fallowLandHa: doublePrecision('fallow_land_ha'),
  areaInKharifHa: doublePrecision('area_in_kharif_ha'),
  areaInRabiHa: doublePrecision('area_in_rabi_ha'),
  demoAreaHa: doublePrecision('demo_area_ha'),
  isSriSciDemoFarmer: text('is_sri_sci_demo_farmer').notNull().default('No'),
  farmPreciseAppUser: text('farm_precise_app_user').notNull().default('No'),
  mobileNo: text('mobile_no').notNull().default(''),

  // Crop details
  mainCrop: text('main_crop').notNull().default(''),
  demoCrop: text('demo_crop').notNull().default(''),
  sowingTransplantingDate: text('sowing_transplanting_date'),
  nameOfIntercrop: text('name_of_intercrop'),
  plantSpaceDetails: text('plant_space_details'),

  // Land management
  soilTesting: text('soil_testing').notNull().default('No'),
  cropRotationHa: doublePrecision('crop_rotation_ha'),
  mixedCroppingHa: doublePrecision('mixed_cropping_ha'),
  interCroppingHa: doublePrecision('inter_cropping_ha'),

  // Pest and disease management
  dashparniArkLiter: doublePrecision('dashparni_ark_liter'),
  nskeNeemarkLiter: doublePrecision('nske_neemark_liter'),
  neemastraLiter: doublePrecision('neemastra_liter'),
  trapCropName: text('trap_crop_name'),
  birdPerchesNo: integer('bird_perches_no'),
  pheromoneTrapNo: integer('pheromone_trap_no'),
  lightTrapNo: integer('light_trap_no'),
  yellowTrapNo: integer('yellow_trap_no'),

  // Nutrient management
  greenManureCultivationHa: doublePrecision('green_manure_cultivation_ha'),
  useOfFym: text('use_of_fym').notNull().default('No'),
  compostingPitsFym: text('composting_pits_fym').notNull().default('No'),
  tetraVermiBed: text('tetra_vermi_bed').notNull().default('No'),
  lowCostVermiBed: text('low_cost_vermi_bed').notNull().default('No'),
  nadep: text('nadep').notNull().default('No'),
  amrutKhadPits: text('amrut_khad_pits').notNull().default('No'),
  seedRootTreatment: text('seed_root_treatment').notNull().default('No'),
  useOfWasteDecomposer: text('use_of_waste_decomposer').notNull().default('No'),
  jeevamrutLitre: doublePrecision('jeevamrut_litre'),
  amrutPaniLitre: doublePrecision('amrut_pani_litre'),
  vermiWashLitre: doublePrecision('vermi_wash_litre'),

  // Soil moisture conservation
  cropResidueMulching: text('crop_residue_mulching').notNull().default('No'),
  bbfAreaHa: doublePrecision('bbf_area_ha'),
  dripAreaHa: doublePrecision('drip_area_ha'),
  sprinklerAreaHa: doublePrecision('sprinkler_area_ha'),
  waterBudgetingExercise: text('water_budgeting_exercise'),

  // Livestock
  livestockHealthCampGp: text('livestock_health_camp_gp'),
  goatRearing: text('goat_rearing'),
  backyardPoultry: text('backyard_poultry'),
  cattleSheepPenning: text('cattle_sheep_penning'),
  promotionOfFodderCrop: text('promotion_of_fodder_crop'),
  silage: text('silage'),

  // Nutrition
  kitchenGardeningAreaHa: doublePrecision('kitchen_gardening_area_ha'),
  multiLayerFarmingAreaHa: doublePrecision('multi_layer_farming_area_ha'),
  cultivationOfMilletsAreaHa: doublePrecision('cultivation_of_millets_area_ha'),

  // Capacity building
  beneficiaryFarmersExposure: text('beneficiary_farmers_exposure').notNull().default('No'),
  beneficiaryFfs: text('beneficiary_ffs').notNull().default('No'),
  beneficiaryAgroMetAdvisory: text('beneficiary_agro_met_advisory').notNull().default('No'),
  beneficiaryBrc: text('beneficiary_brc').notNull().default('No'),

  // Expense details
  expOnSeed: doublePrecision('exp_on_seed'),
  expOnSowing: doublePrecision('exp_on_sowing'),
  expOnFertilizer: doublePrecision('exp_on_fertilizer'),
  expOnWeeding: doublePrecision('exp_on_weeding'),
  expOnIrrigation: doublePrecision('exp_on_irrigation'),
  expOnTools: doublePrecision('exp_on_tools'),
  expOnIpm: doublePrecision('exp_on_ipm'),
  expOnNpm: doublePrecision('exp_on_npm'),
  otherExp: doublePrecision('other_exp'),
  totalExp: doublePrecision('total_exp'),

  // Harvesting details
  totalProductionKg: doublePrecision('total_production_kg'),
  sellValue: doublePrecision('sell_value'),
  netProfit: doublePrecision('net_profit'),

  // Documentation
  photo1: text('photo1'),
  photo2: text('photo2'),
  relatedDocuments: text('related_documents'),

  createdByUid: text('created_by_uid'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Security Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid').notNull(),
  actorEmail: text('actor_email').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(), // e.g., 'CREATE', 'UPDATE', 'DELETE', 'ROLE_CHANGE', 'INVITE_USER', 'SEED_DATA', 'RESET_DATA'
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  village: text('village'),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Projects
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  stateName: text('state_name').notNull().default('Madhya Pradesh'),
  districtName: text('district_name').notNull().default('Mandla'),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('Active'),
  createdByUid: text('created_by_uid').notNull(),
  createdByEmail: text('created_by_email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Project Geographic Hierarchy (Tehsil -> Block -> Cluster -> Village)
export const projectLocations = pgTable('project_locations', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  tehsil: text('tehsil').notNull(),
  block: text('block').notNull(),
  cluster: text('cluster').notNull(),
  village: text('village').notNull(),
  gramPanchayat: text('gram_panchayat').notNull().default(''),
  createdByUid: text('created_by_uid').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Project Team & Role Assignments
export const projectTeamMembers = pgTable('project_team_members', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  memberName: text('member_name').notNull(),
  memberEmail: text('member_email').notNull(),
  role: text('role').notNull().default('field_worker'),
  assignedTehsil: text('assigned_tehsil').notNull().default(''),
  assignedBlock: text('assigned_block').notNull().default(''),
  assignedCluster: text('assigned_cluster').notNull().default(''),
  assignedVillage: text('assigned_village').notNull().default(''),
  assignedByUid: text('assigned_by_uid').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Temporary / Custom Data Collection Forms (Admin & Project Manager Designer)
export interface SchemaCustomFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export const customForms = pgTable('custom_forms', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  fields: jsonb('fields').$type<SchemaCustomFormField[]>().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: text('expires_at'),
  createdByUid: text('created_by_uid').notNull(),
  createdByEmail: text('created_by_email').notNull(),
  createdByRole: text('created_by_role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 16. Temporary Form Submissions
export const customFormSubmissions = pgTable('custom_form_submissions', {
  id: serial('id').primaryKey(),
  formId: integer('form_id')
    .references(() => customForms.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  village: text('village').notNull().default(''),
  responses: jsonb('responses')
    .$type<Record<string, string | number | boolean>>()
    .notNull()
    .default({}),
  submittedByUid: text('submitted_by_uid').notNull(),
  submittedByEmail: text('submitted_by_email').notNull(),
  submittedByRole: text('submitted_by_role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUid],
    references: [users.uid],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  locations: many(projectLocations),
  teamMembers: many(projectTeamMembers),
  customForms: many(customForms),
}));

export const projectLocationsRelations = relations(projectLocations, ({ one }) => ({
  project: one(projects, {
    fields: [projectLocations.projectId],
    references: [projects.id],
  }),
}));

export const projectTeamMembersRelations = relations(projectTeamMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectTeamMembers.projectId],
    references: [projects.id],
  }),
}));

export const customFormsRelations = relations(customForms, ({ one, many }) => ({
  project: one(projects, {
    fields: [customForms.projectId],
    references: [projects.id],
  }),
  submissions: many(customFormSubmissions),
}));

export const customFormSubmissionsRelations = relations(customFormSubmissions, ({ one }) => ({
  form: one(customForms, {
    fields: [customFormSubmissions.formId],
    references: [customForms.id],
  }),
}));
