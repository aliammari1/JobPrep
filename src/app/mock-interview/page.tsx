"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Target,
  Star,
  Brain,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  Award,
  BarChart3,
  Users,
  Lightbulb,
  Zap,
  Eye,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  BookOpen,
  FileText,
  Download,
  Share,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface MockSession {
  id: string;
  title: string;
  type: "behavioral" | "technical" | "leadership" | "case-study";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  currentQuestion: number;
  totalQuestions: number;
  isActive: boolean;
  sessionTime: number;
  aiInterviewer: {
    name: string;
    personality: "professional" | "friendly" | "challenging";
    avatar: string;
  };
}

interface Question {
  id: string;
  text: string;
  type: "behavioral" | "technical" | "case-study";
  followUps: string[];
  hints: string[];
  idealResponse: string;
  timeLimit?: number;
}

interface AIFeedback {
  overall: number;
  categories: {
    communication: number;
    technical: number;
    problemSolving: number;
    confidence: number;
  };
  strengths: string[];
  improvements: string[];
  insights: string[];
}

export default function MockInterview() {
  const [currentSession, setCurrentSession] = useState<MockSession | null>(
    null
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [questionTime, setQuestionTime] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          const transformedSessions = (data.interviews || []).map(
            (interview: any, index: number) => ({
              id: interview.id,
              title: interview.title || `Interview Session ${index + 1}`,
              type: (interview.type || "technical") as
                | "behavioral"
                | "technical"
                | "leadership"
                | "case-study",
              difficulty: (interview.difficulty || "intermediate") as
                | "beginner"
                | "intermediate"
                | "advanced",
              duration: interview.duration || 60,
              currentQuestion: 1,
              totalQuestions: interview.questions?.length || 8,
              isActive: interview.status === "in-progress",
              sessionTime: 0,
              aiInterviewer: {
                name: "AI Interviewer",
                personality: "professional" as const,
                avatar: "",
              },
            })
          );
          setSessions(transformedSessions);
        }
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const mockSessions: MockSession[] = [
    {
      id: "1",
      title: "Senior Software Engineer - Full Stack",
      type: "technical",
      difficulty: "advanced",
      duration: 60,
      currentQuestion: 1,
      totalQuestions: 8,
      isActive: false,
      sessionTime: 0,
      aiInterviewer: {
        name: "Dr. Sarah Chen",
        personality: "professional",
        avatar: "/avatars/sarah.jpg",
      },
    },
    {
      id: "2",
      title: "Product Manager - Leadership Focus",
      type: "leadership",
      difficulty: "intermediate",
      duration: 45,
      currentQuestion: 1,
      totalQuestions: 6,
      isActive: false,
      sessionTime: 0,
      aiInterviewer: {
        name: "Alex Rodriguez",
        personality: "friendly",
        avatar: "/avatars/alex.jpg",
      },
    },
    {
      id: "3",
      title: "Data Scientist - Case Study",
      type: "case-study",
      difficulty: "advanced",
      duration: 90,
      currentQuestion: 1,
      totalQuestions: 4,
      isActive: false,
      sessionTime: 0,
      aiInterviewer: {
        name: "Dr. Michael Park",
        personality: "challenging",
        avatar: "/avatars/michael.jpg",
      },
    },
  ];

  const currentQuestion: Question = {
    id: "1",
    text: "Tell me about a time when you had to lead a project under tight deadlines. How did you manage the team and ensure delivery?",
    type: "behavioral",
    followUps: [
      "What specific challenges did you face with team coordination?",
      "How did you prioritize tasks when everything seemed urgent?",
      "What would you do differently if you faced a similar situation again?",
    ],
    hints: [
      "Structure your answer using the STAR method (Situation, Task, Action, Result)",
      "Quantify the impact of your leadership decisions",
      "Highlight specific communication and delegation strategies",
    ],
    idealResponse:
      "Strong answers should demonstrate leadership skills, time management, team coordination, and measurable outcomes.",
    timeLimit: 300,
  };

  const aiFeedback: AIFeedback = {
    overall: 85,
    categories: {
      communication: 88,
      technical: 82,
      problemSolving: 90,
      confidence: 78,
    },
    strengths: [
      "Clear and structured communication",
      "Strong problem-solving approach",
      "Good use of specific examples",
      "Demonstrates leadership qualities",
    ],
    improvements: [
      "Provide more quantifiable results",
      "Show more confidence in technical abilities",
      "Practice concise explanations of complex topics",
      "Include more stakeholder perspective",
    ],
    insights: [
      "Your communication style is naturally collaborative",
      "You show strong analytical thinking patterns",
      "Consider preparing more diverse examples",
      "Your technical knowledge is solid but could be articulated more confidently",
    ],
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive && currentSession) {
      interval = setInterval(() => {
        setQuestionTime((time) => time + 1);
        currentSession.sessionTime += 1;
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, currentSession]);

  const startSession = (session: MockSession) => {
    setCurrentSession({ ...session, isActive: true });
    setIsSessionActive(true);
    setQuestionTime(0);
    setSessionComplete(false);
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const resumeSession = () => {
    setIsSessionActive(true);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setSessionComplete(true);
  };

  const nextQuestion = () => {
    if (
      currentSession &&
      currentSession.currentQuestion < currentSession.totalQuestions
    ) {
      setCurrentSession((prev) =>
        prev ? { ...prev, currentQuestion: prev.currentQuestion + 1 } : null
      );
      setQuestionTime(0);
    } else {
      endSession();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "behavioral":
        return MessageSquare;
      case "technical":
        return Brain;
      case "leadership":
        return Users;
      case "case-study":
        return FileText;
      default:
        return BookOpen;
    }
  };

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6 space-y-8">
          <AnimatedContainer>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold">Interview Complete!</h1>
              <p className="text-muted-foreground">
                Great job! Here's your detailed performance analysis.
              </p>
            </div>
          </AnimatedContainer>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Score */}
            <AnimatedContainer delay={0.1}>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Overall Performance</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 56 * (1 - aiFeedback.overall / 100)
                        }`}
                        className="text-green-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">
                        {aiFeedback.overall}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800">
                      Excellent Performance
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      You demonstrated strong interview skills across all
                      categories.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Category Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatedContainer delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(aiFeedback.categories).map(
                      ([category, score], index) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span className="text-sm font-medium">
                              {score}%
                            </span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <AnimatedContainer delay={0.3}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <ThumbsUp className="w-5 h-5" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiFeedback.strengths.map((strength, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedContainer>

                {/* Improvements */}
                <AnimatedContainer delay={0.4}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <TrendingUp className="w-5 h-5" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiFeedback.improvements.map((improvement, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Target className="w-4 h-4 text-orange-500 mt-0.5" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedContainer>
              </div>

              {/* AI Insights */}
              <AnimatedContainer delay={0.5}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      AI Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiFeedback.insights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20"
                        >
                          <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5" />
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              {/* Actions */}
              <AnimatedContainer delay={0.6}>
                <div className="flex gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSession && isSessionActive) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-4 space-y-4">
          {/* Session Header */}
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>
                  {currentSession.aiInterviewer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">
                  {currentSession.aiInterviewer.name}
                </h2>
                <p className="text-sm text-gray-400">
                  AI Interviewer • {currentSession.aiInterviewer.personality}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Progress</div>
                <div className="font-medium">
                  {currentSession.currentQuestion} of{" "}
                  {currentSession.totalQuestions}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Time</div>
                <div className="font-medium">{formatTime(questionTime)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Video Area */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 space-y-4">
                  {/* Video Feed */}
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    {isVideoOn ? (
                      <div className="text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-400">Your video feed</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CameraOff className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-400">Video is off</p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={isVideoOn ? "default" : "destructive"}
                      size="sm"
                      onClick={() => setIsVideoOn(!isVideoOn)}
                    >
                      {isVideoOn ? (
                        <Camera className="w-4 h-4" />
                      ) : (
                        <CameraOff className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant={isAudioOn ? "default" : "destructive"}
                      size="sm"
                      onClick={() => setIsAudioOn(!isAudioOn)}
                    >
                      {isAudioOn ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant={isSessionActive ? "secondary" : "default"}
                      size="sm"
                      onClick={isSessionActive ? pauseSession : resumeSession}
                    >
                      {isSessionActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={endSession}
                    >
                      End Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Question */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Question {currentSession.currentQuestion}</span>
                    <Badge
                      className={cn(
                        "text-xs",
                        getDifficultyColor(currentSession.difficulty)
                      )}
                    >
                      {currentSession.difficulty}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    {currentQuestion.text}
                  </p>

                  {currentQuestion.timeLimit && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-400">
                        Suggested time:{" "}
                        {Math.floor(currentQuestion.timeLimit / 60)} minutes
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints(!showHints)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {showHints ? "Hide" : "Show"} Hints
                    </Button>
                    <Button variant="outline" size="sm">
                      <Coffee className="w-4 h-4 mr-2" />
                      Take a Break
                    </Button>
                  </div>

                  {showHints && (
                    <div className="bg-blue-950/30 rounded-lg p-4 space-y-2">
                      <div className="font-medium text-blue-300">Hints:</div>
                      <ul className="space-y-1">
                        {currentQuestion.hints.map((hint, index) => (
                          <li
                            key={index}
                            className="text-sm text-blue-200 flex items-start gap-2"
                          >
                            <span className="text-blue-400">•</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Progress */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Session Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Questions</span>
                      <span>
                        {currentSession.currentQuestion}/
                        {currentSession.totalQuestions}
                      </span>
                    </div>
                    <Progress
                      value={
                        (currentSession.currentQuestion /
                          currentSession.totalQuestions) *
                        100
                      }
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Time Elapsed</span>
                      <span>{formatTime(currentSession.sessionTime)}</span>
                    </div>
                    <Progress
                      value={
                        (currentSession.sessionTime /
                          (currentSession.duration * 60)) *
                        100
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={nextQuestion}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Next Question
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Flag for Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save Response
                  </Button>
                </CardContent>
              </Card>

              {/* AI Feedback */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Live AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">
                        Good eye contact maintained
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">Clear speech patterns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">
                        Consider using more specific examples
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mock Interview Simulator
              </h1>
              <p className="text-muted-foreground mt-2">
                Practice with AI-powered interviewers and get instant feedback
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Play className="w-4 h-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Quick Stats */}
        <AnimatedContainer delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sessions Completed
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">24</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-indigo-500" />
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
                    <p className="text-2xl font-bold text-green-600">87%</p>
                  </div>
                  <Star className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Hours Practiced
                    </p>
                    <p className="text-2xl font-bold text-purple-600">156</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Improvement</p>
                    <p className="text-2xl font-bold text-orange-600">+23%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedContainer>

        {/* Available Sessions */}
        <AnimatedContainer delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Available Mock Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaggeredContainer className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {(sessions.length > 0 ? sessions : mockSessions).map(
                  (session) => {
                    const TypeIcon = getTypeIcon(session.type);
                    return (
                      <StaggeredItem key={session.id}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer group">
                          <CardContent className="p-6 space-y-4">
                            {/* Header */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/20">
                                  <TypeIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    getDifficultyColor(session.difficulty)
                                  )}
                                >
                                  {session.difficulty}
                                </Badge>
                              </div>
                              <h3 className="font-semibold group-hover:text-indigo-600 transition-colors">
                                {session.title}
                              </h3>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Duration:
                                </span>
                                <span>{session.duration} minutes</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Questions:
                                </span>
                                <span>{session.totalQuestions} questions</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Type:
                                </span>
                                <span className="capitalize">
                                  {session.type}
                                </span>
                              </div>
                            </div>

                            {/* AI Interviewer */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {session.aiInterviewer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">
                                  {session.aiInterviewer.name}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {session.aiInterviewer.personality} style
                                </div>
                              </div>
                            </div>

                            {/* Action */}
                            <Button
                              onClick={() => startSession(session)}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Interview
                            </Button>
                          </CardContent>
                        </Card>
                      </StaggeredItem>
                    );
                  }
                )}
              </StaggeredContainer>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Recent Performance */}
        <AnimatedContainer delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Recent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(aiFeedback.categories).map(
                    ([category, score]) => (
                      <div
                        key={category}
                        className="text-center p-4 rounded-lg bg-muted/30"
                      >
                        <div className="text-2xl font-bold text-purple-600">
                          {score}%
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Detailed Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
