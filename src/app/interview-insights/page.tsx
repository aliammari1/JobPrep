"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Calendar,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Award,
  Filter,
  Download,
  RefreshCw,
  Settings,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Gauge,
  Radar,
  Map,
  Layers,
  BookOpen,
  FileText,
  Database,
  Globe,
  Shield,
  Workflow,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";

interface Insight {
  id: string;
  type: "prediction" | "recommendation" | "trend" | "anomaly" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  category: "performance" | "hiring" | "process" | "candidate" | "team";
  data: any;
  timestamp: Date;
  actionable: boolean;
  actions?: InsightAction[];
}

interface InsightAction {
  id: string;
  label: string;
  type: "primary" | "secondary";
  href?: string;
  onClick?: () => void;
}

interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  target?: number;
  unit: string;
}

interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  lastTrained: Date;
  predictions: Prediction[];
  status: "active" | "training" | "inactive";
}

interface Prediction {
  id: string;
  type: "success_rate" | "time_to_hire" | "candidate_fit" | "interview_outcome";
  value: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export default function InterviewInsightsAIPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();

          // Transform analytics data to insights
          const transformedInsights: Insight[] = (data.interviews || [])
            .slice(0, 5)
            .map((interview: any) => ({
              id: interview.id,
              type: "recommendation" as const,
              title: `Interview Analysis: ${
                interview.candidateName || "Candidate"
              }`,
              description: `Score: ${
                interview.score || 0
              }/100. Review performance metrics and candidate fit.`,
              confidence: interview.score || 0,
              impact:
                interview.score > 80
                  ? "high"
                  : interview.score > 60
                  ? "medium"
                  : ("low" as const),
              category: "performance" as const,
              data: {
                score: interview.score,
                technical: interview.technicalScore,
                communication: interview.communicationScore,
              },
              timestamp: new Date(interview.createdAt),
              actionable: true,
            }));

          setInsights(transformedInsights);

          // Set metrics from analytics
          const transformedMetrics: PerformanceMetric[] = [
            {
              id: "1",
              label: "Total Interviews",
              value: data.totalInterviews || 0,
              change: 12,
              trend: "up" as const,
              unit: "interviews",
            },
            {
              id: "2",
              label: "Average Score",
              value: data.averageScore || 0,
              change: 5,
              trend: "up" as const,
              unit: "points",
            },
            {
              id: "3",
              label: "Completion Rate",
              value: Math.round(
                ((data.completedInterviews || 0) /
                  (data.totalInterviews || 1)) *
                  100
              ),
              change: 3,
              trend: "up" as const,
              unit: "%",
            },
          ];

          setMetrics(transformedMetrics);
        } else {
          setInsights(mockInsights);
          setMetrics(mockMetrics);
        }
      } catch (err) {
        setError("Failed to load insights");
        setInsights(mockInsights);
        setMetrics(mockMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [selectedTimeframe]);

  // Mock data
  const mockInsights: Insight[] = [
    {
      id: "1",
      type: "prediction",
      title: "High Success Rate Predicted",
      description:
        "Current interview pipeline shows 78% likelihood of successful hires based on candidate profiles and interview performance patterns.",
      confidence: 85,
      impact: "high",
      category: "hiring",
      data: {
        predicted_success_rate: 78,
        contributing_factors: [
          "technical_skills",
          "cultural_fit",
          "communication",
        ],
      },
      timestamp: new Date(),
      actionable: true,
      actions: [
        {
          id: "1",
          label: "View Pipeline",
          type: "primary",
          href: "/talent-pipeline",
        },
        {
          id: "2",
          label: "Optimize Process",
          type: "secondary",
          href: "/process-optimization",
        },
      ],
    },
    {
      id: "2",
      type: "recommendation",
      title: "Optimize Interview Duration",
      description:
        "AI analysis suggests reducing technical interviews by 15 minutes while maintaining assessment quality. This could improve candidate experience and interviewer efficiency.",
      confidence: 92,
      impact: "medium",
      category: "process",
      data: {
        current_duration: 90,
        recommended_duration: 75,
        efficiency_gain: 18,
      },
      timestamp: new Date(),
      actionable: true,
      actions: [
        { id: "1", label: "Apply Changes", type: "primary" },
        { id: "2", label: "View Analysis", type: "secondary" },
      ],
    },
    {
      id: "3",
      type: "trend",
      title: "Increasing Interview Quality",
      description:
        "Interview quality scores have improved by 23% over the last month, with particularly strong gains in structured questioning and candidate engagement.",
      confidence: 95,
      impact: "high",
      category: "performance",
      data: {
        improvement: 23,
        key_areas: ["questioning", "engagement", "evaluation"],
      },
      timestamp: new Date(),
      actionable: false,
    },
    {
      id: "4",
      type: "anomaly",
      title: "Unusual Dropout Pattern",
      description:
        "Detected 40% increase in candidate withdrawals at the final interview stage. Pattern suggests process friction or misaligned expectations.",
      confidence: 88,
      impact: "high",
      category: "candidate",
      data: {
        dropout_increase: 40,
        stage: "final_interview",
        potential_causes: ["duration", "complexity", "communication"],
      },
      timestamp: new Date(),
      actionable: true,
      actions: [
        { id: "1", label: "Investigate", type: "primary" },
        { id: "2", label: "Review Process", type: "secondary" },
      ],
    },
    {
      id: "5",
      type: "opportunity",
      title: "Top Talent Pool Identified",
      description:
        "AI has identified a cluster of 12 candidates with exceptionally high potential scores. Fast-track evaluation recommended.",
      confidence: 91,
      impact: "high",
      category: "candidate",
      data: {
        candidate_count: 12,
        avg_score: 94,
        recommended_action: "fast_track",
      },
      timestamp: new Date(),
      actionable: true,
      actions: [
        {
          id: "1",
          label: "View Candidates",
          type: "primary",
          href: "/candidate-profiles",
        },
        { id: "2", label: "Schedule Priority", type: "secondary" },
      ],
    },
  ];

  const mockMetrics: PerformanceMetric[] = [
    {
      id: "success_rate",
      label: "Hire Success Rate",
      value: 73,
      change: 8.2,
      trend: "up",
      target: 75,
      unit: "%",
    },
    {
      id: "time_to_hire",
      label: "Time to Hire",
      value: 18,
      change: -2.5,
      trend: "down",
      target: 15,
      unit: "days",
    },
    {
      id: "candidate_satisfaction",
      label: "Candidate Satisfaction",
      value: 4.6,
      change: 0.3,
      trend: "up",
      target: 4.5,
      unit: "/5",
    },
    {
      id: "interviewer_efficiency",
      label: "Interviewer Efficiency",
      value: 87,
      change: 5.1,
      trend: "up",
      target: 90,
      unit: "%",
    },
    {
      id: "quality_score",
      label: "Interview Quality",
      value: 8.4,
      change: 1.2,
      trend: "up",
      target: 8.5,
      unit: "/10",
    },
    {
      id: "cost_per_hire",
      label: "Cost per Hire",
      value: 3250,
      change: -8.5,
      trend: "down",
      target: 3000,
      unit: "$",
    },
  ];

  const mockModels: PredictiveModel[] = [
    {
      id: "hiring_success",
      name: "Hiring Success Predictor",
      description:
        "Predicts likelihood of successful hires based on interview performance, skills assessment, and cultural fit indicators.",
      accuracy: 89.5,
      lastTrained: new Date("2024-01-10"),
      status: "active",
      predictions: [
        {
          id: "1",
          type: "success_rate",
          value: 78,
          confidence: 85,
          timeframe: "Next 30 days",
          factors: ["Technical Skills", "Communication", "Cultural Fit"],
        },
      ],
    },
    {
      id: "time_to_hire",
      name: "Time-to-Hire Optimizer",
      description:
        "Analyzes interview pipeline efficiency and predicts optimal scheduling to minimize time-to-hire while maintaining quality.",
      accuracy: 92.3,
      lastTrained: new Date("2024-01-08"),
      status: "active",
      predictions: [
        {
          id: "2",
          type: "time_to_hire",
          value: 16,
          confidence: 92,
          timeframe: "Current pipeline",
          factors: ["Interview Scheduling", "Decision Speed", "Process Steps"],
        },
      ],
    },
    {
      id: "candidate_fit",
      name: "Candidate-Role Matcher",
      description:
        "Advanced matching algorithm that analyzes candidate profiles against role requirements and team dynamics.",
      accuracy: 87.1,
      lastTrained: new Date("2024-01-12"),
      status: "training",
      predictions: [
        {
          id: "3",
          type: "candidate_fit",
          value: 94,
          confidence: 87,
          timeframe: "Current candidates",
          factors: ["Skills Match", "Experience Level", "Team Compatibility"],
        },
      ],
    },
  ];

  useEffect(() => {
    setInsights(mockInsights);
    setMetrics(mockMetrics);
    setModels(mockModels);
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return <Brain className="w-5 h-5 text-purple-500" />;
      case "recommendation":
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case "trend":
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case "anomaly":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "opportunity":
        return <Target className="w-5 h-5 text-green-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up") return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <ArrowRight className="w-4 h-4 text-gray-500" />;
  };

  const filteredInsights = insights.filter((insight) => {
    if (selectedCategory !== "all" && insight.category !== selectedCategory)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Interview Insights AI
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                AI-powered analytics with predictive insights and intelligent
                recommendations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Brain className="w-4 h-4 mr-2" />
                {insights.length} AI Insights
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Sparkles className="w-4 h-4 mr-2" />
                89.5% Accuracy
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <StaggeredContainer>
              {/* AI Performance Overview */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-600" />
                      AI Performance Overview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedTimeframe}
                        onValueChange={setSelectedTimeframe}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {metrics.map((metric, index) => (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {metric.label}
                          </span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(metric.trend, metric.change)}
                            <span
                              className={`text-sm font-medium ${
                                metric.trend === "up"
                                  ? "text-green-600"
                                  : metric.trend === "down"
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {metric.change > 0 ? "+" : ""}
                              {metric.change}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              {metric.value}
                              {metric.unit}
                            </div>
                            {metric.target && (
                              <div className="text-xs text-gray-500">
                                Target: {metric.target}
                                {metric.unit}
                              </div>
                            )}
                          </div>
                          {metric.target && (
                            <div className="w-16">
                              <Progress
                                value={(metric.value / metric.target) * 100}
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-blue-600" />
                      Real-time Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Active Predictions</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Running 24/7
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">8</div>
                        <div className="text-xs text-gray-500">Models</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Accuracy Rate</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Last 30 days
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          89.5%
                        </div>
                        <div className="text-xs text-gray-500">+2.3%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">Insights Generated</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            This week
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          127
                        </div>
                        <div className="text-xs text-gray-500">+18</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Key Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredInsights.slice(0, 3).map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">
                              {insight.title}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {insight.description.substring(0, 80)}...
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getImpactColor(insight.impact)}
                                variant="outline"
                              >
                                {insight.impact} impact
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* AI Model Status */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    AI Model Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {models.map((model, index) => (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{model.name}</div>
                          <Badge
                            className={
                              model.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : model.status === "training"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            }
                          >
                            {model.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {model.description}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Accuracy</span>
                            <span className="font-medium">
                              {model.accuracy}%
                            </span>
                          </div>
                          <Progress value={model.accuracy} className="h-2" />
                          <div className="text-xs text-gray-500">
                            Last trained:{" "}
                            {model.lastTrained.toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggeredContainer>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <StaggeredContainer>
              {/* Filters */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="performance">
                            Performance
                          </SelectItem>
                          <SelectItem value="hiring">Hiring</SelectItem>
                          <SelectItem value="process">Process</SelectItem>
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        More Filters
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights List */}
              <div className="space-y-4">
                {filteredInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">
                                {insight.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getImpactColor(insight.impact)}
                                >
                                  {insight.impact} impact
                                </Badge>
                                <div className="text-sm text-gray-500">
                                  {insight.confidence}% confidence
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {insight.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="capitalize">
                                  {insight.type}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {insight.category}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {insight.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                              {insight.actionable && insight.actions && (
                                <div className="flex items-center gap-2">
                                  {insight.actions.map((action) => (
                                    <Button
                                      key={action.id}
                                      variant={
                                        action.type === "primary"
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </StaggeredContainer>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <StaggeredContainer>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {models.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{model.name}</CardTitle>
                          <Badge
                            className={
                              model.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : model.status === "training"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            }
                          >
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {model.description}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Model Accuracy
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {model.accuracy}%
                          </span>
                        </div>
                        <Progress value={model.accuracy} className="h-2" />

                        {model.predictions.map((prediction) => (
                          <div
                            key={prediction.id}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">
                                {prediction.type.replace("_", " ")}
                              </span>
                              <span className="text-sm text-gray-500">
                                {prediction.confidence}% confidence
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-indigo-600 mb-2">
                              {prediction.value}
                              {prediction.type === "success_rate"
                                ? "%"
                                : prediction.type === "time_to_hire"
                                ? " days"
                                : prediction.type === "candidate_fit"
                                ? "%"
                                : ""}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {prediction.timeframe}
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">
                                Key Factors:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {prediction.factors.map((factor, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="text-xs text-gray-500">
                          Last updated: {model.lastTrained.toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </StaggeredContainer>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <StaggeredContainer>
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Interactive charts and trend analysis will be displayed
                        here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggeredContainer>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <StaggeredContainer>
              <div className="grid grid-cols-1 gap-6">
                {models.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{model.name}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {model.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                model.status === "active"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : model.status === "training"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                              }
                            >
                              {model.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium mb-2">
                                Accuracy
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {model.accuracy}%
                              </div>
                              <Progress
                                value={model.accuracy}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">
                                Last Training
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {model.lastTrained.toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium mb-2">
                                Predictions Made
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                1,247
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">
                                Success Rate
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                89.3%
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button className="w-full" size="sm">
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              Retrain Model
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              Export Data
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </StaggeredContainer>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
