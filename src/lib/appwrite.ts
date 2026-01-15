// Appwrite Storage Configuration
import { Client, Storage, ID } from "node-appwrite";
import { Readable } from "stream";
import { InputFile } from "node-appwrite/file";

export const RECORDINGS_BUCKET_ID = "recordings";

export function createAppwriteClient() {
  // Server-side Appwrite client configuration
  const client = new Client()
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        "https://fra.cloud.appwrite.io/v1",
    )
    .setProject(
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68dfd41f00191a47462f",
    );

  // Set API key for server-side operations
  const apiKey = process.env.APPWRITE_API_KEY;
  if (apiKey) {
    client.setKey(apiKey);
    console.log("Appwrite API key configured");
  } else {
    console.warn(
      "APPWRITE_API_KEY not found in environment variables. Server-side operations may fail.",
    );
  }

  return client;
}

export function getAppwriteConfig() {
  // Client-side Appwrite configuration (no API key)
  return {
    endpoint:
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      "https://fra.cloud.appwrite.io/v1",
    projectId:
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68dfd41f00191a47462f",
  };
}

/**
 * Upload a file to Appwrite Storage
 * @param file Buffer or Blob to upload
 * @param fileName Name of the file
 * @param permissions Array of permissions (default: read for any user)
 * @returns Uploaded file information including URL
 */
export async function uploadRecording(
  file: Buffer,
  fileName: string,
  permissions: string[] = ['read("any")'],
) {
  const client = createAppwriteClient();
  const storage = new Storage(client);

  try {
    // Create InputFile from Buffer
    const inputFile = InputFile.fromBuffer(file, fileName);

    console.log("Starting upload to Appwrite:", {
      bucketId: RECORDINGS_BUCKET_ID,
      fileName,
      fileSize: file.length,
    });

    const uploadedFile = await storage.createFile(
      RECORDINGS_BUCKET_ID,
      ID.unique(),
      inputFile,
      permissions,
    );

    console.log("File uploaded to Appwrite:", {
      fileId: uploadedFile.$id,
      fileName: uploadedFile.name,
      size: uploadedFile.sizeOriginal,
    });

    // Generate file URL
    const config = getAppwriteConfig();
    const fileUrl = `${config.endpoint}/storage/buckets/${RECORDINGS_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${config.projectId}`;

    console.log("Generated file URL:", fileUrl);

    return {
      fileId: uploadedFile.$id,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.sizeOriginal,
      fileUrl,
      mimeType: uploadedFile.mimeType,
    };
  } catch (error: any) {
    console.error("Error uploading to Appwrite:", error);
    throw new Error(`Failed to upload recording: ${error.message}`);
  }
}

/**
 * Delete a file from Appwrite Storage
 * @param fileId ID of the file to delete
 */
export async function deleteRecording(fileId: string) {
  const client = createAppwriteClient();
  const storage = new Storage(client);

  try {
    await storage.deleteFile(RECORDINGS_BUCKET_ID, fileId);
    return true;
  } catch (error: any) {
    console.error("Error deleting from Appwrite:", error);
    throw new Error(`Failed to delete recording: ${error.message}`);
  }
}

/**
 * Get file details from Appwrite Storage
 * @param fileId ID of the file
 */
export async function getRecordingFile(fileId: string) {
  const client = createAppwriteClient();
  const storage = new Storage(client);

  try {
    const file = await storage.getFile(RECORDINGS_BUCKET_ID, fileId);

    const fileUrl = `${getAppwriteConfig().endpoint}/storage/buckets/${RECORDINGS_BUCKET_ID}/files/${file.$id}/view?project=${getAppwriteConfig().projectId}`;

    return {
      fileId: file.$id,
      fileName: file.name,
      fileSize: file.sizeOriginal,
      fileUrl,
      mimeType: file.mimeType,
      createdAt: file.$createdAt,
    };
  } catch (error: any) {
    console.error("Error getting file from Appwrite:", error);
    throw new Error(`Failed to get recording: ${error.message}`);
  }
}

/**
 * List all files in the recordings bucket
 */
export async function listRecordings() {
  const client = createAppwriteClient();
  const storage = new Storage(client);

  try {
    const files = await storage.listFiles(RECORDINGS_BUCKET_ID);
    return files.files.map((file) => ({
      fileId: file.$id,
      fileName: file.name,
      fileSize: file.sizeOriginal,
      fileUrl: `${getAppwriteConfig().endpoint}/storage/buckets/${RECORDINGS_BUCKET_ID}/files/${file.$id}/view?project=${getAppwriteConfig().projectId}`,
      mimeType: file.mimeType,
      createdAt: file.$createdAt,
    }));
  } catch (error: any) {
    console.error("Error listing files from Appwrite:", error);
    throw new Error(`Failed to list recordings: ${error.message}`);
  }
}
