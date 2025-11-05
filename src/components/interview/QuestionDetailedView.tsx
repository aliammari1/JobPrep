"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Save, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { generateInterviewPDF, downloadPDF, InterviewPDFData } from "@/lib/pdf-generator";
import { toast } from "sonner";

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
  companyName = ""
}: QuestionDetailedViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
      const sanitize = (str: string) => str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 30);
      const datePart = new Date().toISOString().split('T')[0];
      
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
      toast.info("Saving interview...");

      const response = await fetch("/api/save-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionType: "mock-interview",
          topics: jobTitle ? [jobTitle] : interviewResults.map((r) => r.question.type).filter((v, i, a) => a.indexOf(v) === i),
          duration: Math.round(
            interviewResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / 60
          ),
          conversationLog: interviewResults.map((r) => ({
            question: r.question,
            userAnswer: r.userAnswer,
            evaluation: r.evaluation,
          })),
          feedback: finalAssessment,
          improvementAreas: finalAssessment.developmentAreas || [],
          overallScore: parseFloat(statistics.averageScore),
          specificScores: {
            percentage: statistics.percentage,
            totalScore: statistics.totalScore,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save interview");
      }

      const data = await response.json();
      toast.success("Interview saved successfully!");
      console.log("Saved interview ID:", data.sessionId);
    } catch (error) {
      console.error("Error saving interview:", error);
      toast.error("Failed to save interview");
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

      {/* Detailed Question-by-Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Detailed Question Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review each question with your answer, the ideal answer, and detailed feedback
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {interviewResults.map((result, idx) => (
              <div 
                key={idx} 
                className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-6"
              >
                {/* Header with Question Number and Score */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-base px-3 py-1">
                        Question {idx + 1}
                      </Badge>
                      <Badge 
                        className={
                          result.question.type === "technical"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        }
                      >
                        {result.question.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {result.evaluation?.score || 0}/10
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>

                {/* Question Block */}
                <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4 border-l-4 border-indigo-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                      📋 Question:
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {result.question.question}
                  </p>
                </div>

                {/* Your Answer Block */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      ✍️ Your Answer:
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {result.userAnswer || "No answer provided"}
                  </p>
                </div>

                {/* Ideal Answer Block */}
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border-l-4 border-green-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      ✅ Ideal Answer:
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {result.question.idealAnswer || "Sample answer not available"}
                  </p>
                </div>

                {/* Feedback Section */}
                {result.evaluation && (
                  <div className="space-y-4 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                    {/* Overall Feedback */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        💬 Feedback:
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 italic">
                        {result.evaluation.feedback}
                      </p>
                    </div>

                    {/* Strengths */}
                    {result.evaluation.strengths && result.evaluation.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Strengths:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                          {result.evaluation.strengths.map((strength: string, sIdx: number) => (
                            <li key={sIdx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.evaluation.suggestions && result.evaluation.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                          💡 Suggestions for Improvement:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                          {result.evaluation.suggestions.map((suggestion: string, sIdx: number) => (
                            <li key={sIdx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
