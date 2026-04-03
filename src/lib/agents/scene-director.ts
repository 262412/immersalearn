// ============================================
// Agent 2: Scene Director
// Input: Script JSON + Asset Registry
// Output: SceneGraph JSON (renderable by Three.js)
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { Script, Scene, Act, SceneGraph } from "@/lib/types";
import { ASSET_REGISTRY } from "@/lib/scene/asset-registry";

const SYSTEM_PROMPT = `You are a 3D scene director for educational experiences. Given a script scene description, you create detailed 3D scene graphs that can be rendered in a web browser.

## Your Task
Convert a narrative scene description into a structured 3D scene layout with:
- Environment (skybox, terrain, lighting, fog, particles, audio)
- Structures (buildings, landmarks, decorations)
- NPCs (characters with positions, animations, interaction settings)
- Interactive objects (items students can examine, collect, or activate)
- Triggers (proximity events, completion conditions)
- Cinematic sequences (camera movements for key moments)

## CRITICAL: NPC Rules
- You MUST ONLY create NPCs from the "Characters Present" list provided below
- Each NPC's "character_ref" MUST exactly match the character's "id" from the script
- Each NPC's "name" MUST exactly match the character's "name" from the script
- Do NOT invent new characters that are not in the script
- Every character listed in "Characters Present" MUST appear as an NPC in the scene

## Design Principles
1. **Spatial Storytelling**: Place objects to guide the player's eye and movement
2. **Readable Layout**: Don't overcrowd. Leave clear paths between points of interest
3. **Visual Hierarchy**: Important interactive objects should stand out (position, color, lighting)
4. **Atmosphere**: Lighting, fog, and particles should reinforce the scene's mood
5. **Player Flow**: Spawn point → first interaction should be intuitive (visible from spawn)

## Available Assets
You will receive an asset registry. Use asset IDs from this registry when possible.
If no exact match exists, specify a "primitive" (box, sphere, cylinder, cone) with materials.

## Coordinate System
- Y is up
- Units are roughly meters
- Player eye height is ~1.7
- Keep scene within 100x100 units for performance
- Place player spawn at a good viewpoint

## JSON Structure Requirements
- All position/rotation/scale fields must be arrays of 3 numbers: [x, y, z]
- "particles" must be an array (not a single object)
- Every interactive_object must have "interaction.on_interact" with a "type" field
- on_interact type must be one of: "show_panel", "collect_item", "trigger_dialogue", "trigger_choice"
- For "show_panel": include "title" and "description" strings

## Output
Return ONLY a valid JSON object. No markdown, no explanation.`;

export async function generateSceneGraph(
  script: Script,
  act: Act,
  scene: Scene
): Promise<SceneGraph> {
  const client = new Anthropic();

  const defaultSetting = {
    location: scene.description || "An unknown place",
    time_period: "Present day",
    atmosphere: "Neutral",
    weather: "",
  };
  const setting = {
    ...defaultSetting,
    ...(act.setting || {}),
    ...(scene.setting_override || {}),
  };

  const npcsPresent = scene.npcs_present || [];
  const characters = script.characters || [];
  // If npcs_present is empty, include all characters as fallback
  const npcsInScene = npcsPresent.length > 0
    ? characters.filter((c) => npcsPresent.includes(c.id))
    : characters;

  const userMessage = `## Scene to Build
**Title**: ${scene.title || "Untitled Scene"}
**Description**: ${scene.description || "A scene in the story"}
**Objective**: ${scene.objective || "Explore and learn"}

## Setting
- **Location**: ${setting.location}
- **Time Period**: ${setting.time_period}
- **Atmosphere**: ${setting.atmosphere}
${setting.weather ? `- **Weather**: ${setting.weather}` : ""}

## Characters Present (USE EXACTLY THESE — DO NOT INVENT NEW ONES)
${npcsInScene.length > 0
  ? npcsInScene
    .map(
      (c) =>
        `- id: "${c.id}", name: "${c.name}", role: "${c.role}", appearance: "${c.appearance || "default"}", personality: "${c.personality || "friendly"}"`
    )
    .join("\n")
  : "- No specific characters defined. Create 1-2 generic guide characters."}

## Interactions to Support
${(scene.interactions || [])
  .map(
    (i) =>
      `- [${i.id}] ${i.type}: ${i.description}`
  )
  .join("\n") || "(No specific interactions defined — create appropriate ones based on the scene description)"}

## Completion Condition
${scene.completion_condition || "Explore the scene and interact with NPCs"}

## Available Assets
\`\`\`json
${JSON.stringify(ASSET_REGISTRY, null, 2)}
\`\`\`

## Instructions
Create a complete SceneGraph JSON for this scene.
- Place all NPCs with appropriate positions and behaviors
- Create interactive objects for each interaction
- Set up environment (skybox, lighting, terrain) matching the setting
- Add at least one cinematic sequence for the scene intro
- Define triggers for scene completion
- Use asset IDs from the registry where available; use primitives as fallback

Return ONLY a valid JSON object.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error("Failed to extract SceneGraph JSON from scene director response");
  }

  const sceneGraph: SceneGraph = JSON.parse(jsonMatch[1]);

  // Ensure required fields
  if (!sceneGraph.scene_id) {
    sceneGraph.scene_id = scene.id;
  }
  if (!sceneGraph.script_scene_ref) {
    sceneGraph.script_scene_ref = scene.id;
  }

  return sceneGraph;
}

// Generate all scene graphs for a complete script
export async function generateAllSceneGraphs(
  script: Script
): Promise<Map<string, SceneGraph>> {
  const results = new Map<string, SceneGraph>();

  for (const act of script.acts) {
    for (const scene of act.scenes) {
      const sg = await generateSceneGraph(script, act, scene);
      results.set(scene.id, sg);
    }
  }

  return results;
}
