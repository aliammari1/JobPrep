import { NextRequest, NextResponse } from "next/server";
import { extractText, getMeta } from "unpdf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(
      `Processing PDF with unpdf: ${file.name}, size: ${file.size} bytes`,
    );

    // 1. Convert File directly to ArrayBuffer (Modern Web API)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    try {
      // 2. Extract Text and Metadata using unpdf
      const { text, totalPages } = await extractText(uint8Array, {
        mergePages: true,
      });
      const { info } = await getMeta(uint8Array);

      console.log(`PDF parsed successfully. Total pages: ${totalPages}`);

      // 3. Return structured data
      return NextResponse.json({
        text: text || "No text could be extracted from the PDF",
        pages: totalPages,
        info: info, // Metadata like Author, Creator, etc.
      });
    } catch (parseError) {
      console.error("Unpdf parsing error:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse PDF",
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error",
          text: `[PDF File: ${file.name}]\n\nCould not extract text. This file may be a scan or encrypted.`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("General extraction error:", error);
    return NextResponse.json(
      {
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
