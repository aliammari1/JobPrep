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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Star,
  Users,
  Calendar,
  Clock,
  Brain,
  Zap,
  Activity,
  Gauge,
  Eye,
  Download,
  Share,
  Filter,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Database,
  Globe,
  Search,
  Plus,
  Minus,
  RotateCcw,
  RefreshCw,
  Calendar as CalendarIcon,
  Timer,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Code,
  Mic,
  Video,
  Phone,
  Coffee,
  Heart,
  Smile,
  Frown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  unit?: string;
}

interface InterviewPerformance {
  id: string;
  candidateName: string;
  position: string;
  date: Date;
  duration: number;
  overallScore: number;
  categoryScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
    leadership: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  interviewType:
    | "technical"
    | "behavioral"
    | "cultural"
    | "case-study"
    | "panel";
  outcome: "hired" | "rejected" | "pending" | "withdrawn";
}

interface TrendData {
  period: string;
  interviews: number;
  avgScore: number;
  hireRate: number;
  satisfaction: number;
}

export default function PerformanceAnalytics() {
  const [timeFrame, setTimeFrame] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [selectedMetric, setSelectedMetric] = useState<
    "overall" | "technical" | "communication" | "cultural"
  >("overall");
  const [departmentFilter, setDepartmentFilter] = useState<
    "all" | "engineering" | "product" | "design" | "sales"
  >("all");
  const [interviewData, setInterviewData] = useState<InterviewPerformance[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/analytics");

        if (response.ok) {
          const data = await response.json();
          // Transform API data to match InterviewPerformance interface
          const transformedData: InterviewPerformance[] = (
            data.interviews || []
          ).map((interview: any) => ({
            id: interview.id,
            candidateName: interview.candidateName || "Anonymous",
            position: interview.title || interview.position || "Not specified",
            date: new Date(interview.createdAt),
            duration: interview.duration || 60,
            overallScore: interview.score || 0,
            categoryScores: {
              technical: interview.technicalScore || 0,
              communication: interview.communicationScore || 0,
              problemSolving: interview.problemSolvingScore || 0,
              culturalFit: interview.culturalFitScore || 0,
              leadership: interview.leadershipScore || 0,
            },
            sentiment: interview.sentiment || {
              positive: 50,
              neutral: 30,
              negative: 20,
            },
            interviewType: interview.type || "general",
            outcome: interview.status === "completed" ? "completed" : "pending",
          }));

          setInterviewData(transformedData);
          setError(null);
        } else {
          throw new Error("Failed to fetch analytics");
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data");
        // Fallback to mock data
        setInterviewData(mockInterviewData);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeFrame]);

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: "Average Interview Score",
      value: 4.2,
      change: 0.3,
      trend: "up",
      unit: "/5",
    },
    {
      label: "Interview Completion Rate",
      value: 94,
      change: -2,
      trend: "down",
      unit: "%",
    },
    {
      label: "Candidate Satisfaction",
      value: 4.7,
      change: 0.1,
      trend: "up",
      unit: "/5",
    },
    { label: "Time to Hire", value: 18, change: -3, trend: "up", unit: "days" },
    {
      label: "Interview-to-Hire Ratio",
      value: 28,
      change: 5,
      trend: "down",
      unit: "%",
    },
    {
      label: "Quality of Hire Score",
      value: 4.4,
      change: 0.2,
      trend: "up",
      unit: "/5",
    },
  ];

  const mockInterviewData: InterviewPerformance[] = [
    {
      id: "1",
      candidateName: "Alice Johnson",
      position: "Senior Software Engineer",
      date: new Date(2024, 9, 15),
      duration: 65,
      overallScore: 4.5,
      categoryScores: {
        technical: 5,
        communication: 4,
        problemSolving: 5,
        culturalFit: 4,
        leadership: 4,
      },
      sentiment: { positive: 85, neutral: 12, negative: 3 },
      interviewType: "technical",
      outcome: "hired",
    },
    {
      id: "2",
      candidateName: "Bob Chen",
      position: "Product Manager",
      date: new Date(2024, 9, 14),
      duration: 78,
      overallScore: 3.2,
      categoryScores: {
        technical: 3,
        communication: 3,
        problemSolving: 4,
        culturalFit: 2,
        leadership: 3,
      },
      sentiment: { positive: 60, neutral: 30, negative: 10 },
      interviewType: "behavioral",
      outcome: "rejected",
    },
    {
      id: "3",
      candidateName: "Carol Martinez",
      position: "Data Scientist",
      date: new Date(2024, 9, 13),
      duration: 90,
      overallScore: 4.8,
      categoryScores: {
        technical: 5,
        communication: 5,
        problemSolving: 5,
        culturalFit: 5,
        leadership: 4,
      },
      sentiment: { positive: 92, neutral: 7, negative: 1 },
      interviewType: "case-study",
      outcome: "hired",
    },
  ];

  const trendData: TrendData[] = [
    {
      period: "Week 1",
      interviews: 12,
      avgScore: 4.1,
      hireRate: 25,
      satisfaction: 4.5,
    },
    {
      period: "Week 2",
      interviews: 15,
      avgScore: 4.3,
      hireRate: 33,
      satisfaction: 4.6,
    },
    {
      period: "Week 3",
      interviews: 18,
      avgScore: 4.2,
      hireRate: 28,
      satisfaction: 4.7,
    },
    {
      period: "Week 4",
      interviews: 14,
      avgScore: 4.4,
      hireRate: 36,
      satisfaction: 4.8,
    },
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "hired":
        return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "withdrawn":
        return <Badge className="bg-gray-100 text-gray-800">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case "down":
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case "stable":
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return "text-green-600";
    if (score >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const departmentData = {
    engineering: { interviews: 45, avgScore: 4.3, hireRate: 31 },
    product: { interviews: 23, avgScore: 4.1, hireRate: 26 },
    design: { interviews: 18, avgScore: 4.5, hireRate: 39 },
    sales: { interviews: 12, avgScore: 3.9, hireRate: 25 },
  };

  const topPerformers = (
    interviewData.length > 0 ? interviewData : mockInterviewData
  )
    .filter((interview) => interview.overallScore >= 4.0)
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 5);

  interface ImprovementArea {
    area: string;
    score: number;
    trend: "up" | "down" | "stable";
    priority: "high" | "medium" | "low";
  }

  const improvementAreas: ImprovementArea[] = [
    {
      area: "Technical Assessment Accuracy",
      score: 72,
      trend: "down",
      priority: "high",
    },
    {
      area: "Interview Time Management",
      score: 84,
      trend: "up",
      priority: "medium",
    },
    { area: "Candidate Experience", score: 91, trend: "up", priority: "low" },
    {
      area: "Bias Detection & Prevention",
      score: 67,
      trend: "stable",
      priority: "high",
    },
    {
      area: "Interviewer Training Effectiveness",
      score: 78,
      trend: "up",
      priority: "medium",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Loading State */}
        {loading && (
          <Alert>
            <AlertDescription>Loading analytics data...</AlertDescription>
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
                Performance Analytics
              </h1>
              <p className="text-muted-foreground mt-2">
                Detailed performance metrics with trend analysis and improvement
                recommendations
              </p>
            </div>
            <div className="flex gap-3">
              <Select
                value={timeFrame}
                onValueChange={(value: "week" | "month" | "quarter" | "year") =>
                  setTimeFrame(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Key Metrics */}
        <AnimatedContainer delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {metric.label}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-end gap-1">
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          getScoreColor(metric.value)
                        )}
                      >
                        {metric.value}
                      </span>
                      {metric.unit && (
                        <span className="text-sm text-muted-foreground mb-1">
                          {metric.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          metric.trend === "up"
                            ? "text-green-600"
                            : metric.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                        )}
                      >
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}
                        {metric.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs last period
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trends Chart */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-500" />
                      Performance Trends
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={selectedMetric}
                        onValueChange={(
                          value:
                            | "overall"
                            | "technical"
                            | "communication"
                            | "cultural"
                        ) => setSelectedMetric(value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overall">Overall Score</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="communication">
                            Communication
                          </SelectItem>
                          <SelectItem value="cultural">Cultural Fit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mock Chart Visualization */}
                  <div className="h-64 flex items-end justify-between gap-4 p-4">
                    {trendData.map((data) => {
                      const height = (data.avgScore / 5) * 100;
                      return (
                        <div
                          key={data.period}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div className="text-xs text-muted-foreground">
                            {data.avgScore.toFixed(1)}
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-purple-600 to-blue-600 rounded-t-lg transition-all duration-300 hover:from-purple-700 hover:to-blue-700"
                            style={{ height: `${height}%`, minHeight: "20px" }}
                          />
                          <div className="text-xs text-center text-muted-foreground">
                            {data.period}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {trendData.reduce((sum, d) => sum + d.interviews, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Interviews
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {(
                          trendData.reduce((sum, d) => sum + d.avgScore, 0) /
                          trendData.length
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {(
                          trendData.reduce((sum, d) => sum + d.hireRate, 0) /
                          trendData.length
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Hire Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {(
                          trendData.reduce(
                            (sum, d) => sum + d.satisfaction,
                            0
                          ) / trendData.length
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Satisfaction
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Department Performance */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-500" />
                    Department Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(departmentData).map(([dept, data]) => (
                      <div key={dept} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{dept}</span>
                          <div className="flex gap-4 text-sm">
                            <span>{data.interviews} interviews</span>
                            <span
                              className={cn(
                                "font-medium",
                                getScoreColor(data.avgScore)
                              )}
                            >
                              {data.avgScore}/5 avg
                            </span>
                            <span className="text-green-600">
                              {data.hireRate}% hired
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Progress
                            value={(data.interviews / 50) * 100}
                            className="h-2"
                          />
                          <Progress
                            value={(data.avgScore / 5) * 100}
                            className="h-2"
                          />
                          <Progress value={data.hireRate} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Recent Interviews */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Recent Interview Performance
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StaggeredContainer className="space-y-4">
                    {(interviewData.length > 0
                      ? interviewData
                      : mockInterviewData
                    ).map((interview) => (
                      <StaggeredItem key={interview.id}>
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {interview.candidateName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {interview.candidateName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {interview.position}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div
                                className={cn(
                                  "font-bold",
                                  getScoreColor(interview.overallScore)
                                )}
                              >
                                {interview.overallScore}/5
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Score
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {interview.duration}m
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Duration
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm capitalize">
                                {interview.interviewType}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Type
                              </div>
                            </div>
                            {getOutcomeBadge(interview.outcome)}
                          </div>
                        </div>
                      </StaggeredItem>
                    ))}
                  </StaggeredContainer>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            {/* Top Performers */}
            <AnimatedContainer delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
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
                          {performer.overallScore}/5
                        </div>
                        {getOutcomeBadge(performer.outcome)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Improvement Areas */}
            <AnimatedContainer delay={0.6}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Improvement Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {improvementAreas.map((area) => (
                    <div key={area.area} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{area.area}</span>
                        <Badge
                          className={cn(
                            "text-xs",
                            getPriorityColor(area.priority)
                          )}
                        >
                          {area.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={area.score} className="flex-1 h-2" />
                        <span className="text-sm font-medium">
                          {area.score}%
                        </span>
                        {getTrendIcon(area.trend)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Quick Actions */}
            <AnimatedContainer delay={0.7}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Detailed Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Schedule Team Review
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    View Recommendations
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Metrics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="w-4 h-4 mr-2" />
                    Share Dashboard
                  </Button>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Insights Summary */}
            <AnimatedContainer delay={0.8}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Performance Trend
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          Interview scores have improved by 12% this quarter
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                          Action Required
                        </div>
                        <div className="text-xs text-yellow-700 dark:text-yellow-300">
                          Technical assessment bias detected in 3 recent
                          interviews
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">
                          Optimization
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">
                          Candidate satisfaction scores are at an all-time high
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>

        {/* Detailed Analytics Modal/Tabs */}
        <AnimatedContainer delay={0.9}>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="categories" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      "technical",
                      "communication",
                      "problemSolving",
                      "culturalFit",
                      "leadership",
                    ].map((category) => {
                      const data =
                        interviewData.length > 0
                          ? interviewData
                          : mockInterviewData;
                      const avgScore =
                        data.reduce(
                          (sum, interview) =>
                            sum +
                            interview.categoryScores[
                              category as keyof typeof interview.categoryScores
                            ],
                          0
                        ) / data.length;

                      return (
                        <Card key={category}>
                          <CardContent className="p-4 text-center">
                            <div
                              className={cn(
                                "text-2xl font-bold",
                                getScoreColor(avgScore)
                              )}
                            >
                              {avgScore.toFixed(1)}/5
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <Progress
                              value={(avgScore / 5) * 100}
                              className="h-2 mt-2"
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="sentiment" className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    {["positive", "neutral", "negative"].map((sentiment) => {
                      const data =
                        interviewData.length > 0
                          ? interviewData
                          : mockInterviewData;
                      const avgSentiment =
                        data.reduce(
                          (sum, interview) =>
                            sum +
                            interview.sentiment[
                              sentiment as keyof typeof interview.sentiment
                            ],
                          0
                        ) / data.length;

                      const color =
                        sentiment === "positive"
                          ? "text-green-600"
                          : sentiment === "neutral"
                          ? "text-yellow-600"
                          : "text-red-600";

                      return (
                        <Card key={sentiment}>
                          <CardContent className="p-6 text-center">
                            <div className={cn("text-3xl font-bold", color)}>
                              {avgSentiment.toFixed(0)}%
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {sentiment}
                            </div>
                            <Progress
                              value={avgSentiment}
                              className="h-2 mt-2"
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="outcomes" className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {["hired", "rejected", "pending", "withdrawn"].map(
                      (outcome) => {
                        const data =
                          interviewData.length > 0
                            ? interviewData
                            : mockInterviewData;
                        const count = data.filter(
                          (interview) => interview.outcome === outcome
                        ).length;
                        const percentage = (count / data.length) * 100;

                        return (
                          <Card key={outcome}>
                            <CardContent className="p-6 text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {count}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {outcome}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {percentage.toFixed(0)}% of total
                              </div>
                              <Progress
                                value={percentage}
                                className="h-2 mt-2"
                              />
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Immediate Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                Address Technical Bias
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Review assessment criteria for technical
                                interviews
                              </div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                Optimize Interview Duration
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Consider shorter sessions for initial screenings
                              </div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                Interviewer Training
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Schedule bias awareness workshops
                              </div>
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Long-term Improvements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                AI-Enhanced Scoring
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Implement ML models for more consistent
                                evaluation
                              </div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <BarChart3 className="w-4 h-4 text-green-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                Predictive Analytics
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Use historical data to predict candidate success
                              </div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Gauge className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                Performance Benchmarking
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Establish industry-standard performance metrics
                              </div>
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
