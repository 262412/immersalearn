export * from "./knowledge-graph";
export * from "./script";
export * from "./scene-graph";

// ---- Shared Types ----

export interface StudentPreferences {
  genre: "adventure" | "mystery" | "simulation" | "roleplay" | "documentary";
  difficulty: "easy" | "medium" | "hard";
  interests?: string[];
  name?: string;
}

export interface GenerationProgress {
  stage: "uploading" | "extracting" | "scripting" | "verifying" | "building_scene" | "ready" | "error";
  progress: number; // 0-100
  message: string;
  details?: string;
}

export interface VerificationReport {
  script_id: string;
  total_claims: number;
  verified: number;
  flagged: number;
  rejected: number;
  items: VerificationItem[];
}

export interface VerificationItem {
  claim: string;
  scene_id: string;
  interaction_id: string;
  source_fact_id?: string;
  status: "verified" | "flagged" | "rejected";
  reason?: string;
  suggested_correction?: string;
}

export interface LearningReport {
  student_name?: string;
  script_title: string;
  subject: string;
  duration_minutes: number;
  knowledge_coverage: {
    objective_id: string;
    objective_text: string;
    interactions_completed: number;
    interactions_total: number;
    performance: "mastered" | "partial" | "needs_review";
  }[];
  choices_made: {
    scene_id: string;
    prompt: string;
    selected: string;
    was_correct: boolean;
  }[];
  discoveries: {
    item_name: string;
    found: boolean;
  }[];
  overall_score: number; // 0-100
  ai_feedback: string;
  recommendations: string[];
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
