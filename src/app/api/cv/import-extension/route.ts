import { NextRequest, NextResponse } from "next/server";

// Global cache type definition
declare global {
  var linkedInImportCache: {
    [key: string]: {
      data: CVData;
      timestamp: number;
      expiresAt: number;
    };
  } | undefined;
}

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

export async function POST(request: NextRequest) {
  try {
    const cvData: CVData = await request.json();

    // Validate required fields
    if (!cvData.personalInfo || !cvData.personalInfo.fullName) {
      return NextResponse.json(
        { error: "Missing required field: personalInfo.fullName" },
        { status: 400 }
      );
    }

    console.log("Received LinkedIn data from Chrome extension:", {
      name: cvData.personalInfo.fullName,
      experienceCount: cvData.experience?.length || 0,
      educationCount: cvData.education?.length || 0,
      skillsCount: cvData.skills?.length || 0,
    });

    // Store data in a way that CV builder can access it
    // We'll use a simple in-memory store with expiration
    const dataId = `linkedin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // In a production app, you'd store this in Redis or a database
    // For now, we'll return the data and let the extension pass it via URL
    global.linkedInImportCache = global.linkedInImportCache || {};
    global.linkedInImportCache[dataId] = {
      data: cvData,
      timestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };

    // Clean up old entries
    const cache = global.linkedInImportCache;
    if (cache) {
      Object.keys(cache).forEach(key => {
        if (cache[key].expiresAt < Date.now()) {
          delete cache[key];
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "LinkedIn data received successfully",
      dataId: dataId,
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
  } catch (error) {
    console.error("Error processing LinkedIn import:", error);
    return NextResponse.json(
      {
        error: "Failed to process LinkedIn data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get data by ID from cache
  const searchParams = request.nextUrl.searchParams;
  const dataId = searchParams.get('dataId');
  
  if (!dataId) {
    return NextResponse.json(
      {
        message:
          "This endpoint accepts POST requests from the JobPrep Chrome extension",
        usage: "POST /api/cv/import-extension with LinkedIn profile data",
      },
      { status: 200 }
    );
  }

  // Retrieve data from cache
  const cache = global.linkedInImportCache || {};
  const cached = cache[dataId];

  if (!cached || cached.expiresAt < Date.now()) {
    return NextResponse.json(
      { error: "Data not found or expired" },
      { status: 404 }
    );
  }

  // Delete after retrieval for security
  delete cache[dataId];

  return NextResponse.json({
    success: true,
    data: cached.data,
  });
}
