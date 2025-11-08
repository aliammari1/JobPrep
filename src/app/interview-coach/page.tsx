"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Target,
  Brain,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Star,
  Award,
  Lightbulb,
  MessageSquare,
  Video,
  FileText,
  Users,
  Zap,
  Eye,
  Heart,
  BarChart3,
  Calendar,
  Settings,
  ChevronRight,
  Sparkles,
  Trophy,
  Mic,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface CoachingSession {
  id: string;
  title: string;
  type: "behavioral" | "technical" | "leadership" | "communication";
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress: number;
  isCompleted: boolean;
  skills: string[];
  aiInsights?: string;
}

interface SkillAssessment {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  improvementTips: string[];
  practiceExercises: string[];
}

export default function InterviewPrepCoach() {
  const [activeSession, setActiveSession] = useState<CoachingSession | null>(
    null
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const coachingSessions: CoachingSession[] = [
    {
      id: "1",
      title: "Executive Presence & Leadership Communication",
      type: "leadership",
      duration: 45,
      difficulty: "advanced",
      progress: 78,
      isCompleted: false,
      skills: ["Executive Presence", "Strategic Thinking", "Team Leadership"],
      aiInsights: "Focus on concrete examples of leading through change",
    },
    {
      id: "2",
      title: "Technical Problem Solving Framework",
      type: "technical",
      duration: 60,
      difficulty: "intermediate",
      progress: 45,
      isCompleted: false,
      skills: [
        "System Design",
        "Algorithm Thinking",
        "Technical Communication",
      ],
    },
    {
      id: "3",
      title: "STAR Method Mastery",
      type: "behavioral",
      duration: 30,
      difficulty: "beginner",
      progress: 100,
      isCompleted: true,
      skills: ["Storytelling", "Result Quantification", "Impact Communication"],
    },
    {
      id: "4",
      title: "Stakeholder Communication & Influence",
      type: "communication",
      duration: 40,
      difficulty: "intermediate",
      progress: 20,
      isCompleted: false,
      skills: [
        "Persuasion",
        "Conflict Resolution",
        "Cross-functional Collaboration",
      ],
    },
  ];

  const skillAssessments: SkillAssessment[] = [
    {
      skill: "Communication",
      currentLevel: 7,
      targetLevel: 9,
      improvementTips: [
        "Practice storytelling with concrete metrics",
        "Work on concise explanations of complex topics",
        "Develop executive summary skills",
      ],
      practiceExercises: [
        "Record 2-minute explanations of recent projects",
        "Practice elevator pitches for different audiences",
        "Mock presentation to senior stakeholders",
      ],
    },
    {
      skill: "Technical Leadership",
      currentLevel: 8,
      targetLevel: 9,
      improvementTips: [
        "Demonstrate architectural decision-making process",
        "Show examples of technical mentoring",
        "Highlight cross-team technical initiatives",
      ],
      practiceExercises: [
        "System design whiteboarding sessions",
        "Technical architecture presentations",
        "Code review and mentoring scenarios",
      ],
    },
    {
      skill: "Problem Solving",
      currentLevel: 6,
      targetLevel: 8,
      improvementTips: [
        "Structure responses using frameworks",
        "Practice breaking down complex problems",
        "Demonstrate analytical thinking process",
      ],
      practiceExercises: [
        "Case study analysis sessions",
        "Root cause analysis practice",
        "Decision-making framework exercises",
      ],
    },
  ];

  const coachingInsights = [
    {
      type: "strength",
      title: "Technical Expertise",
      description:
        "Strong foundation in system architecture and engineering practices",
      icon: Brain,
      color: "text-green-500",
    },
    {
      type: "improvement",
      title: "Executive Communication",
      description:
        "Focus on translating technical concepts for business stakeholders",
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      type: "opportunity",
      title: "Leadership Stories",
      description:
        "Develop more examples of leading through organizational change",
      icon: Lightbulb,
      color: "text-yellow-500",
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime((time) => time + 1);
      }, 1000);
    } else if (!isSessionActive && sessionTime !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, sessionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
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
    switch (type) {
      case "behavioral":
        return MessageSquare;
      case "technical":
        return Brain;
      case "leadership":
        return Users;
      case "communication":
        return Video;
      default:
        return BookOpen;
    }
  };

  const startSession = (session: CoachingSession) => {
    setActiveSession(session);
    setIsSessionActive(true);
    setSessionTime(0);
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const resumeSession = () => {
    setIsSessionActive(true);
  };

  const resetSession = () => {
    setIsSessionActive(false);
    setSessionTime(0);
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                Interview Prep Coach
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered personalized coaching for interview excellence
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Practice
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assessment
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Active Session */}
        {activeSession && (
          <AnimatedContainer delay={0.1}>
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span>Active Session: {activeSession.title}</span>
                  </div>
                  <div className="text-2xl font-mono">
                    {formatTime(sessionTime)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isSessionActive ? pauseSession : resumeSession}
                      variant="outline"
                      size="sm"
                    >
                      {isSessionActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button onClick={resetSession} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mic className="w-4 h-4 mr-2" />
                      Voice Practice
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Video Practice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Skills & Insights */}
          <div className="space-y-6">
            {/* Skill Assessment */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Skill Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {skillAssessments.map((skill, index) => (
                    <div key={skill.skill} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {skill.currentLevel}/10
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-purple-600">
                            {skill.targetLevel}/10
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={(skill.currentLevel / 10) * 100}
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        Target: Level {skill.targetLevel}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* AI Insights */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-500" />
                    AI Coaching Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coachingInsights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                      <div
                        key={index}
                        className="flex gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <Icon className={cn("w-5 h-5 mt-0.5", insight.color)} />
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {insight.title}
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {insight.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Quick Stats */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <Trophy className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-600">12</div>
                      <div className="text-xs text-green-600">
                        Sessions Completed
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">24h</div>
                      <div className="text-xs text-blue-600">Practice Time</div>
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <Zap className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-600">87%</div>
                    <div className="text-xs text-purple-600">
                      Improvement Score
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="sessions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sessions">Coaching Sessions</TabsTrigger>
                <TabsTrigger value="practice">Practice Areas</TabsTrigger>
                <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
              </TabsList>

              {/* Coaching Sessions */}
              <TabsContent value="sessions">
                <StaggeredContainer className="space-y-4">
                  {coachingSessions.map((session, index) => {
                    const TypeIcon = getTypeIcon(session.type);
                    return (
                      <StaggeredItem key={session.id}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer group">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/20">
                                    <TypeIcon className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold group-hover:text-purple-600 transition-colors">
                                      {session.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="capitalize text-xs"
                                      >
                                        {session.type}
                                      </Badge>
                                      <Badge
                                        className={cn(
                                          "text-xs",
                                          getDifficultyColor(session.difficulty)
                                        )}
                                      >
                                        {session.difficulty}
                                      </Badge>
                                      {session.isCompleted && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Completed
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">
                                    {session.duration} minutes
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Progress: {session.progress}%
                                  </div>
                                </div>
                              </div>

                              {/* Progress */}
                              <div>
                                <Progress
                                  value={session.progress}
                                  className="h-2"
                                />
                              </div>

                              {/* Skills & Actions */}
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {session.skills.map((skill, skillIndex) => (
                                    <Badge
                                      key={skillIndex}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>

                                <Button
                                  onClick={() => startSession(session)}
                                  disabled={activeSession?.id === session.id}
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                >
                                  {activeSession?.id === session.id ? (
                                    "In Progress"
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      {session.progress > 0
                                        ? "Continue"
                                        : "Start"}
                                    </>
                                  )}
                                </Button>
                              </div>

                              {/* AI Insights */}
                              {session.aiInsights && (
                                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5" />
                                    <div>
                                      <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                        AI Coaching Tip
                                      </div>
                                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                        {session.aiInsights}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </StaggeredItem>
                    );
                  })}
                </StaggeredContainer>
              </TabsContent>

              {/* Practice Areas */}
              <TabsContent value="practice">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {skillAssessments.map((skill, index) => (
                    <AnimatedContainer key={skill.skill} delay={index * 0.1}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {skill.skill}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="text-sm font-medium">
                              Improvement Tips
                            </div>
                            <ul className="space-y-2">
                              {skill.improvementTips.map((tip, tipIndex) => (
                                <li
                                  key={tipIndex}
                                  className="text-xs text-muted-foreground flex items-start gap-2"
                                >
                                  <ChevronRight className="w-3 h-3 mt-0.5 text-purple-500" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <div className="text-sm font-medium">
                              Practice Exercises
                            </div>
                            <ul className="space-y-2">
                              {skill.practiceExercises.map(
                                (exercise, exerciseIndex) => (
                                  <li
                                    key={exerciseIndex}
                                    className="text-xs text-muted-foreground flex items-start gap-2"
                                  >
                                    <Target className="w-3 h-3 mt-0.5 text-indigo-500" />
                                    {exercise}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                          <Button variant="outline" className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Start Practice
                          </Button>
                        </CardContent>
                      </Card>
                    </AnimatedContainer>
                  ))}
                </div>
              </TabsContent>

              {/* AI Feedback */}
              <TabsContent value="feedback">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        Recent AI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">
                              Technical Leadership Session
                            </div>
                            <div className="text-sm text-muted-foreground">
                              2 hours ago
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-sm">
                                Strong technical depth and architectural
                                thinking
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              <span className="text-sm">
                                Consider adding more business impact metrics
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                              <span className="text-sm">
                                Practice explaining complex concepts simply
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">
                              Behavioral Interview Practice
                            </div>
                            <div className="text-sm text-muted-foreground">
                              1 day ago
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-sm">
                                Excellent use of STAR method structure
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-sm">
                                Clear quantification of results and impact
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              <span className="text-sm">
                                Add more emotional intelligence examples
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
