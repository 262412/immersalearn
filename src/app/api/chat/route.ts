import { NextRequest, NextResponse } from "next/server";
import { generateNPCResponse, getRelevantFacts } from "@/lib/agents/npc-dialogue";
import type { WorldCharacter, PlanFact } from "@/lib/types/world-plan";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      character,
      facts,
      currentScene,
      conversationHistory,
      studentProgress,
      sceneFactIds,
    } = body as {
      message: string;
      character: WorldCharacter;
      facts: PlanFact[];
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

    if (!message || !character || !facts) {
      return NextResponse.json(
        { error: "message, character, and facts are required" },
        { status: 400 }
      );
    }

    const relevantFacts = getRelevantFacts(
      character,
      facts,
      sceneFactIds || []
    );

    const response = await generateNPCResponse(
      {
        character,
        facts,
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
