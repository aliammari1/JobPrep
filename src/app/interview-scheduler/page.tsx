"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Mail,
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
  XCircle,
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

function InterviewScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"day" | "week" | "month">(
    "week"
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          const transformedInterviews = (data.interviews || []).map(
            (interview: any) => ({
              id: interview.id,
              candidateName: interview.candidateName || "Anonymous",
              position: interview.title || "Position",
              date: new Date(interview.scheduledAt || interview.createdAt),
              time: new Date(
                interview.scheduledAt || interview.createdAt
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
            })
          );
          setInterviews(transformedInterviews);
        } else {
          setInterviews(mockInterviews);
        }
      } catch (error) {
        setInterviews(mockInterviews);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

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

  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
            i.time === time
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
      (i) => i.date.toDateString() === today.toDateString()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
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
                        onValueChange={(v) => setSelectedView(v as any)}
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
                              : "border-solid bg-muted"
                          )}
                          onClick={() =>
                            slot.available && setShowNewInterviewModal(true)
                          }
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
                                    slot.interview.status
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
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = new Date(selectedDate);
                          date.setDate(
                            selectedDate.getDate() - selectedDate.getDay() + i
                          );
                          const dayInterviews = interviews.filter(
                            (interview) =>
                              interview.date.toDateString() ===
                              date.toDateString()
                          );

                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={cn(
                                "min-h-[120px] p-2 border rounded-lg",
                                date.toDateString() ===
                                  new Date().toDateString()
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                                  : "border-gray-200 hover:border-gray-300"
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
