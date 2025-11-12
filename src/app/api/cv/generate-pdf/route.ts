import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const { cvData, colorScheme } = await request.json();

    if (!cvData?.personalInfo?.fullName) {
      return NextResponse.json(
        { error: "Missing required field: personalInfo.fullName" },
        { status: 400 }
      );
    }

    const accentColor = colorScheme || "#3b82f6";
    const { personalInfo, experience, education, skills, projects, certifications, languages } = cvData;

    // Create PDF using jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = margin;
    const maxWidth = pageWidth - 2 * margin;

    // Parse hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ] : [59, 130, 246]; // Default blue
    };

    const [r, g, b] = hexToRgb(accentColor);

    // Add title
    doc.setFontSize(24);
    doc.setTextColor(r, g, b);
    doc.setFont('Helvetica', 'bold');
    doc.text(personalInfo?.fullName || 'Your Name', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Add job title
    if (personalInfo?.title) {
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.setFont('Helvetica', 'normal');
      doc.text(personalInfo.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    }

    // Add contact info
    if (personalInfo?.email || personalInfo?.phone || personalInfo?.location) {
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      const contactInfo = [
        personalInfo?.email,
        personalInfo?.phone,
        personalInfo?.location,
      ]
        .filter(Boolean)
        .join(' • ');
      doc.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
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
      doc.setFont('Helvetica', 'bold');
      doc.text(title, margin, yPosition);
      yPosition += 6;

      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(content, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 4 + 6;
    };

    // Add summary
    if (personalInfo?.summary) {
      addSection('Professional Summary', personalInfo.summary);
    }

    // Add experience
    if (experience && experience.length > 0) {
      let expContent = '';
      experience.forEach((exp: any) => {
        expContent += `${exp.title} at ${exp.company}\n`;
        expContent += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
        if (exp.location) expContent += ` • ${exp.location}`;
        expContent += '\n';
        if (exp.highlights?.length) {
          exp.highlights.forEach((h: string) => {
            expContent += `  • ${h}\n`;
          });
        } else if (exp.description?.length) {
          exp.description.forEach((d: string) => {
            expContent += `  • ${d}\n`;
          });
        }
        expContent += '\n';
      });
      addSection('Experience', expContent.trim());
    }

    // Add education
    if (education && education.length > 0) {
      let eduContent = '';
      education.forEach((edu: any) => {
        eduContent += `${edu.degree}\n`;
        eduContent += `${edu.institution}`;
        if (edu.location) eduContent += ` • ${edu.location}`;
        eduContent += '\n';
        eduContent += `${edu.startDate} - ${edu.endDate}`;
        if (edu.gpa) eduContent += ` • GPA: ${edu.gpa}`;
        eduContent += '\n\n';
      });
      addSection('Education', eduContent.trim());
    }

    // Add skills
    if (skills && skills.length > 0) {
      let skillsContent = '';
      skills.forEach((skillGroup: any) => {
        skillsContent += `${skillGroup.category}: ${skillGroup.items?.join(', ')}\n`;
      });
      addSection('Skills', skillsContent.trim());
    }

    // Add projects
    if (projects && projects.length > 0) {
      let projectsContent = '';
      projects.forEach((proj: any) => {
        projectsContent += `${proj.name}\n`;
        if (proj.description) projectsContent += `${proj.description}\n`;
        if (proj.technologies?.length) projectsContent += `Technologies: ${proj.technologies.join(', ')}\n`;
        projectsContent += '\n';
      });
      addSection('Projects', projectsContent.trim());
    }

    // Add certifications
    if (certifications && certifications.length > 0) {
      let certsContent = '';
      certifications.forEach((cert: any) => {
        certsContent += `${cert.name} - ${cert.issuer} (${cert.date})\n`;
      });
      addSection('Certifications', certsContent.trim());
    }

    // Add languages
    if (languages && languages.length > 0) {
      let langsContent = '';
      languages.forEach((lang: any) => {
        langsContent += `${lang.language} - ${lang.proficiency}\n`;
      });
      addSection('Languages', langsContent.trim());
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
