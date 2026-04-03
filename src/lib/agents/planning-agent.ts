// ============================================
// Planning Agent — Single call that produces
// a unified WorldPlan (knowledge + narrative +
// 3D world spec, all coherent).
// Uses tool_use for structured output.
// Replaces: knowledge-extractor + scriptwriter
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { WorldPlan } from "@/lib/types/world-plan";
import type { StudentPreferences } from "@/lib/types";

const SYSTEM_PROMPT = `You are a creative educational designer who creates immersive 3D learning adventures for PRIMARY SCHOOL CHILDREN (ages 5-11).

## Your Task
Given textbook content and student preferences, create a unified WorldPlan that combines:
1. Knowledge extraction (what the student should learn)
2. A fun narrative/story (with characters kids will love)
3. A 3D world design (where everything happens)

The story and the 3D world MUST be tightly coupled — every character, object, and landmark in the world serves the narrative and teaches something.

## Rules for Children (ages 5-11)
- Use simple, short sentences. A 7-year-old should understand everything.
- Characters should be friendly and fun — like cartoon characters, talking animals, or kind guides
- Give characters easy, memorable names ("Professor Colour", "Luna the Star Cat")
- Make everything feel like a game, never like a lesson
- Choices should be simple (2-3 options)
- Praise correct answers enthusiastically
- Be gentle with wrong answers ("Not quite! Here's a hint...")

## World Design Rules
- Design 1 scene (keep it focused and rich, not spread thin)
- Place 4-6 landmarks/structures spread around the scene (not all at origin)
- Place 2-3 NPCs at distinct positions
- Place 3-5 interactive objects that teach something when examined

## CRITICAL: search_keywords Field
Every landmark, NPC, and interactive item MUST include a "search_keywords" field.
This is used to search a 3D model library. Write simple, concrete, real-world object names.
- BAD: "Professor Paintbrush's Magic Mixing Station" (too fantasy, no real model exists)
- GOOD: "wooden workbench" or "art table with paint"
- BAD: "Warm Colour Garden" (abstract concept)
- GOOD: "flower garden" or "colorful garden"
- BAD: "Artie the Gallery Cat" (fictional character)
- GOOD: "cartoon cat" or "cat character"
- For buildings: "wooden house", "stone temple", "art gallery", "pyramid"
- For nature: "oak tree", "bush", "rock", "river"
- For characters: "old man with beard", "young girl", "cat character", "robot"
- For objects: "paintbrush", "telescope", "book", "globe"
Keep keywords to 2-4 words, use everyday English.
- Define a spatial_flow: "player starts at X, walks to Y, then discovers Z"
- Positions should use realistic coordinates: X=-15 to 15, Z=-15 to 15, Y=0 for ground

## Knowledge Rules
- Extract ONLY facts from the provided textbook. Do NOT invent facts.
- Keep learning objectives simple and achievable for children
- Link every interactive element to specific facts

You MUST call the create_world_plan tool with your complete plan.`;

const WORLD_PLAN_TOOL: Anthropic.Messages.Tool = {
  name: "create_world_plan",
  description: "Create a complete WorldPlan for an immersive educational 3D experience",
  input_schema: {
    type: "object" as const,
    properties: {
      id: { type: "string", description: "Unique plan ID" },
      knowledge: {
        type: "object",
        properties: {
          subject: { type: "string" },
          topic: { type: "string" },
          learning_objectives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                text: { type: "string" },
                bloom_level: { type: "string", enum: ["remember", "understand", "apply", "analyze"] },
              },
              required: ["id", "text", "bloom_level"],
            },
          },
          facts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                statement: { type: "string" },
                category: { type: "string" },
              },
              required: ["id", "statement", "category"],
            },
          },
        },
        required: ["subject", "topic", "learning_objectives", "facts"],
      },
      narrative: {
        type: "object",
        properties: {
          title: { type: "string" },
          genre: { type: "string", enum: ["adventure", "mystery", "simulation", "roleplay", "documentary"] },
          target_age: { type: "string" },
          characters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                personality: { type: "string" },
                appearance: { type: "string" },
                speech_style: { type: "string" },
                knowledge_facts: { type: "array", items: { type: "string" } },
                search_keywords: { type: "string", description: "Simple term for 3D character model, e.g. 'old painter man', 'cartoon cat'" },
              },
              required: ["id", "name", "role", "personality", "appearance", "speech_style", "knowledge_facts", "search_keywords"],
            },
          },
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                story: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    objective: { type: "string" },
                    linked_facts: { type: "array", items: { type: "string" } },
                  },
                  required: ["description", "objective", "linked_facts"],
                },
                world: {
                  type: "object",
                  properties: {
                    environment_type: { type: "string" },
                    time_of_day: { type: "string" },
                    atmosphere: { type: "string" },
                    terrain: { type: "string" },
                    terrain_color: { type: "string" },
                    landmarks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          type: { type: "string" },
                          position: { type: "array", items: { type: "number" } },
                          scale: { type: "array", items: { type: "number" } },
                          color: { type: "string" },
                          primitive: { type: "string" },
                          search_keywords: { type: "string", description: "Simple 2-4 word search term for 3D model library, e.g. 'wooden easel', 'stone building'" },
                        },
                        required: ["id", "name", "description", "position", "scale", "color", "search_keywords"],
                      },
                    },
                    npc_placements: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          character_id: { type: "string" },
                          position: { type: "array", items: { type: "number" } },
                          initial_action: { type: "string" },
                          search_keywords: { type: "string", description: "Simple term for 3D character model, e.g. 'old man', 'cat character'" },
                        },
                        required: ["character_id", "position", "initial_action", "search_keywords"],
                      },
                    },
                    interactive_items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          position: { type: "array", items: { type: "number" } },
                          color: { type: "string" },
                          primitive: { type: "string" },
                          scale: { type: "array", items: { type: "number" } },
                          examine_text: { type: "string" },
                          linked_facts: { type: "array", items: { type: "string" } },
                          search_keywords: { type: "string", description: "Simple term for 3D model, e.g. 'paint palette', 'globe', 'telescope'" },
                        },
                        required: ["id", "name", "description", "position", "color", "examine_text", "linked_facts", "search_keywords"],
                      },
                    },
                    spatial_flow: { type: "string" },
                  },
                  required: ["environment_type", "time_of_day", "atmosphere", "terrain", "landmarks", "npc_placements", "interactive_items", "spatial_flow"],
                },
                interactions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      type: { type: "string", enum: ["dialogue", "choice", "explore", "puzzle"] },
                      description: { type: "string" },
                      pedagogy_method: { type: "string" },
                      pedagogy_rationale: { type: "string" },
                      linked_facts: { type: "array", items: { type: "string" } },
                      npc_id: { type: "string" },
                      dialogue_points: { type: "array", items: { type: "string" } },
                      choices: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            label: { type: "string" },
                            correct: { type: "boolean" },
                            feedback: { type: "string" },
                          },
                          required: ["label", "correct", "feedback"],
                        },
                      },
                    },
                    required: ["id", "type", "description", "pedagogy_method", "linked_facts"],
                  },
                },
              },
              required: ["id", "title", "story", "world", "interactions"],
            },
          },
        },
        required: ["title", "genre", "target_age", "characters", "scenes"],
      },
    },
    required: ["id", "knowledge", "narrative"],
  },
};

export async function createWorldPlan(
  textbookContent: string,
  preferences: StudentPreferences,
  subject?: string,
  topic?: string,
  curriculum?: string
): Promise<WorldPlan> {
  const client = new Anthropic();

  const userMessage = `## Textbook Content
${textbookContent}

## Student Preferences
- Genre: ${preferences.genre}
- Difficulty: ${preferences.difficulty}
- Student Name: ${preferences.name || "Explorer"}
${subject ? `- Subject: ${subject}` : ""}
${topic ? `- Topic: ${topic}` : ""}
${curriculum ? `- Curriculum: ${curriculum}` : ""}

Create a complete WorldPlan for this content. Design a fun, immersive 3D adventure that teaches the key concepts from the textbook. Remember: the student is a young child (ages 5-11).`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    tools: [WORLD_PLAN_TOOL],
    tool_choice: { type: "tool", name: "create_world_plan" },
    messages: [{ role: "user", content: userMessage }],
  });

  // Extract tool_use result — no JSON regex needed!
  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Planning Agent did not produce a tool_use response");
  }

  const plan = toolUse.input as WorldPlan;

  // Ensure ID
  if (!plan.id) {
    plan.id = `plan_${Date.now()}`;
  }

  return plan;
}
