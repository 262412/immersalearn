// ============================================
// Agent 1b: Scriptwriter Agent
// Input: KnowledgeGraph + Student Preferences
// Output: Script JSON
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { KnowledgeGraph, Script, StudentPreferences } from "@/lib/types";

const SYSTEM_PROMPT = `You are a master interactive storyteller and educational designer. You create immersive, interactive scripts that turn educational content into engaging 3D experiences.

## Your Role
Given a Knowledge Graph (structured educational content) and student preferences, you write a complete interactive script that:
1. Covers ALL learning objectives through experiential interactions
2. Embeds evidence-based pedagogy naturally into the narrative
3. Only uses facts from the Knowledge Graph (NEVER invent historical facts)
4. Creates memorable characters and compelling situations

## Script Structure Rules
- Organize into 2-4 Acts, each with 1-3 Scenes
- Each scene must have a clear learning objective
- Every interaction must be tagged with a pedagogy method AND grounded facts
- Include a mix of interaction types: dialogue, choices, exploration, puzzles
- Design for 15-25 minutes total experience

## Pedagogy Methods to Use
- **worked_example**: NPC demonstrates → student tries with guidance → student does independently
- **retrieval_practice**: Ask student to recall previously learned information
- **dual_coding**: Combine visual 3D elements with verbal/text information
- **scaffolding**: Start with heavy support, gradually reduce
- **interleaving**: Mix different knowledge topics across scenes
- **elaborative_interrogation**: Ask "why" and "how" questions

## Character Design
- Each NPC should have a distinct personality and speech style
- NPCs should feel like real people from that time/place
- Give each NPC specific knowledge they can share
- Include at least one mentor figure and one peer/companion

## Anti-Hallucination Rules
- EVERY factual claim in dialogue/narration must reference a Fact ID from the Knowledge Graph
- If the story needs fictional elements (character names, minor details), mark them clearly
- NEVER invent dates, statistics, cause-effect relationships, or historical claims
- When unsure, have the NPC say "I've heard..." rather than stating as fact

## Genre Adaptations
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
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
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

  const script: Script = JSON.parse(jsonMatch[1]);

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
1. Cover all ${kg.learning_objectives.length} learning objectives
2. Reference facts by their IDs (e.g., "F_001") in the grounded_facts arrays
3. Include factual_claims with source_fact_id for every factual statement
4. Tag every interaction with appropriate pedagogy method and rationale
5. Design 2-4 acts with 1-3 scenes each
6. Include an alignment_report showing coverage of all objectives
7. Create 2-4 distinct characters with personalities

Genre is "${prefs.genre}" — adapt the narrative structure accordingly.
Difficulty is "${prefs.difficulty}" — adjust complexity of puzzles/choices.

Return ONLY a valid JSON object matching the Script interface.`;
}
