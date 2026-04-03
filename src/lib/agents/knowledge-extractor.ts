// ============================================
// Agent 1a: Knowledge Extractor
// Input: Textbook text + Curriculum spec
// Output: KnowledgeGraph
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { KnowledgeGraph } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert educational content analyst. Your job is to extract a structured knowledge graph from educational materials.

## Your Task
Given textbook content and (optionally) a curriculum specification, extract:
1. **Learning Objectives** — What students should be able to do after studying this material. Tag each with Bloom's taxonomy level.
2. **Facts** — Specific, verifiable factual claims. Each fact MUST include:
   - The exact statement
   - Which learning objective(s) it supports
   - A confidence level
   - A category (date, name, place, cause_effect, concept, statistic, other)
3. **Key Figures** — Important people mentioned, with their role and significance
4. **Key Events** — Important events with dates, locations, and significance
5. **Key Concepts** — Abstract ideas/terms that need to be understood
6. **Relationships** — How facts, events, and concepts relate to each other

## Rules
- Extract ONLY information that is explicitly stated or directly implied in the source text
- Do NOT add information from your own knowledge — this is critical for hallucination prevention
- If the curriculum spec mentions topics not covered in the textbook, note them as gaps
- Be precise with dates, names, and places — copy them exactly from the source
- Each fact should be atomic (one claim per fact)

## Output Format
Return a valid JSON object matching the KnowledgeGraph TypeScript interface. Use these ID formats:
- Learning Objectives: "LO_1", "LO_2", ...
- Facts: "F_001", "F_002", ...
- Relationships: "R_001", "R_002", ...
- Key Figures: "KF_001", ...
- Key Events: "KE_001", ...
- Key Concepts: "KC_001", ...`;

export async function extractKnowledge(
  textbookContent: string,
  curriculumSpec?: string,
  subject?: string,
  topic?: string
): Promise<KnowledgeGraph> {
  const client = new Anthropic();

  const userMessage = buildUserMessage(textbookContent, curriculumSpec, subject, topic);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
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

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from knowledge extraction response");
  }

  const kg: KnowledgeGraph = JSON.parse(jsonMatch[1]);

  // Ensure IDs exist
  if (!kg.id) {
    kg.id = `kg_${Date.now()}`;
  }

  return kg;
}

function buildUserMessage(
  textbookContent: string,
  curriculumSpec?: string,
  subject?: string,
  topic?: string
): string {
  let message = "";

  if (subject) {
    message += `## Subject: ${subject}\n`;
  }
  if (topic) {
    message += `## Topic: ${topic}\n`;
  }

  if (curriculumSpec) {
    message += `\n## Curriculum Specification\n${curriculumSpec}\n`;
  }

  message += `\n## Textbook Content\n${textbookContent}\n`;

  message += `\n## Instructions
Please extract a complete knowledge graph from the above material. Return ONLY a valid JSON object (no additional text outside the JSON).
The JSON should conform to the KnowledgeGraph interface with fields:
- id (string)
- subject (string)
- curriculum (string)
- topic (string)
- learning_objectives (array)
- facts (array)
- relationships (array)
- key_figures (array)
- key_events (array)
- key_concepts (array)`;

  return message;
}
