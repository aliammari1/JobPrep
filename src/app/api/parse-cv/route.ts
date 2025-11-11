import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface BetterAuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  user: SessionUser;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { data: session } = await betterFetch<BetterAuthSession>(
      "/api/auth/get-session",
      {
        baseURL: req.nextUrl.origin,
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    
    // Read file as text
    let text = "";

    if (fileExtension === "txt") {
      text = await file.text();
    } else if (fileExtension === "pdf") {
      // For PDF parsing, we'll use a simple approach
      // In production, consider using pdf-parse or similar library
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Basic PDF text extraction (very simple, may not work for all PDFs)
      // You should install pdf-parse: npm install pdf-parse
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        text = data.text;
      } catch (error) {
        console.error("PDF parsing error:", error);
        return NextResponse.json(
          { 
            error: "Failed to parse PDF. Please try pasting your CV text instead.",
            fallback: true 
          },
          { status: 400 }
        );
      }
    } else if (fileExtension === "doc" || fileExtension === "docx") {
      // For DOCX parsing
      // You should install mammoth: npm install mammoth
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (error) {
        console.error("DOCX parsing error:", error);
        return NextResponse.json(
          { 
            error: "Failed to parse DOCX. Please try pasting your CV text instead.",
            fallback: true 
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please use PDF, DOCX, or TXT" },
        { status: 400 }
      );
    }

    // Clean up the text
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { 
          error: "Could not extract text from file. Please try pasting your CV text instead.",
          fallback: true 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      length: text.length,
    });
  } catch (error) {
    console.error("Parse CV error:", error);
    return NextResponse.json(
      { error: "Failed to parse CV" },
      { status: 500 }
    );
  }
}
