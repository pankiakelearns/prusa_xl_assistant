export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  interactiveType?: "get_started_question" | "error_codes_question" | "filament_images";
}

export interface SlicerRecommendation {
  infill: number;
  style: "Organic" | "Grid" | "Snug";
  brim: boolean;
  explanation: string;
  strengthScore: number; // 0 to 100
  estimatedTimeMultiplier: number;
}

export interface SlicerStats {
  usedFilamentGrams: number;
  usedFilamentMeters: number;
  usedFilamentVolume: number; // cubic mm
  costUSD: number;
  estimatedPrintTimeNormal: string;
  estimatedPrintTimeStealth: string;
}

export interface TroubleshootingCard {
  id: string;
  title: string;
  category: "adhesion" | "extrusion" | "calibration" | "hardware" | "other";
  symptom: string;
  steps: string[];
  requiresHardwareReplacement: boolean;
  requiresSupportLink: boolean;
  advice: string;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  actionRequired: string;
  completed: boolean;
  screenshotLabel?: string;
  userInteractableType?: "select_toolhead" | "check_brim" | "set_infill" | "choose_style" | "click_slice" | "park_tool" | "switch_power";
  hint?: string;
}
