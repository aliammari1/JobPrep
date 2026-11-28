"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Icons } from "@/components/custom/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/auth-client";
import { downloadPDF, generateInterviewPDF } from "@/lib/pdf-generator";

interface ConversationItem {
  question: string | { question: string; idealAnswer?: string };
  userAnswer: string;
  evaluation?: {
    score: number;
    feedback: string;
  };
}

interface SavedInterview {
  id: string;
  sessionType: string;
  topics: string[];
  duration: number;
  conversationLog: ConversationItem[];
  feedback: any;
  specificScores: any;
  createdAt: string;
}

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value as T;
  if (!value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: interviewId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [interview, setInterview] = useState<SavedInterview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!interviewId) return;

    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/save-interview/${interviewId}`);
        if (response.ok) {
          const data = await response.json();
          const raw = data.interview;
          const parsedConversationRaw = safeJsonParse<
            ConversationItem[] | { questions?: ConversationItem[] }
          >(raw?.conversationLog, []);
          const logItems: ConversationItem[] = Array.isArray(
            parsedConversationRaw,
          )
            ? parsedConversationRaw
            : Array.isArray(parsedConversationRaw?.questions)
              ? parsedConversationRaw.questions
              : [];

          const relationalItems: ConversationItem[] = Array.isArray(
            raw?.mockQuestions,
          )
            ? raw.mockQuestions.map(
                (q: {
                  questionText: string;
                  idealAnswer?: string | null;
                  userAnswer?: string | null;
                  score?: number | null;
                  feedback?: string | null;
                }) => ({
                  question: {
                    question: q.questionText,
                    idealAnswer: q.idealAnswer ?? undefined,
                  },
                  userAnswer: q.userAnswer ?? "",
                  evaluation: {
                    score: q.score ?? 0,
                    feedback: q.feedback ?? "",
                  },
                }),
              )
            : [];

          const parsedTopics = Array.isArray(raw?.topics)
            ? raw.topics
            : safeJsonParse<string[]>(raw?.topics, []);

          const parsedInterview: SavedInterview = {
            ...raw,
            topics: parsedTopics,
            conversationLog:
              relationalItems.length > 0 ? relationalItems : logItems,
            feedback: safeJsonParse<Record<string, any>>(raw?.feedback, {}),
            specificScores: safeJsonParse<Record<string, any>>(
              raw?.specificScores,
              {},
            ),
          };
          setInterview(parsedInterview);
        } else {
          toast.error("Failed to load interview");
          router.push("/recordings");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview");
        router.push("/recordings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, router]);

  const handleDownload = async () => {
    if (!interview) return;

    try {
      toast.loading("Generating PDF...");

      const jobTitle = interview.topics[0] || "Interview";
      const pdfData = {
        candidateName: session?.user?.name || "Candidate",
        jobTitle,
        companyName: "",
        date: new Date(interview.createdAt).toLocaleDateString(),
        questions: interview.conversationLog.map((item, index) => ({
          question:
            typeof item.question === "object"
              ? item.question.question
              : item.question,
          type: "general",
          userAnswer: item.userAnswer || "",
          idealAnswer:
            typeof item.question === "object"
              ? item.question.idealAnswer || ""
              : "",
          score: item.evaluation?.score || 0,
          feedback: item.evaluation?.feedback || "",
          strengths: [],
          weaknesses: [],
          suggestions: [],
        })),
        finalAssessment: {
          overallRating: interview.feedback?.overallRating || "Assessed",
          hiringRecommendation: interview.feedback?.hiringRecommendation || "",
          summary: interview.feedback?.summary || "",
          keyStrengths: interview.feedback?.strengths || [],
          keyWeaknesses: interview.feedback?.areasForImprovement || [],
          detailedFeedback: {
            technical: interview.feedback?.technical || "",
            behavioral: interview.feedback?.behavioral || "",
            communication: interview.feedback?.communication || "",
          },
          developmentAreas: interview.feedback?.areasForImprovement || [],
          nextSteps: interview.feedback?.recommendations || [],
          confidenceLevel: interview.specificScores?.percentage || 0,
        },
        statistics: {
          totalQuestions: interview.conversationLog.length,
          averageScore: String(interview.specificScores?.totalScore || 0),
          percentage: String(interview.specificScores?.percentage || 0),
        },
      };

      const blob = await generateInterviewPDF(pdfData);
      const sanitize = (str: string) =>
        str
          .replace(/[^a-z0-9]/gi, "_")
          .replace(/_+/g, "_")
          .substring(0, 30);
      const fileName = `${sanitize(session?.user?.name || "Candidate")}_${sanitize(jobTitle)}_${new Date(interview.createdAt).toISOString().split("T")[0]}.pdf`;

      downloadPDF(blob, fileName);
      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  const handleDelete = async () => {
    if (!interview) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/save-interview/${interview.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Interview deleted successfully");
        router.push("/recordings");
      } else {
        toast.error("Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>
            <CardDescription>
              The interview you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/recordings")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recordings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scores = interview.specificScores;
  const feedback = interview.feedback;

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/recordings")}
            className="mb-4 hidden lg:inline-flex"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recordings
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-4xl">
                {interview.topics.join(", ") || "Mock Interview"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(interview.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {interview.duration} minutes
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this interview report. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {scores?.percentage || 0}%
              </div>
              <Badge
                variant={
                  scores?.percentage >= 80
                    ? "default"
                    : scores?.percentage >= 60
                      ? "secondary"
                      : "outline"
                }
                className="mt-2"
              >
                {scores?.percentage >= 80
                  ? "Excellent"
                  : scores?.percentage >= 60
                    ? "Good"
                    : "Needs Improvement"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Questions Answered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {interview.conversationLog.length}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total questions in interview
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-8 w-8" />
                {feedback?.overallRating || "Assessed"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
            <CardDescription>
              Overall assessment and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-muted-foreground">
                {feedback?.summary || "No summary available"}
              </p>
            </div>

            {feedback?.strengths && feedback.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                  Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {feedback.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-muted-foreground">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback?.areasForImprovement &&
              feedback.areasForImprovement.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600 dark:text-orange-400">
                    Areas for Improvement
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.areasForImprovement.map(
                      (area: string, index: number) => (
                        <li key={index} className="text-muted-foreground">
                          {area}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

            {feedback?.recommendations &&
              feedback.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Recommendations
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.recommendations.map(
                      (rec: string, index: number) => (
                        <li key={index} className="text-muted-foreground">
                          {rec}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Questions & Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions & Answers</CardTitle>
            <CardDescription>
              Detailed breakdown of your responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-w-0">
              <div className="space-y-6">
                {interview.conversationLog.map((item, index) => {
                  const question =
                    typeof item.question === "object"
                      ? item.question.question
                      : item.question;
                  const idealAnswer =
                    typeof item.question === "object"
                      ? item.question.idealAnswer
                      : "";

                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <h4 className="font-semibold text-lg">
                          Question {index + 1}
                        </h4>
                        {item.evaluation && (
                          <Badge
                            variant={
                              item.evaluation.score >= 8
                                ? "default"
                                : item.evaluation.score >= 5
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {item.evaluation.score}/10
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Question:
                          </p>
                          <p className="text-foreground">{question}</p>
                        </div>

                        <Separator />

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Your Answer:
                          </p>
                          <p className="text-foreground">
                            {item.userAnswer || "No answer provided"}
                          </p>
                        </div>

                        {idealAnswer && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Ideal Answer:
                              </p>
                              <p className="text-foreground text-sm">
                                {idealAnswer}
                              </p>
                            </div>
                          </>
                        )}

                        {item.evaluation && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Feedback:
                              </p>
                              <p className="text-foreground text-sm">
                                {item.evaluation.feedback}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
