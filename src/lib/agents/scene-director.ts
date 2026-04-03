// ============================================
// Agent 2: Scene Director
// Input: Script JSON + Asset Registry
// Output: SceneGraph JSON (renderable by Three.js)
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { Script, Scene, Act, SceneGraph } from "@/lib/types";
import { ASSET_REGISTRY, type AssetEntry } from "@/lib/scene/asset-registry";

// Filter assets relevant to the scene to reduce tokens sent to AI
function getRelevantAssets(setting: Record<string, string>, subject?: string): AssetEntry[] {
  const keywords = Object.values(setting).join(" ").toLowerCase().split(/\s+/);
  const subjectLower = (subject || "").toLowerCase();

  // Always include universal assets
  const universal = ASSET_REGISTRY.filter((a) => a.domain.includes("universal"));

  // Match by domain (subject)
  const byDomain = ASSET_REGISTRY.filter(
    (a) =>
      !a.domain.includes("universal") &&
      a.domain.some(
        (d) =>
          subjectLower.includes(d) ||
          d.includes(subjectLower) ||
          keywords.some((kw) => d.includes(kw) || kw.includes(d))
      )
  );

  // Match by tags (setting keywords)
  const byTags = ASSET_REGISTRY.filter(
    (a) =>
      !a.domain.includes("universal") &&
      !byDomain.includes(a) &&
      a.tags.some((t) => keywords.some((kw) => t.includes(kw) || kw.includes(t)))
  );

  // Deduplicate and limit
  const combined = [...universal, ...byDomain, ...byTags];
  const seen = new Set<string>();
  const result: AssetEntry[] = [];
  for (const a of combined) {
    if (!seen.has(a.id)) {
      seen.add(a.id);
      result.push(a);
    }
  }

  // Send compact version — only id, name, tags, primitive_fallback
  return result.slice(0, 40);
}

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

## Available Assets (filtered for this scene)
${getRelevantAssets(setting, script.meta?.subject).map((a) =>
  `- id:"${a.id}" (${a.primitive_fallback.type}, color:${a.primitive_fallback.color}, scale:[${a.primitive_fallback.scale}]) — ${a.name}`
).join("\n")}

## Instructions
Create a SceneGraph JSON. Keep it focused:
- Place NPCs from the character list above (use their exact id/name)
- Create 3-5 interactive objects with on_interact actions
- Set up environment matching the setting
- Use asset IDs where available; use primitives as fallback
- All positions as [x,y,z] arrays, particles as array

Return ONLY valid JSON, no markdown fences.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
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
