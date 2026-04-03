import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();

    // ---- PDF ----
    if (fileName.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
      const { text, totalPages } = await extractText(pdf, { mergePages: true });

      // mergePages: true returns text as a single string
      // but guard against it being an array anyway
      const textStr = Array.isArray(text) ? text.join("\n\n") : String(text);

      return NextResponse.json({
        text: textStr,
        pages: totalPages,
        fileName: file.name,
      });
    }

    // ---- Plain text / Markdown ----
    if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".markdown")
    ) {
      const text = await file.text();
      return NextResponse.json({
        text,
        pages: 1,
        fileName: file.name,
      });
    }

    // ---- DOCX (extract text from XML in zip) ----
    if (fileName.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const text = extractDocxText(arrayBuffer);
      return NextResponse.json({
        text,
        pages: 1,
        fileName: file.name,
      });
    }

    return NextResponse.json(
      {
        error: `Unsupported file type: ${fileName.split(".").pop()}. Supported: PDF, TXT, MD, DOCX`,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Upload/parse error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse file" },
      { status: 500 }
    );
  }
}

// Minimal DOCX text extraction: pull <w:t> text nodes from the raw XML
function extractDocxText(arrayBuffer: ArrayBuffer): string {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const raw = decoder.decode(new Uint8Array(arrayBuffer));

  // Restore paragraph breaks at </w:p> boundaries
  const paragraphs = raw.split(/<\/w:p>/).map((block) => {
    const matches = block.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (!matches) return "";
    return matches.map((m) => m.replace(/<[^>]+>/g, "")).join("");
  });

  const text = paragraphs.filter((l) => l.trim().length > 0).join("\n\n");

  if (!text.trim()) {
    throw new Error(
      "No readable text found in DOCX file. Try saving as PDF or TXT instead."
    );
  }

  return text;
}
