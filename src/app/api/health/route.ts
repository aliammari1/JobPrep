import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env-validation";

export async function GET() {
  const status = getEnvStatus();

  return NextResponse.json({
    valid: status.valid,
    features: {
      ai: status.aiEnabled,
      video: status.videoEnabled,
      database: status.databaseConnected,
      auth: status.authConfigured,
    },
    configured: status.configured,
    missing: status.missing,
    warnings: status.warnings,
  });
}
