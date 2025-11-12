"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import type { Interview } from "@/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  Globe,
  Plus,
  Edit3,
  Trash2,
  Settings,
  Bell,
  Filter,
  Search,
  Download,
  Upload,
  UserPlus,
  CalendarDays,
  Timer,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface TimeSlot {
  time: string;
  available: boolean;
  interview?: Interview;
}

interface NewInterviewForm {
  candidateName: string;
  position: string;
  scheduledAt: string; // date string
  time: string;
  duration: number;
  type: string;
  status: string;
  candidateEmail: string;
  candidatePhone: string;
  notes: string;
}

function InterviewScheduler() {
  const [selectedView, setSelectedView] = useState<"day" | "week" | "month">(
    "week",
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          // API now returns Prisma Interview type directly
          const interviews = (data.interviews || []) as Interview[];
          setInterviews(interviews);
        } else {
          setInterviews([]);
        }
      } catch {
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();

    // Check calendar connection status
    const checkCalendarConnection = async () => {
      try {
        const response = await fetch("/api/google/calendar/status");
        if (response.ok) {
          const { connected } = await response.json();
          setCalendarConnected(connected);
        }
      } catch (error) {
        console.error("Error checking calendar status:", error);
      }
    };
    checkCalendarConnection();

    // Check URL params for OAuth success/error
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "calendar_connected") {
      setSuccessMessage("Google Calendar connected successfully!");
      setCalendarConnected(true);
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error")) {
      const errorType = params.get("error");
      const errorMessages: Record<string, string> = {
        oauth_denied: "Calendar access was denied",
        invalid_callback: "Invalid OAuth callback",
        unauthorized: "Unauthorized access",
        token_exchange_failed: "Failed to exchange tokens",
        callback_failed: "OAuth callback failed",
      };
      setErrorMessage(
        errorMessages[errorType || ""] || "Failed to connect calendar",
      );
      setTimeout(() => setErrorMessage(null), 5000);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Calculate stats and fetch notifications when interviews change
  useEffect(() => {
    if (interviews.length === 0) return;

    // Calculate statistics
    const completed = interviews.filter((i) => i.status === "completed").length;
    const confirmed = interviews.filter((i) => i.status === "confirmed").length;
    const total = interviews.length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgDuration =
      total > 0
        ? Math.round(
            interviews.reduce((sum, i) => sum + (i.duration || 0), 0) / total
          )
        : 0;

    // Calculate week growth
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const thisWeekCount = interviews.filter(
      (i) => getInterviewDate(i) >= weekStart && getInterviewDate(i) <= now
    ).length;
    const lastWeekCount = interviews.filter(
      (i) => getInterviewDate(i) >= prevWeekStart && getInterviewDate(i) < weekStart
    ).length;

    const weekGrowth =
      lastWeekCount > 0
        ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
        : 0;

    setStats({
      totalInterviews: total,
      completedInterviews: completed,
      confirmedInterviews: confirmed,
      successRate,
      avgDuration,
      weekGrowth,
    });

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/interviews/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [interviews]);
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [newInterviewForm, setNewInterviewForm] = useState<NewInterviewForm>({
    candidateName: "",
    position: "",
    scheduledAt: new Date().toISOString().slice(0, 10),
    time: "09:00",
    duration: 60,
    type: "video",
    status: "scheduled",
    candidateEmail: "",
    candidatePhone: "",
    notes: "",
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  
  // New state for modals and functionality
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState<string | null>(null);
  const [notesContent, setNotesContent] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    confirmedInterviews: 0,
    successRate: 0,
    avgDuration: 0,
    weekGrowth: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  // Helper function to safely get date from scheduledAt
  const getInterviewDate = (interview: Interview): Date => {
    if (interview.scheduledAt) {
      return new Date(interview.scheduledAt);
    }
    return new Date();
  };

  // Generate time slots for the selected date
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const interview = interviews.find(
          (i) => {
            return getInterviewDate(i).toDateString() === selectedDate.toDateString() &&
              i.time === time;
          }
        );

        slots.push({
          time,
          available: !interview,
          interview,
        });
      }
    }

    return slots;
  };

  const getStatusColor = (status: Interview["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
      case "completed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
      case "no-show":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: Interview["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "in-person":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesStatus =
      filterStatus === "all" || interview.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      (interview.candidateName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (interview.position || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getUpcomingInterviews = () => {
    const now = new Date();
    return interviews
      .filter((interview) => {
        const interviewDateTime = getInterviewDate(interview);
        const [hours, minutes] = (interview.time || "00:00").split(":").map(Number);
        interviewDateTime.setHours(hours, minutes);
        return interviewDateTime > now;
      })
      .sort((a, b) => {
        const aDateTime = new Date(a.scheduledAt || new Date());
        const [aHours, aMinutes] = (a.time || "00:00").split(":").map(Number);
        aDateTime.setHours(aHours, aMinutes);

        const bDateTime = new Date(b.scheduledAt || new Date());
        const [bHours, bMinutes] = (b.time || "00:00").split(":").map(Number);
        bDateTime.setHours(bHours, bMinutes);

        return aDateTime.getTime() - bDateTime.getTime();
      });
  };
  const getDayStats = () => {
    const today = new Date();
    const todayInterviews = interviews.filter(
      (i) => getInterviewDate(i).toDateString() === today.toDateString(),
    );

    return {
      total: todayInterviews.length,
      confirmed: todayInterviews.filter((i) => i.status === "confirmed").length,
      pending: todayInterviews.filter((i) => i.status === "scheduled").length,
      completed: todayInterviews.filter((i) => i.status === "completed").length,
    };
  };

  const getWeekStats = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekInterviews = interviews.filter((interview) => {
      const interviewDate = getInterviewDate(interview);
      return interviewDate >= startOfWeek && interviewDate <= endOfWeek;
    });

    return weekInterviews.length;
  };

  const timeSlots = generateTimeSlots();
  const upcomingInterviews = getUpcomingInterviews();
  const dayStats = getDayStats();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newInterviewForm.candidateName.trim()) {
      errors.candidateName = "Candidate name is required";
    }

    if (!newInterviewForm.position.trim()) {
      errors.position = "Position is required";
    }

    if (!newInterviewForm.candidateEmail.trim()) {
      errors.candidateEmail = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInterviewForm.candidateEmail)
    ) {
      errors.candidateEmail = "Invalid email format";
    }

    if (!newInterviewForm.scheduledAt) {
      errors.scheduledAt = "Date is required";
    } else {
      const selectedDate = new Date(newInterviewForm.scheduledAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.scheduledAt = "Date cannot be in the past";
      }
    }

    if (!newInterviewForm.time) {
      errors.time = "Time is required";
    }

    if (newInterviewForm.duration < 15) {
      errors.duration = "Duration must be at least 15 minutes";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Interview Scheduler
              </h1>
              <p className="text-muted-foreground mt-2">
                Smart scheduling with automated reminders and calendar
                integration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowNewInterviewModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Schedule Interview
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!session?.user?.id) {
                    setErrorMessage(
                      "You must be logged in to connect Google Calendar",
                    );
                    return;
                  }

                  // Navigate directly to Google OAuth
                  window.location.href = "/api/google/oauth";
                }}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {calendarConnected
                  ? "Calendar Connected ✓"
                  : "Sync Google Calendar"}
              </Button>
              {calendarConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      setSuccessMessage(
                        "Syncing interviews with Google Calendar...",
                      );
                      const response = await fetch(
                        "/api/interviews/sync-calendar",
                        {
                          method: "POST",
                        },
                      );

                      if (response.ok) {
                        const result = await response.json();
                        const totalSynced = (result.jobPrepToGoogle || 0) + (result.googleToJobPrep || 0);
                        setSuccessMessage(
                          `Sync complete: ${result.jobPrepToGoogle || 0} to Google Calendar, ${result.googleToJobPrep || 0} from Google Calendar` +
                            (result.skipped > 0
                              ? ` (${result.skipped} already synced)`
                              : ""),
                        );
                      } else {
                        throw new Error("Failed to sync");
                      }

                      setTimeout(() => setSuccessMessage(null), 5000);
                    } catch {
                      setErrorMessage(
                        "Failed to sync interviews with Google Calendar",
                      );
                      setTimeout(() => setErrorMessage(null), 5000);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Sync Both Ways
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => setShowSettingsModal(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Quick Stats */}
        <StaggeredContainer>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StaggeredItem>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Today's Interviews
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {dayStats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <span className="text-primary">
                      ✓ {dayStats.confirmed} Confirmed
                    </span>
                    <span className="text-secondary">
                      ⧖ {dayStats.pending} Pending
                    </span>
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
                        This Week
                      </p>
                      <p className="text-3xl font-bold text-secondary">
                        {getWeekStats()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stats.weekGrowth > 0 ? '+' : ''}{stats.weekGrowth}% from last week
                    </div>
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
                        Success Rate
                      </p>
                      <p className="text-3xl font-bold text-accent">{stats.successRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={stats.successRate} className="h-2" />
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
                      <p className="text-3xl font-bold text-primary">
                        {stats.avgDuration}min
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Timer className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Optimal: 45-60 minutes
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>
          </div>
        </StaggeredContainer>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Calendar and Interview List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calendar Controls */}
            <AnimatedContainer delay={0.1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Schedule Calendar
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Tabs
                        value={selectedView}
                        onValueChange={(v: string) =>
                          setSelectedView(v as "day" | "week" | "month")
                        }
                      >
                        <TabsList>
                          <TabsTrigger value="day">Day</TabsTrigger>
                          <TabsTrigger value="week">Week</TabsTrigger>
                          <TabsTrigger value="month">Month</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedView === "day" && (
                    <div className="space-y-3">
                      {timeSlots.map((slot, index) => (
                        <motion.div
                          key={slot.time}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={cn(
                            "flex items-stretch rounded-lg border-2 transition-all cursor-pointer",
                            slot.available
                              ? "border-border bg-background hover:border-primary hover:bg-primary/5"
                              : "border-primary bg-card",
                          )}
                          onClick={() => {
                            if (!slot.available) return;
                            setNewInterviewForm((f) => ({
                              ...f,
                              time: slot.time,
                              date: selectedDate.toISOString().slice(0, 10),
                            }));
                            setShowNewInterviewModal(true);
                          }}
                        >
                          <div className="w-20 bg-card px-4 py-4 flex items-center justify-center border-r border-border font-semibold text-foreground">
                            {slot.time}
                          </div>

                          {slot.interview ? (
                            <div className="flex items-center justify-between flex-1 px-4 py-4">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                                  {getTypeIcon(slot.interview.type)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-foreground">
                                    {slot.interview.candidateName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {slot.interview.position} • {slot.interview.duration}min
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                <Badge
                                  className={getStatusColor(
                                    slot.interview.status,
                                  )}
                                >
                                  {slot.interview.status}
                                </Badge>
                                <Button variant="ghost" size="sm" className="hover:bg-primary/10" onClick={() => {
                                  setEditingInterview(slot.interview!);
                                  setShowEditModal(true);
                                }}>
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-4 text-muted-foreground hover:text-foreground">
                              <Plus className="w-5 h-5" />
                              <span className="font-medium">Click to schedule</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {selectedView === "week" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-7 gap-3 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div key={day} className="p-3 font-semibold text-foreground text-sm">
                              {day}
                            </div>
                          ),
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = new Date(selectedDate);
                          date.setDate(
                            selectedDate.getDate() - selectedDate.getDay() + i,
                          );
                          const dayInterviews = interviews.filter(
                            (interview) =>
                              getInterviewDate(interview).toDateString() ===
                              date.toDateString(),
                          );
                          const isToday = date.toDateString() === new Date().toDateString();

                          return (
                            <motion.div
                              key={date.toDateString()}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={cn(
                                "min-h-[160px] p-4 border-2 rounded-lg transition-all",
                                isToday
                                  ? "border-primary bg-primary/5"
                                  : "border-border bg-card hover:border-foreground/20",
                              )}
                            >
                              <div className={cn(
                                "text-lg font-bold mb-3 w-8 h-8 flex items-center justify-center rounded-lg",
                                isToday ? "bg-primary text-white" : "text-foreground"
                              )}>
                                {date.getDate()}
                              </div>
                              <div className="space-y-2">
                                {dayInterviews.slice(0, 3).map((interview) => (
                                  <div
                                    key={interview.id}
                                    className="text-xs p-2 rounded bg-primary/10 text-primary font-medium truncate hover:bg-primary/20 transition-colors"
                                  >
                                    <div className="truncate">{interview.time}</div>
                                    <div className="truncate text-primary/80">{interview.candidateName}</div>
                                  </div>
                                ))}
                                {dayInterviews.length > 3 && (
                                  <div className="text-xs text-muted-foreground font-medium px-2">
                                    +{dayInterviews.length - 3} more
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedView === "month" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {selectedDate.toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newDate = new Date(selectedDate);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setSelectedDate(newDate);
                            }}
                          >
                            ←
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newDate = new Date(selectedDate);
                              newDate.setMonth(newDate.getMonth() + 1);
                              setSelectedDate(newDate);
                            }}
                          >
                            →
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div
                              key={day}
                              className="p-2 font-semibold text-foreground text-sm"
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 42 }, (_, i) => {
                          const firstDay = new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth(),
                            1
                          );
                          const startDate = new Date(firstDay);
                          startDate.setDate(startDate.getDate() - firstDay.getDay());

                          const date = new Date(startDate);
                          date.setDate(startDate.getDate() + i);

                          const dayInterviews = interviews.filter(
                            (interview) =>
                              getInterviewDate(interview).toDateString() === date.toDateString()
                          );

                          const isToday = date.toDateString() === new Date().toDateString();
                          const isCurrentMonth =
                            date.getMonth() === selectedDate.getMonth();

                          return (
                            <motion.div
                              key={date.toDateString()}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={cn(
                                "min-h-[100px] p-2 border rounded-lg transition-all cursor-pointer",
                                isCurrentMonth
                                  ? isToday
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-card hover:border-foreground/20"
                                  : "border-border/30 bg-muted/20 opacity-50",
                                dayInterviews.length > 0 && "border-primary/50"
                              )}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedView("day");
                              }}
                            >
                              <div
                                className={cn(
                                  "text-sm font-bold mb-1",
                                  isToday
                                    ? "text-primary"
                                    : "text-foreground/60",
                                  !isCurrentMonth && "opacity-40"
                                )}
                              >
                                {date.getDate()}
                              </div>
                              <div className="space-y-1">
                                {dayInterviews.slice(0, 2).map((interview) => (
                                  <div
                                    key={interview.id}
                                    className="text-xs p-1 rounded bg-primary/20 text-primary font-medium truncate"
                                  >
                                    {interview.time}
                                  </div>
                                ))}
                                {dayInterviews.length > 2 && (
                                  <div className="text-xs text-muted-foreground px-1 font-medium">
                                    +{dayInterviews.length - 2}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Interview List */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      All Interviews
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search candidates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 w-48"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowFilterModal(true)}>
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* New Interview Modal - simple, local modal using AnimatePresence */}
                  <AnimatePresence>
                    {showNewInterviewModal && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      >
                        <button
                          type="button"
                          aria-label="Close modal overlay"
                          className="absolute inset-0 bg-black/40"
                          onClick={() => setShowNewInterviewModal(false)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setShowNewInterviewModal(false);
                            }
                          }}
                        />

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="relative w-full max-w-2xl bg-background rounded-lg p-6 shadow-lg border border-border"
                        >
                          <h3 className="text-lg font-semibold mb-3">
                            Schedule New Interview
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Candidate Name *</Label>
                              <Input
                                value={newInterviewForm.candidateName}
                                onChange={(e) => {
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    candidateName: e.target.value,
                                  }));
                                  if (formErrors.candidateName) {
                                    setFormErrors((prev) => ({
                                      ...prev,
                                      candidateName: "",
                                    }));
                                  }
                                }}
                                placeholder="Full name"
                                className={
                                  formErrors.candidateName
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {formErrors.candidateName && (
                                <p className="text-xs text-red-500 mt-1">
                                  {formErrors.candidateName}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Position *</Label>
                              <Input
                                value={newInterviewForm.position}
                                onChange={(e) => {
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    position: e.target.value,
                                  }));
                                  if (formErrors.position) {
                                    setFormErrors((prev) => ({
                                      ...prev,
                                      position: "",
                                    }));
                                  }
                                }}
                                placeholder="Position / title"
                                className={
                                  formErrors.position ? "border-red-500" : ""
                                }
                              />
                              {formErrors.position && (
                                <p className="text-xs text-red-500 mt-1">
                                  {formErrors.position}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Date *</Label>
                              <Input
                                type="date"
                                value={newInterviewForm.scheduledAt}
                                onChange={(e) => {
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    scheduledAt: e.target.value,
                                  }));
                                  if (formErrors.scheduledAt) {
                                    setFormErrors((prev) => ({
                                      ...prev,
                                      date: "",
                                    }));
                                  }
                                }}
                                className={
                                  formErrors.scheduledAt ? "border-red-500" : ""
                                }
                              />
                              {formErrors.scheduledAt && (
                                <p className="text-xs text-red-500 mt-1">
                                  {formErrors.scheduledAt}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Time *</Label>
                              <Input
                                type="time"
                                value={newInterviewForm.time}
                                onChange={(e) => {
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    time: e.target.value,
                                  }));
                                  if (formErrors.time) {
                                    setFormErrors((prev) => ({
                                      ...prev,
                                      time: "",
                                    }));
                                  }
                                }}
                                className={
                                  formErrors.time ? "border-red-500" : ""
                                }
                              />
                              {formErrors.time && (
                                <p className="text-xs text-red-500 mt-1">
                                  {formErrors.time}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Duration (minutes) *</Label>
                              <Input
                                type="number"
                                min="15"
                                value={newInterviewForm.duration}
                                onChange={(e) => {
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    duration: Number(e.target.value) || 30,
                                  }));
                                  if (formErrors.duration) {
                                    setFormErrors((prev) => ({
                                      ...prev,
                                      duration: "",
                                    }));
                                  }
                                }}
                                className={
                                  formErrors.duration ? "border-red-500" : ""
                                }
                              />
                              {formErrors.duration && (
                                <p className="text-xs text-red-500 mt-1">
                                  {formErrors.duration}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Type</Label>
                              <select
                                aria-label="Interview type"
                                className="w-full rounded border px-2 py-1 bg-transparent text-sm"
                                value={newInterviewForm.type}
                                onChange={(e) =>
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    type: e.target.value as Interview["type"],
                                  }))
                                }
                              >
                                <option value="video">Video</option>
                                <option value="in-person">In-Person</option>
                                <option value="phone">Phone</option>
                              </select>
                            </div>

                            <div>
                              <Label>Status</Label>
                              <select
                                aria-label="Interview status"
                                className="w-full rounded border px-2 py-1 bg-transparent text-sm"
                                value={newInterviewForm.status}
                                onChange={(e) =>
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    status: e.target
                                      .value as Interview["status"],
                                  }))
                                }
                              >
                                <option value="scheduled">Scheduled</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no-show">No-show</option>
                              </select>
                            </div>

                            <div>
                              <Label>Email *</Label>
                              <Input
                                type="email"
                                value={newInterviewForm.candidateEmail}
                                onChange={(e) => {
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    candidateEmail: e.target.value,
                                  }));
                                  if (formErrors.candidateEmail) {
                                    setFormErrors((prev) => ({
                                      ...prev,
                                      candidateEmail: "",
                                    }));
                                  }
                                }}
                                placeholder="candidate@email.com"
                                className={
                                  formErrors.candidateEmail
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {formErrors.candidateEmail && (
                                <p className="text-xs text-red-500 mt-1">
                                  {formErrors.candidateEmail}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Phone</Label>
                              <Input
                                value={newInterviewForm.candidatePhone}
                                onChange={(e) =>
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    candidatePhone: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="md:col-span-2">
                              <Label>Notes</Label>
                              <Input
                                value={newInterviewForm.notes}
                                onChange={(e) =>
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    notes: e.target.value,
                                  }))
                                }
                                placeholder="Optional notes"
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowNewInterviewModal(false);
                                setFormErrors({});
                              }}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={async () => {
                                // Validate form
                                if (!validateForm()) {
                                  return;
                                }

                                if (!session?.user?.id) {
                                  setErrorMessage(
                                    "You must be logged in to create interviews",
                                  );
                                  return;
                                }

                                setIsSubmitting(true);

                                try {
                                  // Combine date and time for scheduledAt
                                  const [hours, minutes] =
                                    newInterviewForm.time.split(":");
                                  const scheduledDate = new Date(
                                    newInterviewForm.scheduledAt,
                                  );
                                  scheduledDate.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );

                                  // Create payload (no templateId required - API creates default)
                                  const payload = {
                                    candidateId: session.user.id,
                                    interviewerId: session.user.id,
                                    scheduledAt: scheduledDate.toISOString(),
                                    isAIInterviewer: false,
                                    allowRecording: true,
                                    settings: {
                                      candidateName:
                                        newInterviewForm.candidateName,
                                      position: newInterviewForm.position,
                                      candidateEmail:
                                        newInterviewForm.candidateEmail,
                                      candidatePhone:
                                        newInterviewForm.candidatePhone,
                                      notes: newInterviewForm.notes,
                                      type: newInterviewForm.type,
                                      duration: newInterviewForm.duration,
                                    },
                                  };

                                  const response = await fetch(
                                    "/api/interviews",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify(payload),
                                    },
                                  );

                                  if (!response.ok) {
                                    const error = await response.json();
                                    throw new Error(
                                      error.error ||
                                        "Failed to create interview",
                                    );
                                  }

                                  await response.json();

                                  // Refetch all interviews to get the latest data from the server
                                  const refetchResponse =
                                    await fetch("/api/interviews");
                                  if (refetchResponse.ok) {
                                    const data = await refetchResponse.json();
                                    const fetchedInterviews = (
                                      data.interviews || []
                                    ) as Interview[];
                                    setInterviews(fetchedInterviews);
                                  }

                                  setSuccessMessage(
                                    "Interview scheduled successfully!" +
                                      (calendarConnected
                                        ? " Synced to Google Calendar."
                                        : ""),
                                  );
                                  setShowNewInterviewModal(false);
                                  setFormErrors({});

                                  // Reset form
                                  setNewInterviewForm({
                                    candidateName: "",
                                    position: "",
                                    scheduledAt: new Date().toISOString().slice(0, 10),
                                    time: "09:00",
                                    duration: 60,
                                    type: "video",
                                    status: "scheduled",
                                    candidateEmail: "",
                                    candidatePhone: "",
                                    notes: "",
                                  });

                                  setTimeout(
                                    () => setSuccessMessage(null),
                                    5000,
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error creating interview:",
                                    error,
                                  );
                                  setErrorMessage(
                                    error instanceof Error
                                      ? error.message
                                      : "Failed to create interview",
                                  );
                                  setTimeout(() => setErrorMessage(null), 5000);
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Saving..." : "Save Interview"}
                            </Button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-4">
                    {filteredInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-medium">
                            {(interview.candidateName || "")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>

                          <div>
                            <h4 className="font-medium">
                              {interview.candidateName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {interview.position}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {getInterviewDate(interview).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {interview.time} ({interview.duration}min)
                              </span>
                              <span className="flex items-center gap-1">
                                {getTypeIcon(interview.type)}
                                {interview.type}
                              </span>
                            </div>
                            {/* Email & Calendar Status */}
                            <div className="flex items-center gap-2 mt-2">
                              {interview.reminderSent && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 font-medium">
                                  ✓ Email sent
                                </span>
                              )}
                              {calendarConnected && interview.isCalendarSynced && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 font-medium">
                                  ✓ Calendar synced
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>

                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setShowNotesModal(interview.id);
                              setNotesContent(interview.notes || "");
                            }}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setEditingInterview(interview);
                              setShowEditModal(true);
                            }}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(interview.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Sidebar - Upcoming, Actions, Notifications */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Interviews */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Next Up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingInterviews.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming interviews</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingInterviews
                        .slice(0, 3)
                        .map((interview, index) => (
                          <motion.div
                            key={interview.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-medium">
                              {(interview.candidateName || "")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>

                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {interview.candidateName || "Anonymous"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getInterviewDate(interview).toLocaleDateString()} at{" "}
                                {interview.time}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {getTypeIcon(interview.type)}
                                <Badge
                                  className={getStatusColor(interview.status)}
                                >
                                  {interview.status}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Quick Actions */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    // Navigate to candidate creation
                    window.location.href = "/candidate-profiles";
                  }}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={async () => {
                    const toRemind = interviews.filter(i => !i.reminderSent && i.status !== "completed");
                    if (toRemind.length === 0) {
                      setErrorMessage("No interviews need reminders");
                      setTimeout(() => setErrorMessage(null), 5000);
                      return;
                    }

                    try {
                      const response = await fetch("/api/interviews/send-reminders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ interviewIds: toRemind.map(i => i.id) }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        setSuccessMessage(`Reminders sent to ${result.sent} candidate(s)!`);
                        // Refresh interviews
                        const refreshResponse = await fetch("/api/interviews");
                        if (refreshResponse.ok) {
                          const data = await refreshResponse.json();
                          const transformed = (data.interviews || []) as Interview[];
                          setInterviews(transformed);
                        }
                      } else {
                        throw new Error("Failed to send reminders");
                      }
                      setTimeout(() => setSuccessMessage(null), 5000);
                    } catch (error) {
                      setErrorMessage("Failed to send reminders");
                      setTimeout(() => setErrorMessage(null), 5000);
                    }
                  }}>
                    <Bell className="w-4 h-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={async () => {
                    try {
                      const response = await fetch("/api/interviews/export", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ format: "csv" }),
                      });

                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `interviews-${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        setSuccessMessage("Interviews exported successfully!");
                        setTimeout(() => setSuccessMessage(null), 5000);
                      } else {
                        throw new Error("Failed to export");
                      }
                    } catch (error) {
                      setErrorMessage("Failed to export interviews");
                      setTimeout(() => setErrorMessage(null), 5000);
                    }
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    fileInputRef.current?.click();
                  }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Calendar
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        const formData = new FormData();
                        formData.append("file", file);

                        const response = await fetch("/api/interviews/import", {
                          method: "POST",
                          body: formData,
                        });

                        if (response.ok) {
                          const result = await response.json();
                          setSuccessMessage(`Imported ${result.imported} interview(s)!${result.failed > 0 ? ` (${result.failed} failed)` : ""}`);
                          
                          // Refresh interviews
                          const refreshResponse = await fetch("/api/interviews");
                          if (refreshResponse.ok) {
                            const data = await refreshResponse.json();
                            const transformed = (data.interviews || []) as Interview[];
                            setInterviews(transformed);
                          }
                        } else {
                          throw new Error("Failed to import");
                        }
                        setTimeout(() => setSuccessMessage(null), 5000);
                      } catch (error) {
                        setErrorMessage("Failed to import interviews");
                        setTimeout(() => setErrorMessage(null), 5000);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Notifications */}
            <AnimatedContainer delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 3).map((notif: any) => {
                      const getNotificationIcon = () => {
                        switch (notif.type) {
                          case "reminder":
                            return <AlertCircle className="w-4 h-4 text-primary mt-0.5" />;
                          case "confirmation":
                            return <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />;
                          case "completion":
                            return <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />;
                          default:
                            return <Bell className="w-4 h-4 text-foreground mt-0.5" />;
                        }
                      };

                      const getNotificationBgColor = () => {
                        switch (notif.severity) {
                          case "info":
                            return "bg-primary/10";
                          case "success":
                            return "bg-secondary/10";
                          case "warning":
                            return "bg-amber-500/10";
                          case "error":
                            return "bg-red-500/10";
                          default:
                            return "bg-muted";
                        }
                      };

                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-3 p-3 rounded-lg ${getNotificationBgColor()}`}
                        >
                          {getNotificationIcon()}
                          <div className="text-sm flex-1">
                            <div className="font-medium">{notif.title}</div>
                            <div className="text-muted-foreground text-xs">{notif.message}</div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>

        {/* MODALS */}

        {/* Edit Interview Modal */}
        <AnimatePresence>
          {showEditModal && editingInterview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <button
                type="button"
                aria-label="Close modal"
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingInterview(null);
                }}
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-full max-w-2xl bg-background rounded-lg p-6 shadow-lg border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Interview</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingInterview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Candidate Name</Label>
                    <Input
                      value={editingInterview?.candidateName || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview!,
                          candidateName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Position</Label>
                    <Input
                      value={editingInterview?.position || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview!,
                          position: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={getInterviewDate(editingInterview!).toISOString().slice(0, 10)}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview!,
                          scheduledAt: new Date(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={editingInterview?.time || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview!,
                          time: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={editingInterview?.duration || 0}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview!,
                          duration: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Type</Label>
                    <select
                      value={editingInterview?.type || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview,
                          type: e.target.value as Interview["type"],
                        })
                      }
                      className="w-full rounded border px-2 py-1 bg-transparent text-sm"
                    >
                      <option value="video">Video</option>
                      <option value="in-person">In-Person</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <select
                      value={editingInterview.status}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview,
                          status: e.target.value as Interview["status"],
                        })
                      }
                      className="w-full rounded border px-2 py-1 bg-transparent text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No-show</option>
                    </select>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingInterview?.candidateEmail || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview!,
                          candidateEmail: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editingInterview.candidatePhone || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview,
                          candidatePhone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Input
                      value={editingInterview.notes || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Optional notes"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingInterview(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const [hours, minutes] = (editingInterview?.time || "00:00")
                          .split(":")
                          .map(Number);
                        const scheduledDate = new Date(editingInterview?.scheduledAt || new Date());
                        scheduledDate.setHours(hours, minutes);

                        const response = await fetch(
                          `/api/interviews/${editingInterview.id}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              status: editingInterview.status,
                              scheduledAt: scheduledDate.toISOString(),
                              settings: {
                                candidateName: editingInterview.candidateName,
                                position: editingInterview.position,
                                candidateEmail: editingInterview.candidateEmail,
                                candidatePhone: editingInterview.candidatePhone,
                                notes: editingInterview.notes,
                              },
                            }),
                          }
                        );

                        if (!response.ok) {
                          throw new Error("Failed to update interview");
                        }

                        setSuccessMessage("Interview updated successfully!");
                        setShowEditModal(false);
                        setEditingInterview(null);

                        // Refresh interviews
                        const refreshResponse = await fetch("/api/interviews");
                        if (refreshResponse.ok) {
                          const data = await refreshResponse.json();
                          const transformed = (data.interviews || []) as Interview[];
                          setInterviews(transformed);
                        }

                        setTimeout(() => setSuccessMessage(null), 5000);
                      } catch (error) {
                        setErrorMessage("Failed to update interview");
                        setTimeout(() => setErrorMessage(null), 5000);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowDeleteConfirm(null)}
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative w-full max-w-sm bg-background rounded-lg p-6 shadow-lg border border-border"
              >
                <h3 className="text-lg font-semibold mb-2">Delete Interview?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to delete this interview? This action
                  cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/interviews/${showDeleteConfirm}`,
                          { method: "DELETE" }
                        );

                        if (!response.ok) {
                          throw new Error("Failed to delete interview");
                        }

                        setSuccessMessage("Interview deleted successfully!");
                        setShowDeleteConfirm(null);

                        // Refresh interviews
                        const refreshResponse = await fetch("/api/interviews");
                        if (refreshResponse.ok) {
                          const data = await refreshResponse.json();
                          const transformed = (data.interviews || []) as Interview[];
                          setInterviews(transformed);
                        }

                        setTimeout(() => setSuccessMessage(null), 5000);
                      } catch (error) {
                        setErrorMessage("Failed to delete interview");
                        setTimeout(() => setErrorMessage(null), 5000);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Modal */}
        <AnimatePresence>
          {showFilterModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowFilterModal(false)}
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative w-full max-w-sm bg-background rounded-lg p-6 shadow-lg border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filter Interviews</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilterModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full rounded border px-2 py-2 bg-transparent text-sm"
                    >
                      <option value="all">All</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No-show</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilterModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Modal */}
        <AnimatePresence>
          {showNotesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowNotesModal(null)}
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative w-full max-w-2xl bg-background rounded-lg p-6 shadow-lg border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Interview Notes</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotesModal(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <textarea
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  placeholder="Add notes about this interview..."
                  className="w-full h-48 rounded border px-3 py-2 bg-transparent text-sm resize-none"
                />

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNotesModal(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const interview = interviews.find(
                          (i) => i.id === showNotesModal
                        );
                        if (!interview) return;

                        const response = await fetch(
                          `/api/interviews/${showNotesModal}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              settings: {
                                ...interview,
                                notes: notesContent,
                              },
                            }),
                          }
                        );

                        if (!response.ok) {
                          throw new Error("Failed to save notes");
                        }

                        setSuccessMessage("Notes saved successfully!");
                        setShowNotesModal(null);

                        // Refresh interviews
                        const refreshResponse = await fetch("/api/interviews");
                        if (refreshResponse.ok) {
                          const data = await refreshResponse.json();
                          const transformed = (data.interviews || []) as Interview[];
                          setInterviews(transformed);
                        }

                        setTimeout(() => setSuccessMessage(null), 5000);
                      } catch (error) {
                        setErrorMessage("Failed to save notes");
                        setTimeout(() => setErrorMessage(null), 5000);
                      }
                    }}
                  >
                    Save Notes
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowSettingsModal(false)}
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative w-full max-w-sm bg-background rounded-lg p-6 shadow-lg border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Interview Settings</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettingsModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-muted-foreground">Notifications</div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-send reminders</Label>
                      <input type="checkbox" className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Send confirmations</Label>
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show in-app notifications</Label>
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold text-muted-foreground mb-3">Calendar Integration</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <div className="text-sm font-medium">Google Calendar</div>
                          <div className="text-xs text-muted-foreground">
                            {calendarConnected ? '✓ Connected' : 'Not connected'}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={calendarConnected ? "outline" : "default"}
                          onClick={async () => {
                            try {
                              if (calendarConnected) {
                                // Disconnect
                                setCalendarConnected(false);
                                setSuccessMessage("Google Calendar disconnected");
                              } else {
                                // Connect
                                const response = await fetch('/api/calendar/sync?action=authorize');
                                const { authUrl } = await response.json();
                                window.location.href = authUrl;
                              }
                              setTimeout(() => setSuccessMessage(null), 5000);
                            } catch (error) {
                              setErrorMessage("Failed to manage calendar connection");
                              setTimeout(() => setErrorMessage(null), 5000);
                            }
                          }}
                        >
                          {calendarConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto-sync interviews to calendar</Label>
                        <input type="checkbox" className="w-4 h-4" defaultChecked={calendarConnected} disabled={!calendarConnected} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold text-muted-foreground mb-3">Email Service</div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>📧 Email reminders and confirmations will be sent via:</p>
                      <p className="font-medium text-foreground">Gmail API</p>
                      <p>Ensure your Gmail credentials are configured in settings.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettingsModal(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={() => {
                    setSuccessMessage("Settings saved!");
                    setTimeout(() => setSuccessMessage(null), 5000);
                    setShowSettingsModal(false);
                  }}>
                    Save Settings
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Page() {
  return <InterviewScheduler />;
}
