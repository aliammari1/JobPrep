"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Zap,
  TrendingUp,
  Target,
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Award,
  BookOpen,
  User,
  Users,
  FileText,
  Download,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface FeedbackAnalysis {
  id: string;
  candidateName: string;
  position: string;
  date: string;
  overallScore: number;
  aiConfidence: number;
  categories: {
    technical: {
      score: number;
      feedback: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    communication: {
      score: number;
      feedback: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    problemSolving: {
      score: number;
      feedback: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    cultural: {
      score: number;
      feedback: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    dominant: "positive" | "neutral" | "negative";
  };
  keyInsights: Array<{
    type: "strength" | "concern" | "recommendation";
    text: string;
    confidence: number;
  }>;
  predictedSuccess: number;
  comparisonToRole: {
    match: number;
    gaps: string[];
    alignment: string[];
  };
  interviewMetrics: {
    responseTime: number;
    clarificationRequests: number;
    depth: number;
    creativity: number;
  };
}

const sampleFeedback: FeedbackAnalysis = {
  id: "1",
  candidateName: "Sarah Johnson",
  position: "Senior Frontend Developer",
  date: "2024-01-15",
  overallScore: 87,
  aiConfidence: 92,
  categories: {
    technical: {
      score: 92,
      feedback:
        "Demonstrates exceptional technical proficiency with deep understanding of React ecosystem and modern JavaScript patterns.",
      strengths: [
        "Advanced React hooks usage",
        "Strong TypeScript knowledge",
        "Performance optimization expertise",
        "Modern build tools proficiency",
      ],
      weaknesses: [
        "Limited backend integration experience",
        "Could improve testing strategies",
      ],
      recommendations: [
        "Consider Node.js fundamentals course",
        "Explore test-driven development practices",
        "Study microservices architecture",
      ],
    },
    communication: {
      score: 85,
      feedback:
        "Clear and articulate communication with good technical explanation abilities. Shows confidence in expressing ideas.",
      strengths: [
        "Clear technical explanations",
        "Active listening skills",
        "Confident presentation",
        "Good question-asking ability",
      ],
      weaknesses: [
        "Occasional technical jargon overuse",
        "Could improve conciseness",
      ],
      recommendations: [
        "Practice explaining complex concepts simply",
        "Work on executive summary skills",
        "Develop storytelling techniques",
      ],
    },
    problemSolving: {
      score: 90,
      feedback:
        "Excellent analytical thinking and structured approach to problem-solving. Shows creativity in finding solutions.",
      strengths: [
        "Systematic problem breakdown",
        "Creative solution generation",
        "Pattern recognition",
        "Edge case consideration",
      ],
      weaknesses: [
        "Sometimes overthinks simple problems",
        "Could benefit from time management",
      ],
      recommendations: [
        "Practice quick decision-making exercises",
        "Learn time-boxing techniques",
        "Study algorithmic complexity",
      ],
    },
    cultural: {
      score: 82,
      feedback:
        "Good alignment with company values and shows collaborative mindset. Demonstrates growth mindset and adaptability.",
      strengths: [
        "Strong collaboration emphasis",
        "Growth mindset",
        "Adaptability",
        "Learning orientation",
      ],
      weaknesses: [
        "Could show more initiative examples",
        "Leadership experience limited",
      ],
      recommendations: [
        "Seek leadership opportunities",
        "Practice mentoring scenarios",
        "Develop initiative-taking examples",
      ],
    },
  },
  sentiment: {
    positive: 72,
    neutral: 23,
    negative: 5,
    dominant: "positive",
  },
  keyInsights: [
    {
      type: "strength",
      text: "Exceptional technical depth in frontend technologies with modern best practices",
      confidence: 95,
    },
    {
      type: "strength",
      text: "Strong problem-solving methodology with creative approach to challenges",
      confidence: 88,
    },
    {
      type: "concern",
      text: "Limited full-stack experience may impact backend collaboration",
      confidence: 76,
    },
    {
      type: "recommendation",
      text: "Consider pairing with senior backend developer for first project",
      confidence: 84,
    },
  ],
  predictedSuccess: 89,
  comparisonToRole: {
    match: 87,
    gaps: [
      "Backend API integration",
      "Production debugging experience",
      "Team leadership skills",
    ],
    alignment: [
      "Frontend architecture expertise",
      "User experience focus",
      "Modern development practices",
      "Code quality standards",
    ],
  },
  interviewMetrics: {
    responseTime: 4.2,
    clarificationRequests: 3,
    depth: 8.5,
    creativity: 7.8,
  },
};

function AIFeedbackEngine() {
  const feedback: FeedbackAnalysis = sampleFeedback;
  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof feedback.categories>("technical");
  const [isGenerating, setIsGenerating] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "neutral":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
      case "negative":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "concern":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "recommendation":
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const generateNewFeedback = async () => {
    setIsGenerating(true);
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  const categoryData: Array<{
    key: keyof typeof feedback.categories;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    { key: "technical", label: "Technical", icon: Brain, color: "blue" },
    {
      key: "communication",
      label: "Communication",
      icon: MessageSquare,
      color: "green",
    },
    {
      key: "problemSolving",
      label: "Problem Solving",
      icon: Target,
      color: "purple",
    },
    { key: "cultural", label: "Cultural Fit", icon: Users, color: "orange" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Feedback Engine
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced AI-powered interview analysis with detailed insights
                and recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={generateNewFeedback}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {isGenerating ? "Analyzing..." : "Generate Feedback"}
              </Button>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Overview Cards */}
        <StaggeredContainer>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StaggeredItem>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Overall Score
                      </p>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          getScoreColor(feedback.overallScore)
                        )}
                      >
                        {feedback.overallScore}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={feedback.overallScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>

            <StaggeredItem>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        AI Confidence
                      </p>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          getScoreColor(feedback.aiConfidence)
                        )}
                      >
                        {feedback.aiConfidence}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    High confidence analysis
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>

            <StaggeredItem>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Success Prediction
                      </p>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          getScoreColor(feedback.predictedSuccess)
                        )}
                      >
                        {feedback.predictedSuccess}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Likely to succeed in role
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>

            <StaggeredItem>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Role Match
                      </p>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          getScoreColor(feedback.comparisonToRole.match)
                        )}
                      >
                        {feedback.comparisonToRole.match}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Strong role alignment
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>
          </div>
        </StaggeredContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Scores */}
            <AnimatedContainer delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Category Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryData.map((category, index) => {
                      const categoryInfo = feedback.categories[category.key];
                      const Icon = category.icon;

                      return (
                        <motion.div
                          key={category.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all",
                            selectedCategory === category.key
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                              : "hover:border-gray-400"
                          )}
                          onClick={() => setSelectedCategory(category.key)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">
                                {category.label}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "font-bold",
                                getScoreColor(categoryInfo.score)
                              )}
                            >
                              {categoryInfo.score}%
                            </span>
                          </div>
                          <Progress
                            value={categoryInfo.score}
                            className="h-2"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Detailed Category Analysis */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {
                      categoryData.find((c) => c.key === selectedCategory)
                        ?.label
                    }{" "}
                    Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const categoryInfo = feedback.categories[selectedCategory];
                    return (
                      <div className="space-y-6">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">AI Analysis</h4>
                          <p className="text-muted-foreground">
                            {categoryInfo.feedback}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Strengths
                            </h4>
                            <ul className="space-y-2">
                              {categoryInfo.strengths.map((strength, idx) => (
                                <motion.li
                                  key={strength}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                                  <span>{strength}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              Areas for Improvement
                            </h4>
                            <ul className="space-y-2">
                              {categoryInfo.weaknesses.map((weakness, idx) => (
                                <motion.li
                                  key={weakness}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2" />
                                  <span>{weakness}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-500" />
                            Recommendations
                          </h4>
                          <div className="space-y-2">
                            {categoryInfo.recommendations.map(
                              (recommendation, index) => (
                                <motion.div
                                  key={recommendation}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                >
                                  <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                                  <span className="text-sm">
                                    {recommendation}
                                  </span>
                                </motion.div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Sentiment Analysis */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Interview Sentiment</span>
                      <Badge
                        className={getSentimentColor(
                          feedback.sentiment.dominant
                        )}
                      >
                        {feedback.sentiment.dominant}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(feedback.sentiment)
                        .filter(([key]) => key !== "dominant")
                        .map(([type, value]) => (
                          <div key={type} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{type}</span>
                              <span className="font-medium">{value}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <motion.div
                                className={cn(
                                  "h-2 rounded-full",
                                  type === "positive" && "bg-green-500",
                                  type === "neutral" && "bg-gray-500",
                                  type === "negative" && "bg-red-500"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Insights */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedback.keyInsights.map((insight, index) => (
                    <motion.div
                      key={insight.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <p className="text-sm">{insight.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Confidence:
                          </span>
                          <Progress
                            value={insight.confidence}
                            className="h-1 flex-1"
                          />
                          <span className="text-xs font-medium">
                            {insight.confidence}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Interview Metrics */}
            <AnimatedContainer delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Interview Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="font-medium">
                        {feedback.interviewMetrics.responseTime}s
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Clarifications Asked</span>
                      <span className="font-medium">
                        {feedback.interviewMetrics.clarificationRequests}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Answer Depth</span>
                        <span className="font-medium">
                          {feedback.interviewMetrics.depth}/10
                        </span>
                      </div>
                      <Progress
                        value={feedback.interviewMetrics.depth * 10}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Creativity Score</span>
                        <span className="font-medium">
                          {feedback.interviewMetrics.creativity}/10
                        </span>
                      </div>
                      <Progress
                        value={feedback.interviewMetrics.creativity * 10}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Role Comparison */}
            <AnimatedContainer delay={0.6}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Role Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        getScoreColor(feedback.comparisonToRole.match)
                      )}
                    >
                      {feedback.comparisonToRole.match}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Role Match
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">
                      Strong Alignments
                    </h4>
                    <div className="space-y-1">
                      {feedback.comparisonToRole.alignment
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 text-sm"
                          >
                            <ArrowUp className="w-3 h-3 text-green-500" />
                            <span className="text-muted-foreground">
                              {item}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Skill Gaps</h4>
                    <div className="space-y-1">
                      {feedback.comparisonToRole.gaps.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-sm"
                        >
                          <ArrowDown className="w-3 h-3 text-red-500" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Actions */}
            <AnimatedContainer delay={0.7}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve Candidate
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Analysis
                  </Button>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <AIFeedbackEngine />;
}
