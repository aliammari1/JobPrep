"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Target,
  Star,
  Clock,
  TrendingUp,
  Award,
  Zap,
  CheckCircle,
  AlertTriangle,
  Users,
  Code,
  MessageSquare,
  Mic,
  Camera,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Gauge,
  Trophy,
  Calendar,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Play,
  Pause,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";

interface SkillArea {
  id: string;
  name: string;
  category: "technical" | "soft" | "leadership" | "domain";
  description: string;
  importance: "critical" | "important" | "nice-to-have";
  testTypes: string[];
  averageScore: number;
  benchmarkScore: number;
  trend: "up" | "down" | "stable";
  assessmentCount: number;
}

interface AssessmentResult {
  id: string;
  candidateId: string;
  candidateName: string;
  skillId: string;
  skillName: string;
  score: number;
  maxScore: number;
  completedAt: Date;
  timeSpent: number;
  testType: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface SkillTest {
  id: string;
  name: string;
  description: string;
  skillArea: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  duration: number;
  questionCount: number;
  testType: "multiple-choice" | "coding" | "practical" | "scenario";
  isActive: boolean;
  completionRate: number;
  averageScore: number;
}

export default function SkillAssessmentPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [isAssessing, setIsAssessing] = useState(false);

  const [skillAreas] = useState<SkillArea[]>([
    {
      id: "frontend",
      name: "Frontend Development",
      category: "technical",
      description: "React, Vue, Angular, CSS, JavaScript expertise",
      importance: "critical",
      testTypes: ["coding", "multiple-choice", "practical"],
      averageScore: 78,
      benchmarkScore: 75,
      trend: "up",
      assessmentCount: 145,
    },
    {
      id: "backend",
      name: "Backend Development",
      category: "technical",
      description: "Node.js, Python, Java, Database design",
      importance: "critical",
      testTypes: ["coding", "practical"],
      averageScore: 82,
      benchmarkScore: 80,
      trend: "up",
      assessmentCount: 123,
    },
    {
      id: "communication",
      name: "Communication Skills",
      category: "soft",
      description: "Verbal, written, presentation abilities",
      importance: "important",
      testTypes: ["scenario", "practical"],
      averageScore: 85,
      benchmarkScore: 83,
      trend: "stable",
      assessmentCount: 198,
    },
    {
      id: "problem-solving",
      name: "Problem Solving",
      category: "soft",
      description: "Analytical thinking, creative solutions",
      importance: "critical",
      testTypes: ["scenario", "coding", "multiple-choice"],
      averageScore: 74,
      benchmarkScore: 78,
      trend: "down",
      assessmentCount: 156,
    },
    {
      id: "leadership",
      name: "Leadership",
      category: "leadership",
      description: "Team management, decision making",
      importance: "important",
      testTypes: ["scenario", "practical"],
      averageScore: 79,
      benchmarkScore: 76,
      trend: "up",
      assessmentCount: 89,
    },
    {
      id: "product-knowledge",
      name: "Product Knowledge",
      category: "domain",
      description: "Industry-specific expertise",
      importance: "nice-to-have",
      testTypes: ["multiple-choice", "scenario"],
      averageScore: 71,
      benchmarkScore: 70,
      trend: "stable",
      assessmentCount: 67,
    },
  ]);

  const [skillTests] = useState<SkillTest[]>([
    {
      id: "react-advanced",
      name: "Advanced React Assessment",
      description: "Complex React patterns, hooks, performance optimization",
      skillArea: "frontend",
      difficulty: "Advanced",
      duration: 90,
      questionCount: 25,
      testType: "coding",
      isActive: true,
      completionRate: 78,
      averageScore: 76,
    },
    {
      id: "node-api",
      name: "Node.js API Development",
      description: "RESTful APIs, Express.js, database integration",
      skillArea: "backend",
      difficulty: "Intermediate",
      duration: 75,
      questionCount: 20,
      testType: "practical",
      isActive: true,
      completionRate: 85,
      averageScore: 82,
    },
    {
      id: "communication-scenarios",
      name: "Communication Scenarios",
      description: "Client interaction, team collaboration scenarios",
      skillArea: "communication",
      difficulty: "Intermediate",
      duration: 45,
      questionCount: 15,
      testType: "scenario",
      isActive: true,
      completionRate: 92,
      averageScore: 87,
    },
    {
      id: "algorithm-design",
      name: "Algorithm Design Challenge",
      description: "Complex algorithmic problem solving",
      skillArea: "problem-solving",
      difficulty: "Expert",
      duration: 120,
      questionCount: 8,
      testType: "coding",
      isActive: true,
      completionRate: 64,
      averageScore: 71,
    },
  ]);

  const [recentResults] = useState<AssessmentResult[]>([
    {
      id: "1",
      candidateId: "cand1",
      candidateName: "Alice Johnson",
      skillId: "frontend",
      skillName: "Frontend Development",
      score: 85,
      maxScore: 100,
      completedAt: new Date("2024-01-20"),
      timeSpent: 87,
      testType: "coding",
      feedback:
        "Excellent React knowledge with strong performance optimization skills",
      strengths: [
        "React Hooks",
        "Performance Optimization",
        "Component Design",
      ],
      improvements: ["Testing", "Accessibility"],
    },
    {
      id: "2",
      candidateId: "cand2",
      candidateName: "Bob Chen",
      skillId: "backend",
      skillName: "Backend Development",
      score: 78,
      maxScore: 100,
      completedAt: new Date("2024-01-19"),
      timeSpent: 72,
      testType: "practical",
      feedback: "Strong API design skills with good database knowledge",
      strengths: ["API Design", "Database Optimization", "Security"],
      improvements: ["Caching", "Microservices"],
    },
  ]);

  const getSkillCategoryColor = (category: string) => {
    switch (category) {
      case "technical":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900";
      case "soft":
        return "text-green-600 bg-green-100 dark:bg-green-900";
      case "leadership":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900";
      case "domain":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900";
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "text-red-600";
      case "important":
        return "text-yellow-600";
      case "nice-to-have":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case "stable":
        return <Activity className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "Expert":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredTests = skillTests.filter((test) => {
    if (selectedSkill !== "all" && test.skillArea !== selectedSkill)
      return false;
    if (selectedDifficulty !== "all" && test.difficulty !== selectedDifficulty)
      return false;
    if (selectedTestType !== "all" && test.testType !== selectedTestType)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950 dark:via-purple-950 dark:to-indigo-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Skill Assessment Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive skill evaluation and development tracking
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Target className="w-4 h-4 mr-2" />
                {skillAreas.length} Skill Areas
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Brain className="w-4 h-4 mr-2" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        {/* Quick Stats */}
        <StaggeredContainer>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                    <Target className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Active Tests
                    </p>
                    <p className="text-lg font-semibold">
                      {skillTests.filter((t) => t.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assessments
                    </p>
                    <p className="text-lg font-semibold">
                      {skillAreas.reduce(
                        (sum, skill) => sum + skill.assessmentCount,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avg. Score
                    </p>
                    <p className="text-lg font-semibold">
                      {Math.round(
                        skillAreas.reduce(
                          (sum, skill) => sum + skill.averageScore,
                          0
                        ) / skillAreas.length
                      )}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Gauge className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completion Rate
                    </p>
                    <p className="text-lg font-semibold">
                      {Math.round(
                        skillTests.reduce(
                          (sum, test) => sum + test.completionRate,
                          0
                        ) / skillTests.length
                      )}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggeredContainer>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Skill Areas Grid */}
                <StaggeredContainer>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skillAreas.map((skill, index) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-xl transition-all">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {skill.name}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {getTrendIcon(skill.trend)}
                                <Badge
                                  className={getSkillCategoryColor(
                                    skill.category
                                  )}
                                >
                                  {skill.category}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {skill.description}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Performance</span>
                                  <span>
                                    {skill.averageScore}% vs{" "}
                                    {skill.benchmarkScore}% benchmark
                                  </span>
                                </div>
                                <Progress
                                  value={skill.averageScore}
                                  className="h-2"
                                />
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <span
                                  className={`flex items-center gap-1 ${getImportanceColor(
                                    skill.importance
                                  )}`}
                                >
                                  <Star className="w-3 h-3" />
                                  {skill.importance}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {skill.assessmentCount} assessments
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {skill.testTypes.map((type) => (
                                  <Badge
                                    key={type}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {type}
                                  </Badge>
                                ))}
                              </div>

                              <Button size="sm" className="w-full">
                                <Play className="w-4 h-4 mr-2" />
                                Start Assessment
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </StaggeredContainer>
              </TabsContent>

              <TabsContent value="assessments" className="space-y-6">
                {/* Filters */}
                <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters:</span>
                      </div>
                      <Select
                        value={selectedSkill}
                        onValueChange={setSelectedSkill}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select skill area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Skills</SelectItem>
                          {skillAreas.map((skill) => (
                            <SelectItem key={skill.id} value={skill.id}>
                              {skill.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedDifficulty}
                        onValueChange={setSelectedDifficulty}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedTestType}
                        onValueChange={setSelectedTestType}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Test Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="multiple-choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="coding">Coding</SelectItem>
                          <SelectItem value="practical">Practical</SelectItem>
                          <SelectItem value="scenario">Scenario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Tests */}
                <StaggeredContainer>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTests.map((test, index) => (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {test.name}
                              </CardTitle>
                              <Badge
                                className={getDifficultyColor(test.difficulty)}
                              >
                                {test.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {test.description}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                  <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {test.duration}m
                                  </p>
                                </div>
                                <div className="text-center">
                                  <MessageSquare className="w-4 h-4 mx-auto mb-1 text-green-500" />
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {test.questionCount} questions
                                  </p>
                                </div>
                                <div className="text-center">
                                  <CheckCircle className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {test.completionRate}% complete
                                  </p>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Average Score</span>
                                  <span>{test.averageScore}%</span>
                                </div>
                                <Progress
                                  value={test.averageScore}
                                  className="h-2"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {test.testType.replace("-", " ")}
                                </Badge>
                                {test.isActive ? (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </div>

                              <Button
                                className="w-full"
                                disabled={!test.isActive}
                                onClick={() => setIsAssessing(true)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Assessment
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </StaggeredContainer>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                {/* Recent Results */}
                <StaggeredContainer>
                  <div className="space-y-4">
                    {recentResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {result.candidateName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {result.skillName}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-violet-600">
                                  {result.score}/{result.maxScore}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {Math.round(
                                    (result.score / result.maxScore) * 100
                                  )}
                                  %
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">
                                  {result.timeSpent} minutes
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="text-sm">
                                  {result.completedAt.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-500" />
                                <span className="text-sm capitalize">
                                  {result.testType.replace("-", " ")}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <Progress
                                value={(result.score / result.maxScore) * 100}
                                className="h-3"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  Strengths
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {result.strengths.map((strength) => (
                                    <Badge
                                      key={strength}
                                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    >
                                      {strength}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Improvements
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {result.improvements.map((improvement) => (
                                    <Badge
                                      key={improvement}
                                      className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                    >
                                      {improvement}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <h4 className="font-medium mb-2">AI Feedback</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {result.feedback}
                              </p>
                            </div>

                            <div className="flex justify-end mt-4 gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </StaggeredContainer>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Skill Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {skillAreas.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-violet-500 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (skill.assessmentCount / 200) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                                {skill.assessmentCount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Performance Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {skillAreas.slice(0, 4).map((skill) => (
                          <div key={skill.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{skill.name}</span>
                              <span>{skill.averageScore}%</span>
                            </div>
                            <Progress
                              value={skill.averageScore}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
