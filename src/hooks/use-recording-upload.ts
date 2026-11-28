import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadRecordingOptions {
  file: File | Blob;
  interviewId: string;
  onProgress?: (progress: number) => void;
}

interface UploadRecordingResult {
  success: boolean;
  recording?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileUrl: string;
    mimeType: string;
  };
  error?: string;
}

export function useRecordingUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadIds = useRef(new WeakMap<Blob, string>());
  const active = useRef(false);

  const uploadRecording = async ({
    file,
    interviewId,
    onProgress,
  }: UploadRecordingOptions): Promise<UploadRecordingResult> => {
    if (active.current)
      return { success: false, error: "An upload is already running" };
    if (file.size > 90 * 1024 * 1024) {
      const error = "Recordings larger than 90 MiB must be saved locally";
      toast.error(error);
      return { success: false, error };
    }

    let uploadId = uploadIds.current.get(file);
    if (!uploadId) {
      uploadId = crypto.randomUUID();
      uploadIds.current.set(file, uploadId);
    }
    active.current = true;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const query = new URLSearchParams({
        interviewId,
        uploadId,
        size: String(file.size),
      });
      const result = await new Promise<UploadRecordingResult>(
        (resolve, reject) => {
          const request = new XMLHttpRequest();
          request.open("POST", `/api/recordings/upload?${query}`);
          request.responseType = "json";
          request.timeout = 300_000;
          request.setRequestHeader("Content-Type", file.type || "video/webm");
          request.upload.addEventListener("progress", (event) => {
            if (!event.lengthComputable) return;
            const progress = Math.min(
              99,
              Math.round((event.loaded / event.total) * 100),
            );
            setUploadProgress(progress);
            onProgress?.(progress);
          });
          request.addEventListener("load", () => {
            const response = request.response as UploadRecordingResult | null;
            if (request.status === 200 && response?.recording) {
              resolve(response);
            } else {
              reject(
                new Error(response?.error || "Failed to upload recording"),
              );
            }
          });
          request.addEventListener("error", () =>
            reject(new Error("Recording upload lost its connection")),
          );
          request.addEventListener("timeout", () =>
            reject(new Error("Recording upload timed out")),
          );
          request.addEventListener("abort", () =>
            reject(new Error("Recording upload was canceled")),
          );
          request.send(file);
        },
      );
      setUploadProgress(100);
      onProgress?.(100);
      toast.success("Recording uploaded");
      return result;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to upload recording";
      toast.error(error);
      return { success: false, error };
    } finally {
      active.current = false;
      setIsUploading(false);
    }
  };

  return { uploadRecording, isUploading, uploadProgress };
}
