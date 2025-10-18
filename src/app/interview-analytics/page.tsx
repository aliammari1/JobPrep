"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Brain,
  Star,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Award,
  Building2,
  UserCheck,
  Timer,
  PieChart,
  Activity,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface AnalyticsData {
  overview: {
    totalInterviews: number;
    passRate: number;
    avgDuration: number;
    avgScore: number;
    topPerformingRole: string;
    timeToHire: number;
  };
  trends: {
    interviewsOverTime: Array<{ month: string; count: number; passed: number }>;
    scoresByCategory: {
      technical: number[];
      communication: number[];
      problemSolving: number[];
      cultural: number[];
    };
    positionPerformance: Array<{
      position: string;
      interviews: number;
      passRate: number;
      avgScore: number;
    }>;
  };
  insights: {
    topSkills: Array<{ skill: string; demand: number; avgScore: number }>;
    interviewerPerformance: Array<{
      name: string;
      interviews: number;
      avgScore: number;
      consistency: number;
    }>;
    timeSlotAnalysis: Array<{
      timeSlot: string;
      interviews: number;
      avgScore: number;
      noShowRate: number;
    }>;
    candidateSource: Array<{
      source: string;
      candidates: number;
      conversionRate: number;
    }>;
  };
  predictions: {
    hiringForecast: Array<{ month: string; predicted: number }>;
    skillGapAnalysis: Array<{
      skill: string;
      gap: number;
      priority: "high" | "medium" | "low";
    }>;
    marketTrends: Array<{ trend: string; impact: number; confidence: number }>;
  };
}

const sampleData: AnalyticsData = {
  overview: {
    totalInterviews: 248,
    passRate: 68,
    avgDuration: 52,
    avgScore: 73,
    topPerformingRole: "Frontend Developer",
    timeToHire: 12,
  },
  trends: {
    interviewsOverTime: [
      { month: "Jan", count: 32, passed: 22 },
      { month: "Feb", count: 28, passed: 19 },
      { month: "Mar", count: 35, passed: 24 },
      { month: "Apr", count: 42, passed: 29 },
      { month: "May", count: 38, passed: 26 },
      { month: "Jun", count: 45, passed: 31 },
      { month: "Jul", count: 28, passed: 18 },
    ],
    scoresByCategory: {
      technical: [78, 82, 75, 85, 79, 88, 76],
      communication: [72, 68, 74, 71, 76, 73, 69],
      problemSolving: [81, 84, 79, 87, 83, 85, 80],
      cultural: [74, 77, 73, 79, 75, 81, 76],
    },
    positionPerformance: [
      {
        position: "Frontend Developer",
        interviews: 62,
        passRate: 74,
        avgScore: 78,
      },
      {
        position: "Backend Engineer",
        interviews: 54,
        passRate: 67,
        avgScore: 75,
      },
      {
        position: "Full Stack Developer",
        interviews: 48,
        passRate: 63,
        avgScore: 72,
      },
      {
        position: "Data Scientist",
        interviews: 35,
        passRate: 71,
        avgScore: 76,
      },
      {
        position: "DevOps Engineer",
        interviews: 28,
        passRate: 68,
        avgScore: 74,
      },
      { position: "UX Designer", interviews: 21, passRate: 76, avgScore: 79 },
    ],
  },
  insights: {
    topSkills: [
      { skill: "React", demand: 95, avgScore: 82 },
      { skill: "Python", demand: 88, avgScore: 79 },
      { skill: "TypeScript", demand: 78, avgScore: 76 },
      { skill: "AWS", demand: 72, avgScore: 74 },
      { skill: "Node.js", demand: 68, avgScore: 77 },
      { skill: "Docker", demand: 65, avgScore: 73 },
    ],
    interviewerPerformance: [
      { name: "Alex Chen", interviews: 42, avgScore: 78, consistency: 92 },
      { name: "Sarah Kim", interviews: 38, avgScore: 76, consistency: 88 },
      { name: "Mike Rodriguez", interviews: 35, avgScore: 74, consistency: 85 },
      { name: "Emily Johnson", interviews: 32, avgScore: 80, consistency: 90 },
      { name: "David Park", interviews: 28, avgScore: 75, consistency: 87 },
    ],
    timeSlotAnalysis: [
      { timeSlot: "9:00 AM", interviews: 35, avgScore: 79, noShowRate: 8 },
      { timeSlot: "11:00 AM", interviews: 42, avgScore: 76, noShowRate: 12 },
      { timeSlot: "2:00 PM", interviews: 38, avgScore: 74, noShowRate: 15 },
      { timeSlot: "4:00 PM", interviews: 28, avgScore: 71, noShowRate: 18 },
    ],
    candidateSource: [
      { source: "LinkedIn", candidates: 95, conversionRate: 24 },
      { source: "Indeed", candidates: 78, conversionRate: 18 },
      { source: "Referral", candidates: 42, conversionRate: 45 },
      { source: "Company Website", candidates: 33, conversionRate: 31 },
    ],
  },
  predictions: {
    hiringForecast: [
      { month: "Aug", predicted: 32 },
      { month: "Sep", predicted: 38 },
      { month: "Oct", predicted: 42 },
      { month: "Nov", predicted: 35 },
      { month: "Dec", predicted: 28 },
    ],
    skillGapAnalysis: [
      { skill: "Machine Learning", gap: 78, priority: "high" },
      { skill: "Kubernetes", gap: 65, priority: "high" },
      { skill: "GraphQL", gap: 52, priority: "medium" },
      { skill: "Blockchain", gap: 43, priority: "medium" },
      { skill: "Rust", gap: 38, priority: "low" },
    ],
    marketTrends: [
      {
        trend: "Remote work preference increasing",
        impact: 85,
        confidence: 92,
      },
      { trend: "AI/ML skills in high demand", impact: 78, confidence: 88 },
      {
        trend: "Full-stack roles becoming standard",
        impact: 72,
        confidence: 85,
      },
      { trend: "DevOps skills essential", impact: 68, confidence: 90 },
    ],
  },
};

function InterviewAnalytics() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData>(sampleData);
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("score");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/analytics?userId=${session?.user?.id || ""}`
        );

        if (!response.ok) throw new Error("Failed to fetch analytics");

        const analyticsData = await response.json();

        // Transform API data to match AnalyticsData interface
        // For now, we'll merge with sample data structure
        // In production, you'd fully transform the data
        setData((prevData) => ({
          ...prevData,
          overview: {
            ...prevData.overview,
            totalInterviews: analyticsData.totalInterviews || 0,
            passRate: analyticsData.completedInterviews
              ? (analyticsData.completedInterviews /
                  analyticsData.totalInterviews) *
                100
              : 0,
            avgScore: analyticsData.averageScore || 0,
          },
        }));
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    const isSignificant = Math.abs(change) > 5;

    if (!isSignificant) {
      return {
        icon: <Minus className="w-3 h-3" />,
        color: "text-gray-500",
        text: "No change",
      };
    }

    return {
      icon: isPositive ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      ),
      color: isPositive ? "text-green-500" : "text-red-500",
      text: `${isPositive ? "+" : ""}${change.toFixed(1)}%`,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Interview Analytics
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive insights and predictive analytics for interview
                performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selectedTimeframe}
                onValueChange={setSelectedTimeframe}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={refreshData}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isLoading ? (
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
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Key Metrics */}
        <StaggeredContainer>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <StaggeredItem>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Interviews
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {data.overview.totalInterviews}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs">
                    {(() => {
                      const indicator = getChangeIndicator(248, 220);
                      return (
                        <>
                          <span className={indicator.color}>
                            {indicator.icon}
                          </span>
                          <span className={indicator.color}>
                            {indicator.text}
                          </span>
                          <span className="text-muted-foreground">
                            vs last period
                          </span>
                        </>
                      );
                    })()}
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
                        Pass Rate
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {data.overview.passRate}%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={data.overview.passRate} className="h-2" />
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
                        Avg Duration
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {data.overview.avgDuration}min
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Target: 45-60 minutes
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
                        Avg Score
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {data.overview.avgScore}%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs">
                    {(() => {
                      const indicator = getChangeIndicator(73, 68);
                      return (
                        <>
                          <span className={indicator.color}>
                            {indicator.icon}
                          </span>
                          <span className={indicator.color}>
                            {indicator.text}
                          </span>
                        </>
                      );
                    })()}
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
                        Time to Hire
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {data.overview.timeToHire} days
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <Timer className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Industry avg: 23 days
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
                        Top Role
                      </p>
                      <p className="text-sm font-bold text-cyan-600">
                        {data.overview.topPerformingRole}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-cyan-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    74% pass rate
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>
          </div>
        </StaggeredContainer>

        {/* Main Content */}
        <AnimatedContainer delay={0.2}>
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
                  <TabsTrigger value="overview" className="rounded-none">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="rounded-none">
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="rounded-none">
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="rounded-none">
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="predictions" className="rounded-none">
                    Predictions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Interview Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Interview Timeline
                      </h3>
                      <div className="space-y-3">
                        {data.trends.interviewsOverTime.map((item, index) => (
                          <motion.div
                            key={item.month}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{item.month}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.passed}/{item.count} passed
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{item.count}</div>
                              <div className="text-sm text-green-600">
                                {Math.round((item.passed / item.count) * 100)}%
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Top Skills */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Top Skills in Demand
                      </h3>
                      <div className="space-y-3">
                        {data.insights.topSkills
                          .slice(0, 6)
                          .map((skill, index) => (
                            <motion.div
                              key={skill.skill}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="space-y-2"
                            >
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">
                                  {skill.skill}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Score: {skill.avgScore}%
                                  </span>
                                  <Badge variant="secondary">
                                    {skill.demand}% demand
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Progress
                                  value={skill.avgScore}
                                  className="h-2 flex-1"
                                />
                                <Progress
                                  value={skill.demand}
                                  className="h-2 flex-1"
                                />
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="p-6">
                  <div className="space-y-6">
                    {/* Score Trends by Category */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Score Trends by Category
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(data.trends.scoresByCategory).map(
                          ([category, scores]) => {
                            const avgScore =
                              scores.reduce((a, b) => a + b, 0) / scores.length;
                            const trend = scores[scores.length - 1] - scores[0];

                            return (
                              <Card key={category}>
                                <CardContent className="p-4">
                                  <div className="text-center">
                                    <h4 className="font-medium capitalize mb-2">
                                      {category.replace(/([A-Z])/g, " $1")}
                                    </h4>
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                      {Math.round(avgScore)}%
                                    </div>
                                    <div
                                      className={cn(
                                        "flex items-center justify-center gap-1 text-xs",
                                        trend > 0
                                          ? "text-green-500"
                                          : trend < 0
                                          ? "text-red-500"
                                          : "text-gray-500"
                                      )}
                                    >
                                      {trend > 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : trend < 0 ? (
                                        <TrendingDown className="w-3 h-3" />
                                      ) : (
                                        <Minus className="w-3 h-3" />
                                      )}
                                      <span>
                                        {trend > 0 ? "+" : ""}
                                        {trend.toFixed(1)}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Position Performance */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Position Performance
                      </h3>
                      <div className="space-y-3">
                        {data.trends.positionPerformance.map(
                          (position, index) => (
                            <motion.div
                              key={position.position}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {position.position}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {position.interviews} interviews
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <div className="font-medium">
                                    {position.passRate}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Pass Rate
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {position.avgScore}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Avg Score
                                  </div>
                                </div>
                                <Progress
                                  value={position.passRate}
                                  className="w-16 h-2"
                                />
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Interviewer Performance */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Interviewer Performance
                      </h3>
                      <div className="space-y-3">
                        {data.insights.interviewerPerformance.map(
                          (interviewer, index) => (
                            <motion.div
                              key={interviewer.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {interviewer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {interviewer.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {interviewer.interviews} interviews
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right text-sm">
                                  <div className="font-medium">
                                    {interviewer.avgScore}%
                                  </div>
                                  <div className="text-muted-foreground">
                                    Avg Score
                                  </div>
                                </div>
                                <div className="text-right text-sm">
                                  <div className="font-medium">
                                    {interviewer.consistency}%
                                  </div>
                                  <div className="text-muted-foreground">
                                    Consistency
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Time Slot Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Time Slot Analysis
                      </h3>
                      <div className="space-y-3">
                        {data.insights.timeSlotAnalysis.map((slot, index) => (
                          <motion.div
                            key={slot.timeSlot}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{slot.timeSlot}</div>
                              <div className="text-sm text-muted-foreground">
                                {slot.interviews} interviews
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Avg Score:{" "}
                                </span>
                                <span className="font-medium">
                                  {slot.avgScore}%
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  No-show:{" "}
                                </span>
                                <span className="font-medium">
                                  {slot.noShowRate}%
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 space-y-1">
                              <Progress value={slot.avgScore} className="h-1" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Performance</span>
                                <span>{slot.avgScore}%</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="p-6">
                  <div className="space-y-6">
                    {/* Candidate Sources */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Candidate Source Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.insights.candidateSource.map((source, index) => (
                          <motion.div
                            key={source.source}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card>
                              <CardContent className="p-4 text-center">
                                <h4 className="font-medium mb-2">
                                  {source.source}
                                </h4>
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                  {source.candidates}
                                </div>
                                <div className="text-sm text-muted-foreground mb-3">
                                  Candidates
                                </div>
                                <div className="space-y-2">
                                  <Progress
                                    value={source.conversionRate}
                                    className="h-2"
                                  />
                                  <div className="text-xs text-muted-foreground">
                                    {source.conversionRate}% conversion rate
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Key Insights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Key Insights
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-700 dark:text-green-300">
                                High Performing Time Slots
                              </h4>
                              <p className="text-sm text-green-600 dark:text-green-400">
                                Morning interviews (9-11 AM) show 15% higher
                                scores on average
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-700 dark:text-blue-300">
                                Technical Skills Gap
                              </h4>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                Backend integration skills are the most common
                                weakness
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
                                Interview Length Impact
                              </h4>
                              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                Interviews over 60 minutes show 8% lower
                                satisfaction scores
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-purple-700 dark:text-purple-300">
                                Referral Success Rate
                              </h4>
                              <p className="text-sm text-purple-600 dark:text-purple-400">
                                Employee referrals have 45% higher conversion
                                rates
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="predictions" className="p-6">
                  <div className="space-y-6">
                    {/* Hiring Forecast */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Hiring Forecast
                      </h3>
                      <div className="grid grid-cols-5 gap-4">
                        {data.predictions.hiringForecast.map(
                          (forecast, index) => (
                            <motion.div
                              key={forecast.month}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <h4 className="font-medium mb-2">
                                    {forecast.month}
                                  </h4>
                                  <div className="text-xl font-bold text-green-600">
                                    {forecast.predicted}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Predicted hires
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Skill Gap Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Skill Gap Analysis
                      </h3>
                      <div className="space-y-3">
                        {data.predictions.skillGapAnalysis.map(
                          (skill, index) => (
                            <motion.div
                              key={skill.skill}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                                  <Zap className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {skill.skill}
                                  </div>
                                  <Badge
                                    className={getPriorityColor(skill.priority)}
                                  >
                                    {skill.priority} priority
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-bold text-red-600">
                                    {skill.gap}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Gap
                                  </div>
                                </div>
                                <Progress
                                  value={skill.gap}
                                  className="w-20 h-2"
                                />
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Market Trends */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Market Trends
                      </h3>
                      <div className="space-y-3">
                        {data.predictions.marketTrends.map((trend, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{trend.trend}</div>
                                <div className="text-sm text-muted-foreground">
                                  Impact: {trend.impact}% • Confidence:{" "}
                                  {trend.confidence}%
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Progress
                                value={trend.impact}
                                className="w-16 h-2"
                              />
                              <Progress
                                value={trend.confidence}
                                className="w-16 h-2"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
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

export default function Page() {
  return <InterviewAnalytics />;
}
