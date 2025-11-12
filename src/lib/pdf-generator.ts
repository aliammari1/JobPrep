import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface InterviewPDFData {
  candidateName: string;
  jobTitle?: string;
  companyName?: string;
  date: string;
  questions: {
    question: string;
    type: string;
    userAnswer: string;
    idealAnswer: string;
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  }[];
  finalAssessment: {
    overallRating: string;
    hiringRecommendation: string;
    summary: string;
    keyStrengths: string[];
    keyWeaknesses: string[];
    detailedFeedback: {
      technical: string;
      behavioral: string;
      communication: string;
    };
    developmentAreas: string[];
    nextSteps: string[];
    confidenceLevel: number;
  };
  statistics: {
    totalQuestions: number;
    averageScore: string;
    percentage: string;
  };
}

export async function generateInterviewPDF(data: InterviewPDFData): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;
  const margin = 15;
  const lineHeight = 7;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number): boolean => {
    if (yPos + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Interview Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Candidate Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Candidate: ${data.candidateName}`, margin, yPos);
  yPos += 7;
  
  if (data.jobTitle) {
    pdf.text(`Position: ${data.jobTitle}`, margin, yPos);
    yPos += 7;
  }
  
  if (data.companyName) {
    pdf.text(`Company: ${data.companyName}`, margin, yPos);
    yPos += 7;
  }
  
  pdf.text(`Date: ${data.date}`, margin, yPos);
  yPos += 12;

  // Overall Statistics
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Performance', margin, yPos);
  yPos += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Score: ${data.statistics.percentage}% (${data.statistics.averageScore}/10)`, margin, yPos);
  yPos += 6;
  pdf.text(`Rating: ${data.finalAssessment.overallRating}`, margin, yPos);
  yPos += 6;
  pdf.text(`Recommendation: ${data.finalAssessment.hiringRecommendation}`, margin, yPos);
  yPos += 12;

  // Summary
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary', margin, yPos);
  yPos += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  yPos = addText(data.finalAssessment.summary, margin, yPos, pageWidth - 2 * margin);
  yPos += 10;

  checkNewPage(40);

  // Key Strengths
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94); // Green
  pdf.text('Key Strengths', margin, yPos);
  yPos += 7;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  data.finalAssessment.keyStrengths.forEach((strength, idx) => {
    checkNewPage(10);
    yPos = addText(`• ${strength}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 2;
  });
  yPos += 8;

  // Key Weaknesses
  checkNewPage(40);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(239, 68, 68); // Red
  pdf.text('Areas for Improvement', margin, yPos);
  yPos += 7;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  data.finalAssessment.keyWeaknesses.forEach((weakness, idx) => {
    checkNewPage(10);
    yPos = addText(`• ${weakness}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 2;
  });
  yPos += 8;

  // New page for detailed questions
  pdf.addPage();
  yPos = 20;

  // Question-by-Question Analysis
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Detailed Question Analysis', margin, yPos);
  yPos += 12;

  data.questions.forEach((q, idx) => {
    checkNewPage(80);

    // Question number and type
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246); // Blue
    pdf.text(`Question ${idx + 1} (${q.type})`, margin, yPos);
    yPos += 8;

    // Question text
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Question:', margin, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    yPos = addText(q.question, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 8;

    checkNewPage(30);

    // Your Answer
    pdf.setFont('helvetica', 'bold');
    pdf.text('Your Answer:', margin, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    yPos = addText(q.userAnswer || "No answer provided", margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 8;

    checkNewPage(30);

    // Ideal Answer
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ideal Answer:', margin, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    yPos = addText(q.idealAnswer || "N/A", margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 8;

    checkNewPage(20);

    // Score and Feedback
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Score: ${q.score}/10`, margin, yPos);
    yPos += 6;
    pdf.text('Feedback:', margin, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    yPos = addText(q.feedback, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 8;

    // Strengths
    if (q.strengths.length > 0) {
      checkNewPage(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text('Strengths:', margin, yPos);
      yPos += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      q.strengths.forEach(s => {
        checkNewPage(8);
        yPos = addText(`• ${s}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
        yPos += 2;
      });
      yPos += 4;
    }

    // Suggestions
    if (q.suggestions.length > 0) {
      checkNewPage(15);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(234, 179, 8);
      pdf.text('Suggestions:', margin, yPos);
      yPos += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      q.suggestions.forEach(s => {
        checkNewPage(8);
        yPos = addText(`• ${s}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
        yPos += 2;
      });
      yPos += 4;
    }

    yPos += 10;
  });

  // Next Steps
  checkNewPage(60);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Recommended Next Steps', margin, yPos);
  yPos += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  data.finalAssessment.nextSteps.forEach((step, idx) => {
    checkNewPage(10);
    yPos = addText(`${idx + 1}. ${step}`, margin, yPos, pageWidth - 2 * margin);
    yPos += 2;
  });

  return pdf.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
