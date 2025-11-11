import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Circle, Square, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRecordingUpload } from "@/hooks/use-recording-upload";

interface BrowserRecorderProps {
  interviewId: string;
  roomName?: string;
  onRecordingComplete?: (recordingUrl: string) => void;
}

export function BrowserRecorder({
  interviewId,
  roomName,
  onRecordingComplete,
}: BrowserRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { uploadRecording, isUploading, uploadProgress } = useRecordingUpload();

  const startRecording = useCallback(async () => {
    try {
      // Get user media (audio and video)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording. Please check camera/microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      toast.info("Recording stopped");
    }
  }, [isRecording]);

  const handleUpload = useCallback(async () => {
    if (recordedChunks.length === 0) {
      toast.error("No recording to upload");
      return;
    }

    const blob = new Blob(recordedChunks, { type: "video/webm" });

    const result = await uploadRecording({
      file: blob,
      interviewId,
      roomName,
    });

    if (result.success && result.recording) {
      onRecordingComplete?.(result.recording.fileUrl);
      setRecordedChunks([]);
      setRecordingDuration(0);
    }
  }, [recordedChunks, interviewId, roomName, uploadRecording, onRecordingComplete]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Circle className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {isRecording ? "Recording..." : "Ready to Record"}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDuration(recordingDuration)}
        </span>
      </div>

      <div className="flex gap-2">
        {!isRecording && recordedChunks.length === 0 && (
          <Button onClick={startRecording} className="flex-1">
            <Circle className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="destructive" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}

        {!isRecording && recordedChunks.length > 0 && (
          <>
            <Button
              onClick={startRecording}
              variant="outline"
              className="flex-1"
            >
              <Circle className="w-4 h-4 mr-2" />
              Record Again
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Recording
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
}
