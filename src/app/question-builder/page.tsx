"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  Plus,
  Search,
  Filter,
  Wand2,
  Target,
  Clock,
  Users,
  Code,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  Lightbulb,
  Zap,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";
import { useAiQuestions } from "@/hooks/use-ai-questions";

interface Question {
  id: string;
  text: string;
  type: "behavioral" | "technical" | "coding" | "system-design";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  timeLimit?: number;
  aiGenerated: boolean;
}

export default function SmartQuestionBuilder() {
  const {
    generateQuestions,
    loading: aiLoading,
    error: aiError,
  } = useAiQuestions();

  const [questions, setQuestions] = useState<Question[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSettings, setAiSettings] = useState({
    questionCount: [5],
    difficulty: "medium",
    includeFollowups: true,
    adaptiveDifficulty: true,
    personalizeToRole: true,
  });

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
  ];

  const difficultyLevels = [
    { value: "easy", label: "Easy", color: "bg-green-100 text-green-800" },
    {
      value: "medium",
      label: "Medium",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "hard", label: "Hard", color: "bg-red-100 text-red-800" },
  ];

  const categories = [
    "Problem Solving",
    "Leadership",
    "Communication",
    "Technical Skills",
    "Algorithms",
    "Data Structures",
    "System Architecture",
    "Teamwork",
    "Innovation",
    "Customer Focus",
    "Adaptability",
  ];

  const generateAIQuestions = async () => {
    if (!aiPrompt.trim()) {
      alert("Please describe your interview focus");
      return;
    }

    try {
      const aiQuestions = await generateQuestions({
        role: aiPrompt,
        skillLevel: aiSettings.difficulty,
        count: aiSettings.questionCount[0],
        focus: aiPrompt,
      });

      // Map AI generated questions to our format
      const newQuestions: Question[] = aiQuestions.map((q) => ({
        id: Date.now().toString() + Math.random(),
        text: q.text,
        type:
          q.category === "technical"
            ? "technical"
            : q.category === "behavioral"
            ? "behavioral"
            : "technical",
        difficulty: q.difficulty,
        category: q.category.charAt(0).toUpperCase() + q.category.slice(1),
        tags: [q.category, q.difficulty],
        timeLimit:
          q.difficulty === "hard" ? 30 : q.difficulty === "medium" ? 15 : 10,
        aiGenerated: true,
      }));

      setQuestions((prev) => [...newQuestions, ...prev]);
      setAiPrompt("");
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert(
        "Failed to generate questions. Please check your OpenAI API key in .env.local"
      );
    }
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const getTypeIcon = (type: string) => {
    const typeConfig = questionTypes.find((t) => t.value === type);
    const Icon = typeConfig?.icon || MessageSquare;
    return <Icon className={cn("w-4 h-4", typeConfig?.color)} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Smart Question Builder
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered question generation and intelligent interview design
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Manual
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Question Generator */}
          <AnimatedContainer delay={0.1} className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-500" />
                  AI Question Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Describe your interview focus</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Frontend React developer with 3-5 years experience, focusing on component architecture and state management..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Number of Questions: {aiSettings.questionCount[0]}
                    </Label>
                    <Slider
                      value={aiSettings.questionCount}
                      onValueChange={(value) =>
                        setAiSettings((prev) => ({
                          ...prev,
                          questionCount: value,
                        }))
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select
                      value={aiSettings.difficulty}
                      onValueChange={(value) =>
                        setAiSettings((prev) => ({
                          ...prev,
                          difficulty: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="followups">
                        Include Follow-up Questions
                      </Label>
                      <Switch
                        id="followups"
                        checked={aiSettings.includeFollowups}
                        onCheckedChange={(checked) =>
                          setAiSettings((prev) => ({
                            ...prev,
                            includeFollowups: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="adaptive">Adaptive Difficulty</Label>
                      <Switch
                        id="adaptive"
                        checked={aiSettings.adaptiveDifficulty}
                        onCheckedChange={(checked) =>
                          setAiSettings((prev) => ({
                            ...prev,
                            adaptiveDifficulty: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="personalize">Personalize to Role</Label>
                      <Switch
                        id="personalize"
                        checked={aiSettings.personalizeToRole}
                        onCheckedChange={(checked) =>
                          setAiSettings((prev) => ({
                            ...prev,
                            personalizeToRole: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generateAIQuestions}
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                >
                  {aiLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>

                {/* Error Display */}
                {aiError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Failed to generate questions
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {aiError}. Please check your OpenAI API key in
                        .env.local
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      AI Insights
                    </span>
                  </div>
                  <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
                    <li>
                      • Mix behavioral and technical questions for balance
                    </li>
                    <li>
                      • Include scenario-based questions for practical
                      assessment
                    </li>
                    <li>• Consider adding time-boxed coding challenges</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Questions Library */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Question Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search questions, tags, or categories..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Question Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedDifficulty}
                      onValueChange={setSelectedDifficulty}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Questions List */}
            <StaggeredContainer className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <StaggeredItem key={question.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(question.type)}
                            <div>
                              <Badge
                                variant="outline"
                                className="capitalize text-xs"
                              >
                                {question.type.replace("-", " ")}
                              </Badge>
                              <Badge
                                className={cn(
                                  "ml-2 text-xs",
                                  getDifficultyColor(question.difficulty)
                                )}
                              >
                                {question.difficulty}
                              </Badge>
                              {question.aiGenerated && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Generated
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {question.timeLimit && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {question.timeLimit}min
                              </div>
                            )}
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="text-sm leading-relaxed">
                          {question.text}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Category:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {question.category}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1">
                            {question.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs opacity-70"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggeredItem>
              ))}
            </StaggeredContainer>

            {filteredQuestions.length === 0 && (
              <AnimatedContainer delay={0.3}>
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No questions found matching your criteria.</p>
                      <p className="text-sm mt-1">
                        Try adjusting your filters or generate new questions
                        with AI.
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
