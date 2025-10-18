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
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Brain,
  Video,
  FileText,
  Target,
  Award,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  BarChart3,
  MessageSquare,
  Code,
  Lightbulb,
  BookOpen,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface InterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  improvementRate: number;
  skillsAssessed: number;
  timeSpent: number;
}

interface RecentInterview {
  id: string;
  candidateName: string;
  position: string;
  date: string;
  score: number;
  status: "completed" | "in-progress" | "scheduled";
  type: "technical" | "behavioral" | "system-design";
  duration: number;
}

interface UpcomingInterview {
  id: string;
  candidateName: string;
  position: string;
  scheduledTime: string;
  type: string;
  interviewer: string;
}

function AIInterviewDashboard() {
  const [stats, setStats] = useState<InterviewStats>({
    totalInterviews: 156,
    completedInterviews: 142,
    averageScore: 78.5,
    improvementRate: 12.3,
    skillsAssessed: 24,
    timeSpent: 2840,
  });

  const [recentInterviews] = useState<RecentInterview[]>([
    {
      id: "1",
      candidateName: "Alex Johnson",
      position: "Senior Frontend Developer",
      date: "2025-10-14",
      score: 85,
      status: "completed",
      type: "technical",
      duration: 45,
    },
    {
      id: "2",
      candidateName: "Sarah Chen",
      position: "Full Stack Engineer",
      date: "2025-10-14",
      score: 72,
      status: "completed",
      type: "behavioral",
      duration: 30,
    },
    {
      id: "3",
      candidateName: "Michael Brown",
      position: "System Architect",
      date: "2025-10-14",
      score: 0,
      status: "in-progress",
      type: "system-design",
      duration: 25,
    },
  ]);

  const [upcomingInterviews] = useState<UpcomingInterview[]>([
    {
      id: "1",
      candidateName: "Emma Wilson",
      position: "React Developer",
      scheduledTime: "2:00 PM",
      type: "Technical Interview",
      interviewer: "AI Assistant",
    },
    {
      id: "2",
      candidateName: "David Lee",
      position: "Backend Engineer",
      scheduledTime: "4:30 PM",
      type: "Coding Challenge",
      interviewer: "AI Assistant",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="w-4 h-4" />;
      case "behavioral":
        return <MessageSquare className="w-4 h-4" />;
      case "system-design":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend = "up",
    className,
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    trend?: "up" | "down";
    className?: string;
  }) => (
    <AnimatedContainer delay={0.1}>
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {change && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      trend === "up"
                        ? "text-green-600 bg-green-100 dark:bg-green-900/20"
                        : "text-red-600 bg-red-100 dark:bg-red-900/20"
                    )}
                  >
                    {trend === "up" ? "↗" : "↘"} {change}
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Interview Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive analytics and insights for your interview process
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Interview
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Stats Overview */}
        <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggeredItem>
            <StatCard
              title="Total Interviews"
              value={stats.totalInterviews}
              change="12%"
              icon={Users}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Average Score"
              value={`${stats.averageScore}%`}
              change="5.2%"
              icon={TrendingUp}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Skills Assessed"
              value={stats.skillsAssessed}
              change="8"
              icon={Target}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Time Saved"
              value={`${Math.floor(stats.timeSpent / 60)}h`}
              change="23%"
              icon={Clock}
            />
          </StaggeredItem>
        </StaggeredContainer>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Interviews */}
          <AnimatedContainer delay={0.3} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInterviews.map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {interview.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {interview.candidateName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {interview.position}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(interview.type)}
                          <span className="text-sm capitalize">
                            {interview.type}
                          </span>
                        </div>
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status === "in-progress"
                            ? "In Progress"
                            : interview.status}
                        </Badge>
                        {interview.status === "completed" && (
                          <div className="text-right">
                            <div className="font-medium">
                              {interview.score}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {interview.duration}min
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Upcoming Interviews & Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">
                            {interview.candidateName}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {interview.position}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            {interview.scheduledTime}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Quick Actions */}
            <AnimatedContainer delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Brain className="w-6 h-6 text-blue-500" />
                      <span className="text-xs">AI Mock</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Code className="w-6 h-6 text-green-500" />
                      <span className="text-xs">Code Test</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Video className="w-6 h-6 text-purple-500" />
                      <span className="text-xs">Video Call</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <FileText className="w-6 h-6 text-orange-500" />
                      <span className="text-xs">Templates</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>

        {/* Performance Insights */}
        <AnimatedContainer delay={0.6}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
                  <TabsTrigger value="trends">Performance Trends</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    AI Recommendations
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {["JavaScript", "React", "System Design"].map(
                      (skill, index) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{skill}</span>
                            <span>{85 - index * 10}%</span>
                          </div>
                          <Progress value={85 - index * 10} className="h-2" />
                        </div>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="mt-6">
                  <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Performance trends chart would go here
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-6">
                  <div className="space-y-3">
                    {[
                      "Focus on system design patterns for better scores",
                      "Practice more behavioral questions for confidence",
                      "Consider adding coding challenges to assessments",
                    ].map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
                      >
                        <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
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
  return <AIInterviewDashboard />;
}
