// ============================================
// Agent 3: NPC Dialogue Agent (Runtime)
// Drives real-time NPC conversations
// Constrained by KnowledgeGraph (anti-hallucination)
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { KnowledgeGraph, ScriptCharacter, Fact } from "@/lib/types";

interface DialogueContext {
  character: ScriptCharacter;
  knowledgeGraph: KnowledgeGraph;
  currentScene: {
    id: string;
    description: string;
    objective: string;
  };
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  studentProgress: {
    completed_interactions: string[];
    discoveries: string[];
    current_objective: string;
  };
  relevantFacts: Fact[]; // facts this NPC should know
}

function buildNPCSystemPrompt(ctx: DialogueContext): string {
  const { character, currentScene, relevantFacts, studentProgress } = ctx;

  return `You are ${character.name}, ${character.role}.

## Your Identity
- **Appearance**: ${character.appearance}
- **Personality**: ${character.personality}
- **Speech Style**: ${character.speech_style}
- **Background**: ${character.backstory || "A resident of this world"}

## Your Knowledge (ONLY use these facts)
${relevantFacts.map((f) => `- [${f.id}] ${f.statement}`).join("\n")}

## CRITICAL ANTI-HALLUCINATION RULES
1. You may ONLY share information from the facts listed above
2. NEVER invent dates, names, statistics, or cause-effect relationships
3. If the student asks something outside your knowledge, respond IN CHARACTER:
   - "Hmm, I'm not sure about that..."
   - "You'd have to ask the scholars at the academy about that"
   - "That's beyond what a ${character.role} would know"
4. You can use fictional dialogue and personality — but ALL educational content must come from the verified facts
5. You may paraphrase facts in your character's voice, but don't change their meaning

## Current Scene
- **Scene**: ${currentScene.description}
- **Learning Objective**: ${currentScene.objective}

## Student Progress
- Completed interactions: ${studentProgress.completed_interactions.length}
- Current goal: ${studentProgress.current_objective}

## Behavior Rules
1. Stay in character at ALL times — never break the fourth wall
2. Keep responses to 2-3 sentences (conversational, not lecturing)
3. Weave knowledge naturally into conversation (don't dump facts)
4. If the student seems stuck, offer a gentle hint related to the scene objective
5. Ask engaging follow-up questions to promote thinking
6. Show emotion and personality — you're a person, not a textbook
7. If this is the first message, greet the student naturally based on the scene context

## Language
Respond in the same language the student uses. If they speak Chinese, respond in Chinese.
If they speak English, respond in English.`;
}

export async function generateNPCResponse(
  ctx: DialogueContext,
  studentMessage: string
): Promise<string> {
  const client = new Anthropic();

  const systemPrompt = buildNPCSystemPrompt(ctx);

  const messages: Anthropic.MessageParam[] = [
    // Include conversation history
    ...ctx.conversationHistory.map(
      (msg) =>
        ({
          role: msg.role,
          content: msg.content,
        }) as Anthropic.MessageParam
    ),
    // Add new student message
    {
      role: "user",
      content: studentMessage,
    },
  ];

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // Use Haiku for speed + cost efficiency in real-time chat
    max_tokens: 300,
    system: systemPrompt,
    messages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return text;
}

// Generate NPC greeting (first interaction)
export async function generateNPCGreeting(
  ctx: DialogueContext
): Promise<string> {
  return generateNPCResponse(ctx, "[Student approaches and makes eye contact]");
}

// Get facts relevant to a specific NPC
export function getRelevantFacts(
  character: ScriptCharacter,
  knowledgeGraph: KnowledgeGraph,
  sceneInteractionFactIds: string[]
): Fact[] {
  // Combine facts from the character's knowledge role + scene's interactions
  const allFactIds = new Set(sceneInteractionFactIds);

  // Also include facts related to the character's knowledge domain
  const relevantFacts = knowledgeGraph.facts.filter(
    (f) =>
      allFactIds.has(f.id) ||
      f.statement.toLowerCase().includes(character.knowledge_role.toLowerCase())
  );

  return relevantFacts;
}
