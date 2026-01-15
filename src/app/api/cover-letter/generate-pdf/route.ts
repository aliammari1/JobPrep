import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const letterData = await request.json();

    // Create PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Helper function
    const checkNewPage = (neededSpace: number) => {
      if (yPosition + neededSpace > 280) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Your info
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    if (letterData.yourName) {
      doc.text(letterData.yourName, 20, yPosition);
      yPosition += 5;
    }
    if (letterData.yourEmail) {
      doc.text(letterData.yourEmail, 20, yPosition);
      yPosition += 5;
    }
    if (letterData.yourPhone) {
      doc.text(letterData.yourPhone, 20, yPosition);
      yPosition += 5;
    }
    if (letterData.yourAddress) {
      doc.text(letterData.yourAddress, 20, yPosition);
      yPosition += 5;
    }

    yPosition += 10;

    // Recipient info
    if (letterData.recipientName) {
      doc.text(letterData.recipientName, 20, yPosition);
      yPosition += 5;
    }
    if (letterData.recipientTitle) {
      doc.text(letterData.recipientTitle, 20, yPosition);
      yPosition += 5;
    }
    if (letterData.companyName) {
      doc.text(letterData.companyName, 20, yPosition);
      yPosition += 5;
    }

    yPosition += 10;

    // Content (strip HTML)
    doc.setFontSize(10);
    const plainText = letterData.content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ");
    const lines = doc.splitTextToSize(plainText, 170);

    lines.forEach((line: string) => {
      checkNewPage(5);
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="CoverLetter_${letterData.companyName.replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
