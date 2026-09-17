import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env-validation";

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Service health and feature-configuration status
 *     security: []
 *     responses:
 *       200:
 *         description: Current configuration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid: { type: boolean }
 *                 features:
 *                   type: object
 *                   properties:
 *                     ai: { type: boolean }
 *                     video: { type: boolean }
 *                     database: { type: boolean }
 *                     auth: { type: boolean }
 *                 configured: { type: array, items: { type: string } }
 *                 missing: { type: array, items: { type: string } }
 *                 warnings: { type: array, items: { type: string } }
 */
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
