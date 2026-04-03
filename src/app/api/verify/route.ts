import { NextRequest, NextResponse } from "next/server";
import { verifyScript } from "@/lib/agents/fact-verifier";
import type { KnowledgeGraph, Script } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { script, knowledgeGraph } = body as {
      script: Script;
      knowledgeGraph: KnowledgeGraph;
    };

    if (!script || !knowledgeGraph) {
      return NextResponse.json(
        { error: "script and knowledgeGraph are required" },
        { status: 400 }
      );
    }

    const report = await verifyScript(script, knowledgeGraph);

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify script" },
      { status: 500 }
    );
  }
}
