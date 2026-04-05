// ============================================
// NPC Dialogue Skill — Server-side Agent
// Pure Anthropic SDK. No framework dependency.
// Drop this into any Node.js server.
//
// Requires: ANTHROPIC_API_KEY env var
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  NPCCharacter,
  KnowledgeFact,
  SceneContext,
  ConversationMessage,
  StudentProgress,
} from "./types";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_MAX_TOKENS = 300;
const DEFAULT_TARGET_AGE = "5-11";

// ---- Fact selection ----

/**
 * Returns the subset of facts the NPC should know.
 * Priority: character.knowledge_fact_ids → sceneFactIds → all facts (fallback).
 */
export function selectRelevantFacts(
  character: NPCCharacter,
  facts: KnowledgeFact[],
  sceneFactIds: string[] = []
): KnowledgeFact[] {
  const ids = new Set([
    ...sceneFactIds,
    ...(character.knowledge_fact_ids ?? []),
  ]);

  // If no explicit IDs given at all, give NPC access to all facts
  if (ids.size === 0) return facts;

  return facts.filter((f) => ids.has(f.id));
}

// ---- Prompt builder ----

function buildSystemPrompt(
  character: NPCCharacter,
  relevantFacts: KnowledgeFact[],
  scene: SceneContext,
  studentProgress: StudentProgress,
  targetAge: string
): string {
  const factLines =
    relevantFacts.length > 0
      ? relevantFacts.map((f) => `- [${f.id}] ${f.statement}`).join("\n")
      : "(No specific facts provided — stay general and encouraging)";

  return `You are ${character.name}, ${character.role}.

## CRITICAL: You are talking to a CHILD (ages ${targetAge})
- Use simple, short sentences that a child in this age range understands
- Be warm, enthusiastic, and encouraging at all times
- Use fun comparisons children relate to ("as tall as a giraffe!", "as fast as a cheetah!")
- Never talk down to them — just keep it age-appropriate
- Celebrate correct answers: "Wow, amazing! You're so clever! 🌟"
- Be gentle with wrong answers: "Hmm, not quite — want a little hint?"

## Your Identity
- **Name**: ${character.name}
- **Personality**: ${character.personality}
- **Speech style**: ${character.speech_style}${
    character.appearance ? `\n- **Appearance**: ${character.appearance}` : ""
  }

## What You Know (ONLY use these facts — no inventing!)
${factLines}

## Anti-Hallucination Rules
1. ONLY share information from the facts listed above
2. NEVER make up statistics, dates, names, or any new facts
3. If asked something outside your facts, say: "Ooh, great question! I'm not sure — maybe we can discover it together! 🔍"
4. Always explain facts in fun, simple, child-friendly words

## Current Scene
- **Setting**: ${scene.description}
- **Goal for the child**: ${scene.objective}
${
  studentProgress.current_objective
    ? `- **Current quest**: ${studentProgress.current_objective}`
    : ""
}

## Conversation Rules
1. Stay in character — you are a fun person, NOT a textbook
2. Keep each response to 1–3 short sentences MAX (children have short attention spans)
3. End responses with an exciting follow-up question to keep the child engaged
4. If the child seems stuck, give a warm, friendly hint
5. Show personality — use light humour and enthusiasm!
6. On a first message, greet the child naturally and introduce yourself briefly

## Language
Respond in the same language the child uses.
If they write in Chinese → respond in Chinese.
If they write in English → respond in English.`;
}

// ---- Core function ----

/**
 * Generate a single NPC response.
 *
 * @example
 * const reply = await generateNPCResponse({
 *   character: myNPC,
 *   facts: myFacts,
 *   scene: { description: "Art gallery", objective: "Learn about colours" },
 *   message: "What is a primary colour?",
 * });
 */
export async function generateNPCResponse(options: {
  character: NPCCharacter;
  facts: KnowledgeFact[];
  scene: SceneContext;
  message: string;
  conversationHistory?: ConversationMessage[];
  studentProgress?: StudentProgress;
  sceneFactIds?: string[];
  targetAge?: string;
  model?: string;
  maxResponseTokens?: number;
}): Promise<string> {
  const {
    character,
    facts,
    scene,
    message,
    conversationHistory = [],
    studentProgress = {},
    sceneFactIds = [],
    targetAge = DEFAULT_TARGET_AGE,
    model = DEFAULT_MODEL,
    maxResponseTokens = DEFAULT_MAX_TOKENS,
  } = options;

  const client = new Anthropic();

  const relevantFacts = selectRelevantFacts(character, facts, sceneFactIds);

  const systemPrompt = buildSystemPrompt(
    character,
    relevantFacts,
    scene,
    studentProgress,
    targetAge
  );

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  const response = await client.messages.create({
    model,
    max_tokens: maxResponseTokens,
    system: systemPrompt,
    messages,
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

/**
 * Convenience: generate the NPC's opening greeting.
 * Simulates the child walking up and making eye contact.
 */
export async function generateNPCGreeting(options: Omit<Parameters<typeof generateNPCResponse>[0], "message">): Promise<string> {
  return generateNPCResponse({
    ...options,
    message: "[The child approaches and looks at you with curious eyes]",
  });
}
