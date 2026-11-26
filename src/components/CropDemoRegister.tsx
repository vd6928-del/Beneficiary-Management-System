/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Form8CropDemoRecord,
  Beneficiary,
  VILLAGES,
  VillageType,
} from '../types';
import { generateId } from '../utils';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Download,
  Check,
  AlertCircle,
  X,
  Eye,
  Wheat,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface CropDemoRegisterProps {
  records: Form8CropDemoRecord[];
  beneficiaries: Beneficiary[];
  onAdd: (r: Form8CropDemoRecord) => void;
  onUpdate: (r: Form8CropDemoRecord) => void;
  onDelete: (id: string) => void;
  onExportCSV: (rows: Record<string, any>[], filename: string) => void;
}

type YesNo = 'Yes' | 'No';

interface FormState {
  // 1. Project details
  sn: string;
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

  // 2. Farmer details
  farmerIdSamagra: string;
  nameOfFarmer: string;
  fatherHusbandName: string;
  gender: 'Male' | 'Female' | 'Other';
  beneficiaryType: 'Direct' | 'Indirect';
  totalAreaHa: string;
  cultivableLandHa: string;
  fallowLandHa: string;
  areaInKharifHa: string;
  areaInRabiHa: string;
  demoAreaHa: string;
  isSriSciDemoFarmer: YesNo;
  farmPreciseAppUser: YesNo;
  mobileNo: string;

  // 3. Crop details
  mainCrop: string;
  demoCrop: string;
  sowingTransplantingDate: string;
  nameOfIntercrop: string;
  plantSpaceDetails: string;

  // 4. Land management
  soilTesting: YesNo;
  cropRotationHa: string;
  mixedCroppingHa: string;
  interCroppingHa: string;

  // 5. Pest and disease management
  dashparniArkLiter: string;
  nskeNeemarkLiter: string;
  neemastraLiter: string;
  trapCropName: string;
  birdPerchesNo: string;
  pheromoneTrapNo: string;
  lightTrapNo: string;
  yellowTrapNo: string;

  // 6. Nutrient management
  greenManureCultivationHa: string;
  useOfFym: YesNo;
  compostingPitsFym: YesNo;
  tetraVermiBed: YesNo;
  lowCostVermiBed: YesNo;
  nadep: YesNo;
  amrutKhadPits: YesNo;
  seedRootTreatment: YesNo;
  useOfWasteDecomposer: YesNo;
  jeevamrutLitre: string;
  amrutPaniLitre: string;
  vermiWashLitre: string;

  // 7. Soil moisture conservation
  cropResidueMulching: YesNo;
  bbfAreaHa: string;
  dripAreaHa: string;
  sprinklerAreaHa: string;
  waterBudgetingExercise: string;

  // 8. Livestock
  livestockHealthCampGp: string;
  goatRearing: string;
  backyardPoultry: string;
  cattleSheepPenning: string;
  promotionOfFodderCrop: string;
  silage: string;

  // 9. Nutrition
  kitchenGardeningAreaHa: string;
  multiLayerFarmingAreaHa: string;
  cultivationOfMilletsAreaHa: string;

  // 10. Capacity building
  beneficiaryFarmersExposure: YesNo;
  beneficiaryFfs: YesNo;
  beneficiaryAgroMetAdvisory: YesNo;
  beneficiaryBrc: YesNo;

  // 11. Expense details
  expOnSeed: string;
  expOnSowing: string;
  expOnFertilizer: string;
  expOnWeeding: string;
  expOnIrrigation: string;
  expOnTools: string;
  expOnIpm: string;
  expOnNpm: string;
  otherExp: string;

  // 12. Harvesting details
  totalProductionKg: string;
  sellValue: string;

  // 13. Documentation
  photo1: string;
  photo2: string;
  relatedDocuments: string;
}

const INITIAL_FORM_STATE: FormState = {
  sn: '',
  nameOfProject: '',
  dist: 'Mandla',
  block: '',
  cluster: '',
  gramPanchayat: '',
  village: 'Sukhram',
  theme: 'Climate Resilient Agriculture',
  activityName: '',
  year: '2025-26',
  season: 'Kharif',

  farmerIdSamagra: '',
  nameOfFarmer: '',
  fatherHusbandName: '',
  gender: 'Male',
  beneficiaryType: 'Direct',
  totalAreaHa: '',
  cultivableLandHa: '',
  fallowLandHa: '',
  areaInKharifHa: '',
  areaInRabiHa: '',
  demoAreaHa: '',
  isSriSciDemoFarmer: 'No',
  farmPreciseAppUser: 'No',
  mobileNo: '',

  mainCrop: '',
  demoCrop: '',
  sowingTransplantingDate: '',
  nameOfIntercrop: '',
  plantSpaceDetails: '',

  soilTesting: 'No',
  cropRotationHa: '',
  mixedCroppingHa: '',
  interCroppingHa: '',

  dashparniArkLiter: '',
  nskeNeemarkLiter: '',
  neemastraLiter: '',
  trapCropName: '',
  birdPerchesNo: '',
  pheromoneTrapNo: '',
  lightTrapNo: '',
  yellowTrapNo: '',

  greenManureCultivationHa: '',
  useOfFym: 'No',
  compostingPitsFym: 'No',
  tetraVermiBed: 'No',
  lowCostVermiBed: 'No',
  nadep: 'No',
  amrutKhadPits: 'No',
  seedRootTreatment: 'No',
  useOfWasteDecomposer: 'No',
  jeevamrutLitre: '',
  amrutPaniLitre: '',
  vermiWashLitre: '',

  cropResidueMulching: 'No',
  bbfAreaHa: '',
  dripAreaHa: '',
  sprinklerAreaHa: '',
  waterBudgetingExercise: '',

  livestockHealthCampGp: '',
  goatRearing: '',
  backyardPoultry: '',
  cattleSheepPenning: '',
  promotionOfFodderCrop: '',
  silage: '',

  kitchenGardeningAreaHa: '',
  multiLayerFarmingAreaHa: '',
  cultivationOfMilletsAreaHa: '',

  beneficiaryFarmersExposure: 'No',
  beneficiaryFfs: 'No',
  beneficiaryAgroMetAdvisory: 'No',
  beneficiaryBrc: 'No',

  expOnSeed: '',
  expOnSowing: '',
  expOnFertilizer: '',
  expOnWeeding: '',
  expOnIrrigation: '',
  expOnTools: '',
  expOnIpm: '',
  expOnNpm: '',
  otherExp: '',

  totalProductionKg: '',
  sellValue: '',

  photo1: '',
  photo2: '',
  relatedDocuments: '',
};

const SECTIONS = [
  { id: 'all', label: 'All Sections' },
  { id: 'project', label: '1. Project' },
  { id: 'farmer', label: '2. Farmer' },
  { id: 'crop', label: '3. Crop' },
  { id: 'land', label: '4. Land Mgmt' },
  { id: 'pest', label: '5. Pest & Disease' },
  { id: 'nutrient', label: '6. Nutrient' },
  { id: 'moisture', label: '7. Soil Moisture' },
  { id: 'livestock', label: '8. Livestock' },
  { id: 'nutrition', label: '9. Nutrition' },
  { id: 'capacity', label: '10. Capacity' },
  { id: 'expense', label: '11. Expenses' },
  { id: 'harvest', label: '12. Harvest & Docs' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function parseNum(val: string): number | undefined {
  if (val.trim() === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function numToStr(val?: number): string {
  return val !== undefined && val !== null ? String(val) : '';
}

export default function CropDemoRegister({
  records,
  beneficiaries,
  onAdd,
  onUpdate,
  onDelete,
  onExportCSV,
}: CropDemoRegisterProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('project');
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingRecord, setViewingRecord] = useState<Form8CropDemoRecord | null>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-calculated Total Expense & Net Profit
  const totalExp = useMemo(() => {
    const sum =
      (parseNum(form.expOnSeed) || 0) +
      (parseNum(form.expOnSowing) || 0) +
      (parseNum(form.expOnFertilizer) || 0) +
      (parseNum(form.expOnWeeding) || 0) +
      (parseNum(form.expOnIrrigation) || 0) +
      (parseNum(form.expOnTools) || 0) +
      (parseNum(form.expOnIpm) || 0) +
      (parseNum(form.expOnNpm) || 0) +
      (parseNum(form.otherExp) || 0);
    return Number(sum.toFixed(2));
  }, [
    form.expOnSeed,
    form.expOnSowing,
    form.expOnFertilizer,
    form.expOnWeeding,
    form.expOnIrrigation,
    form.expOnTools,
    form.expOnIpm,
    form.expOnNpm,
    form.otherExp,
  ]);

  const netProfit = useMemo(() => {
    const sell = parseNum(form.sellValue);
    if (sell === undefined) return 0;
    return Number((sell - totalExp).toFixed(2));
  }, [form.sellValue, totalExp]);

  const handleAutofill = (b: Beneficiary) => {
    setForm((prev) => ({
      ...prev,
      nameOfFarmer: b.name,
      fatherHusbandName: b.fatherHusbandName,
      gender: b.gender,
      village: b.village,
      cluster: b.cluster || prev.cluster,
      gramPanchayat: b.gramPanchayat || prev.gramPanchayat,
      farmerIdSamagra: b.samagraId || b.uniqueId || prev.farmerIdSamagra,
      mobileNo: b.mobileNo || prev.mobileNo,
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setIsEditing(false);
    setEditId(null);
    setFormError(null);
  };

  const handleEdit = (r: Form8CropDemoRecord) => {
    setIsEditing(true);
    setEditId(r.id);
    setFormError(null);
    setForm({
      sn: r.sn || '',
      nameOfProject: r.nameOfProject || '',
      dist: r.dist || '',
      block: r.block || '',
      cluster: r.cluster || '',
      gramPanchayat: r.gramPanchayat || '',
      village: r.village || 'Sukhram',
      theme: r.theme || '',
      activityName: r.activityName || '',
      year: r.year || '',
      season: r.season || 'Kharif',

      farmerIdSamagra: r.farmerIdSamagra || '',
      nameOfFarmer: r.nameOfFarmer || '',
      fatherHusbandName: r.fatherHusbandName || '',
      gender: r.gender || 'Male',
      beneficiaryType: r.beneficiaryType || 'Direct',
      totalAreaHa: numToStr(r.totalAreaHa),
      cultivableLandHa: numToStr(r.cultivableLandHa),
      fallowLandHa: numToStr(r.fallowLandHa),
      areaInKharifHa: numToStr(r.areaInKharifHa),
      areaInRabiHa: numToStr(r.areaInRabiHa),
      demoAreaHa: numToStr(r.demoAreaHa),
      isSriSciDemoFarmer: r.isSriSciDemoFarmer === 'Yes' ? 'Yes' : 'No',
      farmPreciseAppUser: r.farmPreciseAppUser === 'Yes' ? 'Yes' : 'No',
      mobileNo: r.mobileNo || '',

      mainCrop: r.mainCrop || '',
      demoCrop: r.demoCrop || '',
      sowingTransplantingDate: r.sowingTransplantingDate || '',
      nameOfIntercrop: r.nameOfIntercrop || '',
      plantSpaceDetails: r.plantSpaceDetails || '',

      soilTesting: r.soilTesting === 'Yes' ? 'Yes' : 'No',
      cropRotationHa: numToStr(r.cropRotationHa),
      mixedCroppingHa: numToStr(r.mixedCroppingHa),
      interCroppingHa: numToStr(r.interCroppingHa),

      dashparniArkLiter: numToStr(r.dashparniArkLiter),
      nskeNeemarkLiter: numToStr(r.nskeNeemarkLiter),
      neemastraLiter: numToStr(r.neemastraLiter),
      trapCropName: r.trapCropName || '',
      birdPerchesNo: numToStr(r.birdPerchesNo),
      pheromoneTrapNo: numToStr(r.pheromoneTrapNo),
      lightTrapNo: numToStr(r.lightTrapNo),
      yellowTrapNo: numToStr(r.yellowTrapNo),

      greenManureCultivationHa: numToStr(r.greenManureCultivationHa),
      useOfFym: r.useOfFym === 'Yes' ? 'Yes' : 'No',
      compostingPitsFym: r.compostingPitsFym === 'Yes' ? 'Yes' : 'No',
      tetraVermiBed: r.tetraVermiBed === 'Yes' ? 'Yes' : 'No',
      lowCostVermiBed: r.lowCostVermiBed === 'Yes' ? 'Yes' : 'No',
      nadep: r.nadep === 'Yes' ? 'Yes' : 'No',
      amrutKhadPits: r.amrutKhadPits === 'Yes' ? 'Yes' : 'No',
      seedRootTreatment: r.seedRootTreatment === 'Yes' ? 'Yes' : 'No',
      useOfWasteDecomposer: r.useOfWasteDecomposer === 'Yes' ? 'Yes' : 'No',
      jeevamrutLitre: numToStr(r.jeevamrutLitre),
      amrutPaniLitre: numToStr(r.amrutPaniLitre),
      vermiWashLitre: numToStr(r.vermiWashLitre),

      cropResidueMulching: r.cropResidueMulching === 'Yes' ? 'Yes' : 'No',
      bbfAreaHa: numToStr(r.bbfAreaHa),
      dripAreaHa: numToStr(r.dripAreaHa),
      sprinklerAreaHa: numToStr(r.sprinklerAreaHa),
      waterBudgetingExercise: r.waterBudgetingExercise || '',

      livestockHealthCampGp: r.livestockHealthCampGp || '',
      goatRearing: r.goatRearing || '',
      backyardPoultry: r.backyardPoultry || '',
      cattleSheepPenning: r.cattleSheepPenning || '',
      promotionOfFodderCrop: r.promotionOfFodderCrop || '',
      silage: r.silage || '',

      kitchenGardeningAreaHa: numToStr(r.kitchenGardeningAreaHa),
      multiLayerFarmingAreaHa: numToStr(r.multiLayerFarmingAreaHa),
      cultivationOfMilletsAreaHa: numToStr(r.cultivationOfMilletsAreaHa),

      beneficiaryFarmersExposure: r.beneficiaryFarmersExposure === 'Yes' ? 'Yes' : 'No',
      beneficiaryFfs: r.beneficiaryFfs === 'Yes' ? 'Yes' : 'No',
      beneficiaryAgroMetAdvisory: r.beneficiaryAgroMetAdvisory === 'Yes' ? 'Yes' : 'No',
      beneficiaryBrc: r.beneficiaryBrc === 'Yes' ? 'Yes' : 'No',

      expOnSeed: numToStr(r.expOnSeed),
      expOnSowing: numToStr(r.expOnSowing),
      expOnFertilizer: numToStr(r.expOnFertilizer),
      expOnWeeding: numToStr(r.expOnWeeding),
      expOnIrrigation: numToStr(r.expOnIrrigation),
      expOnTools: numToStr(r.expOnTools),
      expOnIpm: numToStr(r.expOnIpm),
      expOnNpm: numToStr(r.expOnNpm),
      otherExp: numToStr(r.otherExp),

      totalProductionKg: numToStr(r.totalProductionKg),
      sellValue: numToStr(r.sellValue),

      photo1: r.photo1 || '',
      photo2: r.photo2 || '',
      relatedDocuments: r.relatedDocuments || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameOfProject.trim() || !form.nameOfFarmer.trim()) {
      setFormError('Name of Project and Name of Farmer are required to save this record.');
      return;
    }
    setFormError(null);

    const record: Form8CropDemoRecord = {
      id: isEditing && editId ? editId : generateId(),
      sn: form.sn.trim() || String(records.length + 1),
      nameOfProject: form.nameOfProject.trim(),
      dist: form.dist.trim(),
      block: form.block.trim(),
      cluster: form.cluster.trim() || `${form.village} Cluster`,
      gramPanchayat: form.gramPanchayat.trim(),
      village: form.village,
      theme: form.theme.trim(),
      activityName: form.activityName.trim(),
      year: form.year.trim(),
      season: form.season,

      farmerIdSamagra: form.farmerIdSamagra.trim(),
      nameOfFarmer: form.nameOfFarmer.trim(),
      fatherHusbandName: form.fatherHusbandName.trim(),
      gender: form.gender,
      beneficiaryType: form.beneficiaryType,
      totalAreaHa: parseNum(form.totalAreaHa),
      cultivableLandHa: parseNum(form.cultivableLandHa),
      fallowLandHa: parseNum(form.fallowLandHa),
      areaInKharifHa: parseNum(form.areaInKharifHa),
      areaInRabiHa: parseNum(form.areaInRabiHa),
      demoAreaHa: parseNum(form.demoAreaHa),
      isSriSciDemoFarmer: form.isSriSciDemoFarmer,
      farmPreciseAppUser: form.farmPreciseAppUser,
      mobileNo: form.mobileNo.trim(),

      mainCrop: form.mainCrop.trim(),
      demoCrop: form.demoCrop.trim(),
      sowingTransplantingDate: form.sowingTransplantingDate || undefined,
      nameOfIntercrop: form.nameOfIntercrop.trim() || undefined,
      plantSpaceDetails: form.plantSpaceDetails.trim() || undefined,

      soilTesting: form.soilTesting,
      cropRotationHa: parseNum(form.cropRotationHa),
      mixedCroppingHa: parseNum(form.mixedCroppingHa),
      interCroppingHa: parseNum(form.interCroppingHa),

      dashparniArkLiter: parseNum(form.dashparniArkLiter),
      nskeNeemarkLiter: parseNum(form.nskeNeemarkLiter),
      neemastraLiter: parseNum(form.neemastraLiter),
      trapCropName: form.trapCropName.trim() || undefined,
      birdPerchesNo: parseNum(form.birdPerchesNo),
      pheromoneTrapNo: parseNum(form.pheromoneTrapNo),
      lightTrapNo: parseNum(form.lightTrapNo),
      yellowTrapNo: parseNum(form.yellowTrapNo),

      greenManureCultivationHa: parseNum(form.greenManureCultivationHa),
      useOfFym: form.useOfFym,
      compostingPitsFym: form.compostingPitsFym,
      tetraVermiBed: form.tetraVermiBed,
      lowCostVermiBed: form.lowCostVermiBed,
      nadep: form.nadep,
      amrutKhadPits: form.amrutKhadPits,
      seedRootTreatment: form.seedRootTreatment,
      useOfWasteDecomposer: form.useOfWasteDecomposer,
      jeevamrutLitre: parseNum(form.jeevamrutLitre),
      amrutPaniLitre: parseNum(form.amrutPaniLitre),
      vermiWashLitre: parseNum(form.vermiWashLitre),

      cropResidueMulching: form.cropResidueMulching,
      bbfAreaHa: parseNum(form.bbfAreaHa),
      dripAreaHa: parseNum(form.dripAreaHa),
      sprinklerAreaHa: parseNum(form.sprinklerAreaHa),
      waterBudgetingExercise: form.waterBudgetingExercise.trim() || undefined,

      livestockHealthCampGp: form.livestockHealthCampGp.trim() || undefined,
      goatRearing: form.goatRearing.trim() || undefined,
      backyardPoultry: form.backyardPoultry.trim() || undefined,
      cattleSheepPenning: form.cattleSheepPenning.trim() || undefined,
      promotionOfFodderCrop: form.promotionOfFodderCrop.trim() || undefined,
      silage: form.silage.trim() || undefined,

      kitchenGardeningAreaHa: parseNum(form.kitchenGardeningAreaHa),
      multiLayerFarmingAreaHa: parseNum(form.multiLayerFarmingAreaHa),
      cultivationOfMilletsAreaHa: parseNum(form.cultivationOfMilletsAreaHa),

      beneficiaryFarmersExposure: form.beneficiaryFarmersExposure,
      beneficiaryFfs: form.beneficiaryFfs,
      beneficiaryAgroMetAdvisory: form.beneficiaryAgroMetAdvisory,
      beneficiaryBrc: form.beneficiaryBrc,

      expOnSeed: parseNum(form.expOnSeed),
      expOnSowing: parseNum(form.expOnSowing),
      expOnFertilizer: parseNum(form.expOnFertilizer),
      expOnWeeding: parseNum(form.expOnWeeding),
      expOnIrrigation: parseNum(form.expOnIrrigation),
      expOnTools: parseNum(form.expOnTools),
      expOnIpm: parseNum(form.expOnIpm),
      expOnNpm: parseNum(form.expOnNpm),
      otherExp: parseNum(form.otherExp),
      totalExp,

      totalProductionKg: parseNum(form.totalProductionKg),
      sellValue: parseNum(form.sellValue),
      netProfit: parseNum(form.sellValue) !== undefined ? netProfit : undefined,

      photo1: form.photo1.trim() || undefined,
      photo2: form.photo2.trim() || undefined,
      relatedDocuments: form.relatedDocuments.trim() || undefined,

      createdAt:
        isEditing && editId
          ? records.find((x) => x.id === editId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
    };

    if (isEditing) {
      onUpdate(record);
    } else {
      onAdd(record);
    }
    resetForm();
  };

  const handleExport = () => {
    const flatRows = records.map((r, idx) => ({
      'S.N.': r.sn || idx + 1,
      'Name of Project': r.nameOfProject,
      Dist: r.dist,
      Block: r.block,
      Cluster: r.cluster,
      'Gram Panchayat': r.gramPanchayat,
      Village: r.village,
      Theme: r.theme,
      'Activity name': r.activityName,
      Year: r.year,
      Season: r.season,
      'Farmer ID (Samagra ID)': r.farmerIdSamagra,
      'Name of Farmer': r.nameOfFarmer,
      'Father/Husband Name': r.fatherHusbandName,
      Gender: r.gender,
      'Beneficiary type (Direct / Indirect)': r.beneficiaryType,
      'Total area (ha)': r.totalAreaHa ?? '',
      'Cultivable land (Ha.)': r.cultivableLandHa ?? '',
      'Fallow land (Ha.)': r.fallowLandHa ?? '',
      'Area in Kharif (ha)': r.areaInKharifHa ?? '',
      'Area in Rabi (ha)': r.areaInRabiHa ?? '',
      'Demo area (ha)': r.demoAreaHa ?? '',
      'Is SRI/SCI demo Farmer? (Yes/No)': r.isSriSciDemoFarmer,
      'Farm Precise app user (Yes/No)': r.farmPreciseAppUser,
      'Mobile No.': r.mobileNo,
      'Main crop': r.mainCrop,
      'Demo crop': r.demoCrop,
      'Sowing/transplanting date': r.sowingTransplantingDate ?? '',
      'Name of intercrop': r.nameOfIntercrop ?? '',
      'Plant space details': r.plantSpaceDetails ?? '',
      'Soil testing (Yes/No)': r.soilTesting,
      'Crop Rotation (ha)': r.cropRotationHa ?? '',
      'Mixed cropping (Ha)': r.mixedCroppingHa ?? '',
      'Inter Cropping (ha)': r.interCroppingHa ?? '',
      'Dashparni Ark (liter)': r.dashparniArkLiter ?? '',
      'NSKE/Neemark (liter)': r.nskeNeemarkLiter ?? '',
      'Neemastra (liter)': r.neemastraLiter ?? '',
      'Trap Crop (name of crop)': r.trapCropName ?? '',
      'Bird Perches (No.)': r.birdPerchesNo ?? '',
      'Pheromone trap (No.)': r.pheromoneTrapNo ?? '',
      'Light trap (No.)': r.lightTrapNo ?? '',
      'Yellow Trap (No.)': r.yellowTrapNo ?? '',
      'Green manure cultivation (ha)': r.greenManureCultivationHa ?? '',
      'Use of FYM (Yes/No)': r.useOfFym,
      'Composting pits (FYM) (Yes/No)': r.compostingPitsFym,
      'Tetra Vermi bed (Yes/No)': r.tetraVermiBed,
      'Low cost vermi-bed (Yes/No)': r.lowCostVermiBed,
      'NADEP (Yes/No)': r.nadep,
      'Amrut khad pits (Yes/No)': r.amrutKhadPits,
      'Seed/Root Treatment (Yes/No)': r.seedRootTreatment,
      'Use of Waste decomposer (Yes/No)': r.useOfWasteDecomposer,
      'Jeevamrut (litre)': r.jeevamrutLitre ?? '',
      'Amrut Pani (litre)': r.amrutPaniLitre ?? '',
      'Vermi Wash (litre)': r.vermiWashLitre ?? '',
      'Crop residue mulching (Yes/No)': r.cropResidueMulching,
      'Broad Bed Furrow (BBF) (area/ha)': r.bbfAreaHa ?? '',
      'Drip (area/ha)': r.dripAreaHa ?? '',
      'Sprinkler (area/ha)': r.sprinklerAreaHa ?? '',
      'Water budgeting exercise': r.waterBudgetingExercise ?? '',
      'Livestock health camp through Gram panchayat': r.livestockHealthCampGp ?? '',
      'Goat rearing': r.goatRearing ?? '',
      'Back yard poultry': r.backyardPoultry ?? '',
      'Cattle/sheep penning for soil fertility': r.cattleSheepPenning ?? '',
      'Promotion of fodder crop': r.promotionOfFodderCrop ?? '',
      Silage: r.silage ?? '',
      'Kitchen gardening (area/ha)': r.kitchenGardeningAreaHa ?? '',
      'Multi layer farming (area/ha)': r.multiLayerFarmingAreaHa ?? '',
      'Cultivation of millets (area/ha)': r.cultivationOfMilletsAreaHa ?? '',
      'Beneficiary of Farmers Exposure (Yes/No)': r.beneficiaryFarmersExposure,
      'Beneficiary of Farmer Field School (FFS) (Yes/No)': r.beneficiaryFfs,
      'Beneficiary of Agro-met Advisory (Yes/No)': r.beneficiaryAgroMetAdvisory,
      'Beneficiary of BRC (Yes/No)': r.beneficiaryBrc,
      'Exp on Seed': r.expOnSeed ?? '',
      'Exp on Sowing': r.expOnSowing ?? '',
      'Exp on Fertilizer': r.expOnFertilizer ?? '',
      'Exp on Weeding': r.expOnWeeding ?? '',
      'Exp on Irrigation': r.expOnIrrigation ?? '',
      'Exp on Tools': r.expOnTools ?? '',
      'Exp. On IPM': r.expOnIpm ?? '',
      'Exp. On NPM': r.expOnNpm ?? '',
      'Other exp': r.otherExp ?? '',
      'Total exp': r.totalExp ?? '',
      'Total production (Kg)': r.totalProductionKg ?? '',
      'Sell value': r.sellValue ?? '',
      'Net Profit': r.netProfit ?? '',
      'Photo-1': r.photo1 ?? '',
      'Photo-2': r.photo2 ?? '',
      'Related documents': r.relatedDocuments ?? '',
    }));
    onExportCSV(flatRows, 'Form8_Crop_Demo_Farmer_Progress');
  };

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.nameOfFarmer.toLowerCase().includes(q) ||
        r.farmerIdSamagra.toLowerCase().includes(q) ||
        r.village.toLowerCase().includes(q) ||
        r.nameOfProject.toLowerCase().includes(q) ||
        r.mainCrop.toLowerCase().includes(q) ||
        r.demoCrop.toLowerCase().includes(q) ||
        r.season.toLowerCase().includes(q)
    );
  }, [records, searchTerm]);

  const showSection = (id: SectionId) => activeSection === 'all' || activeSection === id;

  const stepSection = (dir: -1 | 1) => {
    const stepIds = SECTIONS.filter((s) => s.id !== 'all').map((s) => s.id);
    const idx = stepIds.indexOf(activeSection as any);
    if (idx === -1) {
      setActiveSection(dir === 1 ? stepIds[0] : stepIds[stepIds.length - 1]);
      return;
    }
    const nextIdx = Math.max(0, Math.min(stepIds.length - 1, idx + dir));
    setActiveSection(stepIds[nextIdx]);
  };

  const inputCls =
    'w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white';
  const labelCls = 'block text-[11px] font-semibold text-slate-700 mb-1';

  const renderYesNoSelect = (label: string, key: keyof FormState) => (
    <div>
      <label className={labelCls}>{label}</label>
      <select
        value={String(form[key])}
        onChange={(e) => setField(key, e.target.value as any)}
        className={inputCls}
      >
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </div>
  );

  const renderNumInput = (label: string, key: keyof FormState, placeholder = '0', step = 'any') => (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        step={step}
        value={String(form[key])}
        onChange={(e) => setField(key, e.target.value as any)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );

  const renderTextInput = (
    label: string,
    key: keyof FormState,
    placeholder = '',
    required = false,
    datalistId?: string
  ) => (
    <div>
      <label className={labelCls}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        list={datalistId}
        required={required}
        value={String(form[key])}
        onChange={(e) => setField(key, e.target.value as any)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <datalist id="yes-no-suggestions">
        <option value="Yes" />
        <option value="No" />
      </datalist>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing
                  ? 'Edit Crop Demo & Farmer Progress Record'
                  : 'Form 8: Comprehensive Crop Demo & Farmer Progress Entry'}
              </h3>
              <p className="text-xs text-slate-500">
                Complete 12-section farmer demonstration sheet: Project, Farmer, Crop, Land, IPM, Nutrient, Soil Moisture, Livestock, Nutrition, Capacity, Expenses & Harvest.
              </p>
            </div>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Section Jump Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
          {SECTIONS.map((sec) => {
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition border ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Inline Validation Banner */}
        {formError && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
            <button type="button" onClick={() => setFormError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* SECTION 1: PROJECT DETAILS */}
          {showSection('project') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                1. Project Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {renderTextInput('S.N.', 'sn', 'Auto or manual S.N.')}
                {renderTextInput('Name of Project', 'nameOfProject', 'e.g., CRA Mandla Phase II', true)}
                {renderTextInput('Dist', 'dist', 'e.g., Mandla')}
                {renderTextInput('Block', 'block', 'e.g., Ghughri')}
                {renderTextInput('Cluster', 'cluster', 'e.g., Sukhram Cluster')}
                {renderTextInput('Gram Panchayat', 'gramPanchayat', 'Gram Panchayat name')}
                <div>
                  <label className={labelCls}>
                    Village <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.village}
                    onChange={(e) => setField('village', e.target.value as VillageType)}
                    className={inputCls}
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                {renderTextInput('Theme', 'theme', 'e.g., Sustainable Agriculture')}
                {renderTextInput('Activity name', 'activityName', 'e.g., Crop Demonstration')}
                {renderTextInput('Year', 'year', 'e.g., 2025-26')}
                <div>
                  <label className={labelCls}>Season</label>
                  <select
                    value={form.season}
                    onChange={(e) => setField('season', e.target.value)}
                    className={inputCls}
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Whole Year">Whole Year</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: FARMER DETAILS */}
          {showSection('farmer') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  2. Farmer Details
                </h4>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <BeneficiarySearchSelect
                  beneficiaries={beneficiaries}
                  onSelect={handleAutofill}
                  label="Quick Autofill from Master Beneficiary Directory (Optional)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {renderTextInput('Farmer ID (Samagra ID)', 'farmerIdSamagra', 'Samagra / Unique ID')}
                {renderTextInput('Name of Farmer', 'nameOfFarmer', 'Full farmer name', true)}
                {renderTextInput('Father/Husband Name', 'fatherHusbandName', 'Father or husband name')}
                <div>
                  <label className={labelCls}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setField('gender', e.target.value as 'Male' | 'Female' | 'Other')
                    }
                    className={inputCls}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Beneficiary type (User group)</label>
                  <select
                    value={form.beneficiaryType}
                    onChange={(e) =>
                      setField('beneficiaryType', e.target.value as 'Direct' | 'Indirect')
                    }
                    className={inputCls}
                  >
                    <option value="Direct">Direct</option>
                    <option value="Indirect">Indirect</option>
                  </select>
                </div>
                {renderTextInput('Mobile No.', 'mobileNo', '10-digit mobile number')}
                {renderNumInput('Total area (ha)', 'totalAreaHa', '0.00')}
                {renderNumInput('Cultivable land (Ha.)', 'cultivableLandHa', '0.00')}
                {renderNumInput('Fallow / Fellow land (Ha.)', 'fallowLandHa', '0.00')}
                {renderNumInput('Area in Kharif (ha)', 'areaInKharifHa', '0.00')}
                {renderNumInput('Area in Rabi (ha)', 'areaInRabiHa', '0.00')}
                {renderNumInput('Demo area (ha)', 'demoAreaHa', '0.00')}
                {renderYesNoSelect('Is SRI/SCI demo Farmer? (Yes/No)', 'isSriSciDemoFarmer')}
                {renderYesNoSelect('Farm Precise app user (Yes/No)', 'farmPreciseAppUser')}
              </div>
            </section>
          )}

          {/* SECTION 3: CROP DETAILS */}
          {showSection('crop') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                3. Crop Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {renderTextInput('Main crop', 'mainCrop', 'e.g., Paddy, Wheat, Maize')}
                {renderTextInput('Demo crop', 'demoCrop', 'e.g., SRI Paddy, Kodo Millet')}
                <div>
                  <label className={labelCls}>Sowing / transplanting date</label>
                  <input
                    type="date"
                    value={form.sowingTransplantingDate}
                    onChange={(e) => setField('sowingTransplantingDate', e.target.value)}
                    className={inputCls}
                  />
                </div>
                {renderTextInput('Name of intercrop', 'nameOfIntercrop', 'e.g., Pigeon Pea, Urad')}
                <div className="sm:col-span-2">
                  {renderTextInput(
                    'Plant space details',
                    'plantSpaceDetails',
                    'e.g., 25cm x 25cm (SRI spacing)'
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: LAND MANAGEMENT */}
          {showSection('land') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                4. Land Management
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {renderYesNoSelect('Soil testing (Yes/No)', 'soilTesting')}
                {renderNumInput('Crop Rotation (ha)', 'cropRotationHa', '0.00')}
                {renderNumInput('Mixed cropping (Ha)', 'mixedCroppingHa', '0.00')}
                {renderNumInput('Inter Cropping (ha)', 'interCroppingHa', '0.00')}
              </div>
            </section>
          )}

          {/* SECTION 5: PEST AND DISEASE MANAGEMENT */}
          {showSection('pest') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                5. Pest and Disease Management
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {renderNumInput('Dashparni Ark (liter)', 'dashparniArkLiter', '0')}
                {renderNumInput('NSKE/Neemark (liter)', 'nskeNeemarkLiter', '0')}
                {renderNumInput('Neemastra (liter)', 'neemastraLiter', '0')}
                {renderTextInput('Trap Crop (name of crop)', 'trapCropName', 'e.g., Marigold')}
                {renderNumInput('Bird Perches (No.)', 'birdPerchesNo', '0', '1')}
                {renderNumInput('Pheromone trap (No.)', 'pheromoneTrapNo', '0', '1')}
                {renderNumInput('Light trap (No.)', 'lightTrapNo', '0', '1')}
                {renderNumInput('Yellow Trap (No.)', 'yellowTrapNo', '0', '1')}
              </div>
            </section>
          )}

          {/* SECTION 6: NUTRIENT MANAGEMENT */}
          {showSection('nutrient') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                6. Nutrient Management
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {renderNumInput('Green manure cultivation (ha)', 'greenManureCultivationHa', '0.00')}
                {renderYesNoSelect('Use of FYM (Yes/No)', 'useOfFym')}
                {renderYesNoSelect('Composting pits (FYM) (Yes/No)', 'compostingPitsFym')}
                {renderYesNoSelect('Tetra Vermi bed (Yes/No)', 'tetraVermiBed')}
                {renderYesNoSelect('Low cost vermi-bed (Yes/No)', 'lowCostVermiBed')}
                {renderYesNoSelect('NADEP (Yes/No)', 'nadep')}
                {renderYesNoSelect('Amrut khad pits (Yes/No)', 'amrutKhadPits')}
                {renderYesNoSelect('Seed / Root Treatment (Yes/No)', 'seedRootTreatment')}
                {renderYesNoSelect('Use of Waste decomposer (Yes/No)', 'useOfWasteDecomposer')}
                {renderNumInput('Jeevamrut (litre)', 'jeevamrutLitre', '0')}
                {renderNumInput('Amrut Pani (litre)', 'amrutPaniLitre', '0')}
                {renderNumInput('Vermi Wash (litre)', 'vermiWashLitre', '0')}
              </div>
            </section>
          )}

          {/* SECTION 7: SOIL MOISTURE CONSERVATION */}
          {showSection('moisture') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                7. Soil Moisture Conservation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {renderYesNoSelect('Crop residue mulching (Yes/No)', 'cropResidueMulching')}
                {renderNumInput('Broad Bed Furrow (BBF) (area/ha)', 'bbfAreaHa', '0.00')}
                {renderNumInput('Drip (area/ha)', 'dripAreaHa', '0.00')}
                {renderNumInput('Sprinkler (area/ha)', 'sprinklerAreaHa', '0.00')}
                {renderTextInput(
                  'Water budgeting exercise',
                  'waterBudgetingExercise',
                  'Yes / No / Details',
                  false,
                  'yes-no-suggestions'
                )}
              </div>
            </section>
          )}

          {/* SECTION 8: LIVESTOCK */}
          {showSection('livestock') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                8. Livestock
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {renderTextInput(
                  'Livestock health camp through Gram panchayat',
                  'livestockHealthCampGp',
                  'Yes / No / No. of animals',
                  false,
                  'yes-no-suggestions'
                )}
                {renderTextInput(
                  'Goat rearing',
                  'goatRearing',
                  'Yes / No / Count',
                  false,
                  'yes-no-suggestions'
                )}
                {renderTextInput(
                  'Back yard poultry',
                  'backyardPoultry',
                  'Yes / No / Count',
                  false,
                  'yes-no-suggestions'
                )}
                {renderTextInput(
                  'Cattle/sheep penning for soil fertility',
                  'cattleSheepPenning',
                  'Yes / No / Area',
                  false,
                  'yes-no-suggestions'
                )}
                {renderTextInput(
                  'Promotion of fodder crop',
                  'promotionOfFodderCrop',
                  'Yes / No / Crop & Area',
                  false,
                  'yes-no-suggestions'
                )}
                {renderTextInput(
                  'Silage',
                  'silage',
                  'Yes / No / Quantity',
                  false,
                  'yes-no-suggestions'
                )}
              </div>
            </section>
          )}

          {/* SECTION 9: NUTRITION */}
          {showSection('nutrition') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                9. Nutrition
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {renderNumInput('Kitchen gardening (area/ha)', 'kitchenGardeningAreaHa', '0.00')}
                {renderNumInput('Multi layer farming (area/ha)', 'multiLayerFarmingAreaHa', '0.00')}
                {renderNumInput('Cultivation of millets (area/ha)', 'cultivationOfMilletsAreaHa', '0.00')}
              </div>
            </section>
          )}

          {/* SECTION 10: CAPACITY BUILDING */}
          {showSection('capacity') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                10. Capacity Building
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {renderYesNoSelect(
                  'Beneficiary of Farmers Exposure (Yes/No)',
                  'beneficiaryFarmersExposure'
                )}
                {renderYesNoSelect(
                  'Beneficiary of Farmer Field School (FFS) (Yes/No)',
                  'beneficiaryFfs'
                )}
                {renderYesNoSelect(
                  'Beneficiary of Agro-met Advisory (Yes/No)',
                  'beneficiaryAgroMetAdvisory'
                )}
                {renderYesNoSelect('Beneficiary of BRC (Yes/No)', 'beneficiaryBrc')}
              </div>
            </section>
          )}

          {/* SECTION 11: EXPENSE DETAILS */}
          {showSection('expense') && (
            <section className="space-y-4 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  11. Expense Details (INR ₹)
                </h4>
                <span className="text-xs font-bold text-slate-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                  Auto Total Exp: ₹{totalExp.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {renderNumInput('Exp on Seed (₹)', 'expOnSeed', '0')}
                {renderNumInput('Exp on Sowing (₹)', 'expOnSowing', '0')}
                {renderNumInput('Exp on Fertilizer (₹)', 'expOnFertilizer', '0')}
                {renderNumInput('Exp on Weeding (₹)', 'expOnWeeding', '0')}
                {renderNumInput('Exp on Irrigation (₹)', 'expOnIrrigation', '0')}
                {renderNumInput('Exp on Tools (₹)', 'expOnTools', '0')}
                {renderNumInput('Exp. On IPM (₹)', 'expOnIpm', '0')}
                {renderNumInput('Exp. On NPM (₹)', 'expOnNpm', '0')}
                {renderNumInput('Other exp (₹)', 'otherExp', '0')}
                <div>
                  <label className={labelCls}>Total exp (Auto-Calculated ₹)</label>
                  <input
                    type="text"
                    readOnly
                    value={totalExp.toFixed(2)}
                    className="w-full px-3 py-2 border border-amber-200 bg-amber-50/70 rounded-lg text-xs font-bold text-amber-900"
                  />
                </div>
              </div>
            </section>
          )}

          {/* SECTION 12 & 13: HARVESTING DETAILS & DOCUMENTATION */}
          {showSection('harvest') && (
            <section className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  12. Harvesting Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {renderNumInput('Total production (Kg)', 'totalProductionKg', '0')}
                  {renderNumInput('Sell value (₹)', 'sellValue', '0')}
                  <div>
                    <label className={labelCls}>Net Profit (Sell Value - Total Exp ₹)</label>
                    <input
                      type="text"
                      readOnly
                      value={form.sellValue.trim() !== '' ? netProfit.toFixed(2) : '—'}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-bold ${
                        form.sellValue.trim() === ''
                          ? 'border-slate-200 bg-slate-50 text-slate-500'
                          : netProfit >= 0
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-rose-200 bg-rose-50 text-rose-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  13. Documentation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {renderTextInput('Photo-1', 'photo1', 'Photo link / filename / reference')}
                  {renderTextInput('Photo-2', 'photo2', 'Photo link / filename / reference')}
                  {renderTextInput(
                    'Related documents',
                    'relatedDocuments',
                    'Document link / reference'
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Footer Navigation & Submit Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {activeSection !== 'all' && (
                <>
                  <button
                    type="button"
                    onClick={() => stepSection(-1)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev Section
                  </button>
                  <button
                    type="button"
                    onClick={() => stepSection(1)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    Next Section
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'all' ? 'project' : 'all')}
                className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
              >
                {activeSection === 'all' ? 'Step-by-Step View' : 'Show All 12 Sections'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {isEditing ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                {isEditing ? 'Update Record' : 'Save Crop Demo Record'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Saved Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Saved Crop Demo & Farmer Progress Records ({filteredRecords.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click the view icon on any row to inspect all 12 sections or export the complete 88-column CSV sheet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search farmer, crop, village..."
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-4 font-bold">S.N.</th>
                <th className="py-2.5 px-4 font-bold">Project & Location</th>
                <th className="py-2.5 px-4 font-bold">Farmer & Samagra ID</th>
                <th className="py-2.5 px-4 font-bold">Crops & Demo Area</th>
                <th className="py-2.5 px-4 font-bold">Total Exp / Sell / Profit</th>
                <th className="py-2.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No crop demo records saved yet. Fill the form above to add your first entry.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500">{r.sn || idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.nameOfProject}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.village}
                        {r.block ? ` · ${r.block}` : ''}
                        {r.year ? ` · ${r.year} (${r.season})` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.nameOfFarmer}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.farmerIdSamagra || '—'} · {r.gender} · {r.beneficiaryType}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-700">
                        {r.demoCrop || r.mainCrop || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Main: {r.mainCrop || '—'}
                        {r.demoAreaHa !== undefined ? ` · Demo: ${r.demoAreaHa} ha` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-[11px] text-slate-600">
                        Exp: ₹{(r.totalExp ?? 0).toLocaleString('en-IN')} · Sell: ₹
                        {(r.sellValue ?? 0).toLocaleString('en-IN')}
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          (r.netProfit ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        Net Profit: ₹{(r.netProfit ?? 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingRecord(r)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="View all 12 sections"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(r)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(r.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Delete record"
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

      {/* Full Record Inspection Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {viewingRecord.nameOfFarmer} — {viewingRecord.nameOfProject}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingRecord.village} · {viewingRecord.year} ({viewingRecord.season})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-700 mb-1.5">Project & Farmer Details</div>
                <div>Dist / Block / Cluster: {viewingRecord.dist || '—'} / {viewingRecord.block || '—'} / {viewingRecord.cluster || '—'}</div>
                <div>Gram Panchayat / Village: {viewingRecord.gramPanchayat || '—'} / {viewingRecord.village}</div>
                <div>Theme / Activity: {viewingRecord.theme || '—'} / {viewingRecord.activityName || '—'}</div>
                <div>Samagra ID / Mobile: {viewingRecord.farmerIdSamagra || '—'} / {viewingRecord.mobileNo || '—'}</div>
                <div>Total / Cultivable / Fallow (ha): {viewingRecord.totalAreaHa ?? '—'} / {viewingRecord.cultivableLandHa ?? '—'} / {viewingRecord.fallowLandHa ?? '—'}</div>
                <div>Kharif / Rabi / Demo (ha): {viewingRecord.areaInKharifHa ?? '—'} / {viewingRecord.areaInRabiHa ?? '—'} / {viewingRecord.demoAreaHa ?? '—'}</div>
                <div>SRI/SCI Demo: {viewingRecord.isSriSciDemoFarmer} · Farm Precise App: {viewingRecord.farmPreciseAppUser}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-700 mb-1.5">Crop & Land Management</div>
                <div>Main / Demo Crop: {viewingRecord.mainCrop || '—'} / {viewingRecord.demoCrop || '—'}</div>
                <div>Sowing Date: {viewingRecord.sowingTransplantingDate || '—'}</div>
                <div>Intercrop / Plant Space: {viewingRecord.nameOfIntercrop || '—'} / {viewingRecord.plantSpaceDetails || '—'}</div>
                <div>Soil Testing: {viewingRecord.soilTesting}</div>
                <div>Rotation / Mixed / Inter Cropping (ha): {viewingRecord.cropRotationHa ?? '—'} / {viewingRecord.mixedCroppingHa ?? '—'} / {viewingRecord.interCroppingHa ?? '—'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-700 mb-1.5">Pest, Disease & Nutrient Management</div>
                <div>Dashparni / NSKE / Neemastra (L): {viewingRecord.dashparniArkLiter ?? '—'} / {viewingRecord.nskeNeemarkLiter ?? '—'} / {viewingRecord.neemastraLiter ?? '—'}</div>
                <div>Trap Crop: {viewingRecord.trapCropName || '—'} · Bird/Pheromone/Light/Yellow: {viewingRecord.birdPerchesNo ?? 0}/{viewingRecord.pheromoneTrapNo ?? 0}/{viewingRecord.lightTrapNo ?? 0}/{viewingRecord.yellowTrapNo ?? 0}</div>
                <div>Green Manure (ha): {viewingRecord.greenManureCultivationHa ?? '—'} · FYM: {viewingRecord.useOfFym} · Composting Pits: {viewingRecord.compostingPitsFym}</div>
                <div>Tetra Vermi: {viewingRecord.tetraVermiBed} · Low-cost Vermi: {viewingRecord.lowCostVermiBed} · NADEP: {viewingRecord.nadep} · Amrut Khad: {viewingRecord.amrutKhadPits}</div>
                <div>Seed/Root Treatment: {viewingRecord.seedRootTreatment} · Waste Decomposer: {viewingRecord.useOfWasteDecomposer}</div>
                <div>Jeevamrut / Amrut Pani / Vermi Wash (L): {viewingRecord.jeevamrutLitre ?? '—'} / {viewingRecord.amrutPaniLitre ?? '—'} / {viewingRecord.vermiWashLitre ?? '—'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-700 mb-1.5">Soil Moisture, Livestock, Nutrition & Capacity</div>
                <div>Mulching: {viewingRecord.cropResidueMulching} · BBF / Drip / Sprinkler (ha): {viewingRecord.bbfAreaHa ?? '—'} / {viewingRecord.dripAreaHa ?? '—'} / {viewingRecord.sprinklerAreaHa ?? '—'}</div>
                <div>Water Budgeting: {viewingRecord.waterBudgetingExercise || '—'}</div>
                <div>Livestock Camp / Goat / Poultry: {viewingRecord.livestockHealthCampGp || '—'} / {viewingRecord.goatRearing || '—'} / {viewingRecord.backyardPoultry || '—'}</div>
                <div>Penning / Fodder / Silage: {viewingRecord.cattleSheepPenning || '—'} / {viewingRecord.promotionOfFodderCrop || '—'} / {viewingRecord.silage || '—'}</div>
                <div>Kitchen Garden / Multi-layer / Millets (ha): {viewingRecord.kitchenGardeningAreaHa ?? '—'} / {viewingRecord.multiLayerFarmingAreaHa ?? '—'} / {viewingRecord.cultivationOfMilletsAreaHa ?? '—'}</div>
                <div>Exposure / FFS / Agro-met / BRC: {viewingRecord.beneficiaryFarmersExposure} / {viewingRecord.beneficiaryFfs} / {viewingRecord.beneficiaryAgroMetAdvisory} / {viewingRecord.beneficiaryBrc}</div>
              </div>

              <div className="md:col-span-2 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-800 mb-1.5">Expenses, Harvesting & Documentation</div>
                <div>
                  Expenses (₹): Seed {viewingRecord.expOnSeed ?? 0} · Sowing {viewingRecord.expOnSowing ?? 0} · Fertilizer {viewingRecord.expOnFertilizer ?? 0} · Weeding {viewingRecord.expOnWeeding ?? 0} · Irrigation {viewingRecord.expOnIrrigation ?? 0} · Tools {viewingRecord.expOnTools ?? 0} · IPM {viewingRecord.expOnIpm ?? 0} · NPM {viewingRecord.expOnNpm ?? 0} · Other {viewingRecord.otherExp ?? 0}
                </div>
                <div className="font-bold text-slate-900">
                  Total Expense: ₹{viewingRecord.totalExp ?? 0} · Production: {viewingRecord.totalProductionKg ?? '—'} Kg · Sell Value: ₹{viewingRecord.sellValue ?? 0} · Net Profit: ₹{viewingRecord.netProfit ?? 0}
                </div>
                <div>
                  Docs: Photo-1 ({viewingRecord.photo1 || '—'}) · Photo-2 ({viewingRecord.photo2 || '—'}) · Related ({viewingRecord.relatedDocuments || '—'})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
