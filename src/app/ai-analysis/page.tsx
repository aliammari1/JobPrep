"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Eye,
  Ear,
  MessageSquare,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Star,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Lightbulb,
  Zap,
  Heart,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Activity,
  Gauge,
  Download,
  Share,
  Filter,
  Calendar,
  Search,
  Settings,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Camera,
  Mic,
  VideoIcon as Video,
  Globe,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface AnalysisMetrics {
  overall: number;
  categories: {
    communication: number;
    confidence: number;
    technicalSkills: number;
    problemSolving: number;
    culturalFit: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  speechAnalysis: {
    wordsPerMinute: number;
    fillerWords: number;
    pauseFrequency: number;
    clarityScore: number;
  };
  behavioralInsights: {
    eyeContact: number;
    bodyLanguage: number;
    engagement: number;
    enthusiasm: number;
  };
}

interface InterviewAnalysis {
  id: string;
  candidateName: string;
  position: string;
  date: Date;
  duration: number;
  interviewType: "behavioral" | "technical" | "panel" | "case-study";
  metrics: AnalysisMetrics;
  aiInsights: string[];
  recommendations: string[];
  transcriptSummary: string;
  status: "analyzing" | "completed" | "flagged";
}

export default function AIAnalysisDashboard() {
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<InterviewAnalysis | null>(null);
  const [timeFilter, setTimeFilter] = useState<
    "today" | "week" | "month" | "all"
  >("week");
  const [analyses, setAnalyses] = useState<InterviewAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          const transformedData = (data.interviews || []).map(
            (interview: any) => ({
              id: interview.id,
              candidateName: interview.candidateName || "Anonymous",
              position: interview.title || "Not specified",
              date: new Date(interview.createdAt),
              duration: interview.duration || 0,
              interviewType: interview.type || "behavioral",
              status:
                interview.status === "completed"
                  ? "completed"
                  : interview.status === "scheduled"
                  ? "analyzing"
                  : "flagged",
              metrics: {
                overall: interview.score || 0,
                categories: {
                  communication: interview.communicationScore || 0,
                  confidence: interview.score || 0,
                  technicalSkills: interview.technicalScore || 0,
                  problemSolving: interview.problemSolvingScore || 0,
                  culturalFit: interview.culturalFitScore || 0,
                },
                sentiment: {
                  positive: interview.sentiment === "positive" ? 75 : 25,
                  neutral: interview.sentiment === "neutral" ? 75 : 25,
                  negative: interview.sentiment === "negative" ? 75 : 0,
                },
                speechAnalysis: {
                  wordsPerMinute: 150,
                  fillerWords: 10,
                  pauseFrequency: 5,
                  clarityScore: interview.communicationScore || 80,
                },
                behavioralInsights: {
                  eyeContact: 80,
                  bodyLanguage: 80,
                  engagement: interview.score || 80,
                  enthusiasm: interview.score || 80,
                },
              },
              aiInsights: [],
              recommendations: [],
              transcriptSummary: interview.notes || "No summary available",
            })
          );
          setAnalyses(transformedData);
        } else {
          setAnalyses(mockAnalyses);
        }
      } catch (err) {
        setError("Failed to load analyses");
        setAnalyses(mockAnalyses);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [timeFilter]);

  const mockAnalyses: InterviewAnalysis[] = [
    {
      id: "1",
      candidateName: "Alice Johnson",
      position: "Senior Software Engineer",
      date: new Date(2024, 9, 15),
      duration: 65,
      interviewType: "technical",
      status: "completed",
      metrics: {
        overall: 87,
        categories: {
          communication: 92,
          confidence: 85,
          technicalSkills: 94,
          problemSolving: 88,
          culturalFit: 82,
        },
        sentiment: {
          positive: 75,
          neutral: 20,
          negative: 5,
        },
        speechAnalysis: {
          wordsPerMinute: 165,
          fillerWords: 12,
          pauseFrequency: 8,
          clarityScore: 91,
        },
        behavioralInsights: {
          eyeContact: 88,
          bodyLanguage: 85,
          engagement: 93,
          enthusiasm: 87,
        },
      },
      aiInsights: [
        "Candidate demonstrates strong technical depth with clear explanations",
        "Excellent problem-solving approach with systematic thinking",
        "Shows good adaptability when facing unexpected questions",
        "Communication style is professional and well-structured",
      ],
      recommendations: [
        "Consider for senior role - technical skills align well with requirements",
        "Strong cultural fit based on values alignment",
        "Recommend technical deep-dive in system design",
        "Schedule final round with engineering leadership",
      ],
      transcriptSummary:
        "Candidate provided detailed explanations of previous projects, demonstrated strong algorithmic thinking, and showed enthusiasm for the role and company mission.",
    },
    {
      id: "2",
      candidateName: "Bob Chen",
      position: "Product Manager",
      date: new Date(2024, 9, 14),
      duration: 78,
      interviewType: "behavioral",
      status: "flagged",
      metrics: {
        overall: 72,
        categories: {
          communication: 78,
          confidence: 68,
          technicalSkills: 75,
          problemSolving: 82,
          culturalFit: 65,
        },
        sentiment: {
          positive: 60,
          neutral: 30,
          negative: 10,
        },
        speechAnalysis: {
          wordsPerMinute: 145,
          fillerWords: 28,
          pauseFrequency: 15,
          clarityScore: 76,
        },
        behavioralInsights: {
          eyeContact: 72,
          bodyLanguage: 68,
          engagement: 75,
          enthusiasm: 70,
        },
      },
      aiInsights: [
        "Candidate shows nervousness in early responses but improves over time",
        "Strong analytical skills but communication could be more concise",
        "Good understanding of product concepts but lacks specific examples",
        "Shows potential but may need more experience in stakeholder management",
      ],
      recommendations: [
        "Consider for junior PM role or PM intern position",
        "Recommend additional behavioral interview round",
        "Provide specific scenario-based questions",
        "Consider cultural fit assessment with team",
      ],
      transcriptSummary:
        "Candidate demonstrated understanding of product management principles but struggled with providing concrete examples and showed some nervousness throughout the interview.",
    },
    {
      id: "3",
      candidateName: "Carol Martinez",
      position: "Data Scientist",
      date: new Date(2024, 9, 13),
      duration: 90,
      interviewType: "case-study",
      status: "analyzing",
      metrics: {
        overall: 0,
        categories: {
          communication: 0,
          confidence: 0,
          technicalSkills: 0,
          problemSolving: 0,
          culturalFit: 0,
        },
        sentiment: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
        speechAnalysis: {
          wordsPerMinute: 0,
          fillerWords: 0,
          pauseFrequency: 0,
          clarityScore: 0,
        },
        behavioralInsights: {
          eyeContact: 0,
          bodyLanguage: 0,
          engagement: 0,
          enthusiasm: 0,
        },
      },
      aiInsights: [],
      recommendations: [],
      transcriptSummary: "Analysis in progress...",
    },
  ];

  const completedAnalyses = (
    analyses.length > 0 ? analyses : mockAnalyses
  ).filter((a) => a.status === "completed");
  const averageOverallScore =
    completedAnalyses.length > 0
      ? Math.round(
          completedAnalyses.reduce((sum, a) => sum + a.metrics.overall, 0) /
            completedAnalyses.length
        )
      : 0;

  const topPerformers = completedAnalyses
    .sort((a, b) => b.metrics.overall - a.metrics.overall)
    .slice(0, 3);

  const flaggedCandidates = (
    analyses.length > 0 ? analyses : mockAnalyses
  ).filter((a) => a.status === "flagged");

  const getSentimentColor = (type: "positive" | "neutral" | "negative") => {
    switch (type) {
      case "positive":
        return "text-green-500";
      case "neutral":
        return "text-yellow-500";
      case "negative":
        return "text-red-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "analyzing":
        return <Badge className="bg-blue-100 text-blue-800">Analyzing</Badge>;
      case "flagged":
        return <Badge className="bg-red-100 text-red-800">Flagged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Loading State */}
        {loading && (
          <Alert>
            <AlertDescription>Loading AI analyses...</AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Analysis Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced AI-powered interview analysis with sentiment detection
                and behavioral insights
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Analysis Settings
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Overview Stats */}
        <AnimatedContainer delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Interviews Analyzed
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {completedAnalyses.length}
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Score
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {averageOverallScore}%
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Top Performers
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {topPerformers.length}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Flagged Reviews
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {flaggedCandidates.length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Analyses */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      Recent Analyses
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StaggeredContainer className="space-y-4">
                    {(analyses.length > 0 ? analyses : mockAnalyses).map(
                      (analysis) => (
                        <StaggeredItem key={analysis.id}>
                          <Card
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedAnalysis(analysis)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarFallback>
                                        {analysis.candidateName
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-semibold">
                                        {analysis.candidateName}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {analysis.position}
                                      </p>
                                    </div>
                                  </div>
                                  {getStatusBadge(analysis.status)}
                                </div>

                                {/* Metrics */}
                                {analysis.status === "completed" && (
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                      <div
                                        className={cn(
                                          "text-2xl font-bold",
                                          getScoreColor(
                                            analysis.metrics.overall
                                          )
                                        )}
                                      >
                                        {analysis.metrics.overall}%
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Overall
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div
                                        className={cn(
                                          "text-lg font-semibold",
                                          getSentimentColor("positive")
                                        )}
                                      >
                                        {analysis.metrics.sentiment.positive}%
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Positive
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-semibold text-blue-600">
                                        {analysis.duration}min
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Duration
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {analysis.status === "analyzing" && (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="flex items-center gap-2 text-blue-600">
                                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                      <span className="text-sm">
                                        AI analysis in progress...
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs capitalize"
                                    >
                                      {analysis.interviewType.replace("-", " ")}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {analysis.date.toLocaleDateString()}
                                    </span>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </StaggeredItem>
                      )
                    )}
                  </StaggeredContainer>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Sidebar - AI Insights & Tools */}
          <div className="space-y-6">
            {/* Top Performers */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div
                      key={performer.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : "bg-orange-100 text-orange-800"
                          )}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {performer.candidateName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {performer.position}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {performer.metrics.overall}%
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* AI Analysis Tools */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    AI Analysis Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-2" />
                    Sentiment Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Speech Pattern Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Behavioral Insights
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Skill Assessment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Recommendation Engine
                  </Button>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Quick Stats */}
            <AnimatedContainer delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    Analysis Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Communication Excellence</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Proficiency</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cultural Alignment</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>

        {/* Detailed Analysis Modal */}
        {selectedAnalysis && selectedAnalysis.status === "completed" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedAnalysis.candidateName}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedAnalysis.position} • Detailed AI Analysis
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAnalysis(null)}
                  >
                    ×
                  </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                    <TabsTrigger value="speech">Speech Analysis</TabsTrigger>
                    <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                    <TabsTrigger value="recommendations">
                      Recommendations
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      {Object.entries(selectedAnalysis.metrics.categories).map(
                        ([category, score]) => (
                          <Card key={category}>
                            <CardContent className="p-4 text-center">
                              <div
                                className={cn(
                                  "text-2xl font-bold",
                                  getScoreColor(score)
                                )}
                              >
                                {score}%
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {category.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>AI Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedAnalysis.aiInsights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                              <span className="text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sentiment" className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Smile className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-600">
                            {selectedAnalysis.metrics.sentiment.positive}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Positive
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Meh className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-yellow-600">
                            {selectedAnalysis.metrics.sentiment.neutral}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Neutral
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Frown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-red-600">
                            {selectedAnalysis.metrics.sentiment.negative}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Negative
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="speech" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Volume2 className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Speech Metrics</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Words per minute</span>
                              <span className="font-medium">
                                {
                                  selectedAnalysis.metrics.speechAnalysis
                                    .wordsPerMinute
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Filler words</span>
                              <span className="font-medium">
                                {
                                  selectedAnalysis.metrics.speechAnalysis
                                    .fillerWords
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Pause frequency</span>
                              <span className="font-medium">
                                {
                                  selectedAnalysis.metrics.speechAnalysis
                                    .pauseFrequency
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Clarity score</span>
                              <span className="font-medium">
                                {
                                  selectedAnalysis.metrics.speechAnalysis
                                    .clarityScore
                                }
                                %
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Gauge className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">
                              Communication Quality
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Clarity</span>
                                <span className="text-sm">
                                  {
                                    selectedAnalysis.metrics.speechAnalysis
                                      .clarityScore
                                  }
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  selectedAnalysis.metrics.speechAnalysis
                                    .clarityScore
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="behavioral" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(
                        selectedAnalysis.metrics.behavioralInsights
                      ).map(([behavior, score]) => (
                        <Card key={behavior}>
                          <CardContent className="p-6">
                            <div className="text-center">
                              <div
                                className={cn(
                                  "text-2xl font-bold",
                                  getScoreColor(score)
                                )}
                              >
                                {score}%
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {behavior.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <Progress value={score} className="h-2 mt-2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {selectedAnalysis.recommendations.map(
                            (recommendation, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                              >
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                <span className="text-sm">
                                  {recommendation}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAnalysis(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export Analysis
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
