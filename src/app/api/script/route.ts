import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/agents/scriptwriter";
import type { KnowledgeGraph, StudentPreferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { knowledgeGraph, preferences } = body as {
      knowledgeGraph: KnowledgeGraph;
      preferences: StudentPreferences;
    };

    if (!knowledgeGraph || !preferences) {
      return NextResponse.json(
        { error: "knowledgeGraph and preferences are required" },
        { status: 400 }
      );
    }

    const script = await generateScript(knowledgeGraph, preferences);

    return NextResponse.json({ script });
  } catch (error: any) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate script" },
      { status: 500 }
    );
  }
}
