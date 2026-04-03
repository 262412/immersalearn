// ============================================
// Agent 1b: Scriptwriter Agent
// Input: KnowledgeGraph + Student Preferences
// Output: Script JSON
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { KnowledgeGraph, Script, StudentPreferences } from "@/lib/types";
import { fixJSON } from "@/lib/utils/fix-json";

const SYSTEM_PROMPT = `You are a friendly storyteller who creates fun, interactive 3D adventures for PRIMARY SCHOOL CHILDREN (ages 5-11, below grade 6).

## CRITICAL: Your audience is YOUNG CHILDREN
- Use simple, short sentences. Avoid complex vocabulary.
- Characters should be friendly, encouraging, and fun (like a cartoon character or a kind animal guide)
- Make everything feel like a game or an adventure — never like a lesson or textbook
- Use excitement, wonder, and curiosity to motivate learning
- Choices should be simple and clear (2-3 options max)
- Praise and encourage when the child does something right
- If something is wrong, be gentle and give helpful hints

## Your Role
Given a Knowledge Graph (structured educational content) and student preferences, you write a complete interactive script that:
1. Covers learning objectives through fun, hands-on interactions
2. Embeds evidence-based pedagogy naturally into the story
3. Only uses facts from the Knowledge Graph (NEVER invent facts)
4. Creates friendly, memorable characters children will love

## Script Structure Rules
- Organize into 2-4 Acts, each with 1-3 Scenes
- Each scene must have a clear learning objective
- Every interaction must be tagged with a pedagogy method AND grounded facts
- Include a mix of interaction types: dialogue, choices, exploration, puzzles
- Keep it compact: 1-2 Acts, each with 1-2 Scenes (quality over quantity)
- Design for 10-15 minutes total experience
- Keep dialogue_points and descriptions concise

## Pedagogy Methods to Use
- **worked_example**: NPC demonstrates → student tries with guidance → student does independently
- **retrieval_practice**: Ask student to recall previously learned information
- **dual_coding**: Combine visual 3D elements with verbal/text information
- **scaffolding**: Start with heavy support, gradually reduce
- **interleaving**: Mix different knowledge topics across scenes
- **elaborative_interrogation**: Ask "why" and "how" questions

## Character Design (FOR CHILDREN)
- Characters should be like friendly cartoon characters, talking animals, or kind guides
- Give them fun, easy-to-remember names (like "Professor Pixel" or "Luna the Explorer")
- Each character should be warm, patient, and encouraging
- They should speak in simple language a 7-year-old can understand
- Include a main guide/friend character who helps the child throughout

## Anti-Hallucination Rules
- EVERY factual claim must reference a Fact ID from the Knowledge Graph
- Fictional elements (character names, minor details) are fine for storytelling
- NEVER invent facts, dates, or cause-effect relationships
- Keep factual content accurate but explain it in child-friendly language

## Genre Adaptations (child-friendly)
- **adventure**: Hero's journey structure, physical challenges, discovery
- **mystery**: Clues, deduction, reveal sequence
- **simulation**: Role-based decisions, resource management, consequences
- **roleplay**: Identity, relationships, moral dilemmas
- **documentary**: Timeline, testimony, evidence examination

## Output
Return a complete Script JSON matching the Script TypeScript interface. Include the alignment_report.`;

export async function generateScript(
  knowledgeGraph: KnowledgeGraph,
  preferences: StudentPreferences
): Promise<Script> {
  const client = new Anthropic();

  const userMessage = buildUserMessage(knowledgeGraph, preferences);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from scriptwriter response");
  }

  const script: Script = JSON.parse(fixJSON(jsonMatch[1]));

  if (!script.id) {
    script.id = `script_${Date.now()}`;
  }

  return script;
}

function buildUserMessage(
  kg: KnowledgeGraph,
  prefs: StudentPreferences
): string {
  return `## Knowledge Graph
\`\`\`json
${JSON.stringify(kg, null, 2)}
\`\`\`

## Student Preferences
- **Genre**: ${prefs.genre}
- **Difficulty**: ${prefs.difficulty}
- **Student Name**: ${prefs.name || "Explorer"}
${prefs.interests ? `- **Interests**: ${prefs.interests.join(", ")}` : ""}

## Instructions
Create a complete interactive script for a 3D immersive learning experience.

Requirements:
1. Cover the top ${Math.min(kg.learning_objectives.length, 5)} learning objectives
2. Reference facts by their IDs (e.g., "F_001") in the grounded_facts arrays
3. Include factual_claims with source_fact_id for every factual statement
4. Tag every interaction with appropriate pedagogy method and rationale
5. IMPORTANT: Keep it compact — exactly 1 act with 1-2 scenes. Do NOT create more.
6. Include an alignment_report showing coverage of objectives
7. Create 2-3 distinct characters with personalities
8. Keep descriptions concise — 1-2 sentences each

Genre is "${prefs.genre}" — adapt the narrative structure accordingly.
Difficulty is "${prefs.difficulty}" — adjust complexity of puzzles/choices.

Return ONLY a valid JSON object matching the Script interface.`;
}
