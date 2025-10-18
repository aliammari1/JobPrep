// Global type declarations

declare global {
  // LinkedIn import cache for temporary storage
  var linkedInImportCache: Record<string, {
    data: any;
    timestamp: number;
    expiresAt: number;
  }> | undefined;
}

export {};
