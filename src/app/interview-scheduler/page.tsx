"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface Interview {
  id: string;
  candidateName: string;
  position: string;
  date: Date;
  time: string;
  duration: number;
  type: "in-person" | "video" | "phone";
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  interviewer: string;
  location?: string;
  notes?: string;
  reminderSent: boolean;
  candidateEmail: string;
  candidatePhone?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  interview?: Interview;
}

// API interview shape coming from server
interface ApiInterview {
  id?: string;
  candidateName?: string;
  title?: string;
  scheduledAt?: string;
  createdAt?: string;
  duration?: number;
  type?: Interview["type"];
  status?: Interview["status"];
  candidateEmail?: string;
  notes?: string;
}

interface NewInterviewForm {
  candidateName: string;
  position: string;
  date: string;
  time: string;
  duration: number;
  type: Interview["type"];
  status: Interview["status"];
  candidateEmail: string;
  candidatePhone: string;
  notes: string;
}

// simple mock data fallback (module-level)
const mockInterviews: Interview[] = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    position: "Senior Frontend Developer",
    date: new Date(),
    time: "09:00",
    duration: 60,
    type: "video",
    status: "confirmed",
    interviewer: "Alex Chen",
    candidateEmail: "sarah.johnson@email.com",
    candidatePhone: "+1 (555) 123-4567",
    notes: "Focus on React expertise and system design",
    reminderSent: true,
  },
  {
    id: "2",
    candidateName: "Michael Torres",
    position: "Backend Engineer",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: "14:00",
    duration: 45,
    type: "in-person",
    status: "scheduled",
    interviewer: "Jessica Park",
    location: "Conference Room A",
    candidateEmail: "michael.torres@email.com",
    notes: "Technical interview with coding challenge",
    reminderSent: false,
  },
  {
    id: "3",
    candidateName: "Emily Rodriguez",
    position: "UX Designer",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: "11:30",
    duration: 90,
    type: "video",
    status: "confirmed",
    interviewer: "David Kim",
    candidateEmail: "emily.rodriguez@email.com",
    notes: "Portfolio review and design thinking exercise",
    reminderSent: true,
  },
];

function InterviewScheduler() {
  const [selectedDate, _setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"day" | "week" | "month">(
    "week",
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [_loading, setLoading] = useState(true);

  // mock data used as fallback (moved to module scope below)

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          const transformedInterviews = (data.interviews || []).map(
            (interview: ApiInterview) => ({
              id: interview.id || Date.now().toString(),
              candidateName: interview.candidateName || "Anonymous",
              position: interview.title || "Position",
              date: new Date(
                interview.scheduledAt || interview.createdAt || Date.now(),
              ),
              time: new Date(
                interview.scheduledAt || interview.createdAt || Date.now(),
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              duration: interview.duration || 60,
              type: interview.type || "video",
              status: interview.status || "scheduled",
              interviewer: "Interviewer",
              candidateEmail: interview.candidateEmail || "",
              notes: interview.notes || "",
              reminderSent: false,
            }),
          );
          setInterviews(transformedInterviews);
        } else {
          setInterviews(mockInterviews);
        }
      } catch {
        setInterviews(mockInterviews);
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
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [newInterviewForm, setNewInterviewForm] = useState<NewInterviewForm>({
    candidateName: "",
    position: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    duration: 60,
    type: "video",
    status: "scheduled",
    candidateEmail: "",
    candidatePhone: "",
    notes: "",
  });
  const [filterStatus, _setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const { data: session } = useSession();

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
          (i) =>
            i.date.toDateString() === selectedDate.toDateString() &&
            i.time === time,
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
      interview.candidateName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getUpcomingInterviews = () => {
    const now = new Date();
    return interviews
      .filter((interview) => {
        const interviewDateTime = new Date(interview.date);
        const [hours, minutes] = interview.time.split(":").map(Number);
        interviewDateTime.setHours(hours, minutes);
        return interviewDateTime > now;
      })
      .sort((a, b) => {
        const aDateTime = new Date(a.date);
        const [aHours, aMinutes] = a.time.split(":").map(Number);
        aDateTime.setHours(aHours, aMinutes);

        const bDateTime = new Date(b.date);
        const [bHours, bMinutes] = b.time.split(":").map(Number);
        bDateTime.setHours(bHours, bMinutes);

        return aDateTime.getTime() - bDateTime.getTime();
      });
  };

  const getDayStats = () => {
    const today = new Date();
    const todayInterviews = interviews.filter(
      (i) => i.date.toDateString() === today.toDateString(),
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
      return interview.date >= startOfWeek && interview.date <= endOfWeek;
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

    if (!newInterviewForm.date) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date(newInterviewForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = "Date cannot be in the past";
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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
                        "Syncing interviews to Google Calendar...",
                      );
                      const response = await fetch(
                        "/api/interviews/sync-calendar",
                        {
                          method: "POST",
                        },
                      );

                      if (response.ok) {
                        const result = await response.json();
                        setSuccessMessage(
                          `Synced ${result.synced} interview(s) to Google Calendar!` +
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
                        "Failed to sync interviews to Google Calendar",
                      );
                      setTimeout(() => setErrorMessage(null), 5000);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Sync All Interviews
                </Button>
              )}
              <Button variant="outline" size="icon">
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
                      <p className="text-3xl font-bold text-emerald-600">
                        {dayStats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <span className="text-green-600">
                      ✓ {dayStats.confirmed} Confirmed
                    </span>
                    <span className="text-blue-600">
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
                      <p className="text-3xl font-bold text-teal-600">
                        {getWeekStats()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% from last week
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
                      <p className="text-3xl font-bold text-blue-600">87%</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={87} className="h-2" />
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
                      <p className="text-3xl font-bold text-purple-600">
                        52min
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Timer className="w-6 h-6 text-purple-600" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2 space-y-6">
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
                    <div className="space-y-2">
                      {timeSlots.map((slot, index) => (
                        <motion.div
                          key={slot.time}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={cn(
                            "flex items-center p-3 rounded-lg border transition-colors cursor-pointer",
                            slot.available
                              ? "border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                              : "border-solid bg-muted",
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
                          <div className="w-16 text-sm font-medium text-muted-foreground">
                            {slot.time}
                          </div>

                          {slot.interview ? (
                            <div className="flex items-center justify-between flex-1 ml-4">
                              <div className="flex items-center gap-3">
                                {getTypeIcon(slot.interview.type)}
                                <div>
                                  <div className="font-medium">
                                    {slot.interview.candidateName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {slot.interview.position} •{" "}
                                    {slot.interview.duration}min
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getStatusColor(
                                    slot.interview.status,
                                  )}
                                >
                                  {slot.interview.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 ml-4 text-muted-foreground">
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">Available</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {selectedView === "week" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div key={day} className="p-2">
                              {day}
                            </div>
                          ),
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = new Date(selectedDate);
                          date.setDate(
                            selectedDate.getDate() - selectedDate.getDay() + i,
                          );
                          const dayInterviews = interviews.filter(
                            (interview) =>
                              interview.date.toDateString() ===
                              date.toDateString(),
                          );

                          return (
                            <motion.div
                              key={date.toDateString()}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={cn(
                                "min-h-[120px] p-2 border rounded-lg",
                                date.toDateString() ===
                                  new Date().toDateString()
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                                  : "border-gray-200 hover:border-gray-300",
                              )}
                            >
                              <div className="text-sm font-medium mb-2">
                                {date.getDate()}
                              </div>
                              <div className="space-y-1">
                                {dayInterviews.slice(0, 3).map((interview) => (
                                  <div
                                    key={interview.id}
                                    className="text-xs p-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 truncate"
                                  >
                                    {interview.time} {interview.candidateName}
                                  </div>
                                ))}
                                {dayInterviews.length > 3 && (
                                  <div className="text-xs text-muted-foreground">
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
                      <Button variant="outline" size="sm">
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
                          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
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
                                value={newInterviewForm.date}
                                onChange={(e) => {
                                  setNewInterviewForm((f) => ({
                                    ...f,
                                    date: e.target.value,
                                  }));
                                  if (formErrors.date) {
                                    setFormErrors((prev) => ({
                                      ...prev,
                                      date: "",
                                    }));
                                  }
                                }}
                                className={
                                  formErrors.date ? "border-red-500" : ""
                                }
                              />
                              {formErrors.date && (
                                <p className="text-xs text-red-500 mt-1">
                                  {formErrors.date}
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
                                    newInterviewForm.date,
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
                                    const transformedInterviews = (
                                      data.interviews || []
                                    ).map((interview: ApiInterview) => ({
                                      id: interview.id || Date.now().toString(),
                                      candidateName:
                                        interview.candidateName || "Anonymous",
                                      position: interview.title || "Position",
                                      date: new Date(
                                        interview.scheduledAt ||
                                          interview.createdAt ||
                                          Date.now(),
                                      ),
                                      time: new Date(
                                        interview.scheduledAt ||
                                          interview.createdAt ||
                                          Date.now(),
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      }),
                                      duration: interview.duration || 60,
                                      type: interview.type || "video",
                                      status: interview.status || "scheduled",
                                      interviewer: "Interviewer",
                                      candidateEmail:
                                        interview.candidateEmail || "",
                                      notes: interview.notes || "",
                                      reminderSent: false,
                                    }));
                                    setInterviews(transformedInterviews);
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
                                    date: new Date().toISOString().slice(0, 10),
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
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-medium">
                            {interview.candidateName
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
                                {interview.date.toLocaleDateString()}
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
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>

                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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

          {/* Sidebar */}
          <div className="space-y-6">
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
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                              {interview.candidateName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>

                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {interview.candidateName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {interview.date.toLocaleDateString()} at{" "}
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
                  <Button variant="outline" className="w-full justify-start">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Calendar
                  </Button>
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
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Reminder Due</div>
                      <div className="text-muted-foreground">
                        Michael Torres interview tomorrow at 2:00 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Interview Confirmed</div>
                      <div className="text-muted-foreground">
                        Sarah Johnson confirmed for today at 9:00 AM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Timer className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Schedule Conflict</div>
                      <div className="text-muted-foreground">
                        Overlapping meetings detected for Friday
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <InterviewScheduler />;
}
