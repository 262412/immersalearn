import { NextRequest, NextResponse } from "next/server";
import { createWorldPlan } from "@/lib/agents/planning-agent";
import { buildScene } from "@/lib/agents/builder-agent";
import { assembleScene } from "@/lib/scene/assembler";
import { enhanceSceneWithModels } from "@/lib/agents/asset-agent";
import type { StudentPreferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { textbookContent, preferences, subject, topic, curriculum } = body as {
      textbookContent: string;
      preferences: StudentPreferences;
      subject?: string;
      topic?: string;
      curriculum?: string;
    };

    if (!textbookContent || !preferences) {
      return NextResponse.json(
        { error: "textbookContent and preferences are required" },
        { status: 400 }
      );
    }

    // Step 1: Planning Agent — single call, produces unified WorldPlan
    console.log("[Generate] Step 1: Planning Agent...");
    const startPlan = Date.now();
    const worldPlan = await createWorldPlan(
      textbookContent,
      preferences,
      subject,
      topic,
      curriculum
    );
    console.log(
      `[Generate] Plan created in ${((Date.now() - startPlan) / 1000).toFixed(1)}s:`,
      `${worldPlan.knowledge.facts.length} facts,`,
      `${worldPlan.narrative.characters.length} characters,`,
      `${worldPlan.narrative.scenes.length} scenes`
    );

    // Step 2: Builder Agent — tool_use loop, constructs SceneGraph
    console.log("[Generate] Step 2: Builder Agent...");
    const startBuild = Date.now();
    const rawSceneGraph = await buildScene(worldPlan, 0);
    console.log(
      `[Generate] Scene built in ${((Date.now() - startBuild) / 1000).toFixed(1)}s`
    );

    // Step 3: Assembler — deterministic, no AI call
    console.log("[Generate] Step 3: Assembling...");
    const sceneGraph = assembleScene(rawSceneGraph, worldPlan);

    // Step 4: Asset Agent — search for real 3D models (parallel, non-blocking)
    console.log("[Generate] Step 4: Searching for 3D models...");
    const startAssets = Date.now();
    try {
      await enhanceSceneWithModels(sceneGraph, worldPlan);
    } catch (e) {
      // Asset enhancement is best-effort — don't fail the whole pipeline
      console.log("[Generate] Asset search skipped (non-fatal):", (e as Error).message);
    }
    console.log(
      `[Generate] Assets resolved in ${((Date.now() - startAssets) / 1000).toFixed(1)}s.`,
      `Final scene: ${sceneGraph.structures.length} structures,`,
      `${sceneGraph.npcs.length} NPCs,`,
      `${sceneGraph.interactive_objects.length} objects`
    );

    return NextResponse.json({
      worldPlan,
      sceneGraph,
      sceneId: worldPlan.narrative.scenes[0]?.id || "scene_0",
    });
  } catch (error: any) {
    console.error("[Generate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 }
    );
  }
}
