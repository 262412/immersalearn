// ============================================
// SceneGraphBuilder — Deterministic scene
// construction via validated method calls.
// Used by the Builder Agent's tool_use loop.
// ============================================

import { findAssetById } from "@/lib/scene/asset-registry";
import type {
  SceneGraph,
  EnvironmentConfig,
  LayoutConfig,
  Structure,
  NPCInstance,
  InteractiveObject,
  SceneTrigger,
} from "@/lib/types/scene-graph";

type Vec3 = [number, number, number];

function safeVec3(v: any, fallback: Vec3): Vec3 {
  if (Array.isArray(v) && v.length >= 3) {
    return [Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0];
  }
  return fallback;
}

function safeStr(v: any, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function safeNum(v: any, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// ---- Builder Class ----

export class SceneGraphBuilder {
  private sceneId: string;
  private environment: EnvironmentConfig;
  private layout: LayoutConfig;
  private structures: Structure[] = [];
  private npcs: NPCInstance[] = [];
  private interactiveObjects: InteractiveObject[] = [];
  private triggers: SceneTrigger[] = [];

  constructor(sceneId: string) {
    this.sceneId = sceneId;
    this.environment = defaultEnvironment();
    this.layout = defaultLayout();
  }

  // ---- Tool: set_environment ----
  setEnvironment(config: {
    time_of_day?: string;
    terrain_type?: string;
    terrain_color?: string;
    weather?: string;
    sky_color?: string;
    sun_color?: string;
    sun_intensity?: number;
    ambient_color?: string;
    ambient_intensity?: number;
    fog_color?: string;
    fog_near?: number;
    fog_far?: number;
  }): string {
    const tod = safeStr(config.time_of_day, "noon") as any;
    this.environment.skybox = {
      type: "preset",
      value: tod,
      time_of_day: tod,
    };
    this.environment.terrain = {
      type: "flat",
      material: safeStr(config.terrain_type, "grass"),
      size: [60, 60],
      color: config.terrain_color,
    };
    this.environment.lighting = {
      sun: {
        direction: [-1, -2, -1],
        color: safeStr(config.sun_color, "#FFFFFF"),
        intensity: safeNum(config.sun_intensity, 1),
        castShadow: true,
      },
      ambient: {
        color: safeStr(config.ambient_color, "#FFFFFF"),
        intensity: safeNum(config.ambient_intensity, 0.4),
      },
    };
    if (config.fog_color) {
      this.environment.fog = {
        color: config.fog_color,
        near: safeNum(config.fog_near, 20),
        far: safeNum(config.fog_far, 60),
      };
    }
    this.environment.audio = {};
    return `Environment set: ${tod}, terrain=${config.terrain_type || "grass"}`;
  }

  // ---- Tool: set_spawn ----
  setSpawn(config: {
    position?: Vec3;
    look_at?: Vec3;
  }): string {
    this.layout.player_spawn = {
      position: safeVec3(config.position, [0, 1.7, 8]),
      look_at: safeVec3(config.look_at, [0, 1.7, 0]),
    };
    return `Spawn set at [${this.layout.player_spawn.position}]`;
  }

  // ---- Tool: place_structure ----
  placeStructure(spec: {
    id: string;
    label: string;
    asset_id?: string;
    position: Vec3;
    scale?: Vec3;
    color?: string;
    primitive?: string;
    type?: string;
    model_url?: string;
  }): string {
    // Look up asset registry for compound_parts
    const asset = spec.asset_id ? findAssetById(spec.asset_id) : undefined;
    const fallbackColor = asset?.primitive_fallback.color || spec.color || "#888888";
    const fallbackPrimitive = asset?.primitive_fallback.type || spec.primitive || "box";
    const fallbackScale = asset?.primitive_fallback.scale || spec.scale || [1, 1, 1];

    const s: Structure = {
      id: safeStr(spec.id, `struct_${this.structures.length}`),
      type: (spec.type || asset?.category || "decoration") as any,
      asset_id: spec.asset_id,
      model_url: spec.model_url,
      primitive: fallbackPrimitive as any,
      position: safeVec3(spec.position, [0, 0, 0]),
      rotation: [0, 0, 0],
      scale: safeVec3(spec.scale, fallbackScale as Vec3),
      material: {
        color: safeStr(spec.color, fallbackColor),
        metalness: 0.1,
        roughness: 0.8,
        opacity: 1,
      },
      label: spec.label,
      interactive: false,
      // Resolve compound_parts from asset registry as children
      children: asset?.compound_parts?.map((part, i) => ({
        id: `${spec.id}_part_${i}`,
        type: "decoration" as const,
        primitive: part.primitive as any,
        position: part.offset,
        rotation: [0, 0, 0] as [number, number, number],
        scale: part.scale,
        material: { color: part.color, metalness: 0.1, roughness: 0.8, opacity: 1 },
        interactive: false,
      })),
    };
    this.structures.push(s);
    const assetInfo = asset ? ` (asset: ${asset.name})` : "";
    return `Placed structure "${spec.label}"${assetInfo} at [${s.position}]`;
  }

  // ---- Tool: add_npc ----
  addNPC(spec: {
    id: string;
    character_ref: string;
    name: string;
    position: Vec3;
    appearance_color?: string;
    interaction_radius?: number;
    indicator?: string;
    model_url?: string;
  }): string {
    const npc: NPCInstance = {
      id: safeStr(spec.id, `npc_${this.npcs.length}`),
      character_ref: safeStr(spec.character_ref, spec.id),
      name: safeStr(spec.name, `NPC ${this.npcs.length + 1}`),
      avatar: {
        model: "character_male",
        model_url: spec.model_url,
        scale: 1,
      },
      position: safeVec3(spec.position, [this.npcs.length * 3, 0, -2]),
      rotation: [0, 0, 0],
      behavior: {
        idle_animation: "standing",
        dialogue_enabled: true,
        dialogue_mode: "ai_realtime",
        interaction_radius: safeNum(spec.interaction_radius, 3),
      },
      indicator: {
        type: (spec.indicator || "speech") as any,
      },
    };
    this.npcs.push(npc);
    return `Added NPC "${spec.name}" at [${npc.position}]`;
  }

  // ---- Tool: add_interactive_object ----
  addInteractiveObject(spec: {
    id: string;
    name: string;
    asset_id?: string;
    position: Vec3;
    scale?: Vec3;
    color?: string;
    primitive?: string;
    examine_title?: string;
    examine_description: string;
    model_url?: string;
  }): string {
    const asset = spec.asset_id ? findAssetById(spec.asset_id) : undefined;
    const obj: InteractiveObject = {
      id: safeStr(spec.id, `obj_${this.interactiveObjects.length}`),
      name: safeStr(spec.name, `Object ${this.interactiveObjects.length + 1}`),
      asset_id: spec.asset_id,
      model_url: spec.model_url,
      primitive: (asset?.primitive_fallback.type || spec.primitive || "sphere") as any,
      position: safeVec3(spec.position, [0, 0.5, 0]),
      rotation: [0, 0, 0],
      scale: safeVec3(spec.scale, (asset?.primitive_fallback.scale as Vec3) || [0.5, 0.5, 0.5]),
      material: {
        color: safeStr(spec.color, "#FFD700"),
        emissive: "#332200",
        emissiveIntensity: 0.3,
      },
      interaction: {
        type: "examine",
        highlight_on_hover: true,
        on_interact: {
          type: "show_panel",
          title: safeStr(spec.examine_title, spec.name),
          description: safeStr(spec.examine_description, `You examine the ${spec.name}.`),
        },
      },
    };
    this.interactiveObjects.push(obj);
    return `Added interactive object "${spec.name}" at [${obj.position}]`;
  }

  // ---- Tool: add_trigger ----
  addTrigger(spec: {
    id: string;
    type?: string;
    message: string;
  }): string {
    const trigger: SceneTrigger = {
      id: safeStr(spec.id, `trigger_${this.triggers.length}`),
      type: (spec.type || "proximity") as any,
      config: {},
      once: true,
      action: {
        type: "show_notification",
        message: spec.message,
      },
    };
    this.triggers.push(trigger);
    return `Added trigger "${spec.id}"`;
  }

  // ---- Build final SceneGraph ----
  build(): SceneGraph {
    return {
      scene_id: this.sceneId,
      script_scene_ref: this.sceneId,
      environment: this.environment,
      layout: this.layout,
      structures: this.structures,
      npcs: this.npcs,
      interactive_objects: this.interactiveObjects,
      triggers: this.triggers,
      cinematic_sequences: [],
    };
  }

  // Stats for logging
  stats(): string {
    return `structures:${this.structures.length} npcs:${this.npcs.length} objects:${this.interactiveObjects.length} triggers:${this.triggers.length}`;
  }
}

// ---- Defaults ----

function defaultEnvironment(): EnvironmentConfig {
  return {
    skybox: { type: "preset", value: "noon", time_of_day: "noon" },
    terrain: { type: "flat", material: "grass", size: [60, 60] },
    lighting: {
      sun: { direction: [-1, -2, -1], color: "#FFFFFF", intensity: 1, castShadow: true },
      ambient: { color: "#FFFFFF", intensity: 0.4 },
    },
    audio: {},
  };
}

function defaultLayout(): LayoutConfig {
  return {
    player_spawn: { position: [0, 1.7, 8], look_at: [0, 1.7, 0] },
    boundaries: { type: "soft_wall", shape: "rectangle", size: [60, 60] },
  };
}
