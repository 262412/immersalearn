// ============================================
// NPC Dialogue Skill — Barrel Export
// ============================================

// Types
export type {
  NPCCharacter,
  KnowledgeFact,
  SceneContext,
  ConversationMessage,
  StudentProgress,
  NPCDialogueConfig,
  NPCChatRequest,
  NPCChatResponse,
} from "./types";

// Server
export { generateNPCResponse, generateNPCGreeting, selectRelevantFacts } from "./agent";

// Client (React)
export { useNPCDialogue } from "./useNPCDialogue";
export type { UseNPCDialogueOptions, UseNPCDialogueReturn, DialogueMessage } from "./useNPCDialogue";
export { DialoguePanel, NPCDialogue } from "./DialoguePanel";
