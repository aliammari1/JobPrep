"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Lightbulb,
  AlertTriangle,
  Award,
  Layers,
  Map,
  Route,
  FlaskConical,
  Gauge,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share2,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Database,
  Code,
  Puzzle,
  Cpu,
  Network,
  Shield,
  Rocket,
  Handshake,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";
import { useAiQuestions } from "@/hooks/use-ai-questions";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  id: string;
  text: string;
  type:
    | "technical"
    | "behavioral"
    | "situational"
    | "problem-solving"
    | "cultural-fit";
  difficulty: "easy" | "medium" | "hard" | "expert";
  category: string;
  estimatedTime: number;
  followUpQuestions?: string[];
  hints?: string[];
  expectedTopics: string[];
  scoringCriteria: ScoringCriteria[];
  aiGenerated: boolean;
  adaptiveFactors: AdaptiveFactors;
}

interface ScoringCriteria {
  id: string;
  aspect: string;
  weight: number;
  description: string;
}

interface AdaptiveFactors {
  dependencies: string[];
  prerequisites: string[];
  difficultyTriggers: DifficultyTrigger[];
  branchingPaths: BranchingPath[];
}

interface DifficultyTrigger {
  condition:
    | "score_above"
    | "score_below"
    | "time_exceeded"
    | "keywords_present";
  threshold: number;
  action: "increase_difficulty" | "decrease_difficulty" | "branch_to_category";
  target?: string;
}

interface BranchingPath {
  id: string;
  condition: string;
  targetQuestionId: string;
  probability: number;
}

interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  startTime: Date;
  elapsedTime: number;
  status: "preparing" | "active" | "paused" | "completed";
  difficulty: "adaptive" | "easy" | "medium" | "hard";
  questionPath: string[];
  responses: QuestionResponse[];
  aiInsights: AIInsight[];
  adaptiveAdjustments: AdaptiveAdjustment[];
}

interface QuestionResponse {
  questionId: string;
  response: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  aiAnalysis?: {
    sentiment: number;
    confidence: number;
    keyTopics: string[];
    technicalAccuracy: number;
    communicationClarity: number;
  };
}

interface AIInsight {
  id: string;
  type:
    | "difficulty_adjustment"
    | "topic_recommendation"
    | "branching_suggestion"
    | "performance_alert";
  message: string;
  confidence: number;
  timestamp: Date;
  actionTaken?: string;
}

interface AdaptiveAdjustment {
  id: string;
  type:
    | "difficulty_change"
    | "category_switch"
    | "time_extension"
    | "question_skip";
  reason: string;
  previousState: {
    difficulty?: Question["difficulty"];
    category?: string;
    timeRemaining?: number;
    questionId?: string;
  };
  newState: {
    difficulty?: Question["difficulty"];
    category?: string;
    timeRemaining?: number;
    questionId?: string;
  };
  timestamp: Date;
}

export default function AdaptiveQuestionFlowPage() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("interview");
  const [adaptiveMode, setAdaptiveMode] = useState<"auto" | "manual">("auto");
  const [difficultyOverride, setDifficultyOverride] = useState<string>("");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const { generateQuestions } = useAiQuestions();

  // Mock data
  const mockQuestionBank: Question[] = [
    {
      id: "q1",
      text: "Tell me about yourself and your experience with React.",
      type: "technical",
      difficulty: "easy",
      category: "Frontend Development",
      estimatedTime: 300,
      followUpQuestions: [
        "What specific React patterns do you prefer?",
        "How do you handle state management in complex applications?",
      ],
      hints: ["Focus on recent projects", "Mention specific technologies"],
      expectedTopics: ["React", "JavaScript", "Components", "State Management"],
      scoringCriteria: [
        {
          id: "tech_knowledge",
          aspect: "Technical Knowledge",
          weight: 40,
          description: "Understanding of React concepts",
        },
        {
          id: "communication",
          aspect: "Communication",
          weight: 30,
          description: "Clarity and structure of response",
        },
        {
          id: "experience",
          aspect: "Experience",
          weight: 30,
          description: "Relevant project experience",
        },
      ],
      aiGenerated: false,
      adaptiveFactors: {
        dependencies: [],
        prerequisites: [],
        difficultyTriggers: [
          {
            condition: "score_above",
            threshold: 80,
            action: "increase_difficulty",
          },
          {
            condition: "score_below",
            threshold: 40,
            action: "decrease_difficulty",
          },
        ],
        branchingPaths: [
          {
            id: "high_performer",
            condition: "score > 80",
            targetQuestionId: "q3",
            probability: 0.8,
          },
          {
            id: "needs_support",
            condition: "score < 40",
            targetQuestionId: "q2",
            probability: 0.9,
          },
        ],
      },
    },
    {
      id: "q2",
      text: "Describe the difference between props and state in React.",
      type: "technical",
      difficulty: "easy",
      category: "Frontend Development",
      estimatedTime: 240,
      followUpQuestions: ["When would you use one over the other?"],
      hints: ["Think about data flow", "Consider component responsibility"],
      expectedTopics: ["Props", "State", "Data Flow", "Components"],
      scoringCriteria: [
        {
          id: "accuracy",
          aspect: "Technical Accuracy",
          weight: 50,
          description: "Correct understanding of concepts",
        },
        {
          id: "examples",
          aspect: "Examples",
          weight: 30,
          description: "Ability to provide concrete examples",
        },
        {
          id: "clarity",
          aspect: "Clarity",
          weight: 20,
          description: "Clear explanation",
        },
      ],
      aiGenerated: true,
      adaptiveFactors: {
        dependencies: ["q1"],
        prerequisites: ["basic_react"],
        difficultyTriggers: [
          {
            condition: "score_above",
            threshold: 75,
            action: "increase_difficulty",
          },
        ],
        branchingPaths: [
          {
            id: "advanced_path",
            condition: "score > 75",
            targetQuestionId: "q4",
            probability: 0.7,
          },
        ],
      },
    },
    {
      id: "q3",
      text: "Design a scalable React application architecture for a large e-commerce platform.",
      type: "problem-solving",
      difficulty: "hard",
      category: "System Design",
      estimatedTime: 900,
      followUpQuestions: [
        "How would you handle state management?",
        "What about performance optimization?",
        "How would you structure the component hierarchy?",
      ],
      hints: [
        "Consider scalability",
        "Think about team collaboration",
        "Performance is key",
      ],
      expectedTopics: [
        "Architecture",
        "Scalability",
        "State Management",
        "Performance",
        "Team Structure",
      ],
      scoringCriteria: [
        {
          id: "architecture",
          aspect: "Architecture Design",
          weight: 40,
          description: "Quality of proposed architecture",
        },
        {
          id: "scalability",
          aspect: "Scalability Considerations",
          weight: 30,
          description: "Understanding of scale challenges",
        },
        {
          id: "implementation",
          aspect: "Implementation Details",
          weight: 30,
          description: "Practical implementation approach",
        },
      ],
      aiGenerated: true,
      adaptiveFactors: {
        dependencies: ["q1", "q2"],
        prerequisites: ["advanced_react", "system_design"],
        difficultyTriggers: [
          {
            condition: "time_exceeded",
            threshold: 600,
            action: "decrease_difficulty",
          },
        ],
        branchingPaths: [],
      },
    },
    {
      id: "q4",
      text: "Explain how you would implement custom hooks in React and when you would use them.",
      type: "technical",
      difficulty: "medium",
      category: "Frontend Development",
      estimatedTime: 420,
      followUpQuestions: [
        "Can you show an example of a custom hook you've built?",
        "What are the rules of hooks and why are they important?",
      ],
      hints: [
        "Think about reusability",
        "Consider side effects",
        "Rules of hooks",
      ],
      expectedTopics: [
        "Custom Hooks",
        "Reusability",
        "Side Effects",
        "Hook Rules",
      ],
      scoringCriteria: [
        {
          id: "understanding",
          aspect: "Hook Understanding",
          weight: 40,
          description: "Understanding of hook concepts",
        },
        {
          id: "examples",
          aspect: "Practical Examples",
          weight: 35,
          description: "Ability to provide examples",
        },
        {
          id: "best_practices",
          aspect: "Best Practices",
          weight: 25,
          description: "Knowledge of hook best practices",
        },
      ],
      aiGenerated: true,
      adaptiveFactors: {
        dependencies: ["q2"],
        prerequisites: ["intermediate_react"],
        difficultyTriggers: [
          {
            condition: "score_above",
            threshold: 85,
            action: "branch_to_category",
            target: "advanced_topics",
          },
        ],
        branchingPaths: [
          {
            id: "expert_path",
            condition: "score > 85 && time < 300",
            targetQuestionId: "q3",
            probability: 0.9,
          },
        ],
      },
    },
  ];

  const mockSession: InterviewSession = {
    id: "session_1",
    candidateId: "candidate_1",
    candidateName: "Alice Johnson",
    position: "Senior Frontend Developer",
    currentQuestionIndex: 0,
    totalQuestions: 8,
    startTime: new Date(),
    elapsedTime: 0,
    status: "preparing",
    difficulty: "adaptive",
    questionPath: ["q1"],
    responses: [],
    aiInsights: [],
    adaptiveAdjustments: [],
  };

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple calls
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // Initialize with mock data first
    setQuestionBank(mockQuestionBank);
    setSession(mockSession);
    setCurrentQuestion(mockQuestionBank[0]);

    // Then try to generate AI questions
    const loadAiQuestions = async () => {
      setGeneratingQuestions(true);
      setQuestionError(null);
      try {
        const aiQuestions = await generateQuestions({
          role: "Software Engineer",
          skillLevel: "Intermediate",
          count: 10,
          focus: "Full Stack Development",
        });

        if (aiQuestions && aiQuestions.length > 0) {
          const transformedQuestions: Question[] = aiQuestions.map(
            (q, idx) => ({
              id: `ai_q${idx + 1}`,
              text: q.text,
              type: q.category === "behavioral" ? "behavioral" : "technical",
              difficulty: q.difficulty as "easy" | "medium" | "hard" | "expert",
              category:
                q.category.charAt(0).toUpperCase() + q.category.slice(1),
              estimatedTime: 300,
              followUpQuestions: [],
              hints: [],
              expectedTopics: [],
              scoringCriteria: [],
              aiGenerated: true,
              adaptiveFactors: {
                dependencies: [],
                prerequisites: [],
                difficultyTriggers: [],
                branchingPaths: [],
              },
            }),
          );
          setQuestionBank(transformedQuestions);
          setCurrentQuestion(transformedQuestions[0]);
        }
      } catch (error) {
        console.error("Failed to generate AI questions:", error);
        setQuestionError("Using default questions. AI generation failed.");
      } finally {
        setGeneratingQuestions(false);
      }
    };

    loadAiQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startInterview = () => {
    if (session) {
      setSession({
        ...session,
        status: "active",
        startTime: new Date(),
      });
    }
  };

  const pauseInterview = () => {
    if (session) {
      setSession({
        ...session,
        status: "paused",
      });
    }
  };

  // selectNextQuestion is defined below; stable since not capturing changing outer scope state
  const nextQuestion = () => {
    if (!session || !currentQuestion) return;

    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      response: currentResponse,
      startTime: new Date(Date.now() - 120000), // Mock 2 minutes ago
      endTime: new Date(),
      aiAnalysis: {
        sentiment: 0.7,
        confidence: 0.85,
        keyTopics: ["React", "Components"],
        technicalAccuracy: 0.8,
        communicationClarity: 0.9,
      },
    };

    const nextQuestionId = selectNextQuestion(currentQuestion, response);
    const nextQuestion = questionBank.find((q) => q.id === nextQuestionId);

    setSession((prev) =>
      prev
        ? {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            responses: [...prev.responses, response],
            questionPath: [...prev.questionPath, nextQuestionId || ""],
            aiInsights: [
              ...prev.aiInsights,
              {
                id: Date.now().toString(),
                type: "difficulty_adjustment",
                message:
                  "Question difficulty adapted based on strong technical response",
                confidence: 0.88,
                timestamp: new Date(),
              },
            ],
          }
        : null,
    );

    setCurrentQuestion(nextQuestion || null);
    setCurrentResponse("");
    setIsAnalyzing(true);

    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const selectNextQuestion = (
    current: Question,
    response: QuestionResponse,
  ): string | null => {
    // Mock AI logic for question selection
    const score = response.aiAnalysis?.technicalAccuracy || 0.5;

    // Check branching paths
    for (const path of current.adaptiveFactors.branchingPaths) {
      if (score > 0.8 && path.condition.includes("score > 80")) {
        return path.targetQuestionId;
      }
    }

    // Default to next question in bank
    const currentIndex = questionBank.findIndex((q) => q.id === current.id);
    return questionBank[currentIndex + 1]?.id || null;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "expert":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="w-4 h-4" />;
      case "behavioral":
        return <Users className="w-4 h-4" />;
      case "situational":
        return <Puzzle className="w-4 h-4" />;
      case "problem-solving":
        return <Brain className="w-4 h-4" />;
      case "cultural-fit":
        return <Handshake className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Loading Adaptive Interview System
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing AI-driven question flow...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Adaptive Question Flow
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                AI-powered dynamic interview progression with intelligent
                question selection
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Brain className="w-4 h-4 mr-2" />
                AI-Driven
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Zap className="w-4 h-4 mr-2" />
                Adaptive
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        {/* Loading State */}
        {generatingQuestions && (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Generating AI-powered interview questions...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {questionError && (
          <Card className="border-0 shadow-xl bg-yellow-50 dark:bg-yellow-900/20 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
                <p className="text-yellow-800 dark:text-yellow-300">
                  {questionError}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="flow">Question Flow</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="interview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Interview Panel */}
              <div className="xl:col-span-2 space-y-6">
                {/* Session Status */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>AJ</AvatarFallback>
                          </Avatar>
                          {session.candidateName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.position}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            session.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : session.status === "paused"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                : session.status === "preparing"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                          }
                        >
                          {session.status}
                        </Badge>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {session.currentQuestionIndex + 1} /{" "}
                            {session.totalQuestions}
                          </div>
                          <div className="text-gray-500">Questions</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress
                        value={
                          (session.currentQuestionIndex /
                            session.totalQuestions) *
                          100
                        }
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>Interview Progress</span>
                        <span>
                          {Math.round(
                            (session.currentQuestionIndex /
                              session.totalQuestions) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                              {getTypeIcon(currentQuestion.type)}
                            </div>
                            <div>
                              <CardTitle>
                                Question {session.currentQuestionIndex + 1}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  className={getDifficultyColor(
                                    currentQuestion.difficulty,
                                  )}
                                >
                                  {currentQuestion.difficulty}
                                </Badge>
                                <Badge variant="outline">
                                  {currentQuestion.category}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  ~
                                  {Math.round(
                                    currentQuestion.estimatedTime / 60,
                                  )}{" "}
                                  min
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Lightbulb className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Clock className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-lg leading-relaxed">
                          {currentQuestion.text}
                        </div>

                        {/* Response Area */}
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Type your response here, or use voice recording..."
                            value={currentResponse}
                            onChange={(e) => setCurrentResponse(e.target.value)}
                            className="min-h-[120px]"
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant={
                                  isRecording ? "destructive" : "outline"
                                }
                                size="sm"
                                onClick={() => setIsRecording(!isRecording)}
                              >
                                {isRecording ? (
                                  <MicOff className="w-4 h-4" />
                                ) : (
                                  <Mic className="w-4 h-4" />
                                )}
                                {isRecording
                                  ? "Stop Recording"
                                  : "Voice Record"}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload File
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setCurrentResponse("")}
                                disabled={!currentResponse}
                              >
                                Clear
                              </Button>
                              <Button
                                onClick={nextQuestion}
                                disabled={
                                  !currentResponse.trim() || isAnalyzing
                                }
                              >
                                {isAnalyzing ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    Next Question
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Question Hints */}
                        {currentQuestion.hints &&
                          currentQuestion.hints.length > 0 && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                  Hints
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {currentQuestion.hints.map((hint) => (
                                  <li
                                    key={hint}
                                    className="text-sm text-blue-800 dark:text-blue-200"
                                  >
                                    • {hint}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>

                {/* Interview Controls */}
                <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {session.status === "preparing" ? (
                          <Button onClick={startInterview} className="gap-2">
                            <Play className="w-4 h-4" />
                            Start Interview
                          </Button>
                        ) : session.status === "active" ? (
                          <Button
                            onClick={pauseInterview}
                            variant="outline"
                            className="gap-2"
                          >
                            <Pause className="w-4 h-4" />
                            Pause
                          </Button>
                        ) : (
                          <Button onClick={startInterview} className="gap-2">
                            <Play className="w-4 h-4" />
                            Resume
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>15:32 elapsed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Insights */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {session.aiInsights.slice(0, 3).map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {insight.type.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-purple-900 dark:text-purple-100">
                          {insight.message}
                        </p>
                      </div>
                    ))}
                    {session.aiInsights.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          AI insights will appear here during the interview
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Question Path */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="w-5 h-5 text-blue-600" />
                      Question Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {session.questionPath.map((questionId, index) => {
                        const question = questionBank.find(
                          (q) => q.id === questionId,
                        );
                        const isCurrent =
                          index === session.currentQuestionIndex;
                        const isCompleted =
                          index < session.currentQuestionIndex;

                        return (
                          <div
                            key={questionId}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                              isCurrent
                                ? "bg-blue-100 dark:bg-blue-900"
                                : isCompleted
                                  ? "bg-green-50 dark:bg-green-950"
                                  : "bg-gray-50 dark:bg-gray-800"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                isCurrent
                                  ? "bg-blue-500 text-white"
                                  : isCompleted
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {question?.category || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {question?.difficulty || "Unknown"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Adaptive Controls */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-orange-600" />
                      Adaptive Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Mode</span>
                        <Badge
                          className={
                            adaptiveMode === "auto"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                          }
                        >
                          {adaptiveMode}
                        </Badge>
                      </div>
                      <Select
                        value={adaptiveMode}
                        onValueChange={(value: "auto" | "manual") =>
                          setAdaptiveMode(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automatic</SelectItem>
                          <SelectItem value="manual">
                            Manual Override
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {adaptiveMode === "manual" && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Difficulty Override
                        </div>
                        <Select
                          value={difficultyOverride}
                          onValueChange={setDifficultyOverride}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">
                        Session Stats
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg. Response Time</span>
                          <span>2.5 min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Current Difficulty</span>
                          <span className="capitalize">
                            {currentQuestion.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>AI Confidence</span>
                          <span>87%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flow" className="space-y-6">
            <StaggeredContainer>
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Question Flow Visualization</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visual representation of the adaptive question flow and
                    branching logic
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Interactive flow diagram will be displayed here
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Showing question dependencies, branching paths, and AI
                        decision points
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggeredContainer>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <StaggeredContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Technical Accuracy</span>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Communication Clarity</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Response Depth</span>
                          <span className="text-sm font-medium">72%</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Adaptive Adjustments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>Difficulty increased (Q3)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Route className="w-4 h-4 text-blue-500" />
                        <span>Branched to advanced path</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>Time extension granted</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      AI Confidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">
                        87%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Current prediction confidence
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </StaggeredContainer>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <StaggeredContainer>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Adaptive Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label
                        htmlFor="ai-sensitivity"
                        className="text-sm font-medium"
                      >
                        AI Sensitivity
                      </label>
                      <Slider
                        id="ai-sensitivity"
                        defaultValue={[75]}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        How quickly AI adapts to candidate responses
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="difficulty-range"
                        className="text-sm font-medium"
                      >
                        Difficulty Range
                      </label>
                      <Slider
                        id="difficulty-range"
                        defaultValue={[25, 75]}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Allowed difficulty adjustment range
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="branch-probability"
                        className="text-sm font-medium"
                      >
                        Branch Probability
                      </label>
                      <Slider
                        id="branch-probability"
                        defaultValue={[60]}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Likelihood of taking alternative question paths
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Question Bank Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start gap-2">
                      <Upload className="w-4 h-4" />
                      Import Question Bank
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Current Bank
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      Generate AI Questions
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Manage Categories
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </StaggeredContainer>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
