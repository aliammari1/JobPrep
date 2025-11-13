import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

// Add CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface CVData {
  personalInfo: {
    fullName: string;
    title: string;
    email?: string;
    phone?: string;
    location: string;
    summary: string;
    linkedin?: string;
    photo?: string;
    website?: string;
    github?: string;
    portfolio?: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    highlights: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    description?: string;
  }>;
  skills: Array<{
    id: string;
    category: string;
    items: string[];
    level: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiency: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialUrl?: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    githubUrl?: string;
  }>;
  awards?: Array<{
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
}

// Constants
const TTL_MINUTES = 15;
const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB max for security
const SESSION_ID_LENGTH = 32; // Cryptographically secure random ID

// Generate cryptographically secure session ID
function generateSessionId(): string {
  return randomBytes(SESSION_ID_LENGTH).toString('hex');
}

// Validate payload size
function validatePayloadSize(cvData: CVData): boolean {
  const size = JSON.stringify(cvData).length;
  return size <= MAX_PAYLOAD_SIZE;
}

// Store CV data in database and return session ID
async function storeImportSession(cvData: CVData): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + (TTL_MINUTES * 60 * 1000));
  
  try {
    await prisma.linkedInImportSession.create({
      data: {
        sessionId: sessionId,
        data: cvData as any, // Prisma stores as JSON
        expiresAt: expiresAt,
      },
    });
    
    console.log(`Created import session in database: ${sessionId} (expires in ${TTL_MINUTES} minutes)`);
    return sessionId;
  } catch (error) {
    console.error('Failed to store import session:', error);
    throw error;
  }
}


export async function POST(request: NextRequest) {
  try {
    const cvData: CVData = await request.json();

    // Validate required fields
    if (!cvData?.personalInfo?.fullName) {
      const response = NextResponse.json(
        { error: "Missing required field: personalInfo.fullName" },
        { status: 400 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Validate payload size
    if (!validatePayloadSize(cvData)) {
      const response = NextResponse.json(
        { error: "Payload too large. Maximum 1MB allowed." },
        { status: 413 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    console.log("Received LinkedIn data from Chrome extension:", {
      name: cvData.personalInfo.fullName,
      experienceCount: cvData.experience?.length || 0,
      educationCount: cvData.education?.length || 0,
      skillsCount: cvData.skills?.length || 0,
    });

    // Store data server-side with secure session ID
    const sessionId = await storeImportSession(cvData);

    const response = NextResponse.json({
      success: true,
      message: "LinkedIn data received successfully",
      sessionId: sessionId,
      expiresIn: TTL_MINUTES * 60, // seconds
      data: {
        fullName: cvData.personalInfo.fullName,
        itemsExtracted: {
          experience: cvData.experience?.length || 0,
          education: cvData.education?.length || 0,
          skills:
            cvData.skills?.reduce((sum, group) => sum + group.items.length, 0) ||
            0,
          certifications: cvData.certifications?.length || 0,
          projects: cvData.projects?.length || 0,
          languages: cvData.languages?.length || 0,
        },
      },
    });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error("Error processing LinkedIn import:", error);
    const response = NextResponse.json(
      {
        error: "Failed to process LinkedIn data",
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

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// New endpoint: POST to retrieve stored session data
export async function GET(request: NextRequest) {
  // This endpoint now returns API documentation
  const response = NextResponse.json(
    {
      message: "LinkedIn Import API",
      usage: {
        step1: "POST /api/cv/import-extension with LinkedIn profile data",
        step2: "Receive sessionId in response",
        step3: "POST /api/cv/import-extension/retrieve with { sessionId } to fetch data",
      },
      notes: "Data is stored securely server-side and expires after 15 minutes",
    },
    { status: 200 }
  );
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

