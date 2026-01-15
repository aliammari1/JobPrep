"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Save, CheckCircle2, Eye } from "lucide-react";
import { useState } from "react";
import {
  generateInterviewPDF,
  downloadPDF,
  InterviewPDFData,
} from "@/lib/pdf-generator";
import { toast } from "sonner";
import { FullPageAnswersView } from "./FullPageAnswersView";

interface QuestionDetailedViewProps {
  interviewResults: any[];
  finalAssessment: any;
  statistics: {
    totalScore: number;
    averageScore: string;
    percentage: string;
  };
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
}

export function QuestionDetailedView({
  interviewResults,
  finalAssessment,
  statistics,
  candidateName = "Candidate",
  jobTitle = "Interview",
  companyName = "",
}: QuestionDetailedViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSwipeableCards, setShowSwipeableCards] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast.info("Generating PDF report...");

      const pdfData: InterviewPDFData = {
        candidateName: candidateName,
        jobTitle: jobTitle,
        companyName: companyName,
        date: new Date().toLocaleDateString(),
        questions: interviewResults.map((result) => ({
          question: result.question.question,
          type: result.question.type,
          userAnswer: result.userAnswer,
          idealAnswer: result.question.idealAnswer || "N/A",
          score: result.evaluation?.score || 0,
          feedback: result.evaluation?.feedback || "No feedback",
          strengths: result.evaluation?.strengths || [],
          weaknesses: result.evaluation?.weaknesses || [],
          suggestions: result.evaluation?.suggestions || [],
        })),
        finalAssessment: finalAssessment,
        statistics: {
          totalQuestions: interviewResults.length,
          averageScore: statistics.averageScore,
          percentage: statistics.percentage,
        },
      };

      const pdfBlob = await generateInterviewPDF(pdfData);

      // Create personalized filename: CandidateName_JobTitle_CompanyName_Date.pdf
      const sanitize = (str: string) =>
        str
          .replace(/[^a-z0-9]/gi, "_")
          .replace(/_+/g, "_")
          .substring(0, 30);
      const datePart = new Date().toISOString().split("T")[0];

      let filename = sanitize(candidateName);
      if (jobTitle && jobTitle !== "Interview") {
        filename += `_${sanitize(jobTitle)}`;
      }
      if (companyName) {
        filename += `_${sanitize(companyName)}`;
      }
      filename += `_${datePart}.pdf`;

      downloadPDF(pdfBlob, filename);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSaveInterview = async () => {
    try {
      setIsSaving(true);
      console.log("SAVE BUTTON CLICKED - Starting save...");
      toast.info("Saving interview...");

      const payload = {
        sessionType: "mock-interview",
        topics: jobTitle
          ? [jobTitle]
          : interviewResults
              .map((r) => r.question.type)
              .filter((v, i, a) => a.indexOf(v) === i),
        duration: Math.round(
          interviewResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / 60,
        ),
        conversationLog: interviewResults.map((r) => ({
          question: r.question,
          userAnswer: r.userAnswer,
          evaluation: r.evaluation,
        })),
        questions: interviewResults, // Complete question data
        candidateName,
        jobTitle,
        companyName,
        feedback: finalAssessment,
        improvementAreas: finalAssessment.developmentAreas || [],
        overallScore: parseFloat(statistics.averageScore),
        specificScores: {
          percentage: statistics.percentage,
          totalScore: statistics.totalScore,
        },
      };

      console.log("Payload prepared:", {
        questionsCount: payload.questions?.length,
        candidateName: payload.candidateName,
        jobTitle: payload.jobTitle,
        hasOverallScore: !!payload.overallScore,
      });

      const response = await fetch("/api/save-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData?.details || "Failed to save interview");
      }

      const data = await response.json();
      console.log("Save successful! Session ID:", data.sessionId);
      toast.success("Interview saved successfully!");
      console.log("Saved interview ID:", data.sessionId);
    } catch (error) {
      console.error("Error saving interview:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save interview",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Generating PDF..." : "Download PDF Report"}
            </Button>
            <Button
              onClick={() => setShowSwipeableCards(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Answers Swipeable
            </Button>
            <Button
              onClick={() => {
                console.log("TEST CLICK - Button is working!");
                toast.info("Button clicked!");
              }}
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Test Click
            </Button>
            <Button
              onClick={handleSaveInterview}
              disabled={isSaving}
              size="lg"
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save to Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Question-by-Question Breakdown - Swipeable Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Detailed Question Analysis</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Swipe through each question or use the arrows to review your answers,
          ideal responses, and feedback
        </p>
      </div>

      {/* Swipeable Cards Modal */}
      {showSwipeableCards && (
        <FullPageAnswersView
          interviewResults={interviewResults}
          onClose={() => setShowSwipeableCards(false)}
        />
      )}
    </div>
  );
}
