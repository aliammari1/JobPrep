"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Users,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
  Brain,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Send,
  Plus,
  Filter,
  Search,
  Download,
  Share2,
  Calendar,
  User,
  Award,
  Activity,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Vote,
  Scale,
  Handshake,
  Workflow,
  MessageCircle,
  Edit,
  Save,
  RefreshCw,
  Settings,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";

interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: "technical" | "hr" | "manager" | "peer" | "senior";
  avatar?: string;
  isOnline: boolean;
  hasSubmitted: boolean;
  weight: number;
  expertise: string[];
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  type: "numeric" | "rating" | "text" | "boolean";
  category: "technical" | "soft" | "cultural" | "leadership";
}

interface InterviewerScore {
  interviewerId: string;
  criteriaId: string;
  score: number;
  comment: string;
  confidence: number;
  lastUpdated: Date;
}

interface Evaluation {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  interviewDate: Date;
  status:
    | "pending"
    | "in-progress"
    | "review"
    | "completed"
    | "consensus-needed";
  interviewers: Interviewer[];
  criteria: EvaluationCriteria[];
  scores: InterviewerScore[];
  consensus: {
    reached: boolean;
    finalScore: number;
    notes: string;
    decidedBy: string;
    decidedAt?: Date;
  };
  discussions: Discussion[];
  overallRecommendation: "hire" | "no-hire" | "pending" | null;
}

interface Discussion {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  type: "comment" | "question" | "concern" | "highlight";
  timestamp: Date;
  replies: DiscussionReply[];
  reactions: { [emoji: string]: string[] };
}

interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
}

export default function CollaborativeEvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUserId] = useState("user1");
  const [newComment, setNewComment] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showConsensusModal, setShowConsensusModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await fetch("/api/interviews?status=completed");
        if (response.ok) {
          const data = await response.json();
          const transformedEvaluations = (data.interviews || []).map(
            (interview: any) => ({
              id: interview.id,
              candidateId: interview.candidateId || interview.id,
              candidateName: interview.candidateName || "Anonymous",
              position: interview.title || "Position",
              interviewDate: new Date(interview.createdAt),
              status: "completed" as const,
              interviewers: [],
              criteria: mockCriteria,
              scores: [],
              consensus: {
                reached: true,
                finalScore: interview.score || 0,
                notes: interview.notes || "",
                decidedBy: "System",
              },
              discussions: [],
            })
          );
          setEvaluations(transformedEvaluations);
        } else {
          setEvaluations(mockEvaluations);
        }
      } catch (error) {
        setEvaluations(mockEvaluations);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  // Mock data
  const mockCriteria: EvaluationCriteria[] = [
    {
      id: "tech-skills",
      name: "Technical Skills",
      description: "Programming ability, system design, problem-solving",
      weight: 30,
      maxScore: 100,
      type: "numeric",
      category: "technical",
    },
    {
      id: "communication",
      name: "Communication",
      description: "Clarity, articulation, listening skills",
      weight: 20,
      maxScore: 100,
      type: "numeric",
      category: "soft",
    },
    {
      id: "problem-solving",
      name: "Problem Solving",
      description: "Analytical thinking, creativity, approach to challenges",
      weight: 25,
      maxScore: 100,
      type: "numeric",
      category: "technical",
    },
    {
      id: "cultural-fit",
      name: "Cultural Fit",
      description: "Alignment with company values and team dynamics",
      weight: 15,
      maxScore: 100,
      type: "numeric",
      category: "cultural",
    },
    {
      id: "leadership",
      name: "Leadership Potential",
      description: "Initiative, mentoring ability, decision making",
      weight: 10,
      maxScore: 100,
      type: "numeric",
      category: "leadership",
    },
  ];

  const mockEvaluations: Evaluation[] = [
    {
      id: "1",
      candidateId: "cand1",
      candidateName: "Alice Johnson",
      position: "Senior Frontend Developer",
      interviewDate: new Date("2024-01-20T10:00:00"),
      status: "consensus-needed",
      interviewers: [
        {
          id: "int1",
          name: "Sarah Chen",
          email: "sarah@company.com",
          role: "technical",
          isOnline: true,
          hasSubmitted: true,
          weight: 1.0,
          expertise: ["React", "JavaScript", "System Design"],
        },
        {
          id: "int2",
          name: "Mike Rodriguez",
          email: "mike@company.com",
          role: "manager",
          isOnline: false,
          hasSubmitted: true,
          weight: 1.2,
          expertise: ["Leadership", "Team Management"],
        },
        {
          id: "int3",
          name: "Emily Zhang",
          email: "emily@company.com",
          role: "hr",
          isOnline: true,
          hasSubmitted: false,
          weight: 0.8,
          expertise: ["Cultural Fit", "Communication"],
        },
      ],
      criteria: mockCriteria,
      scores: [
        {
          interviewerId: "int1",
          criteriaId: "tech-skills",
          score: 85,
          comment: "Strong React knowledge, excellent problem-solving approach",
          confidence: 90,
          lastUpdated: new Date("2024-01-20T11:30:00"),
        },
        {
          interviewerId: "int2",
          criteriaId: "leadership",
          score: 75,
          comment:
            "Shows good initiative, needs more experience in team leading",
          confidence: 80,
          lastUpdated: new Date("2024-01-20T12:00:00"),
        },
      ],
      consensus: {
        reached: false,
        finalScore: 0,
        notes: "",
        decidedBy: "",
      },
      discussions: [
        {
          id: "disc1",
          authorId: "int1",
          authorName: "Sarah Chen",
          content:
            "Alice demonstrated excellent technical skills. Her approach to the React optimization problem was particularly impressive.",
          type: "highlight",
          timestamp: new Date("2024-01-20T11:45:00"),
          replies: [
            {
              id: "reply1",
              authorId: "int2",
              authorName: "Mike Rodriguez",
              content:
                "I agree, but I'm slightly concerned about her leadership experience for a senior role.",
              timestamp: new Date("2024-01-20T12:15:00"),
            },
          ],
          reactions: { "👍": ["int2"], "🤔": ["int3"] },
        },
      ],
      overallRecommendation: null,
    },
  ];

  useEffect(() => {
    setEvaluations(mockEvaluations);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
      case "in-progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "review":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "consensus-needed":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "technical":
        return <Brain className="w-4 h-4" />;
      case "manager":
        return <Users className="w-4 h-4" />;
      case "hr":
        return <Handshake className="w-4 h-4" />;
      case "peer":
        return <User className="w-4 h-4" />;
      case "senior":
        return <Award className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const calculateAverageScore = (
    evaluation: Evaluation,
    criteriaId: string
  ) => {
    const relevantScores = evaluation.scores.filter(
      (s) => s.criteriaId === criteriaId
    );
    if (relevantScores.length === 0) return 0;

    const weightedSum = relevantScores.reduce((sum, score) => {
      const interviewer = evaluation.interviewers.find(
        (i) => i.id === score.interviewerId
      );
      return sum + score.score * (interviewer?.weight || 1);
    }, 0);

    const totalWeight = relevantScores.reduce((sum, score) => {
      const interviewer = evaluation.interviewers.find(
        (i) => i.id === score.interviewerId
      );
      return sum + (interviewer?.weight || 1);
    }, 0);

    return Math.round(weightedSum / totalWeight);
  };

  const calculateOverallScore = (evaluation: Evaluation) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    evaluation.criteria.forEach((criteria) => {
      const avgScore = calculateAverageScore(evaluation, criteria.id);
      totalWeightedScore += avgScore * criteria.weight;
      totalWeight += criteria.weight;
    });

    return Math.round(totalWeightedScore / totalWeight);
  };

  const getConsensusStatus = (evaluation: Evaluation) => {
    const submittedCount = evaluation.interviewers.filter(
      (i) => i.hasSubmitted
    ).length;
    const totalInterviewers = evaluation.interviewers.length;

    if (submittedCount === 0) return "Not started";
    if (submittedCount < totalInterviewers)
      return `${submittedCount}/${totalInterviewers} submitted`;
    if (!evaluation.consensus.reached) return "Needs consensus";
    return "Consensus reached";
  };

  const addComment = () => {
    if (!selectedEvaluation || !newComment.trim()) return;

    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      authorId: currentUserId,
      authorName: "Current User",
      content: newComment,
      type: "comment",
      timestamp: new Date(),
      replies: [],
      reactions: {},
    };

    setSelectedEvaluation((prev) =>
      prev
        ? {
            ...prev,
            discussions: [...prev.discussions, newDiscussion],
          }
        : null
    );

    setNewComment("");
  };

  const toggleReaction = (discussionId: string, emoji: string) => {
    setSelectedEvaluation((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        discussions: prev.discussions.map((discussion) => {
          if (discussion.id === discussionId) {
            const reactions = { ...discussion.reactions };
            if (!reactions[emoji]) reactions[emoji] = [];

            if (reactions[emoji].includes(currentUserId)) {
              reactions[emoji] = reactions[emoji].filter(
                (id) => id !== currentUserId
              );
            } else {
              reactions[emoji].push(currentUserId);
            }

            return { ...discussion, reactions };
          }
          return discussion;
        }),
      };
    });
  };

  const filteredEvaluations = evaluations.filter((evaluation) => {
    if (filterStatus !== "all" && evaluation.status !== filterStatus)
      return false;
    if (
      searchQuery &&
      !evaluation.candidateName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !evaluation.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950 dark:via-blue-950 dark:to-cyan-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Collaborative Evaluation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Multi-interviewer assessment with real-time consensus building
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Users className="w-4 h-4 mr-2" />
                {evaluations.length} Evaluations
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Scale className="w-4 h-4 mr-2" />
                Consensus-Driven
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        {!selectedEvaluation ? (
          // Evaluations List View
          <StaggeredContainer>
            {/* Controls */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-8">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search evaluations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="consensus-needed">
                          Needs Consensus
                        </SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Evaluations
                      </p>
                      <p className="text-lg font-semibold">
                        {evaluations.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <Timer className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pending Consensus
                      </p>
                      <p className="text-lg font-semibold">
                        {
                          evaluations.filter(
                            (e) => e.status === "consensus-needed"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Completed
                      </p>
                      <p className="text-lg font-semibold">
                        {
                          evaluations.filter((e) => e.status === "completed")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Avg. Score
                      </p>
                      <p className="text-lg font-semibold">
                        {Math.round(
                          evaluations.reduce(
                            (sum, e) => sum + calculateOverallScore(e),
                            0
                          ) / evaluations.length
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Evaluations Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvaluations.map((evaluation, index) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-2xl transition-all cursor-pointer group"
                      onClick={() => setSelectedEvaluation(evaluation)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(evaluation.status)}>
                            {evaluation.status.replace("-", " ")}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600">
                              {calculateOverallScore(evaluation)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Overall Score
                            </div>
                          </div>
                        </div>
                        <CardTitle className="group-hover:text-indigo-600 transition-colors">
                          {evaluation.candidateName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {evaluation.position}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Interviewer Status */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{getConsensusStatus(evaluation)}</span>
                            </div>
                            <div className="flex -space-x-2">
                              {evaluation.interviewers.map((interviewer) => (
                                <div key={interviewer.id} className="relative">
                                  <Avatar className="w-6 h-6 border-2 border-white">
                                    <AvatarFallback className="text-xs">
                                      {interviewer.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                      interviewer.hasSubmitted
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="font-semibold">
                                {evaluation.discussions.length}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Comments
                              </div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="font-semibold">
                                {
                                  evaluation.interviewers.filter(
                                    (i) => i.hasSubmitted
                                  ).length
                                }
                                /{evaluation.interviewers.length}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Submitted
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {evaluation.interviewDate.toLocaleDateString()}
                            </span>
                            <span>
                              {evaluation.consensus.reached ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Timer className="w-4 h-4 text-orange-500" />
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvaluations.map((evaluation, index) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => setSelectedEvaluation(evaluation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div>
                              <h3 className="font-semibold">
                                {evaluation.candidateName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {evaluation.position}
                              </p>
                            </div>
                            <Badge
                              className={getStatusColor(evaluation.status)}
                            >
                              {evaluation.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-indigo-600">
                                {calculateOverallScore(evaluation)}%
                              </div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">
                                {
                                  evaluation.interviewers.filter(
                                    (i) => i.hasSubmitted
                                  ).length
                                }
                                /{evaluation.interviewers.length}
                              </div>
                              <div className="text-xs text-gray-500">
                                Submitted
                              </div>
                            </div>
                            <div className="flex -space-x-2">
                              {evaluation.interviewers.map((interviewer) => (
                                <Avatar
                                  key={interviewer.id}
                                  className="w-8 h-8 border-2 border-white"
                                >
                                  <AvatarFallback className="text-xs">
                                    {interviewer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </StaggeredContainer>
        ) : (
          // Detailed Evaluation View
          <StaggeredContainer>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Evaluation Panel */}
              <div className="xl:col-span-2 space-y-6">
                {/* Header */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {selectedEvaluation.candidateName}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedEvaluation.position}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={getStatusColor(selectedEvaluation.status)}
                        >
                          {selectedEvaluation.status.replace("-", " ")}
                        </Badge>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">
                            {calculateOverallScore(selectedEvaluation)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            Overall Score
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedEvaluation(null)}
                        >
                          ← Back
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="scores">Scores</TabsTrigger>
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                    <TabsTrigger value="consensus">Consensus</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Criteria Overview */}
                    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Evaluation Criteria</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedEvaluation.criteria.map((criteria) => (
                            <div key={criteria.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {criteria.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Weight: {criteria.weight}%
                                  </span>
                                  <span className="text-lg font-semibold">
                                    {calculateAverageScore(
                                      selectedEvaluation,
                                      criteria.id
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                              <Progress
                                value={calculateAverageScore(
                                  selectedEvaluation,
                                  criteria.id
                                )}
                                className="h-2"
                              />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {criteria.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Interviewer Progress */}
                    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Interviewer Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedEvaluation.interviewers.map(
                            (interviewer) => (
                              <div
                                key={interviewer.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {interviewer.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {interviewer.name}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                      {getRoleIcon(interviewer.role)}
                                      {interviewer.role}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      Weight
                                    </div>
                                    <div className="font-semibold">
                                      {interviewer.weight}x
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {interviewer.isOnline && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                    {interviewer.hasSubmitted ? (
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <AlertCircle className="w-5 h-5 text-orange-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="scores" className="space-y-6">
                    {/* Detailed Scores */}
                    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Individual Scores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {selectedEvaluation.criteria.map((criteria) => (
                            <div key={criteria.id} className="space-y-3">
                              <h4 className="font-semibold">{criteria.name}</h4>
                              <div className="space-y-2">
                                {selectedEvaluation.interviewers.map(
                                  (interviewer) => {
                                    const score =
                                      selectedEvaluation.scores.find(
                                        (s) =>
                                          s.interviewerId === interviewer.id &&
                                          s.criteriaId === criteria.id
                                      );
                                    return (
                                      <div
                                        key={interviewer.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                      >
                                        <div className="flex items-center gap-3">
                                          <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-xs">
                                              {interviewer.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="font-medium">
                                            {interviewer.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          {score ? (
                                            <>
                                              <div className="text-right">
                                                <div className="font-semibold">
                                                  {score.score}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  Confidence: {score.confidence}
                                                  %
                                                </div>
                                              </div>
                                              <Progress
                                                value={score.score}
                                                className="w-20 h-2"
                                              />
                                            </>
                                          ) : (
                                            <span className="text-gray-400">
                                              Not submitted
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="discussion" className="space-y-6">
                    {/* Add Comment */}
                    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Add your thoughts or questions about this candidate..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Lightbulb className="w-4 h-4 mr-2" />
                                Highlight
                              </Button>
                              <Button variant="outline" size="sm">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Concern
                              </Button>
                            </div>
                            <Button onClick={addComment}>
                              <Send className="w-4 h-4 mr-2" />
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Discussion Thread */}
                    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>
                          Discussion ({selectedEvaluation.discussions.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedEvaluation.discussions.map((discussion) => (
                            <motion.div
                              key={discussion.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs">
                                    {discussion.authorName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">
                                      {discussion.authorName}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {discussion.type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {discussion.timestamp.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-sm mb-3">
                                    {discussion.content}
                                  </p>

                                  {/* Reactions */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {["👍", "👎", "🤔", "❤️"].map((emoji) => (
                                        <Button
                                          key={emoji}
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-2"
                                          onClick={() =>
                                            toggleReaction(discussion.id, emoji)
                                          }
                                        >
                                          {emoji}
                                          {discussion.reactions[emoji]?.length >
                                            0 && (
                                            <span className="ml-1 text-xs">
                                              {
                                                discussion.reactions[emoji]
                                                  .length
                                              }
                                            </span>
                                          )}
                                        </Button>
                                      ))}
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <MessageCircle className="w-3 h-3 mr-1" />
                                      Reply
                                    </Button>
                                  </div>

                                  {/* Replies */}
                                  {discussion.replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="mt-3 ml-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">
                                          {reply.authorName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {reply.timestamp.toLocaleTimeString()}
                                        </span>
                                      </div>
                                      <p className="text-sm">{reply.content}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="consensus" className="space-y-6">
                    {/* Consensus Building */}
                    <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Consensus Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            {selectedEvaluation.consensus.reached ? (
                              <div className="space-y-2">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                                <h3 className="text-lg font-semibold">
                                  Consensus Reached
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Final Score:{" "}
                                  {selectedEvaluation.consensus.finalScore}%
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <Timer className="w-12 h-12 text-orange-500 mx-auto" />
                                <h3 className="text-lg font-semibold">
                                  Consensus Needed
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {getConsensusStatus(selectedEvaluation)}
                                </p>
                                <Button
                                  onClick={() => setShowConsensusModal(true)}
                                >
                                  <Vote className="w-4 h-4 mr-2" />
                                  Build Consensus
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Recommendation Summary */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                              <ThumbsUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                              <div className="font-semibold">2</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Hire
                              </div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <ThumbsDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <div className="font-semibold">0</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                No Hire
                              </div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                              <div className="font-semibold">1</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Pending
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Evaluation Summary */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">
                        {calculateOverallScore(selectedEvaluation)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Overall Score
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedEvaluation.criteria.map((criteria) => (
                        <div key={criteria.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{criteria.name}</span>
                            <span>
                              {calculateAverageScore(
                                selectedEvaluation,
                                criteria.id
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={calculateAverageScore(
                              selectedEvaluation,
                              criteria.id
                            )}
                            className="h-1"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Details */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Interview Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Date
                      </span>
                      <span className="text-sm font-medium">
                        {selectedEvaluation.interviewDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Position
                      </span>
                      <span className="text-sm font-medium">
                        {selectedEvaluation.position}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Interviewers
                      </span>
                      <span className="text-sm font-medium">
                        {selectedEvaluation.interviewers.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Status
                      </span>
                      <Badge
                        className={getStatusColor(selectedEvaluation.status)}
                      >
                        {selectedEvaluation.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button size="sm" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Results
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Follow-up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Evaluation Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </StaggeredContainer>
        )}
      </div>
    </div>
  );
}
