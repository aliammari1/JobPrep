import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const { cvData, colorScheme } = await request.json();

    if (!cvData?.personalInfo?.fullName) {
      return NextResponse.json(
        { error: "Missing required field: personalInfo.fullName" },
        { status: 400 },
      );
    }

    const accentColor = colorScheme || "#3b82f6";
    const {
      personalInfo,
      experience,
      education,
      skills,
      projects,
      certifications,
      languages,
    } = cvData;

    // Create PDF using jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = margin;
    const maxWidth = pageWidth - 2 * margin;

    // Parse hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [59, 130, 246]; // Default blue
    };

    const [r, g, b] = hexToRgb(accentColor);

    // Add title
    doc.setFontSize(24);
    doc.setTextColor(r, g, b);
    doc.setFont("Helvetica", "bold");
    doc.text(personalInfo?.fullName || "Your Name", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 12;

    // Add job title
    if (personalInfo?.title) {
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.setFont("Helvetica", "normal");
      doc.text(personalInfo.title, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 8;
    }

    // Add contact info
    const contactParts = [
      personalInfo?.email,
      personalInfo?.phone,
      personalInfo?.location,
    ].filter((item) => item && typeof item === "string" && item.trim() !== "");

    if (contactParts.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text(contactParts.join(" • "), pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 8;
    }

    yPosition += 3;

    // Add horizontal line
    doc.setDrawColor(r, g, b);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Helper function to add section
    const addSection = (title: string, content: string) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(11);
      doc.setTextColor(r, g, b);
      doc.setFont("Helvetica", "bold");
      doc.text(title, margin, yPosition);
      yPosition += 6;

      doc.setTextColor(0, 0, 0);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(content, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 4 + 6;
    };

    // Add summary
    if (personalInfo?.summary) {
      addSection("Professional Summary", personalInfo.summary);
    }

    // Add experience
    if (Array.isArray(experience) && experience.length > 0) {
      let expContent = "";
      experience.forEach((exp: any) => {
        if (!exp) return;
        expContent += `${exp.title || "Position"} at ${exp.company || "Company"}\n`;
        const startDate = exp.startDate || "Start";
        const endDate = exp.current ? "Present" : exp.endDate || "End";
        expContent += `${startDate} - ${endDate}`;
        if (exp.location) expContent += ` • ${exp.location}`;
        expContent += "\n";
        if (Array.isArray(exp.highlights) && exp.highlights.length > 0) {
          exp.highlights.forEach((h: string) => {
            if (h) expContent += `  • ${h}\n`;
          });
        } else if (exp.description) {
          const descriptions = Array.isArray(exp.description)
            ? exp.description
            : [exp.description];
          descriptions.forEach((d: string) => {
            if (d) expContent += `  • ${d}\n`;
          });
        }
        expContent += "\n";
      });
      if (expContent.trim()) {
        addSection("Experience", expContent.trim());
      }
    }

    // Add education
    if (Array.isArray(education) && education.length > 0) {
      let eduContent = "";
      education.forEach((edu: any) => {
        if (!edu) return;
        eduContent += `${edu.degree || "Degree"}\n`;
        eduContent += `${edu.institution || "Institution"}`;
        if (edu.location) eduContent += ` • ${edu.location}`;
        eduContent += "\n";
        const startDate = edu.startDate || "Start";
        const endDate = edu.endDate || "End";
        eduContent += `${startDate} - ${endDate}`;
        if (edu.gpa) eduContent += ` • GPA: ${edu.gpa}`;
        eduContent += "\n\n";
      });
      if (eduContent.trim()) {
        addSection("Education", eduContent.trim());
      }
    }

    // Add skills
    if (Array.isArray(skills) && skills.length > 0) {
      let skillsContent = "";
      skills.forEach((skillGroup: any) => {
        if (!skillGroup) return;
        const category = skillGroup.category || "Skills";
        const items = Array.isArray(skillGroup.items)
          ? skillGroup.items.filter(Boolean)
          : [];
        if (items.length > 0) {
          skillsContent += `${category}: ${items.join(", ")}\n`;
        }
      });
      if (skillsContent.trim()) {
        addSection("Skills", skillsContent.trim());
      }
    }

    // Add projects
    if (Array.isArray(projects) && projects.length > 0) {
      let projectsContent = "";
      projects.forEach((proj: any) => {
        if (!proj) return;
        projectsContent += `${proj.name || "Project"}\n`;
        if (proj.description) projectsContent += `${proj.description}\n`;
        if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
          const techs = proj.technologies.filter(Boolean);
          if (techs.length > 0) {
            projectsContent += `Technologies: ${techs.join(", ")}\n`;
          }
        }
        projectsContent += "\n";
      });
      if (projectsContent.trim()) {
        addSection("Projects", projectsContent.trim());
      }
    }

    // Add certifications
    if (Array.isArray(certifications) && certifications.length > 0) {
      let certsContent = "";
      certifications.forEach((cert: any) => {
        if (!cert) return;
        const name = cert.name || "Certification";
        const issuer = cert.issuer || "Issuer";
        const date = cert.date || "Date";
        certsContent += `${name} - ${issuer} (${date})\n`;
      });
      if (certsContent.trim()) {
        addSection("Certifications", certsContent.trim());
      }
    }

    // Add languages
    if (Array.isArray(languages) && languages.length > 0) {
      let langsContent = "";
      languages.forEach((lang: any) => {
        if (!lang) return;
        const language = lang.language || "Language";
        const proficiency = lang.proficiency || "Proficiency";
        langsContent += `${language} - ${proficiency}\n`;
      });
      if (langsContent.trim()) {
        addSection("Languages", langsContent.trim());
      }
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
