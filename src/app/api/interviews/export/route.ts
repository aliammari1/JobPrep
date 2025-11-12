import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/interviews/export - Export interviews to CSV
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { format = "csv", filters = {} } = body;

    // Build where clause based on filters
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.startDate && filters.endDate) {
      where.scheduledAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    if (format === "csv") {
      // Create CSV content
      const headers = [
        "Candidate Name",
        "Email",
        "Phone",
        "Position",
        "Date",
        "Time",
        "Duration (min)",
        "Type",
        "Status",
        "Interviewer",
        "Notes",
      ];

      const rows = interviews.map((interview) => {
        const scheduledDate = new Date(interview.scheduledAt || Date.now());
        const dateStr = scheduledDate.toLocaleDateString();
        const timeStr = scheduledDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const settings = JSON.parse(interview.settings || "{}");

        return [
          interview.candidate?.name || "",
          interview.candidate?.email || "",
          interview.candidate?.phoneNumber || "",
          settings.position || "",
          dateStr,
          timeStr,
          interview.duration || 60,
          (interview as any).interviewType || "video",
          interview.status || "",
          interview.interviewer?.name || "",
          settings.notes || "",
        ];
      });

      // Build CSV string
      let csvContent = headers.join(",") + "\n";
      csvContent += rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="interviews.csv"',
        },
      });
    } else if (format === "json") {
      return NextResponse.json({
        success: true,
        count: interviews.length,
        data: interviews,
        exportedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting interviews:", error);
    return NextResponse.json(
      { error: "Failed to export interviews" },
      { status: 500 }
    );
  }
}
