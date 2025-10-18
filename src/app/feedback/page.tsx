"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Eye,
  Clock,
  Users,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
  Share,
  Calendar,
  Search,
  Settings,
  Plus,
  Edit,
  Trash2,
  Flag,
  Heart,
  Smile,
  Frown,
  Meh,
  FileText,
  Database,
  Mail,
  Bell,
  Archive,
  Tag,
  User,
  Building,
  Briefcase,
  Coffee,
  Lightbulb,
  Zap,
  Globe,
  Camera,
  Mic,
  VideoIcon as Video,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface FeedbackEntry {
  id: string;
  interviewId: string;
  candidateName: string;
  position: string;
  interviewerName: string;
  interviewDate: Date;
  submissionDate: Date;
  overallRating: number;
  status: "draft" | "submitted" | "reviewed";
  categories: {
    communication: number;
    technicalSkills: number;
    problemSolving: number;
    culturalFit: number;
    leadership: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    generalComments: string;
    recommendation: "strongHire" | "hire" | "noHire" | "strongNoHire";
  };
  tags: string[];
  isConfidential: boolean;
}

interface FeedbackTemplate {
  id: string;
  name: string;
  description: string;
  categories: string[];
  questions: {
    question: string;
    type: "rating" | "text" | "checkbox" | "radio";
    options?: string[];
    required: boolean;
  }[];
}

export default function FeedbackSystem() {
  const [activeTab, setActiveTab] = useState("submit");
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "submitted" | "reviewed"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          const transformedFeedback = (data.interviews || []).map(
            (interview: any) => ({
              id: interview.id,
              interviewId: interview.id,
              candidateName: interview.candidateName || "Anonymous",
              position: interview.title || "Position",
              interviewerName: "Interviewer",
              interviewDate: new Date(interview.createdAt),
              submissionDate: new Date(
                interview.updatedAt || interview.createdAt
              ),
              overallRating: (interview.score || 0) / 20,
              status: interview.status === "completed" ? "submitted" : "draft",
              categories: {
                communication: (interview.communicationScore || 0) / 20,
                technicalSkills: (interview.technicalScore || 0) / 20,
                problemSolving: (interview.problemSolvingScore || 0) / 20,
                culturalFit: (interview.culturalFitScore || 0) / 20,
                leadership: (interview.leadershipScore || 0) / 20,
              },
              feedback: {
                strengths: [],
                improvements: [],
                generalComments: interview.notes || "",
              },
              recommendation:
                interview.score > 70
                  ? "hire"
                  : interview.score > 50
                  ? "maybe"
                  : "reject",
              tags: [],
              isConfidential: false,
            })
          );
          setFeedbackEntries(transformedFeedback);
        } else {
          setFeedbackEntries(mockFeedbackEntries);
        }
      } catch (error) {
        setFeedbackEntries(mockFeedbackEntries);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const [newFeedback, setNewFeedback] = useState({
    candidateName: "",
    position: "",
    interviewerName: "",
    overallRating: 0,
    categories: {
      communication: 0,
      technicalSkills: 0,
      problemSolving: 0,
      culturalFit: 0,
      leadership: 0,
    },
    strengths: [""],
    improvements: [""],
    generalComments: "",
    recommendation: "hire" as const,
    tags: [] as string[],
    isConfidential: false,
  });

  const mockFeedbackEntries: FeedbackEntry[] = [
    {
      id: "1",
      interviewId: "INT-001",
      candidateName: "Alice Johnson",
      position: "Senior Software Engineer",
      interviewerName: "John Smith",
      interviewDate: new Date(2024, 9, 15),
      submissionDate: new Date(2024, 9, 15),
      overallRating: 4.5,
      status: "submitted",
      categories: {
        communication: 5,
        technicalSkills: 5,
        problemSolving: 4,
        culturalFit: 4,
        leadership: 4,
      },
      feedback: {
        strengths: [
          "Excellent technical depth in React and Node.js",
          "Clear communication when explaining complex concepts",
          "Strong problem-solving approach with systematic thinking",
        ],
        improvements: [
          "Could benefit from more experience with system design at scale",
          "Leadership experience could be more concrete with specific examples",
        ],
        generalComments:
          "Alice demonstrated strong technical skills and would be a valuable addition to the team. She showed good adaptability when faced with unexpected questions and maintained professionalism throughout.",
        recommendation: "hire",
      },
      tags: ["technical-strong", "good-communicator", "recommended"],
      isConfidential: false,
    },
    {
      id: "2",
      interviewId: "INT-002",
      candidateName: "Bob Chen",
      position: "Product Manager",
      interviewerName: "Sarah Wilson",
      interviewDate: new Date(2024, 9, 14),
      submissionDate: new Date(2024, 9, 14),
      overallRating: 3.0,
      status: "reviewed",
      categories: {
        communication: 3,
        technicalSkills: 3,
        problemSolving: 4,
        culturalFit: 2,
        leadership: 3,
      },
      feedback: {
        strengths: [
          "Good analytical thinking and problem-solving skills",
          "Understanding of product development lifecycle",
        ],
        improvements: [
          "Communication could be more concise and structured",
          "Needs more experience with stakeholder management",
          "Cultural fit concerns due to approach to team collaboration",
        ],
        generalComments:
          "Bob has potential but may need more experience in a PM role. Consider for a junior position or additional rounds to assess fit.",
        recommendation: "noHire",
      },
      tags: ["needs-experience", "cultural-concerns", "potential"],
      isConfidential: true,
    },
    {
      id: "3",
      interviewId: "INT-003",
      candidateName: "Carol Martinez",
      position: "Data Scientist",
      interviewerName: "Mike Johnson",
      interviewDate: new Date(2024, 9, 13),
      submissionDate: new Date(2024, 9, 13),
      overallRating: 4.8,
      status: "submitted",
      categories: {
        communication: 5,
        technicalSkills: 5,
        problemSolving: 5,
        culturalFit: 5,
        leadership: 4,
      },
      feedback: {
        strengths: [
          "Exceptional knowledge of machine learning and statistics",
          "Excellent communication of complex technical concepts",
          "Strong portfolio with real-world impact examples",
          "Great cultural fit with team values",
        ],
        improvements: [
          "Could expand knowledge in MLOps and deployment pipelines",
        ],
        generalComments:
          "Outstanding candidate with strong technical skills and excellent communication. Would be a great addition to our data science team.",
        recommendation: "strongHire",
      },
      tags: ["exceptional", "strong-hire", "technical-expert"],
      isConfidential: false,
    },
  ];

  const feedbackTemplates: FeedbackTemplate[] = [
    {
      id: "1",
      name: "Software Engineer",
      description:
        "Comprehensive feedback template for software engineering roles",
      categories: [
        "Technical Skills",
        "Problem Solving",
        "Communication",
        "Cultural Fit",
      ],
      questions: [
        {
          question: "How would you rate the candidate's coding skills?",
          type: "rating",
          required: true,
        },
        {
          question: "Describe the candidate's approach to problem solving",
          type: "text",
          required: true,
        },
        {
          question:
            "Which technologies did the candidate demonstrate proficiency in?",
          type: "checkbox",
          options: ["JavaScript", "Python", "React", "Node.js", "SQL", "AWS"],
          required: false,
        },
      ],
    },
    {
      id: "2",
      name: "Product Manager",
      description:
        "Feedback template focused on product management competencies",
      categories: [
        "Strategic Thinking",
        "Stakeholder Management",
        "Communication",
        "Leadership",
      ],
      questions: [
        {
          question:
            "How effectively can the candidate communicate with different stakeholders?",
          type: "rating",
          required: true,
        },
        {
          question: "What is your recommendation for this candidate?",
          type: "radio",
          options: ["Strong Hire", "Hire", "No Hire", "Strong No Hire"],
          required: true,
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case "reviewed":
        return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case "strongHire":
        return <Badge className="bg-green-600 text-white">Strong Hire</Badge>;
      case "hire":
        return <Badge className="bg-green-100 text-green-800">Hire</Badge>;
      case "noHire":
        return <Badge className="bg-red-100 text-red-800">No Hire</Badge>;
      case "strongNoHire":
        return <Badge className="bg-red-600 text-white">Strong No Hire</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        )}
      />
    ));
  };

  const handleSubmitFeedback = () => {
    // Handle feedback submission logic
    console.log("Submitting feedback:", newFeedback);
    // Reset form
    setNewFeedback({
      candidateName: "",
      position: "",
      interviewerName: "",
      overallRating: 0,
      categories: {
        communication: 0,
        technicalSkills: 0,
        problemSolving: 0,
        culturalFit: 0,
        leadership: 0,
      },
      strengths: [""],
      improvements: [""],
      generalComments: "",
      recommendation: "hire",
      tags: [],
      isConfidential: false,
    });
  };

  const addStrength = () => {
    setNewFeedback((prev) => ({
      ...prev,
      strengths: [...prev.strengths, ""],
    }));
  };

  const addImprovement = () => {
    setNewFeedback((prev) => ({
      ...prev,
      improvements: [...prev.improvements, ""],
    }));
  };

  const updateStrength = (index: number, value: string) => {
    setNewFeedback((prev) => ({
      ...prev,
      strengths: prev.strengths.map((strength, i) =>
        i === index ? value : strength
      ),
    }));
  };

  const updateImprovement = (index: number, value: string) => {
    setNewFeedback((prev) => ({
      ...prev,
      improvements: prev.improvements.map((improvement, i) =>
        i === index ? value : improvement
      ),
    }));
  };

  const removeStrength = (index: number) => {
    setNewFeedback((prev) => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index),
    }));
  };

  const removeImprovement = (index: number) => {
    setNewFeedback((prev) => ({
      ...prev,
      improvements: prev.improvements.filter((_, i) => i !== index),
    }));
  };

  const filteredFeedback = (
    feedbackEntries.length > 0 ? feedbackEntries : mockFeedbackEntries
  ).filter((entry) => {
    const matchesStatus =
      filterStatus === "all" || entry.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      entry.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.interviewerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Feedback System
              </h1>
              <p className="text-muted-foreground mt-2">
                Structured feedback collection with rating systems and
                collaborative review tools
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Feedback Settings
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Feedback
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
                      Total Feedback
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {mockFeedbackEntries.length}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {
                        mockFeedbackEntries.filter(
                          (f) => f.status === "submitted"
                        ).length
                      }
                    </p>
                  </div>
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {
                        mockFeedbackEntries.filter(
                          (f) => f.status === "reviewed"
                        ).length
                      }
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {(
                        mockFeedbackEntries.reduce(
                          (sum, f) => sum + f.overallRating,
                          0
                        ) / mockFeedbackEntries.length
                      ).toFixed(1)}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedContainer>

        {/* Main Content */}
        <AnimatedContainer delay={0.2}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
              <TabsTrigger value="review">Review Feedback</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Submit Feedback Tab */}
            <TabsContent value="submit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Interview Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Candidate Name</Label>
                      <Input
                        id="candidateName"
                        value={newFeedback.candidateName}
                        onChange={(e) =>
                          setNewFeedback((prev) => ({
                            ...prev,
                            candidateName: e.target.value,
                          }))
                        }
                        placeholder="Enter candidate name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newFeedback.position}
                        onChange={(e) =>
                          setNewFeedback((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        placeholder="Enter position"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interviewerName">Interviewer Name</Label>
                      <Input
                        id="interviewerName"
                        value={newFeedback.interviewerName}
                        onChange={(e) =>
                          setNewFeedback((prev) => ({
                            ...prev,
                            interviewerName: e.target.value,
                          }))
                        }
                        placeholder="Enter interviewer name"
                      />
                    </div>
                  </div>

                  {/* Overall Rating */}
                  <div className="space-y-3">
                    <Label>Overall Rating</Label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-8 h-8 cursor-pointer transition-colors",
                            i < newFeedback.overallRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                          onClick={() =>
                            setNewFeedback((prev) => ({
                              ...prev,
                              overallRating: i + 1,
                            }))
                          }
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {newFeedback.overallRating}/5
                      </span>
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div className="space-y-4">
                    <Label>Category Ratings</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(newFeedback.categories).map(
                        ([category, rating]) => (
                          <div key={category} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium capitalize">
                                {category.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {rating}/5
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-5 h-5 cursor-pointer transition-colors",
                                    i < rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  )}
                                  onClick={() =>
                                    setNewFeedback((prev) => ({
                                      ...prev,
                                      categories: {
                                        ...prev.categories,
                                        [category]: i + 1,
                                      },
                                    }))
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Strengths</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addStrength}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Strength
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newFeedback.strengths.map((strength, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={strength}
                            onChange={(e) =>
                              updateStrength(index, e.target.value)
                            }
                            placeholder="Enter a strength"
                            className="flex-1"
                          />
                          {newFeedback.strengths.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeStrength(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Areas for Improvement</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addImprovement}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Improvement
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newFeedback.improvements.map((improvement, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={improvement}
                            onChange={(e) =>
                              updateImprovement(index, e.target.value)
                            }
                            placeholder="Enter an area for improvement"
                            className="flex-1"
                          />
                          {newFeedback.improvements.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeImprovement(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Comments */}
                  <div className="space-y-2">
                    <Label htmlFor="generalComments">General Comments</Label>
                    <Textarea
                      id="generalComments"
                      value={newFeedback.generalComments}
                      onChange={(e) =>
                        setNewFeedback((prev) => ({
                          ...prev,
                          generalComments: e.target.value,
                        }))
                      }
                      placeholder="Provide overall feedback and comments..."
                      rows={4}
                    />
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-3">
                    <Label>Recommendation</Label>
                    <RadioGroup
                      value={newFeedback.recommendation}
                      onValueChange={(value) =>
                        setNewFeedback((prev) => ({
                          ...prev,
                          recommendation: value as any,
                        }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="strongHire" id="strongHire" />
                        <Label htmlFor="strongHire">Strong Hire</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hire" id="hire" />
                        <Label htmlFor="hire">Hire</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noHire" id="noHire" />
                        <Label htmlFor="noHire">No Hire</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="strongNoHire"
                          id="strongNoHire"
                        />
                        <Label htmlFor="strongNoHire">Strong No Hire</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Confidential */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confidential"
                      checked={newFeedback.isConfidential}
                      onCheckedChange={(checked) =>
                        setNewFeedback((prev) => ({
                          ...prev,
                          isConfidential: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="confidential">Mark as confidential</Label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1">
                      Save as Draft
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Feedback Tab */}
            <TabsContent value="review" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by candidate, position, or interviewer..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <RadioGroup
                      value={filterStatus}
                      onValueChange={(value) => setFilterStatus(value as any)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="submitted" id="submitted" />
                        <Label htmlFor="submitted">Submitted</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reviewed" id="reviewed" />
                        <Label htmlFor="reviewed">Reviewed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="draft" />
                        <Label htmlFor="draft">Draft</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback List */}
              <div className="space-y-4">
                <StaggeredContainer>
                  {filteredFeedback.map((feedback, index) => (
                    <StaggeredItem key={feedback.id}>
                      <Card
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {feedback.candidateName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">
                                    {feedback.candidateName}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {feedback.position}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {feedback.isConfidential && (
                                  <Badge
                                    variant="outline"
                                    className="text-red-600 border-red-600"
                                  >
                                    <Flag className="w-3 h-3 mr-1" />
                                    Confidential
                                  </Badge>
                                )}
                                {getStatusBadge(feedback.status)}
                              </div>
                            </div>

                            {/* Rating and Recommendation */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Overall Rating:
                                </span>
                                <div className="flex">
                                  {getRatingStars(feedback.overallRating)}
                                </div>
                                <span className="text-sm font-medium">
                                  ({feedback.overallRating}/5)
                                </span>
                              </div>
                              {getRecommendationBadge(
                                feedback.feedback.recommendation
                              )}
                            </div>

                            {/* Interviewer and Date */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>
                                  Interviewer: {feedback.interviewerName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>
                                  {feedback.interviewDate.toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Tags */}
                            {feedback.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {feedback.tags.map((tag, tagIndex) => (
                                  <Badge
                                    key={tagIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Action Button */}
                            <div className="flex justify-end">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggeredItem>
                  ))}
                </StaggeredContainer>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Feedback Templates</h3>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbackTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{template.name}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>

                      <div className="space-y-2">
                        <h4 className="font-medium">Categories:</h4>
                        <div className="flex flex-wrap gap-2">
                          {template.categories.map((category, index) => (
                            <Badge key={index} variant="outline">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">
                          Questions: {template.questions.length}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {template.questions.filter((q) => q.required).length}{" "}
                          required,{" "}
                          {template.questions.filter((q) => !q.required).length}{" "}
                          optional
                        </p>
                      </div>

                      <Button variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      Rating Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = mockFeedbackEntries.filter(
                          (f) => Math.floor(f.overallRating) === rating
                        ).length;
                        const percentage =
                          (count / mockFeedbackEntries.length) * 100;
                        return (
                          <div key={rating} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{rating} stars</span>
                              <span>
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Recommendation Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["strongHire", "hire", "noHire", "strongNoHire"].map(
                        (rec) => {
                          const count = mockFeedbackEntries.filter(
                            (f) => f.feedback.recommendation === rec
                          ).length;
                          const percentage =
                            (count / mockFeedbackEntries.length) * 100;
                          return (
                            <div
                              key={rec}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {getRecommendationBadge(rec)}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{count}</div>
                                <div className="text-sm text-muted-foreground">
                                  {percentage.toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedContainer>

        {/* Detailed Feedback Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedFeedback.candidateName}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedFeedback.position} • Detailed Feedback
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFeedback(null)}
                  >
                    ×
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-2">
                        <div className="text-4xl font-bold text-purple-600">
                          {selectedFeedback.overallRating}/5
                        </div>
                        <div className="flex justify-center">
                          {getRatingStars(selectedFeedback.overallRating)}
                        </div>
                        <div className="text-center mt-4">
                          {getRecommendationBadge(
                            selectedFeedback.feedback.recommendation
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(selectedFeedback.categories).map(
                          ([category, rating]) => (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">
                                  {category.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <span>{rating}/5</span>
                              </div>
                              <Progress
                                value={(rating / 5) * 100}
                                className="h-2"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-green-500" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedFeedback.feedback.strengths.map(
                          (strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedFeedback.feedback.improvements.map(
                          (improvement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                              <span className="text-sm">{improvement}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>General Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {selectedFeedback.feedback.generalComments}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Submitted by {selectedFeedback.interviewerName} on{" "}
                    {selectedFeedback.submissionDate.toLocaleDateString()}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFeedback(null)}
                    >
                      Close
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
