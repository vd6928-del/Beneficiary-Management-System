/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { desc, eq, inArray } from 'drizzle-orm';
import { db } from './index.ts';
import {
  beneficiaries,
  convergences,
  craActivities,
  cropDemoRecords,
  ffsLogs,
  healthNutrition,
  sprinklers,
  trainingsMeetings,
  vdcMeetings,
} from './schema.ts';
import type { ModuleKey } from '../types.ts';
import type { DbUser } from './users.ts';
import { getRoleMetadata } from '../lib/roles.ts';

const VALID_MODULES: ModuleKey[] = [
  'beneficiaries',
  'activities',
  'trainings',
  'nutritionLogs',
  'convergences',
  'sprinklers',
  'ffsLogs',
  'vdcMeetings',
  'cropDemoRecords',
];

export function isValidModuleKey(value: string): value is ModuleKey {
  return VALID_MODULES.includes(value as ModuleKey);
}

function asString(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  return fallback;
}

function asOptionalString(v: unknown): string | null {
  if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  return null;
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const parsed = Number(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asOptionalNumber(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : null;
}

function asInt(v: unknown, fallback = 0): number {
  return Math.round(asNumber(v, fallback));
}

function asOptionalInt(v: unknown): number | null {
  const n = asOptionalNumber(v);
  return n !== null ? Math.round(n) : null;
}

function serializeTimestamps<T extends { createdAt: Date; updatedAt?: Date }>(
  row: T
): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string } {
  const { createdAt, updatedAt: _u, ...rest } = row;
  return {
    ...rest,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
  };
}

function stripNulls<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== null) {
      result[key] = val;
    }
  }
  return result as T;
}

function getVillageFilter(user: DbUser): string[] | null {
  const perms = getRoleMetadata(user.role).permissions;
  if (perms.canViewAllVillages) return null;
  if (!user.assignedVillages || user.assignedVillages.length === 0) return null;
  return user.assignedVillages;
}

export async function getAllModuleDataForUser(user: DbUser) {
  const villageFilter = getVillageFilter(user);

  try {
    const [
      benRows,
      craRows,
      trRows,
      hnRows,
      convRows,
      sprRows,
      ffsRows,
      vdcRows,
      cropDemoRows,
    ] = await Promise.all([
      villageFilter
        ? db
            .select()
            .from(beneficiaries)
            .where(inArray(beneficiaries.village, villageFilter))
            .orderBy(desc(beneficiaries.createdAt))
        : db.select().from(beneficiaries).orderBy(desc(beneficiaries.createdAt)),
      villageFilter
        ? db
            .select()
            .from(craActivities)
            .where(inArray(craActivities.village, villageFilter))
            .orderBy(desc(craActivities.createdAt))
        : db.select().from(craActivities).orderBy(desc(craActivities.createdAt)),
      villageFilter
        ? db
            .select()
            .from(trainingsMeetings)
            .where(inArray(trainingsMeetings.village, villageFilter))
            .orderBy(desc(trainingsMeetings.createdAt))
        : db.select().from(trainingsMeetings).orderBy(desc(trainingsMeetings.createdAt)),
      villageFilter
        ? db
            .select()
            .from(healthNutrition)
            .where(inArray(healthNutrition.village, villageFilter))
            .orderBy(desc(healthNutrition.createdAt))
        : db.select().from(healthNutrition).orderBy(desc(healthNutrition.createdAt)),
      villageFilter
        ? db
            .select()
            .from(convergences)
            .where(inArray(convergences.village, villageFilter))
            .orderBy(desc(convergences.createdAt))
        : db.select().from(convergences).orderBy(desc(convergences.createdAt)),
      villageFilter
        ? db
            .select()
            .from(sprinklers)
            .where(inArray(sprinklers.village, villageFilter))
            .orderBy(desc(sprinklers.createdAt))
        : db.select().from(sprinklers).orderBy(desc(sprinklers.createdAt)),
      villageFilter
        ? db
            .select()
            .from(ffsLogs)
            .where(inArray(ffsLogs.village, villageFilter))
            .orderBy(desc(ffsLogs.createdAt))
        : db.select().from(ffsLogs).orderBy(desc(ffsLogs.createdAt)),
      villageFilter
        ? db
            .select()
            .from(vdcMeetings)
            .where(inArray(vdcMeetings.village, villageFilter))
            .orderBy(desc(vdcMeetings.createdAt))
        : db.select().from(vdcMeetings).orderBy(desc(vdcMeetings.createdAt)),
      villageFilter
        ? db
            .select()
            .from(cropDemoRecords)
            .where(inArray(cropDemoRecords.village, villageFilter))
            .orderBy(desc(cropDemoRecords.createdAt))
        : db.select().from(cropDemoRecords).orderBy(desc(cropDemoRecords.createdAt)),
    ]);

    return {
      beneficiaries: benRows.map((r) => stripNulls(serializeTimestamps(r))),
      activities: craRows.map((r) => stripNulls(serializeTimestamps(r))),
      trainings: trRows.map((r) => stripNulls(serializeTimestamps(r))),
      nutritionLogs: hnRows.map((r) => stripNulls(serializeTimestamps(r))),
      convergences: convRows.map((r) => stripNulls(serializeTimestamps(r))),
      sprinklers: sprRows.map((r) => stripNulls(serializeTimestamps(r))),
      ffsLogs: ffsRows.map((r) => stripNulls(serializeTimestamps(r))),
      vdcMeetings: vdcRows.map((r) => stripNulls(serializeTimestamps(r))),
      cropDemoRecords: cropDemoRows.map((r) => stripNulls(serializeTimestamps(r))),
    };
  } catch (error) {
    console.error('Failed to fetch module data:', error);
    throw new Error('Unable to load records from database.', { cause: error });
  }
}

export async function getRecordMetaById(
  module: ModuleKey,
  id: string
): Promise<{ id: string; village: string; createdByUid: string | null } | null> {
  try {
    let rows: { id: string; village: string; createdByUid: string | null }[] = [];
    switch (module) {
      case 'beneficiaries':
        rows = await db
          .select({ id: beneficiaries.id, village: beneficiaries.village, createdByUid: beneficiaries.createdByUid })
          .from(beneficiaries)
          .where(eq(beneficiaries.id, id))
          .limit(1);
        break;
      case 'activities':
        rows = await db
          .select({ id: craActivities.id, village: craActivities.village, createdByUid: craActivities.createdByUid })
          .from(craActivities)
          .where(eq(craActivities.id, id))
          .limit(1);
        break;
      case 'trainings':
        rows = await db
          .select({ id: trainingsMeetings.id, village: trainingsMeetings.village, createdByUid: trainingsMeetings.createdByUid })
          .from(trainingsMeetings)
          .where(eq(trainingsMeetings.id, id))
          .limit(1);
        break;
      case 'nutritionLogs':
        rows = await db
          .select({ id: healthNutrition.id, village: healthNutrition.village, createdByUid: healthNutrition.createdByUid })
          .from(healthNutrition)
          .where(eq(healthNutrition.id, id))
          .limit(1);
        break;
      case 'convergences':
        rows = await db
          .select({ id: convergences.id, village: convergences.village, createdByUid: convergences.createdByUid })
          .from(convergences)
          .where(eq(convergences.id, id))
          .limit(1);
        break;
      case 'sprinklers':
        rows = await db
          .select({ id: sprinklers.id, village: sprinklers.village, createdByUid: sprinklers.createdByUid })
          .from(sprinklers)
          .where(eq(sprinklers.id, id))
          .limit(1);
        break;
      case 'ffsLogs':
        rows = await db
          .select({ id: ffsLogs.id, village: ffsLogs.village, createdByUid: ffsLogs.createdByUid })
          .from(ffsLogs)
          .where(eq(ffsLogs.id, id))
          .limit(1);
        break;
      case 'vdcMeetings':
        rows = await db
          .select({ id: vdcMeetings.id, village: vdcMeetings.village, createdByUid: vdcMeetings.createdByUid })
          .from(vdcMeetings)
          .where(eq(vdcMeetings.id, id))
          .limit(1);
        break;
      case 'cropDemoRecords':
        rows = await db
          .select({ id: cropDemoRecords.id, village: cropDemoRecords.village, createdByUid: cropDemoRecords.createdByUid })
          .from(cropDemoRecords)
          .where(eq(cropDemoRecords.id, id))
          .limit(1);
        break;
    }
    return rows[0] ?? null;
  } catch (error) {
    console.error(`Failed to look up ${module} record:`, error);
    throw new Error('Unable to look up record.', { cause: error });
  }
}

export async function createModuleRecord(
  module: ModuleKey,
  body: Record<string, unknown>,
  actor: DbUser
) {
  const id = asString(body.id) || crypto.randomUUID();
  const now = new Date();
  const createdAt = body.createdAt ? new Date(String(body.createdAt)) : now;
  const safeCreatedAt = Number.isNaN(createdAt.getTime()) ? now : createdAt;

  try {
    switch (module) {
      case 'beneficiaries': {
        const [inserted] = await db
          .insert(beneficiaries)
          .values({
            id,
            uniqueId: asString(body.uniqueId),
            name: asString(body.name),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            village: asString(body.village),
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            samagraId: asOptionalString(body.samagraId),
            mobileNo: asOptionalString(body.mobileNo),
            hamletTola: asOptionalString(body.hamletTola),
            headOfHH: asOptionalString(body.headOfHH),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'activities': {
        const [inserted] = await db
          .insert(craActivities)
          .values({
            id,
            cluster: asString(body.cluster),
            village: asString(body.village),
            uniqueId: asString(body.uniqueId),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            year: asString(body.year),
            season: asString(body.season),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            unit1Name: asString(body.unit1Name),
            unit1Value: asNumber(body.unit1Value),
            unit2Name: asOptionalString(body.unit2Name),
            unit2Value: asOptionalNumber(body.unit2Value),
            unit3Name: asOptionalString(body.unit3Name),
            unit3Value: asOptionalNumber(body.unit3Value),
            remark: asOptionalString(body.remark),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'trainings': {
        const [inserted] = await db
          .insert(trainingsMeetings)
          .values({
            id,
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            uniqueId: asString(body.uniqueId),
            nameOfParticipant: asString(body.nameOfParticipant),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            mobileNo: asString(body.mobileNo),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            dateOfTrainingMeeting: asString(body.dateOfTrainingMeeting),
            year: asString(body.year),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            agenda: asString(body.agenda),
            remarks: asOptionalString(body.remarks),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'nutritionLogs': {
        const [inserted] = await db
          .insert(healthNutrition)
          .values({
            id,
            cluster: asString(body.cluster),
            village: asString(body.village),
            uniqueId: asString(body.uniqueId),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            year: asString(body.year),
            season: asString(body.season),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            areaHa: asNumber(body.areaHa),
            remark: asOptionalString(body.remark),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'convergences': {
        const [inserted] = await db
          .insert(convergences)
          .values({
            id,
            cluster: asString(body.cluster),
            village: asString(body.village),
            samagraId: asString(body.samagraId),
            nameOfBeneficiary: asString(body.nameOfBeneficiary),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            theme: asString(body.theme),
            khasraNo: asString(body.khasraNo),
            areaPlannedHa: asNumber(body.areaPlannedHa),
            nameOfDepartment: asString(body.nameOfDepartment),
            typesOfActivitiesWork: asString(body.typesOfActivitiesWork),
            activityName: asString(body.activityName),
            length: asOptionalNumber(body.length),
            width: asOptionalNumber(body.width),
            height: asOptionalNumber(body.height),
            volumeCum: asOptionalNumber(body.volumeCum),
            capacityCrLiter: asOptionalNumber(body.capacityCrLiter),
            lat: asOptionalNumber(body.lat),
            long: asOptionalNumber(body.long),
            implementationBy: asString(body.implementationBy),
            scheme: asString(body.scheme),
            estimatedAmount: asNumber(body.estimatedAmount),
            planSubmittedDate: asOptionalString(body.planSubmittedDate),
            sanctionDate: asOptionalString(body.sanctionDate),
            tsAs: asOptionalString(body.tsAs),
            areaCoveredHa: asOptionalNumber(body.areaCoveredHa),
            workStatus: asString(body.workStatus, 'Planned'),
            workStartingDate: asOptionalString(body.workStartingDate),
            workCompletionDate: asOptionalString(body.workCompletionDate),
            completionYear: asOptionalString(body.completionYear),
            actualExpenses: asOptionalNumber(body.actualExpenses),
            evidencePhoto: asOptionalString(body.evidencePhoto),
            evidenceProceedings: asOptionalString(body.evidenceProceedings),
            evidenceLetter: asOptionalString(body.evidenceLetter),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'sprinklers': {
        const [inserted] = await db
          .insert(sprinklers)
          .values({
            id,
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            year: asString(body.year),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            theme: asString(body.theme),
            activity: asString(body.activity),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            khasraNo: asString(body.khasraNo),
            contributionAmount: asNumber(body.contributionAmount),
            receiptNo: asString(body.receiptNo),
            uniqueId: asString(body.uniqueId),
            mobileNo: asString(body.mobileNo),
            areaCoveredHac: asNumber(body.areaCoveredHac),
            photo1: asOptionalString(body.photo1),
            photo2: asOptionalString(body.photo2),
            relatedDocuments: asOptionalString(body.relatedDocuments),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'ffsLogs': {
        const [inserted] = await db
          .insert(ffsLogs)
          .values({
            id,
            nameOfProject: asString(body.nameOfProject),
            dist: asString(body.dist),
            block: asString(body.block),
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            year: asString(body.year),
            season: asString(body.season),
            dateOfFFS: asString(body.dateOfFFS),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            uniqueId: asString(body.uniqueId),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            mobileNo: asString(body.mobileNo),
            totalPresenceIncludingPrevious: asInt(body.totalPresenceIncludingPrevious),
            totalPresenceInExposureVisit: asInt(body.totalPresenceInExposureVisit),
            nameOfCrop: asString(body.nameOfCrop),
            topicOfFFS: asString(body.topicOfFFS),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'vdcMeetings': {
        const [inserted] = await db
          .insert(vdcMeetings)
          .values({
            id,
            village: asString(body.village),
            placeOfMeeting: asString(body.placeOfMeeting),
            year: asString(body.year),
            date: asString(body.date),
            nameOfParticipant: asString(body.nameOfParticipant),
            headOfHH: asString(body.headOfHH, 'Yes'),
            hamletTola: asString(body.hamletTola),
            samagraIdNo: asString(body.samagraIdNo),
            mobileNo: asString(body.mobileNo),
            meetingsAttended: asInt(body.meetingsAttended, 1),
            agenda: asString(body.agenda),
            decisionTaken: asString(body.decisionTaken),
            activityImplementation: asString(body.activityImplementation),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }

      case 'cropDemoRecords': {
        const expSeed = asOptionalNumber(body.expOnSeed);
        const expSowing = asOptionalNumber(body.expOnSowing);
        const expFert = asOptionalNumber(body.expOnFertilizer);
        const expWeed = asOptionalNumber(body.expOnWeeding);
        const expIrr = asOptionalNumber(body.expOnIrrigation);
        const expTools = asOptionalNumber(body.expOnTools);
        const expIpm = asOptionalNumber(body.expOnIpm);
        const expNpm = asOptionalNumber(body.expOnNpm);
        const expOther = asOptionalNumber(body.otherExp);
        const computedTotalExp =
          asOptionalNumber(body.totalExp) ??
          Number(
            (
              (expSeed || 0) +
              (expSowing || 0) +
              (expFert || 0) +
              (expWeed || 0) +
              (expIrr || 0) +
              (expTools || 0) +
              (expIpm || 0) +
              (expNpm || 0) +
              (expOther || 0)
            ).toFixed(2)
          );
        const sellVal = asOptionalNumber(body.sellValue);
        const computedNetProfit =
          asOptionalNumber(body.netProfit) ??
          (sellVal !== null ? Number((sellVal - computedTotalExp).toFixed(2)) : null);

        const [inserted] = await db
          .insert(cropDemoRecords)
          .values({
            id,
            sn: asOptionalString(body.sn),
            nameOfProject: asString(body.nameOfProject),
            dist: asString(body.dist),
            block: asString(body.block),
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            year: asString(body.year),
            season: asString(body.season),

            farmerIdSamagra: asString(body.farmerIdSamagra),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            totalAreaHa: asOptionalNumber(body.totalAreaHa),
            cultivableLandHa: asOptionalNumber(body.cultivableLandHa),
            fallowLandHa: asOptionalNumber(body.fallowLandHa),
            areaInKharifHa: asOptionalNumber(body.areaInKharifHa),
            areaInRabiHa: asOptionalNumber(body.areaInRabiHa),
            demoAreaHa: asOptionalNumber(body.demoAreaHa),
            isSriSciDemoFarmer: asString(body.isSriSciDemoFarmer, 'No'),
            farmPreciseAppUser: asString(body.farmPreciseAppUser, 'No'),
            mobileNo: asString(body.mobileNo),

            mainCrop: asString(body.mainCrop),
            demoCrop: asString(body.demoCrop),
            sowingTransplantingDate: asOptionalString(body.sowingTransplantingDate),
            nameOfIntercrop: asOptionalString(body.nameOfIntercrop),
            plantSpaceDetails: asOptionalString(body.plantSpaceDetails),

            soilTesting: asString(body.soilTesting, 'No'),
            cropRotationHa: asOptionalNumber(body.cropRotationHa),
            mixedCroppingHa: asOptionalNumber(body.mixedCroppingHa),
            interCroppingHa: asOptionalNumber(body.interCroppingHa),

            dashparniArkLiter: asOptionalNumber(body.dashparniArkLiter),
            nskeNeemarkLiter: asOptionalNumber(body.nskeNeemarkLiter),
            neemastraLiter: asOptionalNumber(body.neemastraLiter),
            trapCropName: asOptionalString(body.trapCropName),
            birdPerchesNo: asOptionalInt(body.birdPerchesNo),
            pheromoneTrapNo: asOptionalInt(body.pheromoneTrapNo),
            lightTrapNo: asOptionalInt(body.lightTrapNo),
            yellowTrapNo: asOptionalInt(body.yellowTrapNo),

            greenManureCultivationHa: asOptionalNumber(body.greenManureCultivationHa),
            useOfFym: asString(body.useOfFym, 'No'),
            compostingPitsFym: asString(body.compostingPitsFym, 'No'),
            tetraVermiBed: asString(body.tetraVermiBed, 'No'),
            lowCostVermiBed: asString(body.lowCostVermiBed, 'No'),
            nadep: asString(body.nadep, 'No'),
            amrutKhadPits: asString(body.amrutKhadPits, 'No'),
            seedRootTreatment: asString(body.seedRootTreatment, 'No'),
            useOfWasteDecomposer: asString(body.useOfWasteDecomposer, 'No'),
            jeevamrutLitre: asOptionalNumber(body.jeevamrutLitre),
            amrutPaniLitre: asOptionalNumber(body.amrutPaniLitre),
            vermiWashLitre: asOptionalNumber(body.vermiWashLitre),

            cropResidueMulching: asString(body.cropResidueMulching, 'No'),
            bbfAreaHa: asOptionalNumber(body.bbfAreaHa),
            dripAreaHa: asOptionalNumber(body.dripAreaHa),
            sprinklerAreaHa: asOptionalNumber(body.sprinklerAreaHa),
            waterBudgetingExercise: asOptionalString(body.waterBudgetingExercise),

            livestockHealthCampGp: asOptionalString(body.livestockHealthCampGp),
            goatRearing: asOptionalString(body.goatRearing),
            backyardPoultry: asOptionalString(body.backyardPoultry),
            cattleSheepPenning: asOptionalString(body.cattleSheepPenning),
            promotionOfFodderCrop: asOptionalString(body.promotionOfFodderCrop),
            silage: asOptionalString(body.silage),

            kitchenGardeningAreaHa: asOptionalNumber(body.kitchenGardeningAreaHa),
            multiLayerFarmingAreaHa: asOptionalNumber(body.multiLayerFarmingAreaHa),
            cultivationOfMilletsAreaHa: asOptionalNumber(body.cultivationOfMilletsAreaHa),

            beneficiaryFarmersExposure: asString(body.beneficiaryFarmersExposure, 'No'),
            beneficiaryFfs: asString(body.beneficiaryFfs, 'No'),
            beneficiaryAgroMetAdvisory: asString(body.beneficiaryAgroMetAdvisory, 'No'),
            beneficiaryBrc: asString(body.beneficiaryBrc, 'No'),

            expOnSeed: expSeed,
            expOnSowing: expSowing,
            expOnFertilizer: expFert,
            expOnWeeding: expWeed,
            expOnIrrigation: expIrr,
            expOnTools: expTools,
            expOnIpm: expIpm,
            expOnNpm: expNpm,
            otherExp: expOther,
            totalExp: computedTotalExp,

            totalProductionKg: asOptionalNumber(body.totalProductionKg),
            sellValue: sellVal,
            netProfit: computedNetProfit,

            photo1: asOptionalString(body.photo1),
            photo2: asOptionalString(body.photo2),
            relatedDocuments: asOptionalString(body.relatedDocuments),

            createdByUid: actor.uid,
            createdByEmail: actor.email,
            createdAt: safeCreatedAt,
            updatedAt: now,
          })
          .returning();
        return stripNulls(serializeTimestamps(inserted));
      }
    }
  } catch (error: any) {
    console.error(`Failed to create ${module} record:`, error);
    if (error?.code === '23505') {
      throw new Error('A record with this Unique ID already exists.', { cause: error });
    }
    throw new Error('Unable to save record. Please check your input.', { cause: error });
  }
}

export async function updateModuleRecord(
  module: ModuleKey,
  id: string,
  body: Record<string, unknown>
) {
  const now = new Date();

  try {
    switch (module) {
      case 'beneficiaries': {
        const [updated] = await db
          .update(beneficiaries)
          .set({
            uniqueId: asString(body.uniqueId),
            name: asString(body.name),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            village: asString(body.village),
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            samagraId: asOptionalString(body.samagraId),
            mobileNo: asOptionalString(body.mobileNo),
            hamletTola: asOptionalString(body.hamletTola),
            headOfHH: asOptionalString(body.headOfHH),
            updatedAt: now,
          })
          .where(eq(beneficiaries.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'activities': {
        const [updated] = await db
          .update(craActivities)
          .set({
            cluster: asString(body.cluster),
            village: asString(body.village),
            uniqueId: asString(body.uniqueId),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            year: asString(body.year),
            season: asString(body.season),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            unit1Name: asString(body.unit1Name),
            unit1Value: asNumber(body.unit1Value),
            unit2Name: asOptionalString(body.unit2Name),
            unit2Value: asOptionalNumber(body.unit2Value),
            unit3Name: asOptionalString(body.unit3Name),
            unit3Value: asOptionalNumber(body.unit3Value),
            remark: asOptionalString(body.remark),
            updatedAt: now,
          })
          .where(eq(craActivities.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'trainings': {
        const [updated] = await db
          .update(trainingsMeetings)
          .set({
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            uniqueId: asString(body.uniqueId),
            nameOfParticipant: asString(body.nameOfParticipant),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            mobileNo: asString(body.mobileNo),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            dateOfTrainingMeeting: asString(body.dateOfTrainingMeeting),
            year: asString(body.year),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            agenda: asString(body.agenda),
            remarks: asOptionalString(body.remarks),
            updatedAt: now,
          })
          .where(eq(trainingsMeetings.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'nutritionLogs': {
        const [updated] = await db
          .update(healthNutrition)
          .set({
            cluster: asString(body.cluster),
            village: asString(body.village),
            uniqueId: asString(body.uniqueId),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            year: asString(body.year),
            season: asString(body.season),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            areaHa: asNumber(body.areaHa),
            remark: asOptionalString(body.remark),
            updatedAt: now,
          })
          .where(eq(healthNutrition.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'convergences': {
        const [updated] = await db
          .update(convergences)
          .set({
            cluster: asString(body.cluster),
            village: asString(body.village),
            samagraId: asString(body.samagraId),
            nameOfBeneficiary: asString(body.nameOfBeneficiary),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            theme: asString(body.theme),
            khasraNo: asString(body.khasraNo),
            areaPlannedHa: asNumber(body.areaPlannedHa),
            nameOfDepartment: asString(body.nameOfDepartment),
            typesOfActivitiesWork: asString(body.typesOfActivitiesWork),
            activityName: asString(body.activityName),
            length: asOptionalNumber(body.length),
            width: asOptionalNumber(body.width),
            height: asOptionalNumber(body.height),
            volumeCum: asOptionalNumber(body.volumeCum),
            capacityCrLiter: asOptionalNumber(body.capacityCrLiter),
            lat: asOptionalNumber(body.lat),
            long: asOptionalNumber(body.long),
            implementationBy: asString(body.implementationBy),
            scheme: asString(body.scheme),
            estimatedAmount: asNumber(body.estimatedAmount),
            planSubmittedDate: asOptionalString(body.planSubmittedDate),
            sanctionDate: asOptionalString(body.sanctionDate),
            tsAs: asOptionalString(body.tsAs),
            areaCoveredHa: asOptionalNumber(body.areaCoveredHa),
            workStatus: asString(body.workStatus, 'Planned'),
            workStartingDate: asOptionalString(body.workStartingDate),
            workCompletionDate: asOptionalString(body.workCompletionDate),
            completionYear: asOptionalString(body.completionYear),
            actualExpenses: asOptionalNumber(body.actualExpenses),
            evidencePhoto: asOptionalString(body.evidencePhoto),
            evidenceProceedings: asOptionalString(body.evidenceProceedings),
            evidenceLetter: asOptionalString(body.evidenceLetter),
            updatedAt: now,
          })
          .where(eq(convergences.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'sprinklers': {
        const [updated] = await db
          .update(sprinklers)
          .set({
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            year: asString(body.year),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            theme: asString(body.theme),
            activity: asString(body.activity),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            khasraNo: asString(body.khasraNo),
            contributionAmount: asNumber(body.contributionAmount),
            receiptNo: asString(body.receiptNo),
            uniqueId: asString(body.uniqueId),
            mobileNo: asString(body.mobileNo),
            areaCoveredHac: asNumber(body.areaCoveredHac),
            photo1: asOptionalString(body.photo1),
            photo2: asOptionalString(body.photo2),
            relatedDocuments: asOptionalString(body.relatedDocuments),
            updatedAt: now,
          })
          .where(eq(sprinklers.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'ffsLogs': {
        const [updated] = await db
          .update(ffsLogs)
          .set({
            nameOfProject: asString(body.nameOfProject),
            dist: asString(body.dist),
            block: asString(body.block),
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            year: asString(body.year),
            season: asString(body.season),
            dateOfFFS: asString(body.dateOfFFS),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            uniqueId: asString(body.uniqueId),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            mobileNo: asString(body.mobileNo),
            totalPresenceIncludingPrevious: asInt(body.totalPresenceIncludingPrevious),
            totalPresenceInExposureVisit: asInt(body.totalPresenceInExposureVisit),
            nameOfCrop: asString(body.nameOfCrop),
            topicOfFFS: asString(body.topicOfFFS),
            updatedAt: now,
          })
          .where(eq(ffsLogs.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'vdcMeetings': {
        const [updated] = await db
          .update(vdcMeetings)
          .set({
            village: asString(body.village),
            placeOfMeeting: asString(body.placeOfMeeting),
            year: asString(body.year),
            date: asString(body.date),
            nameOfParticipant: asString(body.nameOfParticipant),
            headOfHH: asString(body.headOfHH, 'Yes'),
            hamletTola: asString(body.hamletTola),
            samagraIdNo: asString(body.samagraIdNo),
            mobileNo: asString(body.mobileNo),
            meetingsAttended: asInt(body.meetingsAttended, 1),
            agenda: asString(body.agenda),
            decisionTaken: asString(body.decisionTaken),
            activityImplementation: asString(body.activityImplementation),
            updatedAt: now,
          })
          .where(eq(vdcMeetings.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }

      case 'cropDemoRecords': {
        const expSeed = asOptionalNumber(body.expOnSeed);
        const expSowing = asOptionalNumber(body.expOnSowing);
        const expFert = asOptionalNumber(body.expOnFertilizer);
        const expWeed = asOptionalNumber(body.expOnWeeding);
        const expIrr = asOptionalNumber(body.expOnIrrigation);
        const expTools = asOptionalNumber(body.expOnTools);
        const expIpm = asOptionalNumber(body.expOnIpm);
        const expNpm = asOptionalNumber(body.expOnNpm);
        const expOther = asOptionalNumber(body.otherExp);
        const computedTotalExp =
          asOptionalNumber(body.totalExp) ??
          Number(
            (
              (expSeed || 0) +
              (expSowing || 0) +
              (expFert || 0) +
              (expWeed || 0) +
              (expIrr || 0) +
              (expTools || 0) +
              (expIpm || 0) +
              (expNpm || 0) +
              (expOther || 0)
            ).toFixed(2)
          );
        const sellVal = asOptionalNumber(body.sellValue);
        const computedNetProfit =
          asOptionalNumber(body.netProfit) ??
          (sellVal !== null ? Number((sellVal - computedTotalExp).toFixed(2)) : null);

        const [updated] = await db
          .update(cropDemoRecords)
          .set({
            sn: asOptionalString(body.sn),
            nameOfProject: asString(body.nameOfProject),
            dist: asString(body.dist),
            block: asString(body.block),
            cluster: asString(body.cluster),
            gramPanchayat: asString(body.gramPanchayat),
            village: asString(body.village),
            theme: asString(body.theme),
            activityName: asString(body.activityName),
            year: asString(body.year),
            season: asString(body.season),

            farmerIdSamagra: asString(body.farmerIdSamagra),
            nameOfFarmer: asString(body.nameOfFarmer),
            fatherHusbandName: asString(body.fatherHusbandName),
            gender: asString(body.gender, 'Male'),
            beneficiaryType: asString(body.beneficiaryType, 'Direct'),
            totalAreaHa: asOptionalNumber(body.totalAreaHa),
            cultivableLandHa: asOptionalNumber(body.cultivableLandHa),
            fallowLandHa: asOptionalNumber(body.fallowLandHa),
            areaInKharifHa: asOptionalNumber(body.areaInKharifHa),
            areaInRabiHa: asOptionalNumber(body.areaInRabiHa),
            demoAreaHa: asOptionalNumber(body.demoAreaHa),
            isSriSciDemoFarmer: asString(body.isSriSciDemoFarmer, 'No'),
            farmPreciseAppUser: asString(body.farmPreciseAppUser, 'No'),
            mobileNo: asString(body.mobileNo),

            mainCrop: asString(body.mainCrop),
            demoCrop: asString(body.demoCrop),
            sowingTransplantingDate: asOptionalString(body.sowingTransplantingDate),
            nameOfIntercrop: asOptionalString(body.nameOfIntercrop),
            plantSpaceDetails: asOptionalString(body.plantSpaceDetails),

            soilTesting: asString(body.soilTesting, 'No'),
            cropRotationHa: asOptionalNumber(body.cropRotationHa),
            mixedCroppingHa: asOptionalNumber(body.mixedCroppingHa),
            interCroppingHa: asOptionalNumber(body.interCroppingHa),

            dashparniArkLiter: asOptionalNumber(body.dashparniArkLiter),
            nskeNeemarkLiter: asOptionalNumber(body.nskeNeemarkLiter),
            neemastraLiter: asOptionalNumber(body.neemastraLiter),
            trapCropName: asOptionalString(body.trapCropName),
            birdPerchesNo: asOptionalInt(body.birdPerchesNo),
            pheromoneTrapNo: asOptionalInt(body.pheromoneTrapNo),
            lightTrapNo: asOptionalInt(body.lightTrapNo),
            yellowTrapNo: asOptionalInt(body.yellowTrapNo),

            greenManureCultivationHa: asOptionalNumber(body.greenManureCultivationHa),
            useOfFym: asString(body.useOfFym, 'No'),
            compostingPitsFym: asString(body.compostingPitsFym, 'No'),
            tetraVermiBed: asString(body.tetraVermiBed, 'No'),
            lowCostVermiBed: asString(body.lowCostVermiBed, 'No'),
            nadep: asString(body.nadep, 'No'),
            amrutKhadPits: asString(body.amrutKhadPits, 'No'),
            seedRootTreatment: asString(body.seedRootTreatment, 'No'),
            useOfWasteDecomposer: asString(body.useOfWasteDecomposer, 'No'),
            jeevamrutLitre: asOptionalNumber(body.jeevamrutLitre),
            amrutPaniLitre: asOptionalNumber(body.amrutPaniLitre),
            vermiWashLitre: asOptionalNumber(body.vermiWashLitre),

            cropResidueMulching: asString(body.cropResidueMulching, 'No'),
            bbfAreaHa: asOptionalNumber(body.bbfAreaHa),
            dripAreaHa: asOptionalNumber(body.dripAreaHa),
            sprinklerAreaHa: asOptionalNumber(body.sprinklerAreaHa),
            waterBudgetingExercise: asOptionalString(body.waterBudgetingExercise),

            livestockHealthCampGp: asOptionalString(body.livestockHealthCampGp),
            goatRearing: asOptionalString(body.goatRearing),
            backyardPoultry: asOptionalString(body.backyardPoultry),
            cattleSheepPenning: asOptionalString(body.cattleSheepPenning),
            promotionOfFodderCrop: asOptionalString(body.promotionOfFodderCrop),
            silage: asOptionalString(body.silage),

            kitchenGardeningAreaHa: asOptionalNumber(body.kitchenGardeningAreaHa),
            multiLayerFarmingAreaHa: asOptionalNumber(body.multiLayerFarmingAreaHa),
            cultivationOfMilletsAreaHa: asOptionalNumber(body.cultivationOfMilletsAreaHa),

            beneficiaryFarmersExposure: asString(body.beneficiaryFarmersExposure, 'No'),
            beneficiaryFfs: asString(body.beneficiaryFfs, 'No'),
            beneficiaryAgroMetAdvisory: asString(body.beneficiaryAgroMetAdvisory, 'No'),
            beneficiaryBrc: asString(body.beneficiaryBrc, 'No'),

            expOnSeed: expSeed,
            expOnSowing: expSowing,
            expOnFertilizer: expFert,
            expOnWeeding: expWeed,
            expOnIrrigation: expIrr,
            expOnTools: expTools,
            expOnIpm: expIpm,
            expOnNpm: expNpm,
            otherExp: expOther,
            totalExp: computedTotalExp,

            totalProductionKg: asOptionalNumber(body.totalProductionKg),
            sellValue: sellVal,
            netProfit: computedNetProfit,

            photo1: asOptionalString(body.photo1),
            photo2: asOptionalString(body.photo2),
            relatedDocuments: asOptionalString(body.relatedDocuments),

            updatedAt: now,
          })
          .where(eq(cropDemoRecords.id, id))
          .returning();
        return updated ? stripNulls(serializeTimestamps(updated)) : null;
      }
    }
  } catch (error: any) {
    console.error(`Failed to update ${module} record:`, error);
    if (error?.code === '23505') {
      throw new Error('A record with this Unique ID already exists.', { cause: error });
    }
    throw new Error('Unable to update record.', { cause: error });
  }
}

export async function deleteModuleRecord(module: ModuleKey, id: string): Promise<boolean> {
  try {
    let deleted: { id: string }[] = [];
    switch (module) {
      case 'beneficiaries':
        deleted = await db.delete(beneficiaries).where(eq(beneficiaries.id, id)).returning({ id: beneficiaries.id });
        break;
      case 'activities':
        deleted = await db.delete(craActivities).where(eq(craActivities.id, id)).returning({ id: craActivities.id });
        break;
      case 'trainings':
        deleted = await db.delete(trainingsMeetings).where(eq(trainingsMeetings.id, id)).returning({ id: trainingsMeetings.id });
        break;
      case 'nutritionLogs':
        deleted = await db.delete(healthNutrition).where(eq(healthNutrition.id, id)).returning({ id: healthNutrition.id });
        break;
      case 'convergences':
        deleted = await db.delete(convergences).where(eq(convergences.id, id)).returning({ id: convergences.id });
        break;
      case 'sprinklers':
        deleted = await db.delete(sprinklers).where(eq(sprinklers.id, id)).returning({ id: sprinklers.id });
        break;
      case 'ffsLogs':
        deleted = await db.delete(ffsLogs).where(eq(ffsLogs.id, id)).returning({ id: ffsLogs.id });
        break;
      case 'vdcMeetings':
        deleted = await db.delete(vdcMeetings).where(eq(vdcMeetings.id, id)).returning({ id: vdcMeetings.id });
        break;
      case 'cropDemoRecords':
        deleted = await db.delete(cropDemoRecords).where(eq(cropDemoRecords.id, id)).returning({ id: cropDemoRecords.id });
        break;
    }
    return deleted.length > 0;
  } catch (error) {
    console.error(`Failed to delete ${module} record:`, error);
    throw new Error('Unable to delete record.', { cause: error });
  }
}

export async function seedAllModuleData(
  payload: Partial<Record<ModuleKey, Record<string, unknown>[]>>,
  actor: DbUser
): Promise<void> {
  try {
    const existingBeneficiaries = await db
      .select({ id: beneficiaries.id })
      .from(beneficiaries)
      .limit(1);
    if (existingBeneficiaries.length > 0) {
      throw new Error('Demo data can only be populated when the catalog is empty.');
    }

    const modules: ModuleKey[] = [
      'beneficiaries',
      'activities',
      'trainings',
      'nutritionLogs',
      'convergences',
      'sprinklers',
      'ffsLogs',
      'vdcMeetings',
      'cropDemoRecords',
    ];
    for (const mod of modules) {
      const items = payload[mod];
      if (Array.isArray(items)) {
        for (const item of items) {
          await createModuleRecord(mod, item, actor);
        }
      }
    }
  } catch (error: any) {
    if (error?.message?.includes('when the catalog is empty')) {
      throw error;
    }
    console.error('Failed to seed module data:', error);
    throw new Error('Unable to populate demo data.', { cause: error });
  }
}
