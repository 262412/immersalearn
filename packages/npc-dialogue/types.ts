// ============================================
// NPC Dialogue Skill — Shared Types
// Framework-agnostic. No ImmersaLearn dependency.
// ============================================

/** A character the player can talk to */
export interface NPCCharacter {
  id: string;
  name: string;
  /** Short role description, e.g. "art teacher", "explorer guide" */
  role: string;
  personality: string;
  speech_style: string;
  appearance?: string;
  /** Explicit fact IDs this NPC knows. If omitted, NPC gets all facts. */
  knowledge_fact_ids?: string[];
}

/** A single piece of ground-truth knowledge the NPC can cite */
export interface KnowledgeFact {
  id: string;
  statement: string;
}

/** Scene/level context passed to the NPC so it can stay on-topic */
export interface SceneContext {
  id?: string;
  description: string;
  objective: string;
}

/** One message in a conversation */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/** Session progress — used to personalise NPC responses */
export interface StudentProgress {
  completed_interactions?: string[];
  discoveries?: string[];
  current_objective?: string;
}

/** Full config for a single NPC session */
export interface NPCDialogueConfig {
  character: NPCCharacter;
  facts: KnowledgeFact[];
  scene: SceneContext;
  /**
   * Additional fact IDs relevant to this scene/interaction
   * (union-ed with character.knowledge_fact_ids).
   */
  sceneFactIds?: string[];
  studentProgress?: StudentProgress;
  /** Age range shown in system prompt. Defaults to "5-11". */
  targetAge?: string;
  /** Claude model. Defaults to "claude-haiku-4-5-20251001" (fast, cheap). */
  model?: string;
  /** Max tokens per NPC response. Defaults to 300. */
  maxResponseTokens?: number;
}

/** Request body posted to /api/npc-chat (or whichever route you mount) */
export interface NPCChatRequest {
  message: string;
  character: NPCCharacter;
  facts: KnowledgeFact[];
  scene: SceneContext;
  sceneFactIds?: string[];
  conversationHistory?: ConversationMessage[];
  studentProgress?: StudentProgress;
  targetAge?: string;
  model?: string;
  maxResponseTokens?: number;
}

/** Response returned by the route */
export interface NPCChatResponse {
  response: string;
}
