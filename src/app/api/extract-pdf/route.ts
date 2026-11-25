import { type NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { captureApiError } from "@/lib/observability";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const parser = new PDFParse({ data: uint8Array });

    try {
      const [textResult, infoResult] = await Promise.all([
        parser.getText(),
        parser.getInfo(),
      ]);

      return NextResponse.json({
        text: textResult.text || "No text could be extracted from the PDF",
        pages: textResult.total,
        info: infoResult.info ?? null,
      });
    } catch (parseError) {
      captureApiError("POST /api/extract-pdf", parseError, {
        extra: { fileName: file.name, fileSize: file.size },
      });
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
    } finally {
      await parser.destroy().catch(() => {});
    }
  } catch (error) {
    captureApiError("POST /api/extract-pdf", error);
    return NextResponse.json(
      {
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
