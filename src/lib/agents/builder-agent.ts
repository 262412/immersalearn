// ============================================
// Builder Agent — Constructs a SceneGraph via
// tool_use. Each tool call is validated by
// SceneGraphBuilder. No raw JSON output.
// Replaces: scene-director
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type { WorldPlan, WorldScene } from "@/lib/types/world-plan";
import type { SceneGraph } from "@/lib/types/scene-graph";
import { getAssetsForDomain, ASSET_REGISTRY } from "@/lib/scene/asset-registry";
import { SceneGraphBuilder } from "@/lib/scene/scene-builder";

const SYSTEM_PROMPT = `You are a 3D scene builder for an educational children's game. You receive a WorldPlan scene description and must build it by calling tools.

## Rules
- Call set_environment FIRST to set up the sky, terrain, and lighting
- Call set_spawn to position the player
- Call place_structure for each landmark (4-6 total, spread them around)
- Call add_npc for each character listed in the plan
- Call add_interactive_object for each interactive item (3-5 total)
- Call finalize_scene when done

## Positioning Rules
- Spread objects around: use X from -12 to 12, Z from -12 to 12
- Y=0 is ground level. Objects sit ON the ground (Y = half their height)
- Don't stack objects at the same position
- Place NPCs facing the player spawn area
- Put interactive objects near related NPCs or landmarks

## The player spawns at approximately [0, 1.7, 8] looking toward [0, 1.7, 0].
Place the most important NPC near the center [0, 0, 0] so the player sees them first.`;

const BUILDER_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "set_environment",
    description: "Set up sky, terrain, and lighting for the scene",
    input_schema: {
      type: "object" as const,
      properties: {
        time_of_day: { type: "string", enum: ["dawn", "morning", "noon", "afternoon", "dusk", "night"], description: "Time of day affects sky color and lighting" },
        terrain_type: { type: "string", enum: ["grass", "sand", "stone", "dirt", "snow", "water"], description: "Ground material" },
        terrain_color: { type: "string", description: "Hex color override for terrain" },
        sun_color: { type: "string", description: "Hex color for sunlight" },
        sun_intensity: { type: "number", description: "Sun brightness 0-2" },
        ambient_intensity: { type: "number", description: "Ambient light 0-1" },
        fog_color: { type: "string", description: "Fog color (omit for no fog)" },
      },
      required: ["time_of_day", "terrain_type"],
    },
  },
  {
    name: "set_spawn",
    description: "Set where the player starts and what they look at",
    input_schema: {
      type: "object" as const,
      properties: {
        position: { type: "array", items: { type: "number" }, description: "[x, y, z] — y should be 1.7 for eye height" },
        look_at: { type: "array", items: { type: "number" }, description: "[x, y, z] — where the player looks initially" },
      },
      required: ["position", "look_at"],
    },
  },
  {
    name: "place_structure",
    description: "Place a building, landmark, or decoration in the scene",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string" },
        label: { type: "string", description: "Display name" },
        asset_id: { type: "string", description: "Asset ID from the available assets list (PREFERRED — gives better visuals)" },
        position: { type: "array", items: { type: "number" }, description: "[x, y, z]" },
        scale: { type: "array", items: { type: "number" }, description: "[width, height, depth]" },
        color: { type: "string", description: "Hex color (fallback if no asset_id)" },
        primitive: { type: "string", enum: ["box", "cylinder", "sphere", "cone"], description: "Fallback shape if no asset_id" },
        type: { type: "string", enum: ["building", "landmark", "decoration", "terrain_feature"] },
      },
      required: ["id", "label", "position", "scale", "color", "primitive"],
    },
  },
  {
    name: "add_npc",
    description: "Add a character (NPC) to the scene",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string" },
        character_ref: { type: "string", description: "Must match a character ID from the plan" },
        name: { type: "string" },
        position: { type: "array", items: { type: "number" }, description: "[x, y, z] — y should be 0" },
        appearance_color: { type: "string", description: "Body color hex" },
        indicator: { type: "string", enum: ["speech", "exclamation", "question"], description: "Icon above head" },
      },
      required: ["id", "character_ref", "name", "position"],
    },
  },
  {
    name: "add_interactive_object",
    description: "Add an object the student can click to examine",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        asset_id: { type: "string", description: "Asset ID from available assets (PREFERRED)" },
        position: { type: "array", items: { type: "number" }, description: "[x, y, z]" },
        scale: { type: "array", items: { type: "number" }, description: "[w, h, d]" },
        color: { type: "string", description: "Hex color (fallback)" },
        primitive: { type: "string", enum: ["box", "cylinder", "sphere", "cone"], description: "Fallback shape" },
        examine_title: { type: "string", description: "Title shown when examined" },
        examine_description: { type: "string", description: "Educational text shown when examined (simple, for kids)" },
      },
      required: ["id", "name", "position", "examine_description"],
    },
  },
  {
    name: "finalize_scene",
    description: "Signal that the scene is complete. Call this when all objects are placed.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: { type: "string", description: "Brief summary of what was built" },
      },
      required: ["summary"],
    },
  },
];

const MAX_ITERATIONS = 25;

export async function buildScene(
  worldPlan: WorldPlan,
  sceneIndex: number = 0
): Promise<SceneGraph> {
  const scene = worldPlan.narrative.scenes[sceneIndex];
  if (!scene) {
    throw new Error(`Scene index ${sceneIndex} not found in WorldPlan`);
  }

  const client = new Anthropic();
  const builder = new SceneGraphBuilder(scene.id);

  // Build the prompt describing what needs to be built
  const sceneDescription = buildScenePrompt(worldPlan, scene);

  // Start the tool_use conversation
  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: sceneDescription },
  ];

  let iterations = 0;
  let finalized = false;

  while (iterations < MAX_ITERATIONS && !finalized) {
    iterations++;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: BUILDER_TOOLS,
      messages,
    });

    // Process each content block
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === "tool_use") {
        const input = block.input as Record<string, any>;
        let result: string;

        try {
          switch (block.name) {
            case "set_environment":
              result = builder.setEnvironment(input);
              break;
            case "set_spawn":
              result = builder.setSpawn(input);
              break;
            case "place_structure":
              result = builder.placeStructure(input as any);
              break;
            case "add_npc":
              result = builder.addNPC(input as any);
              break;
            case "add_interactive_object":
              result = builder.addInteractiveObject(input as any);
              break;
            case "finalize_scene":
              finalized = true;
              result = `Scene finalized. ${builder.stats()}`;
              break;
            default:
              result = `Unknown tool: ${block.name}`;
          }
        } catch (err: any) {
          result = `Error: ${err.message}`;
        }

        console.log(`[Builder] ${block.name}: ${result}`);

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    // If there were tool calls, send results back
    if (toolResults.length > 0) {
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }

    // If the model stopped without tool calls, we're done
    if (response.stop_reason === "end_turn" && toolResults.length === 0) {
      break;
    }
  }

  console.log(`[Builder] Completed in ${iterations} iterations. ${builder.stats()}`);

  return builder.build();
}

function buildScenePrompt(plan: WorldPlan, scene: WorldScene): string {
  const chars = plan.narrative.characters;
  const subject = plan.knowledge.subject?.toLowerCase() || "";

  // Get available assets for this subject
  const assets = getAssetsForDomain(subject);
  const assetList = assets.length > 0
    ? assets.map((a) => `  "${a.id}": ${a.name} (${a.category})`).join("\n")
    : ASSET_REGISTRY.map((a) => `  "${a.id}": ${a.name} (${a.category})`).join("\n");

  return `## Build this scene: "${scene.title}"

## Story
${scene.story.description}
Learning objective: ${scene.story.objective}

## Environment
- Type: ${scene.world.environment_type}
- Time: ${scene.world.time_of_day}
- Atmosphere: ${scene.world.atmosphere}
- Terrain: ${scene.world.terrain}${scene.world.terrain_color ? ` (color: ${scene.world.terrain_color})` : ""}
- Spatial flow: ${scene.world.spatial_flow}

## AVAILABLE ASSETS (use asset_id when calling place_structure or add_interactive_object!)
These give MUCH better visuals than raw primitives. Always prefer asset_id over primitive.
${assetList}

## Characters to place (MUST add all as NPCs):
${(scene.world.npc_placements || []).map((npc) => {
  const char = chars.find((c) => c.id === npc.character_id);
  return `- character_ref="${npc.character_id}", name="${char?.name || npc.character_id}", position=[${npc.position}], doing: "${npc.initial_action}"`;
}).join("\n") || "- (place all characters from the plan)"}

## Landmarks to place (use asset_id from the list above!):
${(scene.world.landmarks || []).map((lm) =>
  `- id="${lm.id}", "${lm.name}": ${lm.description} — position=[${lm.position}], scale=[${lm.scale}], color=${lm.color}`
).join("\n") || "- (create appropriate landmarks for the scene)"}

## Interactive items to place:
${(scene.world.interactive_items || []).map((item) =>
  `- id="${item.id}", "${item.name}": examine_text="${item.examine_text}" — position=[${item.position}], color=${item.color}`
).join("\n") || "- (create 3-5 interactive educational objects)"}

Build the scene now. For EVERY structure, use an asset_id from the list above when possible. Start with set_environment, then set_spawn, then place structures (with asset_id!), NPCs, and interactive objects. Call finalize_scene when done.`;
}
