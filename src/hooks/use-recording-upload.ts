import { useState } from "react";
import { toast } from "sonner";

interface UploadRecordingOptions {
  file: File | Blob;
  interviewId: string;
  roomName?: string;
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

  const uploadRecording = async ({
    file,
    interviewId,
    roomName,
    onProgress,
  }: UploadRecordingOptions): Promise<UploadRecordingResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Convert Blob to File if needed
      if (file instanceof Blob && !(file instanceof File)) {
        const fileName = `recording-${Date.now()}.webm`;
        file = new File([file], fileName, { type: file.type || "video/webm" });
      }
      
      formData.append("file", file);
      formData.append("interviewId", interviewId);
      if (roomName) {
        formData.append("roomName", roomName);
      }

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
            onProgress?.(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setIsUploading(false);
            setUploadProgress(100);
            toast.success("Recording uploaded successfully!");
            resolve({
              success: true,
              recording: response.recording,
            });
          } else {
            const error = xhr.responseText || "Upload failed";
            setIsUploading(false);
            toast.error("Failed to upload recording");
            reject({
              success: false,
              error,
            });
          }
        });

        xhr.addEventListener("error", () => {
          setIsUploading(false);
          toast.error("Network error during upload");
          reject({
            success: false,
            error: "Network error",
          });
        });

        xhr.open("POST", "/api/recordings/upload");
        xhr.send(formData);
      });
    } catch (error: any) {
      setIsUploading(false);
      toast.error(error.message || "Failed to upload recording");
      return {
        success: false,
        error: error.message,
      };
    }
  };

  return {
    uploadRecording,
    isUploading,
    uploadProgress,
  };
}
