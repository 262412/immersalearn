// ============================================
// NPC Dialogue Skill — Next.js App Router Route
//
// Usage: copy this file to
//   src/app/api/npc-chat/route.ts
// (or any path you prefer)
//
// Requires: ANTHROPIC_API_KEY env var
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { generateNPCResponse } from "./agent";
import type { NPCChatRequest } from "./types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NPCChatRequest;

    const {
      message,
      character,
      facts,
      scene,
      sceneFactIds,
      conversationHistory,
      studentProgress,
      targetAge,
      model,
      maxResponseTokens,
    } = body;

    if (!message || !character || !facts || !scene) {
      return NextResponse.json(
        { error: "message, character, facts, and scene are required" },
        { status: 400 }
      );
    }

    const response = await generateNPCResponse({
      character,
      facts,
      scene,
      message,
      conversationHistory,
      studentProgress,
      sceneFactIds,
      targetAge,
      model,
      maxResponseTokens,
    });

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to generate NPC response";
    console.error("[npc-chat]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
