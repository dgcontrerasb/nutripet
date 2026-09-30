export type PetType = 'dog' | 'cat';

export type LifeStage = 'puppy_kitten' | 'adult' | 'senior';

export type BodyCondition = 'underweight' | 'ideal' | 'overweight';

export type ActivityLevel = 'low' | 'moderate' | 'high' | 'working';

export type DietType = 'kibble' | 'barf' | 'mixed';

export type Gender = 'male' | 'female';

export interface MedicalRecord {
  id: string;
  petId: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  type: 'consultation' | 'surgery' | 'exam' | 'xray' | 'prescription' | 'treatment';
  title: string;
  veterinarian?: string;
  diagnosis?: string;
  notes?: string;
  createdAt?: string;
}

export interface Reminder {
  id: string;
  petId: string;
  userId?: string;
  type: 'vaccine' | 'deworming' | 'medication' | 'checkup' | 'bath';
  name: string;
  dueDate: string; // YYYY-MM-DD
  dosage?: string;
  completed: boolean;
  notes?: string;
  recurringDays?: number; // Días para repetición/ciclo del siguiente recordatorio
  createdAt?: string;
}

export interface BathLog {
  id: string;
  petId: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  type: 'routine' | 'medicated' | 'dry_wash' | 'grooming';
  shampooUsed?: string;
  notes?: string;
  nextBathDate?: string;
  createdAt?: string;
}

export interface WeightLog {
  id: string;
  petId: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

export interface PetProfile {
  id: string;
  userId?: string;
  publicId?: string; // ID estable y persistente en publicPets/{publicId}
  name: string;
  type: PetType;
  breedId: string;
  breedCustom?: string;
  birthDate?: string; // YYYY-MM-DD para edad automática
  gender?: Gender;
  weightKg: number;
  idealWeightKg?: number;
  stage: LifeStage;
  ageMonths: number;
  neutered: boolean;
  activity: ActivityLevel;
  condition: BodyCondition;
  diet: DietType;
  kibbleKcalPer100g: number;
  photoUrl?: string;
  microchip?: string;
  allergies?: string;
  knownDiseases?: string;
  ownerName?: string;
  ownerPhone?: string;
  emergencyContact?: string;
  veterinarian?: string;
  veterinarianPhone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface estricta para la tarjeta de emergencia pública de código QR.
 * Almacenada exclusivamente en publicPets/{publicToken}
 * LIMITACIÓN TÉCNICA DOCUMENTADA DE FIRESTORE RULES:
 * Para verificar la propiedad del documento en update/delete por el creador,
 * ownerId se almacena en el documento Firestore. Técnicamente el cliente que lee
 * el documento puede ver este string UID, pero NUNCA se renderiza en la UI del visitante.
 */
export interface PublicPetEmergencyCard {
  publicToken: string;
  ownerId: string;
  active: boolean;
  name: string;
  type: PetType;
  breedName: string;
  photoUrl?: string;
  gender?: Gender;
  stage: LifeStage;
  weightKg: number;
  neutered: boolean;
  
  // Consentimientos explícitos
  shareHealthEmergencyInfo: boolean;
  allergies?: string;
  knownDiseases?: string;

  shareOwnerContact: boolean;
  ownerName?: string;
  ownerPhone?: string;

  shareVetContact: boolean;
  veterinarian?: string;
  veterinarianPhone?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CalculationResult {
  rer: number; // Resting Energy Requirement in kcal
  mer: number; // Maintenance Energy Requirement in kcal
  activityMultiplier: number;
  kibbleDailyGrams: number;
  mealsPerDay: number;
  gramsPerMeal: number;
  waterDailyMl: { min: number; max: number };
  barfBreakdown?: {
    totalGrams: number;
    percentage: number;
    meatyBonesGrams: number; // 50%
    muscleMeatGrams: number; // 30%
    organsGrams: number;     // 10% (5% liver, 5% other)
    vegetablesFruitsGrams: number; // 10%
  };
}

export interface BreedInfo {
  id: string;
  type: PetType;
  name: string;
  sizeCategory: 'pequeño' | 'mediano' | 'grande' | 'gigante' | 'felino';
  typicalWeight: string;
  predispositions: string[];
  nutritionFocus: string;
  recommendedFoodTypes: {
    tier: 'Súper Premium' | 'Veterinario Específico' | 'Económico de Buena Calidad';
    brands: string[];
    why: string;
  }[];
  breedTips: string[];
}

export interface ToxicFood {
  id: string;
  name: string;
  category: 'mortal' | 'danger' | 'caution' | 'superfood';
  appliesTo: 'both' | 'dog' | 'cat';
  dangerLevel: string;
  why: string;
  symptoms: string;
  iconName: string;
}

export interface HealthGuide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  keyPoints: { title: string; desc: string }[];
  warningNote?: string;
}

export type SubscriptionTier = 'free' | 'trial' | 'pro_monthly' | 'pro_annual';

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'trialing' | 'expired';
  planName: string;
  startDate?: string;
  validUntil?: string;
  autoRenew?: boolean;
  trialStartDate?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  isManual?: boolean;
  includeInRevenue?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceUsd: number;
  priceCop: number;
  interval: 'monthly' | 'annual';
  features: string[];
  isPopular?: boolean;
}

export type AppTab = 
  | 'calculator' 
  | 'routine'
  | 'sheet' 
  | 'medical' 
  | 'reminders' 
  | 'recipes'
  | 'advisor' 
  | 'foods' 
  | 'breeds' 
  | 'guides';
