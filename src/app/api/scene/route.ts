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

    const act = script.acts.find((a) => a.id === actId);
    if (!act) {
      return NextResponse.json({ error: "Act not found" }, { status: 404 });
    }

    const scene = act.scenes.find((s) => s.id === sceneId);
    if (!scene) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    const rawSceneGraph = await generateSceneGraph(script, act, scene);

    // Normalize: fill all missing fields so the renderer never crashes
    const sceneGraph = normalizeSceneGraph(rawSceneGraph);

    return NextResponse.json({ sceneGraph });
  } catch (error: any) {
    console.error("Scene generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate scene" },
      { status: 500 }
    );
  }
}
