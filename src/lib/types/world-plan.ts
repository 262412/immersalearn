// ============================================
// WorldPlan — Unified output from Planning Agent
// Replaces KnowledgeGraph + Script as a single
// coherent document where story and world are
// designed together.
// ============================================

export type Genre = "adventure" | "mystery" | "simulation" | "roleplay" | "documentary";

export type PedagogyMethod =
  | "worked_example"
  | "retrieval_practice"
  | "dual_coding"
  | "scaffolding"
  | "interleaving"
  | "elaborative_interrogation"
  | "spaced_repetition";

export type BloomLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

// ---- Top-level Plan ----

export interface WorldPlan {
  id: string;
  knowledge: KnowledgeLayer;
  narrative: NarrativeLayer;
}

// ---- Knowledge Layer (what students learn) ----

export interface KnowledgeLayer {
  subject: string;
  topic: string;
  curriculum?: string;
  learning_objectives: PlanObjective[];
  facts: PlanFact[];
}

export interface PlanObjective {
  id: string;
  text: string;
  bloom_level: BloomLevel;
}

export interface PlanFact {
  id: string;
  statement: string;
  category: string;
}

// ---- Narrative Layer (story + world, unified) ----

export interface NarrativeLayer {
  title: string;
  genre: Genre;
  target_age: string;
  characters: WorldCharacter[];
  scenes: WorldScene[];
}

// ---- Scene = Story + World + Interactions (unified) ----

export interface WorldScene {
  id: string;
  title: string;

  // Story elements
  story: {
    description: string;
    objective: string;
    linked_facts: string[];
  };

  // World elements (designed by same agent = coherent)
  world: {
    environment_type: string;
    time_of_day: string;
    atmosphere: string;
    terrain: string;
    terrain_color?: string;
    landmarks: WorldLandmark[];
    npc_placements: NPCPlacement[];
    interactive_items: InteractiveItemSpec[];
    spatial_flow: string;
  };

  // Interaction design
  interactions: PlanInteraction[];
}

export interface WorldLandmark {
  id: string;
  name: string;
  description: string;
  type: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  primitive?: string;
  search_keywords?: string; // e.g. "wooden easel" — used to find 3D model from library
}

export interface NPCPlacement {
  character_id: string;
  position: [number, number, number];
  initial_action: string;
  search_keywords?: string; // e.g. "painter artist character" — for 3D model search
}

export interface InteractiveItemSpec {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
  primitive?: string;
  scale?: [number, number, number];
  examine_text: string;
  linked_facts: string[];
  search_keywords?: string; // e.g. "paint palette" — for 3D model search
}

export interface WorldCharacter {
  id: string;
  name: string;
  role: string;
  personality: string;
  appearance: string;
  speech_style: string;
  knowledge_facts: string[];
  search_keywords?: string; // e.g. "old painter man" — for 3D character model
}

export interface PlanInteraction {
  id: string;
  type: "dialogue" | "choice" | "explore" | "puzzle";
  description: string;
  pedagogy_method: PedagogyMethod;
  pedagogy_rationale: string;
  linked_facts: string[];
  // For choice type
  choices?: {
    label: string;
    correct: boolean;
    feedback: string;
  }[];
  // For dialogue type
  npc_id?: string;
  dialogue_points?: string[];
}
