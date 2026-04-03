// ============================================
// Scene Graph Normalizer
// Ensures ANY AI-generated SceneGraph is safe
// to render — fills all missing fields with
// sensible defaults. Runs ONCE before rendering.
// ============================================

import type {
  SceneGraph,
  EnvironmentConfig,
  LayoutConfig,
  Structure,
  NPCInstance,
  InteractiveObject,
  SceneTrigger,
  CinematicSequence,
} from "@/lib/types/scene-graph";

type Vec3 = [number, number, number];

const DEFAULT_VEC3: Vec3 = [0, 0, 0];
const DEFAULT_SPAWN: Vec3 = [0, 1.7, 5];
const DEFAULT_LOOK_AT: Vec3 = [0, 1.7, 0];

// ---- Main entry point ----

export function normalizeSceneGraph(raw: any): SceneGraph {
  if (!raw || typeof raw !== "object") {
    return buildEmptyScene();
  }

  return {
    scene_id: raw.scene_id || raw.id || `scene_${Date.now()}`,
    script_scene_ref: raw.script_scene_ref || raw.scene_id || "",
    environment: normalizeEnvironment(raw.environment),
    layout: normalizeLayout(raw.layout),
    structures: normalizeArray(raw.structures, normalizeStructure),
    npcs: normalizeArray(raw.npcs, normalizeNPC),
    interactive_objects: normalizeArray(
      raw.interactive_objects || raw.interactiveObjects || raw.objects,
      normalizeInteractiveObject
    ),
    triggers: normalizeArray(raw.triggers, normalizeTrigger),
    cinematic_sequences: normalizeArray(
      raw.cinematic_sequences || raw.cinematics,
      normalizeCinematic
    ),
  };
}

// ---- Helpers ----

function normalizeArray<T>(input: any, normalizeFn: (item: any, index: number) => T): T[] {
  if (!input) return [];
  if (!Array.isArray(input)) {
    // Single object → wrap in array
    if (typeof input === "object") return [normalizeFn(input, 0)];
    return [];
  }
  return input.map((item, i) => normalizeFn(item, i));
}

function vec3(v: any, fallback: Vec3 = DEFAULT_VEC3): Vec3 {
  if (Array.isArray(v) && v.length >= 3) {
    return [Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0];
  }
  if (v && typeof v === "object" && ("x" in v || "X" in v)) {
    return [Number(v.x ?? v.X) || 0, Number(v.y ?? v.Y) || 0, Number(v.z ?? v.Z) || 0];
  }
  return fallback;
}

function str(v: any, fallback: string): string {
  if (typeof v === "string" && v.trim()) return v;
  return fallback;
}

function num(v: any, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bool(v: any, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  return fallback;
}

// ---- Environment ----

function normalizeEnvironment(env: any): EnvironmentConfig {
  if (!env || typeof env !== "object") {
    return defaultEnvironment();
  }

  const skybox = env.skybox || {};
  const terrain = env.terrain || {};
  const lighting = env.lighting || {};
  const sun = lighting.sun || lighting.directional || {};
  const ambient = lighting.ambient || {};

  return {
    skybox: {
      type: str(skybox.type, "preset") as any,
      value: str(skybox.value || skybox.preset, "noon"),
      time_of_day: str(skybox.time_of_day || skybox.timeOfDay, "noon") as any,
    },
    terrain: {
      type: str(terrain.type, "flat") as any,
      material: str(terrain.material || terrain.texture, "grass"),
      size: [num(terrain.size?.[0], 60), num(terrain.size?.[1], 60)],
      color: terrain.color,
    },
    lighting: {
      sun: {
        direction: vec3(sun.direction || sun.position, [-1, -2, -1]),
        color: str(sun.color, "#FFFFFF"),
        intensity: num(sun.intensity, 1),
        castShadow: bool(sun.castShadow, true),
      },
      ambient: {
        color: str(ambient.color, "#FFFFFF"),
        intensity: num(ambient.intensity, 0.4),
      },
      point_lights: normalizeArray(
        lighting.point_lights || lighting.pointLights,
        (pl) => ({
          position: vec3(pl.position, [0, 3, 0]),
          color: str(pl.color, "#FFFFFF"),
          intensity: num(pl.intensity, 0.5),
          distance: num(pl.distance, 20),
        })
      ),
    },
    fog: env.fog
      ? {
          color: str(env.fog.color, "#cccccc"),
          near: num(env.fog.near, 20),
          far: num(env.fog.far, 80),
        }
      : undefined,
    particles: normalizeArray(
      Array.isArray(env.particles) ? env.particles : env.particles ? [env.particles] : [],
      (p) => ({
        type: str(p.type, "dust") as any,
        density: str(p.density, "low") as any,
        area: p.area ? vec3(p.area, [40, 10, 40]) : undefined,
      })
    ),
    audio: {
      ambient: env.audio?.ambient,
      music: env.audio?.music,
      volume: num(env.audio?.volume, 0.5),
    },
  };
}

function defaultEnvironment(): EnvironmentConfig {
  return normalizeEnvironment({});
}

// ---- Layout ----

function normalizeLayout(layout: any): LayoutConfig {
  if (!layout || typeof layout !== "object") layout = {};
  const spawn = layout.player_spawn || layout.playerSpawn || layout.spawn || {};
  const boundaries = layout.boundaries || layout.boundary || {};

  return {
    player_spawn: {
      position: vec3(spawn.position, DEFAULT_SPAWN),
      look_at: vec3(spawn.look_at || spawn.lookAt, DEFAULT_LOOK_AT),
    },
    boundaries: {
      type: str(boundaries.type, "soft_wall") as any,
      shape: str(boundaries.shape, "rectangle") as any,
      size: [num(boundaries.size?.[0], 60), num(boundaries.size?.[1], 60)],
      message_on_hit: boundaries.message_on_hit || boundaries.message,
    },
  };
}

// ---- Structure ----

function normalizeStructure(s: any, i: number): Structure {
  if (!s || typeof s !== "object") s = {};
  return {
    id: str(s.id, `structure_${i}`),
    type: str(s.type, "decoration") as any,
    asset_id: s.asset_id || s.assetId || s.asset,
    model_url: s.model_url || s.modelUrl,
    primitive: str(s.primitive, "box") as any,
    position: vec3(s.position),
    rotation: vec3(s.rotation),
    scale: vec3(s.scale, [1, 1, 1]),
    material: s.material
      ? {
          color: str(s.material.color, "#888888"),
          metalness: num(s.material.metalness, 0.1),
          roughness: num(s.material.roughness, 0.8),
          opacity: num(s.material.opacity, 1),
          texture: s.material.texture,
        }
      : undefined,
    label: s.label || s.name,
    interactive: bool(s.interactive, false),
    children: s.children ? normalizeArray(s.children, normalizeStructure) : undefined,
  };
}

// ---- NPC ----

function normalizeNPC(n: any, i: number): NPCInstance {
  if (!n || typeof n !== "object") n = {};
  const behavior = n.behavior || {};
  const avatar = n.avatar || {};

  return {
    id: str(n.id, `npc_${i}`),
    character_ref: str(n.character_ref || n.characterRef || n.character_id, n.id || `npc_${i}`),
    name: str(n.name, `Character ${i + 1}`),
    avatar: {
      model: str(avatar.model || avatar.base, "character_male"),
      model_url: avatar.model_url || avatar.modelUrl,
      clothing: avatar.clothing,
      accessories: Array.isArray(avatar.accessories) ? avatar.accessories : [],
      scale: num(avatar.scale, 1),
    },
    position: vec3(n.position, [i * 3, 0, -3]),
    rotation: vec3(n.rotation),
    behavior: {
      idle_animation: str(behavior.idle_animation || behavior.idle, "standing"),
      greeting_animation: behavior.greeting_animation || behavior.greeting,
      dialogue_enabled: bool(behavior.dialogue_enabled ?? behavior.dialogueEnabled, true),
      dialogue_mode: str(behavior.dialogue_mode || behavior.dialogueMode, "ai_realtime") as any,
      patrol_path: behavior.patrol_path,
      interaction_radius: num(behavior.interaction_radius || behavior.interactionRadius, 3),
    },
    indicator: n.indicator
      ? { type: str(n.indicator.type, "speech") as any, color: n.indicator.color }
      : { type: "speech" as const },
  };
}

// ---- Interactive Object ----

function normalizeInteractiveObject(o: any, i: number): InteractiveObject {
  if (!o || typeof o !== "object") o = {};
  const interaction = o.interaction || {};

  return {
    id: str(o.id, `obj_${i}`),
    name: str(o.name || o.label, `Object ${i + 1}`),
    asset_id: o.asset_id || o.assetId,
    model_url: o.model_url || o.modelUrl,
    primitive: str(o.primitive, "sphere") as any,
    position: vec3(o.position, [i * 2, 0.5, 0]),
    rotation: vec3(o.rotation),
    scale: vec3(o.scale, [0.5, 0.5, 0.5]),
    material: o.material
      ? {
          color: o.material.color,
          emissive: o.material.emissive,
          emissiveIntensity: num(o.material.emissiveIntensity, 0),
        }
      : undefined,
    interaction: {
      type: str(interaction.type, "examine") as any,
      highlight_on_hover: bool(interaction.highlight_on_hover ?? interaction.highlightOnHover, true),
      cursor: interaction.cursor,
      script_interaction_ref: interaction.script_interaction_ref || interaction.scriptInteractionRef,
      on_interact: interaction.on_interact || interaction.onInteract || {
        type: "show_panel" as const,
        title: str(o.name || o.label, `Object ${i + 1}`),
        description: str(o.description || interaction.description, "You examine this object closely."),
      },
    },
  };
}

// ---- Trigger ----

function normalizeTrigger(t: any, i: number): SceneTrigger {
  if (!t || typeof t !== "object") t = {};
  return {
    id: str(t.id, `trigger_${i}`),
    type: str(t.type, "proximity") as any,
    config: t.config || {},
    once: bool(t.once, true),
    action: t.action || { type: "show_notification" as const, message: "Something happened" },
  };
}

// ---- Cinematic ----

function normalizeCinematic(c: any, i: number): CinematicSequence {
  if (!c || typeof c !== "object") c = {};
  return {
    id: str(c.id, `cinematic_${i}`),
    camera_keyframes: normalizeArray(c.camera_keyframes || c.keyframes, (kf) => ({
      position: vec3(kf.position, [0, 5, 10]),
      look_at: vec3(kf.look_at || kf.lookAt, [0, 0, 0]),
      duration: num(kf.duration, 2),
      easing: kf.easing,
    })),
    narration: c.narration,
    total_duration: num(c.total_duration || c.duration, 5),
    on_complete: c.on_complete || c.onComplete,
  };
}

// ---- Empty Scene ----

function buildEmptyScene(): SceneGraph {
  return {
    scene_id: "empty",
    script_scene_ref: "",
    environment: defaultEnvironment(),
    layout: normalizeLayout({}),
    structures: [],
    npcs: [],
    interactive_objects: [],
    triggers: [],
    cinematic_sequences: [],
  };
}
