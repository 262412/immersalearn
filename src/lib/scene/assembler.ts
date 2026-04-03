// ============================================
// Assembler — Deterministic post-build step
// No AI calls. Validates + enhances the
// Builder Agent's SceneGraph output.
// ============================================

import type { SceneGraph } from "@/lib/types/scene-graph";
import type { WorldPlan } from "@/lib/types/world-plan";
import { normalizeSceneGraph } from "./normalize-scene";
import { ASSET_REGISTRY } from "./asset-registry";

export function assembleScene(
  rawSceneGraph: SceneGraph,
  worldPlan: WorldPlan
): SceneGraph {
  // Step 1: Normalize (fill missing fields)
  const scene = normalizeSceneGraph(rawSceneGraph);

  // Step 2: Validate NPC character_refs match plan characters
  const characterIds = new Set(worldPlan.narrative.characters.map((c) => c.id));
  for (const npc of scene.npcs) {
    if (!characterIds.has(npc.character_ref)) {
      // Try to find closest match by name
      const match = worldPlan.narrative.characters.find(
        (c) => c.name === npc.name || c.id === npc.id
      );
      if (match) {
        npc.character_ref = match.id;
      } else if (worldPlan.narrative.characters.length > 0) {
        // Fallback to first character
        npc.character_ref = worldPlan.narrative.characters[0].id;
      }
    }
  }

  // Step 3: Resolve asset IDs to compound geometry
  for (const structure of scene.structures) {
    if (structure.asset_id) {
      const asset = ASSET_REGISTRY.find((a) => a.id === structure.asset_id);
      if (asset?.compound_parts) {
        structure.children = asset.compound_parts.map((part, i) => ({
          id: `${structure.id}_part_${i}`,
          type: "decoration" as const,
          primitive: part.primitive as any,
          position: part.offset,
          rotation: [0, 0, 0] as [number, number, number],
          scale: part.scale,
          material: { color: part.color, metalness: 0.1, roughness: 0.8, opacity: 1 },
          interactive: false,
        }));
      }
    }
  }

  // Step 4: Ensure at least some content
  if (scene.structures.length === 0 && scene.npcs.length === 0 && scene.interactive_objects.length === 0) {
    console.warn("[Assembler] Scene is completely empty — adding fallback content");
    // Add a ground marker so the scene isn't invisible
    scene.structures.push({
      id: "fallback_ground",
      type: "decoration",
      primitive: "cylinder",
      position: [0, 0.05, 0],
      rotation: [0, 0, 0],
      scale: [8, 0.1, 8],
      material: { color: "#8B7355", metalness: 0, roughness: 1, opacity: 1 },
      label: "Explore area",
      interactive: false,
    });
  }

  return scene;
}
