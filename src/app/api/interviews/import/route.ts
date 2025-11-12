import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/interviews/import - Import interviews from file
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const content = await file.text();
    const lines = content.split("\n");

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 }
      );
    }

    // Parse CSV headers
    const headers_arr = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const requiredHeaders = [
      "candidate name",
      "email",
      "date",
      "time",
      "status",
    ];
    const missingHeaders = requiredHeaders.filter(
      (h) => !headers_arr.some((header) => header.includes(h))
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingHeaders.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Parse rows
    const imported: any[] = [];
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        
        const candidateNameIdx = headers_arr.findIndex((h) =>
          h.includes("candidate name")
        );
        const emailIdx = headers_arr.findIndex((h) => h.includes("email"));
        const dateIdx = headers_arr.findIndex((h) => h === "date");
        const timeIdx = headers_arr.findIndex((h) => h === "time");
        const statusIdx = headers_arr.findIndex((h) => h === "status");
        const phoneIdx = headers_arr.findIndex((h) => h.includes("phone"));
        const positionIdx = headers_arr.findIndex((h) =>
          h.includes("position")
        );
        const durationIdx = headers_arr.findIndex((h) =>
          h.includes("duration")
        );
        const typeIdx = headers_arr.findIndex((h) => h === "type");

        const candidateName = values[candidateNameIdx]?.trim();
        const email = values[emailIdx]?.trim();
        const dateStr = values[dateIdx]?.trim();
        const timeStr = values[timeIdx]?.trim();
        const status = values[statusIdx]?.trim() || "scheduled";

        // Validate required fields
        if (!candidateName || !email || !dateStr || !timeStr) {
          errors.push({
            row: i + 1,
            error: "Missing required fields",
          });
          continue;
        }

        // Parse date and time
        const [year, month, day] = dateStr.split("-");
        const [hours, minutes] = timeStr.split(":");

        if (!year || !month || !day || !hours || !minutes) {
          errors.push({
            row: i + 1,
            error: "Invalid date or time format",
          });
          continue;
        }

        const scheduledAt = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        );

        if (isNaN(scheduledAt.getTime())) {
          errors.push({
            row: i + 1,
            error: "Invalid date/time",
          });
          continue;
        }

        // Create or get candidate
        let candidate = await prisma.user.findUnique({
          where: { email },
        });

        if (!candidate) {
          const id = `user_${email.replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;
          candidate = await prisma.user.create({
            data: {
              id,
              email,
              name: candidateName,
              emailVerified: true,
            },
          });
        }

        // Create interview - use templateId or create without it
        const interviewData: any = {
          candidateId: candidate.id,
          interviewerId: session.user!.id,
          scheduledAt,
          status: status as any,
          duration: parseInt(values[durationIdx]?.trim() || "60") || 60,
          settings: JSON.stringify({
            position: values[positionIdx]?.trim() || "",
            candidateName,
            candidateEmail: email,
            candidatePhone: values[phoneIdx]?.trim() || "",
            notes: "",
          }),
        };

        const interview = await prisma.interview.create({
          data: interviewData,
        });

        imported.push({
          id: interview.id,
          candidateName,
          email,
          status: "created",
        });
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: errors.length,
      data: imported,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing interviews:", error);
    return NextResponse.json(
      { error: "Failed to import interviews" },
      { status: 500 }
    );
  }
}
