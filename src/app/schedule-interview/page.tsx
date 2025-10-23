"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Video,
  Mail,
  Bell,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  Settings,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Globe,
  Phone,
  MessageSquare,
  FileText,
  Link,
  Zap,
  Brain,
  Target,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  type: "phone" | "video" | "in-person" | "panel";
  date: Date;
  duration: number;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  interviewers: Interviewer[];
  location?: string;
  meetingLink?: string;
  notes?: string;
  round: number;
  department: string;
}

interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isLead: boolean;
}

export default function ScheduleInterview() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedView, setSelectedView] = useState<"calendar" | "list">(
    "calendar",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    candidateId: "",
    candidateName: "",
    candidateEmail: "",
    position: "",
    type: "video" as const,
    date: new Date(),
    time: "10:00",
    duration: 60,
    location: "",
    meetingLink: "",
    notes: "",
    round: 1,
    department: "",
    interviewers: [] as string[],
    sendReminders: true,
    recordSession: false,
    templateId: "",
  });

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/interviews?status=${filterStatus}`);
        if (!response.ok) throw new Error("Failed to fetch interviews");
        const data = await response.json();

        // Transform API data to match Interview interface
        const transformedInterviews: Interview[] = data.map((item: any) => ({
          id: item.id,
          candidateName: item.candidate.name,
          candidateEmail: item.candidate.email,
          position: item.template.title,
          type: "video", // Default type, you can extend the schema to include this
          date: item.scheduledAt ? new Date(item.scheduledAt) : new Date(),
          duration: item.template.duration,
          status: item.status,
          round: 1, // Can be extended in schema
          department: item.template.category,
          interviewers: item.interviewer
            ? [
                {
                  id: item.interviewer.id,
                  name: item.interviewer.name,
                  email: item.interviewer.email,
                  role: item.interviewer.role || "Interviewer",
                  isLead: true,
                },
              ]
            : [],
          meetingLink: item.settings
            ? JSON.parse(item.settings).meetingLink
            : undefined,
          location: item.settings
            ? JSON.parse(item.settings).location
            : undefined,
          notes: item.settings ? JSON.parse(item.settings).notes : undefined,
        }));

        setInterviews(transformedInterviews);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchInterviews();
    }
  }, [session, filterStatus]);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    if (session) {
      fetchTemplates();
    }
  }, [session]);

  // Fetch users (for candidate selection)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users?limit=100");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (session) {
      fetchUsers();
    }
  }, [session]);

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "phone":
        return Phone;
      case "in-person":
        return MapPin;
      case "panel":
        return Users;
      default:
        return Video;
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || interview.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate),
  });

  const handleSchedule = async () => {
    try {
      // Validate required fields
      if (!formData.candidateId) {
        alert("Please select a candidate");
        return;
      }

      if (!formData.templateId) {
        alert("Please select an interview template");
        return;
      }

      // Create interview via API
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: formData.candidateId,
          templateId: formData.templateId,
          interviewerId: formData.interviewers[0] || session?.user?.id, // First interviewer as lead or current user
          scheduledAt: new Date(
            formData.date.setHours(
              parseInt(formData.time.split(":")[0]),
              parseInt(formData.time.split(":")[1]),
            ),
          ).toISOString(),
          allowRecording: formData.recordSession,
          settings: {
            location: formData.location,
            meetingLink: formData.meetingLink,
            notes: formData.notes,
            type: formData.type,
            department: formData.department,
            round: formData.round,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create interview");
      }

      const newInterview = await response.json();

      // Transform and add to local state
      setInterviews((prev) => [
        ...prev,
        {
          id: newInterview.id,
          candidateName: newInterview.candidate.name,
          candidateEmail: newInterview.candidate.email,
          position: newInterview.template.title,
          type: formData.type,
          date: new Date(newInterview.scheduledAt),
          duration: newInterview.template.duration,
          status: newInterview.status,
          round: formData.round,
          department: formData.department,
          interviewers: newInterview.interviewer
            ? [
                {
                  id: newInterview.interviewer.id,
                  name: newInterview.interviewer.name,
                  email: newInterview.interviewer.email,
                  role: newInterview.interviewer.role || "Interviewer",
                  isLead: true,
                },
              ]
            : [],
          meetingLink: formData.meetingLink,
          location: formData.location,
          notes: formData.notes,
        },
      ]);

      setShowForm(false);

      // Reset form
      setFormData({
        candidateId: "",
        candidateName: "",
        candidateEmail: "",
        position: "",
        type: "video",
        date: new Date(),
        time: "10:00",
        duration: 60,
        location: "",
        meetingLink: "",
        notes: "",
        round: 1,
        department: "",
        interviewers: [],
        sendReminders: true,
        recordSession: false,
        templateId: "",
      });
    } catch (error: any) {
      console.error("Error scheduling interview:", error);
      alert(error.message || "Failed to schedule interview. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Schedule Interview
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage interview scheduling with calendar integration and
                automated notifications
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Quick Stats */}
        <AnimatedContainer delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Today's Interviews
                    </p>
                    <p className="text-2xl font-bold text-blue-600">5</p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold text-green-600">23</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Confirmations
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">8</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-purple-600">94%</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar & Filters */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                    Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Quick Actions */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Schedule Optimizer
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Interview Templates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Interview Guidelines
                  </Button>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Interviews Overview
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          selectedView === "calendar" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedView("calendar")}
                      >
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Calendar
                      </Button>
                      <Button
                        variant={
                          selectedView === "list" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedView("list")}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        List
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search by candidate, position, or department..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rescheduled">Rescheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Calendar View */}
            {selectedView === "calendar" && (
              <AnimatedContainer delay={0.5}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Week of{" "}
                      {format(startOfWeek(selectedDate), "MMM dd, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day, index) => (
                        <div key={index} className="space-y-2">
                          <div className="text-center">
                            <div className="text-sm font-medium">
                              {format(day, "EEE")}
                            </div>
                            <div className="text-lg">{format(day, "d")}</div>
                          </div>
                          <div className="space-y-1 min-h-[200px]">
                            {filteredInterviews
                              .filter(
                                (interview) =>
                                  format(interview.date, "yyyy-MM-dd") ===
                                  format(day, "yyyy-MM-dd"),
                              )
                              .map((interview) => {
                                const TypeIcon = getTypeIcon(interview.type);
                                return (
                                  <div
                                    key={interview.id}
                                    className="p-2 rounded-md border text-xs bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center gap-1 mb-1">
                                      <TypeIcon className="w-3 h-3" />
                                      <span className="font-medium truncate">
                                        {interview.candidateName}
                                      </span>
                                    </div>
                                    <div className="text-muted-foreground">
                                      {format(interview.date, "HH:mm")} -{" "}
                                      {interview.position}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            )}

            {/* List View */}
            {selectedView === "list" && (
              <StaggeredContainer className="space-y-4">
                {filteredInterviews.map((interview, index) => {
                  const TypeIcon = getTypeIcon(interview.type);
                  return (
                    <StaggeredItem key={interview.id}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
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
                                  <h3 className="font-semibold">
                                    {interview.candidateName}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {interview.candidateEmail}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    getStatusColor(interview.status),
                                  )}
                                >
                                  {interview.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Interview Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <TypeIcon className="w-4 h-4 text-blue-500" />
                                <span className="capitalize">
                                  {interview.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-green-500" />
                                <span>
                                  {format(interview.date, "MMM dd, HH:mm")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-500" />
                                <span>{interview.duration} min</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-orange-500" />
                                <span>{interview.department}</span>
                              </div>
                            </div>

                            {/* Position & Round */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">
                                  {interview.position}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  Round {interview.round}
                                </Badge>
                              </div>

                              {interview.meetingLink && (
                                <Button variant="outline" size="sm">
                                  <Link className="w-4 h-4 mr-2" />
                                  Join Meeting
                                </Button>
                              )}
                            </div>

                            {/* Interviewers */}
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                Interviewers
                              </div>
                              <div className="flex items-center gap-2">
                                {interview.interviewers.map(
                                  (interviewer, interviewerIndex) => (
                                    <div
                                      key={interviewer.id}
                                      className="flex items-center gap-2"
                                    >
                                      <Avatar className="w-6 h-6">
                                        <AvatarFallback className="text-xs">
                                          {interviewer.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs">
                                        {interviewer.name}
                                        {interviewer.isLead && (
                                          <Badge
                                            variant="secondary"
                                            className="ml-1 text-xs"
                                          >
                                            Lead
                                          </Badge>
                                        )}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Message
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Link
                                </Button>
                              </div>

                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggeredItem>
                  );
                })}
              </StaggeredContainer>
            )}
          </div>
        </div>

        {/* Schedule Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Schedule New Interview</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Select Candidate *</Label>
                    <Select
                      value={formData.candidateId}
                      onValueChange={(value) => {
                        const selectedUser = users.find((u) => u.id === value);
                        setFormData((prev) => ({
                          ...prev,
                          candidateId: value,
                          candidateName: selectedUser?.name || "",
                          candidateEmail: selectedUser?.email || "",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Interview Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="in-person">In Person</SelectItem>
                        <SelectItem value="panel">Panel Interview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(formData.date, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) =>
                            date && setFormData((prev) => ({ ...prev, date }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, time: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Data Science">
                          Data Science
                        </SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Interview Template *</Label>
                    <Select
                      value={formData.templateId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, templateId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interview template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title} - {template.category} (
                            {template.difficulty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Add any additional notes or requirements..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reminders"
                      checked={formData.sendReminders}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          sendReminders: checked,
                        }))
                      }
                    />
                    <Label htmlFor="reminders">Send email reminders</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="record"
                      checked={formData.recordSession}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          recordSession: checked,
                        }))
                      }
                    />
                    <Label htmlFor="record">Record session</Label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
