import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

export async function POST(request: NextRequest) {
  let tempAudioPath: string | null = null;
  let tempOutputPath: string | null = null;

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log("🎤 Received audio file:", audioFile.type, audioFile.size, "bytes");

    // Convert Blob to Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), ".tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save audio to temp file
    const timestamp = Date.now();
    tempAudioPath = path.join(tempDir, `audio_${timestamp}.webm`);
    fs.writeFileSync(tempAudioPath, buffer);
    console.log("📝 Saved audio to:", tempAudioPath);

    // Try using OpenAI's Whisper Python package locally
    try {
      console.log("🔊 Transcribing with local Whisper...");
      
      // Use Python to run Whisper locally
      const command = `python -m whisper "${tempAudioPath}" --model base --language en --output_format json --output_dir "${tempDir}"`;
      
      console.log("⚙️ Running command:", command);
      const output = execSync(command, { 
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      console.log("✅ Whisper output:", output);

      // Read the JSON output from Whisper
      const jsonOutputPath = path.join(tempDir, `audio_${timestamp}.json`);
      
      if (fs.existsSync(jsonOutputPath)) {
        const jsonResult = JSON.parse(fs.readFileSync(jsonOutputPath, "utf-8"));
        const transcribedText = jsonResult.text || "";
        
        console.log("✅ Transcription successful:", transcribedText.substring(0, 100));
        
        // Cleanup
        fs.unlinkSync(jsonOutputPath);
        
        return NextResponse.json({
          text: transcribedText,
          confidence: 0.95,
        });
      }
    } catch (whisperError) {
      console.error("❌ Whisper error:", whisperError instanceof Error ? whisperError.message : whisperError);
      
      // Check if Whisper is installed
      if (whisperError instanceof Error && whisperError.message.includes("No module named whisper")) {
        return NextResponse.json(
          {
            error: "Local Whisper not installed. Please run: pip install openai-whisper",
            text: "",
          },
          { status: 503 }
        );
      }
      
      if (whisperError instanceof Error && whisperError.message.includes("command not found")) {
        return NextResponse.json(
          {
            error: "Python or Whisper not found. Please ensure Python is installed and Whisper is installed via: pip install openai-whisper",
            text: "",
          },
          { status: 503 }
        );
      }

      throw whisperError;
    }

  } catch (error) {
    console.error("❌ Transcription error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Transcription failed. Ensure local Whisper is installed.",
        text: "",
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temp files
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      try {
        fs.unlinkSync(tempAudioPath);
        console.log("🗑️ Cleaned up temp audio file");
      } catch (e) {
        console.warn("Could not delete temp audio file:", e);
      }
    }
  }
}
