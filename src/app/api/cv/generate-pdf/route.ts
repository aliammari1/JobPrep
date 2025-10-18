import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const cvData = body.cvData || body; // Handle both { cvData, template } and direct cvData

		// Validate cvData exists
		if (!cvData || !cvData.personalInfo) {
			return NextResponse.json(
				{ error: "Invalid CV data provided" },
				{ status: 400 }
			);
		}

		// Create PDF with jsPDF
		const doc = new jsPDF();
		let yPosition = 20;

		// Helper to check if we need a new page
		const checkNewPage = (neededSpace: number) => {
			if (yPosition + neededSpace > 280) {
				doc.addPage();
				yPosition = 20;
			}
		};

		// Title
		doc.setFontSize(24);
		doc.setFont("helvetica", "bold");
		doc.text(cvData.personalInfo.fullName || "Your Name", 20, yPosition);
		yPosition += 10;

		// Contact Info
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		if (cvData.personalInfo.email) {
			doc.text(cvData.personalInfo.email, 20, yPosition);
			yPosition += 5;
		}
		if (cvData.personalInfo.phone) {
			doc.text(cvData.personalInfo.phone, 20, yPosition);
			yPosition += 5;
		}
		if (cvData.personalInfo.location) {
			doc.text(cvData.personalInfo.location, 20, yPosition);
			yPosition += 5;
		}
		if (cvData.personalInfo.linkedin) {
			doc.text(cvData.personalInfo.linkedin, 20, yPosition);
			yPosition += 5;
		}

		yPosition += 5;
		doc.setDrawColor(0);
		doc.line(20, yPosition, 190, yPosition);
		yPosition += 10;

		// Summary
		if (cvData.summary) {
			checkNewPage(30);
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("Professional Summary", 20, yPosition);
			yPosition += 7;

			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
			const summaryLines = doc.splitTextToSize(cvData.summary, 170);
			summaryLines.forEach((line: string) => {
				checkNewPage(5);
				doc.text(line, 20, yPosition);
				yPosition += 5;
			});
			yPosition += 5;
		}

		// Experience
		if (cvData.experiences?.length > 0) {
			checkNewPage(30);
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("Work Experience", 20, yPosition);
			yPosition += 7;

			cvData.experiences.forEach((exp: {
				position?: string;
				company?: string;
				startDate?: string;
				endDate?: string;
				description?: string;
			}) => {
				checkNewPage(25);

				doc.setFontSize(12);
				doc.setFont("helvetica", "bold");
				doc.text(exp.position || "", 20, yPosition);
				yPosition += 6;

				doc.setFontSize(10);
				doc.setFont("helvetica", "normal");
				doc.text(exp.company || "", 20, yPosition);
				yPosition += 5;

				doc.setFontSize(9);
				doc.setTextColor(100);
				doc.text(
					`${exp.startDate || ""} - ${exp.endDate || "Present"}`,
					20,
					yPosition
				);
				doc.setTextColor(0);
				yPosition += 6;

				doc.setFontSize(10);
				if (exp.description) {
					const descLines = doc.splitTextToSize(exp.description, 170);
					descLines.forEach((line: string) => {
						checkNewPage(5);
						doc.text(line, 20, yPosition);
						yPosition += 5;
					});
				}
				yPosition += 5;
			});
		}

		// Education
		if (cvData.education?.length > 0) {
			checkNewPage(30);
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("Education", 20, yPosition);
			yPosition += 7;

			cvData.education.forEach((edu: {
				degree?: string;
				institution?: string;
				location?: string;
				startDate?: string;
				endDate?: string;
				gpa?: string;
			}) => {
				checkNewPage(20);

				doc.setFontSize(12);
				doc.setFont("helvetica", "bold");
				doc.text(edu.degree || "", 20, yPosition);
				yPosition += 6;

				doc.setFontSize(10);
				doc.setFont("helvetica", "normal");
				doc.text(edu.institution || "", 20, yPosition);
				yPosition += 5;

				doc.setFontSize(9);
				doc.setTextColor(100);
				doc.text(
					`${edu.location || ""} • ${edu.startDate || ""} - ${edu.endDate || ""}`,
					20,
					yPosition
				);
				doc.setTextColor(0);
				yPosition += 7;
			});
		}

		// Skills
		if (cvData.skills?.length > 0) {
			checkNewPage(20);
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("Skills", 20, yPosition);
			yPosition += 7;

			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
			const skillsText = cvData.skills.join(" • ");
			const skillLines = doc.splitTextToSize(skillsText, 170);
			skillLines.forEach((line: string) => {
				checkNewPage(5);
				doc.text(line, 20, yPosition);
				yPosition += 5;
			});
			yPosition += 5;
		}

		// Languages
		if (cvData.languages?.length > 0) {
			checkNewPage(15);
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("Languages", 20, yPosition);
			yPosition += 7;

			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
			doc.text(cvData.languages.join(" • "), 20, yPosition);
		}

		// Generate PDF buffer
		const pdfBuffer = doc.output("arraybuffer");

		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="CV_${cvData.personalInfo.fullName.replace(/\s+/g, "_")}.pdf"`,
			},
		});
	} catch (error: unknown) {
		console.error("PDF generation error:", error);
		const message = error instanceof Error ? error.message : "Failed to generate PDF";
		return NextResponse.json(
			{ error: message, details: error instanceof Error ? error.stack : undefined },
			{ status: 500 }
		);
	}
}
