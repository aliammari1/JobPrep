"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Loader,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FullPageAnswersView } from "@/components/interview/FullPageAnswersView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";

interface InterviewSession {
  id: string;
  sessionType: string;
  topics: string[];
  duration: number;
  overallScore: number | null;
  conversationLog: string;
  feedback: string;
  specificScores: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  questions?: any[];
  mockQuestions?: any[];
  application?: { id: string; company: string; role: string } | null;
}

interface ParsedInterview {
  session: InterviewSession;
  questions: any[];
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
  feedback?: any;
  specificScores?: any;
}

export default function QuestionsPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [parsedInterviews, setParsedInterviews] = useState<ParsedInterview[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterview, setSelectedInterview] =
    useState<ParsedInterview | null>(null);
  const [showFullView, setShowFullView] = useState(false);

  useEffect(() => {
    if (isSessionLoading) return;
    if (!session?.user) {
      setInterviews([]);
      setParsedInterviews([]);
      setLoading(false);
      return;
    }
    fetchInterviews();
  }, [isSessionLoading, session?.user]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/save-interview");

      if (!response.ok) {
        if (response.status === 401) {
          setInterviews([]);
          setParsedInterviews([]);
          return;
        }
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data.interviews || []);

      // Parse interviews
      const parsed = (data.interviews || []).map(
        (interviewSession: InterviewSession) => {
          let questions: any[] = [];
          let candidateName = "";
          let jobTitle = interviewSession.application?.role || "";
          let companyName = interviewSession.application?.company || "";
          let feedback = null;
          let specificScores = null;

          // Parse metadata from conversationLog safely
          if (interviewSession.conversationLog) {
            try {
              const conversationData = JSON.parse(
                interviewSession.conversationLog,
              );
              candidateName = conversationData?.candidateName || "";
              jobTitle = conversationData?.jobTitle || "";
              companyName = conversationData?.companyName || "";
              if (Array.isArray(conversationData?.questions)) {
                questions = conversationData.questions;
              } else if (Array.isArray(conversationData)) {
                questions = conversationData;
              }
            } catch {
              // Ignore malformed conversationLog JSON
            }
          }

          // Prefer relational database questions if present
          const dbQuestions =
            interviewSession.questions && interviewSession.questions.length > 0
              ? interviewSession.questions
              : interviewSession.mockQuestions &&
                  interviewSession.mockQuestions.length > 0
                ? interviewSession.mockQuestions
                : null;

          if (dbQuestions && Array.isArray(dbQuestions)) {
            questions = dbQuestions;
          }

          if (interviewSession.feedback) {
            try {
              feedback = JSON.parse(interviewSession.feedback);
            } catch {
              feedback = interviewSession.feedback;
            }
          }

          if (interviewSession.specificScores) {
            try {
              specificScores = JSON.parse(interviewSession.specificScores);
            } catch {
              specificScores = null;
            }
          }

          return {
            session: interviewSession,
            questions,
            candidateName,
            jobTitle,
            companyName,
            feedback,
            specificScores,
          };
        },
      );

      setParsedInterviews(parsed);
      setError(null);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load interviews",
      );
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = parsedInterviews.filter((interview) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      interview.jobTitle?.toLowerCase().includes(searchLower) ||
      interview.candidateName?.toLowerCase().includes(searchLower) ||
      interview.companyName?.toLowerCase().includes(searchLower) ||
      interview.session.topics.some((t) =>
        t.toLowerCase().includes(searchLower),
      )
    );
  });

  const handleViewAnswers = (interview: ParsedInterview) => {
    setSelectedInterview(interview);
    setShowFullView(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 8) return "text-emerald-700 dark:text-emerald-400";
    if (score >= 6) return "text-amber-700 dark:text-amber-400";
    return "text-rose-700 dark:text-rose-400";
  };

  const getScoreBgColor = (score: number | null) => {
    if (score === null) return "bg-muted";
    if (score >= 8) return "bg-emerald-500/15";
    if (score >= 6) return "bg-amber-500/15";
    return "bg-rose-500/15";
  };

  // Transform database questions to FullPageAnswersView format
  const transformQuestionsForDisplay = (dbQuestions: any[]) => {
    return dbQuestions.map((q: any, idx: number) => ({
      question: {
        id: q.order || idx + 1,
        type: q.questionType || "technical",
        question: q.questionText || "",
        idealAnswer: q.idealAnswer || "",
        evaluationCriteria: [],
      },
      userAnswer: q.userAnswer || "",
      evaluation: q.evaluation || {
        score: q.score ?? 0,
        strengths: q.strengths || [],
        weaknesses: q.weaknesses || [],
        suggestions: q.suggestions || [],
        feedback: q.feedback || "",
        keyPointsCovered: [],
        keyPointsMissed: [],
      },
      timeSpent: q.timeSpent || 0,
    }));
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="sr-only font-display lg:not-sr-only lg:flex lg:items-center lg:gap-3 lg:text-3xl lg:font-bold lg:text-foreground">
                <BookOpen className="w-8 h-8 text-primary" />
                Interview Questions History
              </h1>
              <p className="text-muted-foreground mt-2">
                Review all your saved mock interviews and their results
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by job title, company, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading your interviews...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
              <Button
                onClick={fetchInterviews}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredInterviews.length === 0 && (
          <Card>
            <CardContent className="pt-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold text-foreground mb-2">
                No interviews yet
              </p>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No interviews match your search."
                  : "Complete a mock interview and save it to see your history here."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Interviews Grid */}
        {!loading && !error && filteredInterviews.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInterviews.map((interview, index) => (
              <motion.div
                key={interview.session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border overflow-hidden select-none focus-within:ring-2 focus-within:ring-ring/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle
                          className="text-lg line-clamp-2"
                          title={
                            interview.jobTitle ||
                            interview.session.topics[0] ||
                            "Untitled Interview"
                          }
                        >
                          {interview.jobTitle ||
                            interview.session.topics[0] ||
                            "Untitled Interview"}
                        </CardTitle>
                        {interview.candidateName && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {interview.candidateName}
                          </p>
                        )}
                      </div>
                      {interview.session.overallScore !== null && (
                        <Badge
                          className={`${getScoreBgColor(
                            interview.session.overallScore,
                          )} ${getScoreColor(interview.session.overallScore)} font-bold`}
                        >
                          {interview.session.overallScore.toFixed(1)}/10
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Interview Details */}
                    <div className="space-y-2 text-sm">
                      {interview.companyName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span>{interview.companyName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(interview.session.completedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{interview.session.duration} minutes</span>
                      </div>
                    </div>

                    {/* Questions Count */}
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {interview.questions?.length || 0} Questions
                      </span>
                    </div>

                    {/* Topics */}
                    {interview.session.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {interview.session.topics
                          .slice(0, 2)
                          .map((topic, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {topic}
                            </Badge>
                          ))}
                        {interview.session.topics.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{interview.session.topics.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => handleViewAnswers(interview)}
                      className="w-full mt-4"
                      variant="default"
                    >
                      View Answers
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && !error && filteredInterviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid gap-4 md:grid-cols-3"
          >
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {filteredInterviews.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Interviews
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {(
                      filteredInterviews.reduce(
                        (sum, i) => sum + (i.session.overallScore || 0),
                        0,
                      ) / filteredInterviews.length
                    ).toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Average Score
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {filteredInterviews.reduce(
                      (sum, i) => sum + i.session.duration,
                      0,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Full Page Answers View Modal */}
      {showFullView && selectedInterview && (
        <FullPageAnswersView
          interviewResults={transformQuestionsForDisplay(
            selectedInterview.questions,
          )}
          onClose={() => {
            setShowFullView(false);
            setSelectedInterview(null);
          }}
        />
      )}
    </div>
  );
}
