import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Allowed origins for CORS (whitelist approach)
const ALLOWED_ORIGINS = [
  'localhost:3000',
  'localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://job-prep-fawn.vercel.app',
  'chrome-extension://', // Chrome extension protocol
];

// Helper function to get CORS headers based on request origin
function getCorsHeaders(origin: string | null): Record<string, string> | null {
  if (!origin) {
    return null; // No origin header, reject
  }

  // Check if origin matches any allowed origin
  const isAllowed = ALLOWED_ORIGINS.some((allowedOrigin) => {
    // For chrome-extension, just check the protocol prefix
    if (allowedOrigin === 'chrome-extension://') {
      return origin.startsWith('chrome-extension://');
    }
    // For URLs, do exact or host:port match
    return (
      origin === allowedOrigin ||
      origin.replace('http://', '') === allowedOrigin ||
      origin.replace('https://', '') === allowedOrigin
    );
  });

  if (!isAllowed) {
    return null; // Origin not allowed
  }

  // Return CORS headers with the validated origin
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (!corsHeaders) {
    return new NextResponse(null, { status: 403 }); // Forbidden
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (!corsHeaders) {
    return new NextResponse(
      JSON.stringify({ error: 'CORS policy: origin not allowed' }),
      { status: 403 }
    );
  }

  try {
    const { sessionId } = await request.json();

    // Validate sessionId presence
    if (!sessionId || typeof sessionId !== 'string') {
      const response = NextResponse.json(
        { error: "Missing or invalid sessionId" },
        { status: 400 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Fetch session from database
    const session = await prisma.linkedInImportSession.findUnique({
      where: { sessionId: sessionId },
    });

    if (!session) {
      const response = NextResponse.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.linkedInImportSession.delete({
        where: { id: session.id },
      });
      
      const response = NextResponse.json(
        { error: "Session expired" },
        { status: 410 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Retrieve data and delete session (one-time use)
    const data = session.data;
    
    // Update retrievedAt timestamp and delete session
    await prisma.linkedInImportSession.delete({
      where: { id: session.id },
    });

    console.log(`Retrieved and deleted session: ${sessionId}`);

    const response = NextResponse.json({
      success: true,
      data: data,
    });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error("Error retrieving import session:", error);
    const response = NextResponse.json(
      {
        error: "Failed to retrieve session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}
