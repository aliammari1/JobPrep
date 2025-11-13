import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, confidence } = body;

    if (!text) {
      return NextResponse.json(
        { error: "No transcribed text provided" },
        { status: 400 }
      );
    }

    // This endpoint now receives already-transcribed text from the browser
    // The browser handles speech recognition using the Web Speech API
    // This endpoint just validates and processes the transcription result

    console.log("📝 Received transcription:", text.substring(0, 100));

    return NextResponse.json({
      text: text.trim(),
      confidence: confidence || 0.9,
      source: "browser-speech-recognition",
    });
  } catch (error) {
    console.error("❌ Transcription processing error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Transcription processing failed",
        text: "",
      },
      { status: 500 }
    );
  }
}

