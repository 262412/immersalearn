import { NextRequest, NextResponse } from "next/server";
import { generateNPCResponse, getRelevantFacts } from "@/lib/agents/npc-dialogue";
import type { KnowledgeGraph, ScriptCharacter, Fact } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      character,
      knowledgeGraph,
      currentScene,
      conversationHistory,
      studentProgress,
      sceneFactIds,
    } = body as {
      message: string;
      character: ScriptCharacter;
      knowledgeGraph: KnowledgeGraph;
      currentScene: {
        id: string;
        description: string;
        objective: string;
      };
      conversationHistory: { role: "user" | "assistant"; content: string }[];
      studentProgress: {
        completed_interactions: string[];
        discoveries: string[];
        current_objective: string;
      };
      sceneFactIds: string[];
    };

    if (!message || !character || !knowledgeGraph) {
      return NextResponse.json(
        { error: "message, character, and knowledgeGraph are required" },
        { status: 400 }
      );
    }

    const relevantFacts = getRelevantFacts(
      character,
      knowledgeGraph,
      sceneFactIds || []
    );

    const response = await generateNPCResponse(
      {
        character,
        knowledgeGraph,
        currentScene: currentScene || {
          id: "unknown",
          description: "A scene",
          objective: "Learn",
        },
        conversationHistory: conversationHistory || [],
        studentProgress: studentProgress || {
          completed_interactions: [],
          discoveries: [],
          current_objective: "",
        },
        relevantFacts,
      },
      message
    );

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
