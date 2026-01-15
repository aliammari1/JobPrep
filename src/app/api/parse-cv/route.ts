import { NextRequest, NextResponse } from "next/server";
import { headers as getNextHeaders } from "next/headers";
import { auth } from "@/lib/auth"; // Your better-auth instance
import { extractText } from "unpdf";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    // 1. Modern Better-Auth Session Check (Using native headers)
    const session = await auth.api.getSession({
      headers: await getNextHeaders(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    let text = "";

    // 2. Optimized File Processing
    if (fileExtension === "txt") {
      text = await file.text();
    } else if (fileExtension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      try {
        // Modern unpdf: Built for speed and better structure preservation
        const { text: extractedText } = await extractText(uint8Array, {
          mergePages: true,
        });
        text = extractedText;
      } catch (err) {
        console.error("Unpdf error:", err);
        return NextResponse.json(
          { error: "Failed to parse PDF accurately.", fallback: true },
          { status: 400 },
        );
      }
    } else if (fileExtension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      // Mammoth still works great in 2026 for DOCX to Text
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

    // 3. Modern Text Sanitization
    const cleanText = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[^\x20-\x7E\n]/g, "") // Remove non-printable characters often found in resumes
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
    console.error("Parse CV error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
