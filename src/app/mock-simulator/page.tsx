"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Brain,
  Clock,
  Target,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  BarChart3,
  Settings,
  Star,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";
import { useAiQuestions } from "@/hooks/use-ai-questions";
import { AIFeedback } from "@/components/interview/ai-feedback";

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  hints: string[];
  followUpQuestions: string[];
}

interface SimulationSettings {
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  duration: number;
  questionTypes: string[];
  aiPersonality: "Professional" | "Friendly" | "Challenging" | "Supportive";
  realTimeAnalysis: boolean;
  voiceEnabled: boolean;
  videoEnabled: boolean;
}

interface PerformanceMetrics {
  responseTime: number;
  confidenceLevel: number;
  clarityScore: number;
  technicalAccuracy: number;
  communicationScore: number;
  overallRating: number;
}

export default function MockSimulatorPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    confidenceLevel: 0,
    clarityScore: 0,
    technicalAccuracy: 0,
    communicationScore: 0,
    overallRating: 0,
  });

  const [settings, setSettings] = useState<SimulationSettings>({
    difficulty: "Intermediate",
    duration: 30,
    questionTypes: ["Technical", "Behavioral", "Problem Solving"],
    aiPersonality: "Professional",
    realTimeAnalysis: true,
    voiceEnabled: true,
    videoEnabled: true,
  });

  const [showSettings, setShowSettings] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const {
    generateQuestions,
    loading: aiLoading,
    error: aiError,
  } = useAiQuestions();

  // Generate questions using AI when simulation starts
  const generateAiQuestions = async () => {
    setGeneratingQuestions(true);
    setQuestionError(null);

    try {
      const count =
        settings.duration === 15 ? 3 : settings.duration === 30 ? 5 : 8;
      const category = settings.questionTypes[0] || "Technical";
      const difficulty = settings.difficulty;

      const aiQuestions = await generateQuestions({
        role: category,
        skillLevel: difficulty,
        count,
      });

      if (aiQuestions && aiQuestions.length > 0) {
        // Transform AI questions to match our Question interface
        const transformedQuestions: Question[] = aiQuestions.map(
          (q, index) => ({
            id: (index + 1).toString(),
            text: q.text,
            category: q.category,
            difficulty: (q.difficulty.charAt(0).toUpperCase() +
              q.difficulty.slice(1)) as "Easy" | "Medium" | "Hard",
            timeLimit: 300, // 5 minutes per question
            hints: [],
            followUpQuestions: [],
          })
        );

        setQuestions(transformedQuestions);
        return true;
      } else {
        setQuestionError("Failed to generate questions. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setQuestionError("An error occurred while generating questions.");
      return false;
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const startSimulation = async () => {
    // Generate questions first
    const success = await generateAiQuestions();

    if (!success || questions.length === 0) {
      return; // Don't start simulation if question generation failed
    }
    setIsSimulating(true);
    setShowSettings(false);
    setCurrentQuestion(questions[0]);
    setQuestionIndex(0);
    setTimeRemaining(questions[0].timeLimit);
    setResponse("");
    setMetrics({
      responseTime: 0,
      confidenceLevel: 0,
      clarityScore: 0,
      technicalAccuracy: 0,
      communicationScore: 0,
      overallRating: 0,
    });
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setShowSettings(true);
    setCurrentQuestion(null);
    setIsRecording(false);
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setTimeRemaining(questions[nextIndex].timeLimit);
      setResponse("");

      // Simulate performance metrics update
      setMetrics(() => ({
        responseTime: Math.random() * 60 + 30,
        confidenceLevel: Math.random() * 40 + 60,
        clarityScore: Math.random() * 30 + 70,
        technicalAccuracy: Math.random() * 25 + 75,
        communicationScore: Math.random() * 20 + 80,
        overallRating: Math.random() * 15 + 85,
      }));
    } else {
      stopSimulation();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isSimulating) {
      nextQuestion();
    }
    return () => clearTimeout(timer);
  }, [isSimulating, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI Mock Interview Simulator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Practice with AI-powered realistic interview scenarios
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Brain className="w-4 h-4 mr-2" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Target className="w-4 h-4 mr-2" />
                Real-time Analysis
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        {/* Error Display */}
        {questionError && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {questionError}
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <AnimatedContainer delay={0.1}>
            <Card className="mb-8 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configure Your Interview Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label>Interview Duration</Label>
                  <Select
                    value={settings.duration.toString()}
                    onValueChange={(value: string) =>
                      setSettings({ ...settings, duration: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">
                        15 minutes (3 questions)
                      </SelectItem>
                      <SelectItem value="30">
                        30 minutes (5 questions)
                      </SelectItem>
                      <SelectItem value="45">
                        45 minutes (8 questions)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={settings.difficulty}
                    onValueChange={(value: string) =>
                      setSettings({
                        ...settings,
                        difficulty: value as SimulationSettings["difficulty"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">
                        Beginner - Entry Level
                      </SelectItem>
                      <SelectItem value="Intermediate">
                        Intermediate - Mid Level
                      </SelectItem>
                      <SelectItem value="Advanced">
                        Advanced - Senior Level
                      </SelectItem>
                      <SelectItem value="Expert">
                        Expert - Leadership
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Button */}
                <div className="pt-4">
                  <Button
                    onClick={startSimulation}
                    disabled={generatingQuestions}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    size="lg"
                  >
                    {generatingQuestions ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Generating AI Questions...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start AI Mock Interview
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}

        {/* Interview In Progress */}
        {isSimulating && currentQuestion && (
          <StaggeredContainer className="grid lg:grid-cols-3 gap-6">
            {/* Main Interview Area */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Question {questionIndex + 1} of {questions.length}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getDifficultyColor(
                          currentQuestion.difficulty
                        )}
                      >
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {currentQuestion.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentQuestion.id}
                    className="space-y-4"
                  >
                    <p className="text-lg leading-relaxed">
                      {currentQuestion.text}
                    </p>

                    {/* Timer */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Time Remaining: {formatTime(timeRemaining)}
                        </span>
                      </div>
                      <Progress
                        value={
                          (timeRemaining / currentQuestion.timeLimit) * 100
                        }
                        className="flex-1"
                      />
                    </div>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Response Area */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Your Response</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={audioEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAudioEnabled(!audioEnabled)}
                      >
                        {audioEnabled ? (
                          <Mic className="w-4 h-4" />
                        ) : (
                          <MicOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant={videoEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setVideoEnabled(!videoEnabled)}
                      >
                        {videoEnabled ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <VideoOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant={isRecording ? "destructive" : "default"}
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {isRecording ? "Stop" : "Record"}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Type your response here or use voice recording..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-[200px] text-base"
                  />

                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={stopSimulation}>
                      <Square className="w-4 h-4 mr-2" />
                      End Interview
                    </Button>
                    <Button
                      onClick={nextQuestion}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      {questionIndex < questions.length - 1
                        ? "Next Question"
                        : "Finish Interview"}
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Real-time Analytics */}
            <div className="space-y-6">
              {/* Performance Metrics */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Real-time Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence Level</span>
                      <span>{Math.round(metrics.confidenceLevel)}%</span>
                    </div>
                    <Progress value={metrics.confidenceLevel} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clarity Score</span>
                      <span>{Math.round(metrics.clarityScore)}%</span>
                    </div>
                    <Progress value={metrics.clarityScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Communication</span>
                      <span>{Math.round(metrics.communicationScore)}%</span>
                    </div>
                    <Progress
                      value={metrics.communicationScore}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Rating</span>
                      <span>{Math.round(metrics.overallRating)}%</span>
                    </div>
                    <Progress value={metrics.overallRating} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* AI Hints */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Hints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentQuestion.hints.map((hint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Zap className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {hint}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Progress */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Session Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Questions Completed</span>
                      <span>
                        {questionIndex} / {questions.length}
                      </span>
                    </div>
                    <Progress
                      value={(questionIndex / questions.length) * 100}
                    />

                    <div className="flex justify-between text-sm">
                      <span>Session Time</span>
                      <span>
                        {formatTime((questionIndex + 1) * 300 - timeRemaining)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggeredContainer>
        )}
      </div>
    </div>
  );
}
