export type PostureMode = 'sitting' | 'standing' | 'sit_stand';

export type PrimaryDevice = 'laptop_only' | 'laptop_with_peripherals' | 'desktop_single' | 'desktop_dual';

export interface UserErgoProfile {
  heightCm: number;
  postureMode: PostureMode;
  shoeHeelCm: number;
  dailyWorkHours: number;
  deskType: 'fixed' | 'adjustable';
  hasFootrest: boolean;
  primaryDevice: PrimaryDevice;
}

export interface ErgoCalculation {
  chairSeatHeight: number;
  deskHeightSitting: number;
  deskHeightStanding: number;
  monitorTopHeightSitting: number;
  monitorTopHeightStanding: number;
  eyeLevelSitting: number;
  monitorDistanceCm: { min: number; max: number };
  armrestHeightAboveSeat: number;
  needsFootrestRecommendation: boolean;
  footrestExplanation: string;
}

export type ChecklistCategory = 'screen' | 'chair' | 'desk_peripherals' | 'body_posture' | 'environment';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  tip: string;
  nr17Ref?: string;
  status: 'ok' | 'needs_fix' | 'unanswered';
  importance: 'high' | 'medium';
}

export type BodyPart = 'neck' | 'shoulders' | 'upper_back' | 'lower_back' | 'wrists' | 'eyes' | 'legs';

export interface DiscomfortRecord {
  bodyPart: BodyPart;
  severity: number; // 1 to 5
  description: string;
  ergonomicCauses: string[];
  immediateCorrections: string[];
}

export interface StretchExercise {
  id: string;
  title: string;
  targetArea: string;
  bodyPart: BodyPart;
  durationSec: number;
  repsText: string;
  benefits: string;
  steps: string[];
  safetyTip: string;
}

export type TimerMode = '20_20_20' | 'micro_break' | 'labor_stretch';

export interface BreakHistory {
  timestamp: string;
  mode: TimerMode;
}
