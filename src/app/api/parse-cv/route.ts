import mammoth from "mammoth";
import { headers as getNextHeaders } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await getNextHeaders(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    let text = "";

    if (fileExtension === "txt") {
      text = await file.text();
    } else if (fileExtension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const parser = new PDFParse({ data: uint8Array });

      try {
        const result = await parser.getText();
        text = result.text;
      } catch (err) {
        captureApiError("POST /api/parse-cv", err, {
          userId,
          extra: { fileName: file.name },
        });
        return NextResponse.json(
          { error: "Failed to parse PDF accurately.", fallback: true },
          { status: 400 },
        );
      } finally {
        await parser.destroy().catch(() => {});
      }
    } else if (fileExtension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(arrayBuffer),
      });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Use PDF, DOCX, or TXT" },
        { status: 400 },
      );
    }

    const cleanText = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[^\x20-\x7E\n]/g, "")
      .trim();

    if (!cleanText || cleanText.length < 50) {
      return NextResponse.json(
        { error: "Content too thin for analysis.", fallback: true },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      text: cleanText,
      length: cleanText.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    captureApiError("POST /api/parse-cv", error, { userId });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
