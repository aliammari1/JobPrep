import { NextResponse } from "next/server";
import { getApiDocs } from "@/lib/openapi";

/**
 * Serves the generated OpenAPI document. Consumed by the in-app Scalar viewer
 * at /api-docs and by external tooling (Mintlify, Spectral, codegen).
 */
export function GET() {
  return NextResponse.json(getApiDocs());
}
