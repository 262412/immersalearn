export * from "./scene-graph";
export * from "./world-plan";

// ---- Shared Types ----

export interface StudentPreferences {
  genre: "adventure" | "mystery" | "simulation" | "roleplay" | "documentary";
  difficulty: "easy" | "medium" | "hard";
  interests?: string[];
  name?: string;
}

export interface GenerationProgress {
  stage: "uploading" | "planning" | "building" | "assembling" | "ready" | "error";
  progress: number; // 0-100
  message: string;
  details?: string;
}

export interface SessionState {
  script_id: string;
  current_act: string;
  current_scene: string;
  completed_interactions: string[];
  collected_items: string[];
  choices_log: { interaction_id: string; choice_id: string; timestamp: number }[];
  dialogue_log: { npc_id: string; messages: { role: string; content: string }[] }[];
  start_time: number;
  discoveries: string[];
}

// ---- Choice Interaction Types (used by ChoicePanel) ----

export interface ChoiceContent {
  type: "choice";
  prompt: string;
  options: ChoiceOption[];
  min_select?: number;
  max_select?: number;
  allow_retry: boolean;
}

export interface ChoiceOption {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
  consequence?: string;
  next_interaction?: string;
}
