// ============================================
// Knowledge Graph — Stage 1 Output
// Extracted from textbook + curriculum spec
// ============================================

export interface KnowledgeGraph {
  id: string;
  subject: string;
  curriculum: string; // e.g. "GCSE AQA", "A-Level OCR", "IB"
  topic: string;
  grade_level?: string;

  learning_objectives: LearningObjective[];
  facts: Fact[];
  relationships: Relationship[];
  key_figures: KeyFigure[];
  key_events: KeyEvent[];
  key_concepts: KeyConcept[];
}

export interface LearningObjective {
  id: string; // "LO_1"
  text: string;
  bloom_level: BloomLevel;
  source: string; // where in the spec
}

export type BloomLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

export interface Fact {
  id: string; // "F_001"
  statement: string;
  source_page?: number;
  source_quote?: string;
  linked_objectives: string[]; // LO IDs
  confidence: "verified" | "needs_review";
  category: "date" | "name" | "place" | "cause_effect" | "concept" | "statistic" | "other";
}

export interface Relationship {
  id: string;
  from_id: string; // Fact/Concept/Event ID
  to_id: string;
  type: "causes" | "precedes" | "part_of" | "contrasts" | "supports" | "leads_to";
  description?: string;
}

export interface KeyFigure {
  id: string;
  name: string;
  role: string;
  period: string;
  significance: string;
  related_facts: string[];
}

export interface KeyEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  significance: string;
  related_facts: string[];
}

export interface KeyConcept {
  id: string;
  name: string;
  definition: string;
  examples: string[];
  related_facts: string[];
}
