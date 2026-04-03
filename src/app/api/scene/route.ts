import { NextRequest, NextResponse } from "next/server";
import { generateSceneGraph } from "@/lib/agents/scene-director";
import { normalizeSceneGraph } from "@/lib/scene/normalize-scene";
import type { Script } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { script, actId, sceneId } = body as {
      script: Script;
      actId: string;
      sceneId: string;
    };

    if (!script || !actId || !sceneId) {
      return NextResponse.json(
        { error: "script, actId, and sceneId are required" },
        { status: 400 }
      );
    }

    const acts = script.acts || [];
    const act = acts.find((a) => a.id === actId);
    if (!act) {
      return NextResponse.json({ error: `Act "${actId}" not found in ${acts.length} acts` }, { status: 404 });
    }

    const scenes = act.scenes || [];
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) {
      return NextResponse.json({ error: `Scene "${sceneId}" not found in act "${actId}" (${scenes.length} scenes)` }, { status: 404 });
    }

    const rawSceneGraph = await generateSceneGraph(script, act, scene);

    console.log("[Scene Director] Raw output keys:", Object.keys(rawSceneGraph || {}));
    console.log("[Scene Director] structures:", (rawSceneGraph as any)?.structures?.length ?? 0);
    console.log("[Scene Director] npcs:", (rawSceneGraph as any)?.npcs?.length ?? 0);
    console.log("[Scene Director] interactive_objects:", (rawSceneGraph as any)?.interactive_objects?.length ?? 0);

    // Normalize: fill all missing fields so the renderer never crashes
    const sceneGraph = normalizeSceneGraph(rawSceneGraph);

    console.log("[Normalized] structures:", sceneGraph.structures.length,
      "npcs:", sceneGraph.npcs.length,
      "objects:", sceneGraph.interactive_objects.length);

    return NextResponse.json({ sceneGraph });
  } catch (error: any) {
    console.error("Scene generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate scene" },
      { status: 500 }
    );
  }
}
