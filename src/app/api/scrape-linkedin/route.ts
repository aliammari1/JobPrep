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

// Pin to Node.js runtime for serverless compatibility
export const runtime = 'nodejs';

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

    // Dynamic imports for puppeteer-core and chromium
    const puppeteer = await import("puppeteer-core");
    const chromiumModule = await import("@sparticuz/chromium");
    const chromium = chromiumModule.default;

    // Determine if we're in production (Vercel) or development
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

    // Launch browser with appropriate configuration
    const browser = await puppeteer.launch({
      args: isProduction 
        ? chromium.args
        : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
          ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: isProduction
        ? await chromium.executablePath()
        : process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : process.platform === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : '/usr/bin/google-chrome',
      headless: true,
    });

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    try {
      // Navigate to the job posting
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for job description to load
      await page.waitForSelector('.description__text, .show-more-less-html__markup, .jobs-description__content', {
        timeout: 10000
      });

      // Extract job information
      const jobData = await page.evaluate(() => {
        // Try multiple selectors for job title
        const titleElement = 
          document.querySelector('.top-card-layout__title') ||
          document.querySelector('.jobs-unified-top-card__job-title') ||
          document.querySelector('h1.t-24');
        const title = titleElement?.textContent?.trim() || '';

        // Try multiple selectors for company name
        const companyElement = 
          document.querySelector('.topcard__org-name-link') ||
          document.querySelector('.jobs-unified-top-card__company-name') ||
          document.querySelector('.topcard__flavor--black-link');
        const company = companyElement?.textContent?.trim() || '';

        // Try multiple selectors for location
        const locationElement = 
          document.querySelector('.topcard__flavor--bullet') ||
          document.querySelector('.jobs-unified-top-card__bullet');
        const location = locationElement?.textContent?.trim() || '';

        // Try multiple selectors for job description
        const descriptionElement = 
          document.querySelector('.description__text') ||
          document.querySelector('.show-more-less-html__markup') ||
          document.querySelector('.jobs-description__content') ||
          document.querySelector('.jobs-box__html-content');
        
        let description = '';
        if (descriptionElement) {
          // Get text content and clean it up
          description = descriptionElement.textContent?.trim() || '';
          // Remove extra whitespace and normalize line breaks
          description = description
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
        }

        return { title, company, location, description };
      });

      await browser.close();

      // Format the job description
      const formattedDescription = `Job Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}

Job Description:
${jobData.description}`;

      return NextResponse.json({
        jobDescription: formattedDescription,
        success: true,
      });

    } catch (scrapeError) {
      await browser.close();
      console.error("Scraping error:", scrapeError);
      
      return NextResponse.json({
        jobDescription: `Unable to scrape job details from LinkedIn.\n\nThis could be due to:\n- LinkedIn's anti-scraping protections\n- The job posting requires login\n- The URL format has changed\n\nPlease copy and paste the job description manually.`,
        success: false,
      });
    }

  } catch (error) {
    console.error("LinkedIn scraping error:", error);
    return NextResponse.json(
      { 
        error: "Failed to scrape LinkedIn job",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
