export enum InteractionSeverity {
  HIGH = 'HIGH', // أحمر - خطير
  MODERATE = 'MODERATE', // برتقالي - متوسط
  LOW = 'LOW', // أصفر/أزرق - منخفض
  CONTRAINDICATED = 'CONTRAINDICATED', // أسود/أحمر غامق - ممنوع
  UNKNOWN = 'UNKNOWN'
}

export enum InteractionType {
  DRUG_DRUG = 'DRUG_DRUG',
  DRUG_FOOD = 'DRUG_FOOD',
  DRUG_DISEASE = 'DRUG_DISEASE',
  DRUG_LAB = 'DRUG_LAB',
  DRUG_VACCINE = 'DRUG_VACCINE',
  DRUG_PREGNANCY_LACTATION = 'DRUG_PREGNANCY_LACTATION'
}

export interface InteractionData {
  id: string;
  drugA: string;
  drugB?: string; // Optional because it might be food or disease
  foodOrCondition?: string;
  type: InteractionType;
  severity: InteractionSeverity;
  mechanism: string;
  effect: string;
  management: string;
}

export interface DrugOption {
  id: string;
  name: string;
}