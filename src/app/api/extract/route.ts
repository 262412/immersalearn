import { NextRequest, NextResponse } from "next/server";
import { extractKnowledge } from "@/lib/agents/knowledge-extractor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { textbookContent, curriculumSpec, subject, topic } = body;

    if (!textbookContent) {
      return NextResponse.json(
        { error: "textbookContent is required" },
        { status: 400 }
      );
    }

    const knowledgeGraph = await extractKnowledge(
      textbookContent,
      curriculumSpec,
      subject,
      topic
    );

    return NextResponse.json({ knowledgeGraph });
  } catch (error: any) {
    console.error("Knowledge extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract knowledge" },
      { status: 500 }
    );
  }
}
