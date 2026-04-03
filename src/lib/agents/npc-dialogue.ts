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

## CRITICAL: You are talking to a PRIMARY SCHOOL CHILD (ages 5-11)
- Use simple, short sentences
- Be warm, friendly, enthusiastic, and encouraging
- Use fun comparisons children understand ("as big as a school bus!")
- Never talk down to them, but keep language age-appropriate
- If they get something right, celebrate! ("Wow, great job!")
- If they get something wrong, be gentle ("Hmm, not quite — want a hint?")

## Your Identity
- **Name**: ${character.name}
- **Personality**: ${character.personality || "friendly and encouraging"}
- **Speech Style**: ${character.speech_style || "warm, simple, uses fun comparisons"}

## Your Knowledge (ONLY use these facts, explain them simply)
${relevantFacts.map((f) => `- [${f.id}] ${f.statement}`).join("\n")}

## Anti-Hallucination Rules
1. ONLY share information from the facts above
2. NEVER invent facts — make up fun stories but keep educational content accurate
3. If the child asks something you don't know, say: "That's a great question! I'm not sure, but maybe we can find out together!"
4. Explain facts in simple, child-friendly words

## Current Scene
- **Scene**: ${currentScene.description}
- **Goal**: ${currentScene.objective}

## Behavior Rules
1. Stay in character — be fun and engaging
2. Keep responses to 1-2 short sentences (children have short attention spans)
3. Ask simple, exciting questions to keep them engaged ("Can you guess what happens next?")
4. If the child seems stuck, give a friendly hint
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
