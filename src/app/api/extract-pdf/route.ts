import { NextRequest, NextResponse } from "next/server";

// Force this route to use Node.js runtime (not Edge)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`Processing PDF: ${file.name}, size: ${file.size} bytes`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer created, attempting to parse...");

    try {
  // Import pdf-parse core function directly to avoid debug-side effects
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");

      console.log("pdf-parse loaded, parsing PDF...");

      // Parse PDF - v1.1.1 uses simple function call
      const data = await pdfParse(buffer);

      console.log(`PDF parsed successfully. Text length: ${data.text?.length || 0}`);

      // Return extracted text
      return NextResponse.json({
        text: data.text || "No text could be extracted from the PDF",
        pages: data.numpages,
        info: data.info,
      });
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      return NextResponse.json(
        { 
          error: "Failed to parse PDF",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          text: `[PDF File: ${file.name}]\n\nCould not extract text from PDF. The file may be scanned images or encrypted.\n\nPlease enter the content manually.`
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process PDF file",
        details: error instanceof Error ? error.message : "Unknown error",
        text: "Error processing PDF. Please enter content manually."
      },
      { status: 500 }
    );
  }
}
