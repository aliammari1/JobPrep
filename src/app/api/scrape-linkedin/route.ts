import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface BetterAuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  user: SessionUser;
}

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { data: session } = await betterFetch<BetterAuthSession>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL
    if (!url.includes("linkedin.com/jobs")) {
      return NextResponse.json(
        { error: "Invalid LinkedIn job URL" },
        { status: 400 }
      );
    }

    // Try to extract Open Graph metadata from the URL
    const jobData = await extractJobDataFromHTML(url);

    if (jobData.success) {
      return NextResponse.json({
        jobDescription: formatJobData(jobData),
        success: true,
        source: 'og-metadata'
      });
    }

    // Fallback to user-friendly extraction guide
    return NextResponse.json({
      jobDescription: generateExtractionGuide(url),
      success: false,
      source: 'fallback',
      message: "Please copy the job details from LinkedIn and paste below. We've provided a guide to help."
    });

  } catch (error) {
    console.error("LinkedIn data extraction error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process LinkedIn job",
        details: error instanceof Error ? error.message : "Unknown error",
        fallback: true
      },
      { status: 500 }
    );
  }
}

async function extractJobDataFromHTML(url: string): Promise<any> {
  try {
    // Fetch with strict timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const jobData = parseHTMLMetadata(html, url);

    if (jobData.title || jobData.description) {
      return {
        success: true,
        ...jobData
      };
    }

    return { success: false };
  } catch (error) {
    console.log("HTML extraction failed:", error instanceof Error ? error.message : 'Unknown error');
    return { success: false };
  }
}

function parseHTMLMetadata(html: string, url: string): any {
  try {
    // Extract Open Graph metadata
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);

    // Extract structured data (JSON-LD)
    const jsonLdMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let jsonLdData = null;

    if (jsonLdMatch) {
      try {
        jsonLdData = JSON.parse(jsonLdMatch[1]);
      } catch (e) {
        // JSON parse error, continue
      }
    }

    // Extract job-related metadata from various sources
    const title = ogTitleMatch ? decodeHTML(ogTitleMatch[1]) : extractTitleFromHTML(html);
    const description = ogDescMatch ? decodeHTML(ogDescMatch[1]) : extractDescriptionFromHTML(html);
    
    // Try to extract company and location from JSON-LD
    let company = '';
    let location = '';

    if (jsonLdData) {
      if (jsonLdData.hiringOrganization?.name) {
        company = jsonLdData.hiringOrganization.name;
      }
      if (jsonLdData.jobLocation?.address?.addressLocality) {
        location = jsonLdData.jobLocation.address.addressLocality;
        if (jsonLdData.jobLocation.address.addressCountry) {
          location += ', ' + jsonLdData.jobLocation.address.addressCountry;
        }
      }
    }

    return {
      title: title.substring(0, 200),
      company: company || 'Not specified',
      location: location || 'Remote',
      description: description.substring(0, 2000)
    };
  } catch (error) {
    console.log("HTML parsing error:", error);
    return {};
  }
}

function extractTitleFromHTML(html: string): string {
  // Try common patterns for job title
  const patterns = [
    /<h1[^>]*>([^<]+)<\/h1>/,
    /<h2[^>]*class="[^"]*job[^"]*"[^>]*>([^<]+)<\/h2>/,
    /<title>([^-|]*)([-|].*)?<\/title>/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return decodeHTML(match[1].trim()).substring(0, 200);
    }
  }

  return 'Job Position';
}

function extractDescriptionFromHTML(html: string): string {
  // Try to find the main content area
  const patterns = [
    /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]{0,3000}?)<\/div>/i,
    /<article[^>]*>([\s\S]{0,3000}?)<\/article>/i,
    /<main[^>]*>([\s\S]{0,3000}?)<\/main>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const content = stripHTML(match[1]).trim();
      if (content.length > 50) {
        return content.substring(0, 2000);
      }
    }
  }

  return 'Job description content';
}

function stripHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHTML(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  
  return text.replace(/&[a-z]+;/gi, match => entities[match] || match);
}

function formatJobData(data: any): string {
  return `Job Title: ${data.title || 'N/A'}
Company: ${data.company || 'N/A'}
Location: ${data.location || 'N/A'}

Job Description:
${data.description || 'Description not available'}`;
}

function generateExtractionGuide(url: string): string {
  return `📋 LinkedIn Job Details Extraction Guide

**This job couldn't be automatically extracted. Here's how to copy it:**

1. **Go to the job posting:** ${url}

2. **Copy the following information:**
   • Job Title (usually at the top in large text)
   • Company Name
   • Location
   • Full Job Description (scroll down and copy the entire description)

3. **Paste it in the field below** - Our AI will automatically parse and organize it

**Tips:**
- Make sure to include the complete job description
- Include any requirements, responsibilities, and benefits sections
- If there's a "Show More" button, click it first to see the full description

**Alternative Methods:**
- Copy the URL and share it with team members
- Print to PDF and upload if your job requires attachments
- Use your browser's reader mode to clean up the layout before copying

This manual approach ensures 100% accuracy while respecting LinkedIn's Terms of Service.`;
}


