"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
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
  Code,
  Users,
  Lightbulb,
  Zap,
  Eye,
  Award,
  BarChart3,
  Filter,
  Search,
  ChevronRight,
  Mic,
  Video,
  FileText,
  Download,
  Share,
  Settings,
  Plus,
  Bookmark,
  Timer,
  Volume2,
  RefreshCw,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface PracticeQuestion {
  id: string;
  text: string;
  type: "behavioral" | "technical" | "coding" | "case-study" | "system-design";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  timeLimit?: number;
  hints?: string[];
  sampleAnswer?: string;
  followUps?: string[];
  isBookmarked: boolean;
  userAttempts: number;
  lastScore?: number;
}

interface PracticeSession {
  id: string;
  title: string;
  description: string;
  questionsCount: number;
  estimatedTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "focused" | "comprehensive" | "custom";
  questions: string[];
  progress: number;
  isCompleted: boolean;
}

export default function PracticeInterview() {
  const { data: session } = useSession();
  const [selectedQuestion, setSelectedQuestion] =
    useState<PracticeQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [showHints, setShowHints] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<
    PracticeQuestion[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/questions?questionType=${selectedType}&difficulty=${selectedDifficulty}`
        );

        if (!response.ok) throw new Error("Failed to fetch questions");

        const data = await response.json();

        // Transform API data to match PracticeQuestion interface
        const transformedQuestions: PracticeQuestion[] = data.map(
          (item: any) => ({
            id: item.id,
            text: item.question,
            type: item.questionType,
            difficulty: item.difficulty,
            category: item.template.category,
            tags: [], // Can be extended from template tags
            timeLimit: item.timeLimit,
            hints: [], // Can be parsed from evaluationCriteria
            sampleAnswer: item.expectedAnswer,
            followUps: [], // Can be extended in schema
            isBookmarked: false, // Can be extended with user bookmarks
            userAttempts: item.responses.length,
            lastScore: item.responses[0]?.aiScore,
          })
        );

        setPracticeQuestions(transformedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchQuestions();
    }
  }, [session, selectedType, selectedDifficulty]);

  const practiceSessions: PracticeSession[] = [
    {
      id: "1",
      title: "FAANG Behavioral Bootcamp",
      description:
        "Practice common behavioral questions asked at top tech companies",
      questionsCount: 12,
      estimatedTime: 90,
      difficulty: "intermediate",
      type: "focused",
      questions: ["1", "3", "5"],
      progress: 75,
      isCompleted: false,
    },
    {
      id: "2",
      title: "System Design Fundamentals",
      description: "Master the basics of system design interviews",
      questionsCount: 8,
      estimatedTime: 120,
      difficulty: "advanced",
      type: "focused",
      questions: ["3", "7", "9"],
      progress: 25,
      isCompleted: false,
    },
    {
      id: "3",
      title: "Coding Interview Prep",
      description: "Solve algorithmic challenges with optimal time complexity",
      questionsCount: 15,
      estimatedTime: 180,
      difficulty: "intermediate",
      type: "focused",
      questions: ["2", "4", "6"],
      progress: 100,
      isCompleted: true,
    },
  ];

  const questionTypes = [
    {
      value: "behavioral",
      label: "Behavioral",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      value: "technical",
      label: "Technical",
      icon: Brain,
      color: "text-green-500",
    },
    { value: "coding", label: "Coding", icon: Code, color: "text-purple-500" },
    {
      value: "system-design",
      label: "System Design",
      icon: BarChart3,
      color: "text-orange-500",
    },
    {
      value: "case-study",
      label: "Case Study",
      icon: FileText,
      color: "text-red-500",
    },
  ];

  const filteredQuestions = practiceQuestions.filter((question) => {
    const matchesSearch =
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || question.type === selectedType;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      question.difficulty === selectedDifficulty;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getSessionDifficultyColor = (difficulty: string) => {
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
    const typeConfig = questionTypes.find((t) => t.value === type);
    const Icon = typeConfig?.icon || MessageSquare;
    return <Icon className={cn("w-4 h-4", typeConfig?.color)} />;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startPractice = (question: PracticeQuestion) => {
    setSelectedQuestion(question);
    setCurrentAnswer("");
    setSessionTime(0);
    setIsActive(true);
    setShowHints(false);
    setShowSampleAnswer(false);
  };

  const submitAnswer = () => {
    if (selectedQuestion && currentAnswer.trim()) {
      // Simulate scoring
      const score = Math.floor(Math.random() * 20) + 80; // Random score between 80-100
      console.log(
        "Submitted answer for question:",
        selectedQuestion.id,
        "Score:",
        score
      );

      // Update question attempts and score
      selectedQuestion.userAttempts += 1;
      selectedQuestion.lastScore = score;

      setIsActive(false);
      alert(
        `Great job! Your answer scored ${score}/100. Keep practicing to improve!`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Practice Interview
              </h1>
              <p className="text-muted-foreground mt-2">
                Guided practice sessions with comprehensive question banks and
                improvement tracking
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Custom Session
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
                      Questions Practiced
                    </p>
                    <p className="text-2xl font-bold text-green-600">127</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
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
                    <p className="text-2xl font-bold text-blue-600">84%</p>
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
                      Practice Hours
                    </p>
                    <p className="text-2xl font-bold text-purple-600">45</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Streak Days</p>
                    <p className="text-2xl font-bold text-orange-600">12</p>
                  </div>
                  <Award className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedContainer>

        {/* Active Practice Session */}
        {selectedQuestion && (
          <AnimatedContainer delay={0.2}>
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span>Active Practice Session</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-mono">
                      {formatTime(sessionTime)}
                    </div>
                    {selectedQuestion.timeLimit && (
                      <div className="text-sm text-muted-foreground">
                        / {formatTime(selectedQuestion.timeLimit)}
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(selectedQuestion.type)}
                    <Badge
                      className={cn(
                        "text-xs",
                        getDifficultyColor(selectedQuestion.difficulty)
                      )}
                    >
                      {selectedQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline">{selectedQuestion.category}</Badge>
                    {selectedQuestion.isBookmarked && (
                      <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                    <p className="text-lg leading-relaxed">
                      {selectedQuestion.text}
                    </p>
                  </div>
                </div>

                {/* Answer Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Your Answer:</label>
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
                        <Mic className="w-4 h-4 mr-2" />
                        Voice Input
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here... Use the STAR method for behavioral questions or break down your approach for technical questions."
                    className="min-h-[200px]"
                  />

                  {showHints && selectedQuestion.hints && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2">
                      <div className="font-medium text-blue-700 dark:text-blue-300">
                        Hints:
                      </div>
                      <ul className="space-y-1">
                        {selectedQuestion.hints.map((hint, index) => (
                          <li
                            key={index}
                            className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2"
                          >
                            <Lightbulb className="w-3 h-3 mt-1 text-blue-500" />
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Back to Questions
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showSampleAnswer ? "Hide" : "Show"} Sample Answer
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Flag className="w-4 h-4 mr-2" />
                      Save for Later
                    </Button>
                    <Button
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim()}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit Answer
                    </Button>
                  </div>
                </div>

                {showSampleAnswer && selectedQuestion.sampleAnswer && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                    <div className="font-medium text-green-700 dark:text-green-300 mb-2">
                      Sample Answer Guidelines:
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {selectedQuestion.sampleAnswer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Practice Sessions */}
          <div className="space-y-6">
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Practice Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practiceSessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="space-y-3 p-4 rounded-lg border"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{session.title}</h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              getSessionDifficultyColor(session.difficulty)
                            )}
                          >
                            {session.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{session.questionsCount} questions</span>
                        <span>{session.estimatedTime} min</span>
                      </div>

                      <Button
                        variant={session.isCompleted ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                      >
                        {session.isCompleted ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Review Session
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {session.progress > 0 ? "Continue" : "Start"}{" "}
                            Session
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Question Bank */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Question Bank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search questions, categories, or tags..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">All Types</option>
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Questions List */}
            <StaggeredContainer className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <StaggeredItem key={question.id}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(question.type)}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="capitalize text-xs"
                                >
                                  {question.type.replace("-", " ")}
                                </Badge>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    getDifficultyColor(question.difficulty)
                                  )}
                                >
                                  {question.difficulty}
                                </Badge>
                                {question.isBookmarked && (
                                  <Bookmark className="w-3 h-3 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {question.category}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {question.timeLimit && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Timer className="w-3 h-3" />
                                {Math.floor(question.timeLimit / 60)}min
                              </div>
                            )}
                            <Button
                              onClick={() => startPractice(question)}
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Practice
                            </Button>
                          </div>
                        </div>

                        {/* Question Preview */}
                        <p className="text-sm leading-relaxed line-clamp-2">
                          {question.text}
                        </p>

                        {/* Stats & Tags */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Attempts: {question.userAttempts}</span>
                            {question.lastScore && (
                              <span>Last Score: {question.lastScore}%</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {question.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                #{tag}
                              </Badge>
                            ))}
                            {question.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{question.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggeredItem>
              ))}
            </StaggeredContainer>

            {filteredQuestions.length === 0 && (
              <AnimatedContainer delay={0.5}>
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No questions found matching your criteria.</p>
                      <p className="text-sm mt-1">
                        Try adjusting your filters or search terms.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
