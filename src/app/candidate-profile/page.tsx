"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  Briefcase,
  Star,
  Award,
  Code2,
  Brain,
  MessageSquare,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Camera,
  Upload,
  Edit3,
  Save,
  Plus,
  Trash2,
  Eye,
  Download,
  Share,
  Settings,
  BookOpen,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

interface Skill {
  name: string;
  level: number;
  category: "technical" | "soft" | "language";
  verified: boolean;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
  gpa?: string;
}

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  profileImage?: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  preferences: {
    remoteWork: boolean;
    travelWillingness: number;
    salaryRange: { min: number; max: number };
    availableFrom: string;
  };
  assessmentScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultural: number;
  };
  interviewHistory: Array<{
    date: string;
    position: string;
    result: "passed" | "failed" | "pending";
    feedback: string;
  }>;
}

const sampleCandidate: CandidateProfile = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  title: "Senior Frontend Developer",
  summary:
    "Passionate frontend developer with 8+ years of experience building scalable web applications. Expert in React, TypeScript, and modern web technologies. Strong advocate for user experience and accessibility.",
  skills: [
    { name: "React", level: 95, category: "technical", verified: true },
    { name: "TypeScript", level: 90, category: "technical", verified: true },
    { name: "Node.js", level: 85, category: "technical", verified: false },
    { name: "AWS", level: 75, category: "technical", verified: true },
    { name: "Communication", level: 92, category: "soft", verified: true },
    { name: "Leadership", level: 88, category: "soft", verified: false },
    { name: "Spanish", level: 85, category: "language", verified: false },
  ],
  experience: [
    {
      id: "1",
      company: "TechCorp Inc.",
      position: "Senior Frontend Developer",
      duration: "2020 - Present",
      description:
        "Lead frontend development for multiple high-traffic applications serving 1M+ users.",
      technologies: ["React", "TypeScript", "GraphQL", "AWS"],
      achievements: [
        "Improved application performance by 40%",
        "Led team of 5 developers",
        "Implemented design system used across 10+ products",
      ],
    },
    {
      id: "2",
      company: "StartupXYZ",
      position: "Frontend Developer",
      duration: "2018 - 2020",
      description: "Built and maintained frontend for B2B SaaS platform.",
      technologies: ["Vue.js", "JavaScript", "REST APIs"],
      achievements: [
        "Reduced load times by 60%",
        "Implemented real-time features",
        "Mentored junior developers",
      ],
    },
  ],
  education: [
    {
      id: "1",
      institution: "Stanford University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      year: "2018",
      gpa: "3.8",
    },
  ],
  certifications: [
    "AWS Certified Developer",
    "Google Cloud Professional",
    "Certified Scrum Master",
  ],
  projects: [
    {
      name: "TaskFlow Pro",
      description:
        "Full-stack project management application with real-time collaboration",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB"],
      url: "https://taskflow-pro.com",
    },
    {
      name: "Weather Analytics Dashboard",
      description:
        "Data visualization dashboard for weather patterns using D3.js",
      technologies: ["React", "D3.js", "Python", "FastAPI"],
    },
  ],
  preferences: {
    remoteWork: true,
    travelWillingness: 25,
    salaryRange: { min: 120000, max: 160000 },
    availableFrom: "2024-02-01",
  },
  assessmentScores: {
    technical: 92,
    communication: 88,
    problemSolving: 95,
    cultural: 86,
  },
  interviewHistory: [
    {
      date: "2024-01-15",
      position: "Senior Frontend Developer",
      result: "passed",
      feedback:
        "Excellent technical skills and communication. Strong cultural fit.",
    },
    {
      date: "2023-11-22",
      position: "Lead Developer",
      result: "pending",
      feedback: "Impressive portfolio, awaiting final decision.",
    },
  ],
};

function CandidateProfileBuilder() {
  const [candidate, setCandidate] = useState<CandidateProfile>(sampleCandidate);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: 0,
    category: "technical" as const,
    verified: false,
  });

  const getSkillColor = (level: number) => {
    if (level >= 90) return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (level >= 70) return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    if (level >= 50)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  };

  const getSkillLevelText = (level: number) => {
    if (level >= 90) return "Expert";
    if (level >= 70) return "Advanced";
    if (level >= 50) return "Intermediate";
    return "Beginner";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <Code2 className="w-4 h-4" />;
      case "soft":
        return <Brain className="w-4 h-4" />;
      case "language":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getOverallScore = () => {
    const scores = candidate.assessmentScores;
    return Math.round(
      (scores.technical +
        scores.communication +
        scores.problemSolving +
        scores.cultural) /
        4
    );
  };

  const addSkill = () => {
    if (newSkill.name && newSkill.level > 0) {
      setCandidate((prev) => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill, verified: false }],
      }));
      setNewSkill({
        name: "",
        level: 0,
        category: "technical",
        verified: false,
      });
    }
  };

  const removeSkill = (index: number) => {
    setCandidate((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const skillsByCategory = candidate.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Candidate Profile Builder
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive candidate profiles with skills assessment and
                interview tracking
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                {isEditing ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
              <Button variant="outline" size="icon">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <AnimatedContainer delay={0.1}>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      {isEditing ? (
                        <Input
                          value={candidate.name}
                          onChange={(e) =>
                            setCandidate((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="text-center font-semibold"
                        />
                      ) : (
                        <h3 className="text-xl font-semibold">
                          {candidate.name}
                        </h3>
                      )}

                      {isEditing ? (
                        <Input
                          value={candidate.title}
                          onChange={(e) =>
                            setCandidate((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="text-center text-sm mt-1"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {candidate.title}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input
                            value={candidate.email}
                            onChange={(e) =>
                              setCandidate((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="text-xs"
                          />
                        ) : (
                          <span>{candidate.email}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input
                            value={candidate.phone}
                            onChange={(e) =>
                              setCandidate((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="text-xs"
                          />
                        ) : (
                          <span>{candidate.phone}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input
                            value={candidate.location}
                            onChange={(e) =>
                              setCandidate((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            className="text-xs"
                          />
                        ) : (
                          <span>{candidate.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Assessment Scores */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Assessment Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {getOverallScore()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overall Score
                    </div>
                  </div>

                  {Object.entries(candidate.assessmentScores).map(
                    ([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-medium">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Quick Actions */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    View Resume
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Assessment Test
                  </Button>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
                      <TabsTrigger value="overview" className="rounded-none">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="skills" className="rounded-none">
                        Skills
                      </TabsTrigger>
                      <TabsTrigger value="experience" className="rounded-none">
                        Experience
                      </TabsTrigger>
                      <TabsTrigger value="education" className="rounded-none">
                        Education
                      </TabsTrigger>
                      <TabsTrigger value="projects" className="rounded-none">
                        Projects
                      </TabsTrigger>
                      <TabsTrigger value="preferences" className="rounded-none">
                        Preferences
                      </TabsTrigger>
                      <TabsTrigger value="interviews" className="rounded-none">
                        Interview History
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Professional Summary
                          </h3>
                          {isEditing ? (
                            <Textarea
                              value={candidate.summary}
                              onChange={(e) =>
                                setCandidate((prev) => ({
                                  ...prev,
                                  summary: e.target.value,
                                }))
                              }
                              rows={4}
                              className="resize-none"
                            />
                          ) : (
                            <p className="text-muted-foreground leading-relaxed">
                              {candidate.summary}
                            </p>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Key Highlights
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">Experience</div>
                                <div className="text-sm text-muted-foreground">
                                  {candidate.experience.length} positions
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <Code2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  Technical Skills
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {
                                    candidate.skills.filter(
                                      (s) => s.category === "technical"
                                    ).length
                                  }{" "}
                                  skills
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  Certifications
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {candidate.certifications.length} certified
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-medium">Projects</div>
                                <div className="text-sm text-muted-foreground">
                                  {candidate.projects.length} completed
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Certifications
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {candidate.certifications.map((cert, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Award className="w-3 h-3" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="p-6">
                      <div className="space-y-6">
                        {isEditing && (
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-medium mb-3">Add New Skill</h4>
                            <div className="grid grid-cols-4 gap-3">
                              <Input
                                placeholder="Skill name"
                                value={newSkill.name}
                                onChange={(e) =>
                                  setNewSkill((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                              />
                              <Input
                                type="number"
                                placeholder="Level (1-100)"
                                value={newSkill.level || ""}
                                onChange={(e) =>
                                  setNewSkill((prev) => ({
                                    ...prev,
                                    level: parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                              <select
                                value={newSkill.category}
                                onChange={(e) =>
                                  setNewSkill((prev) => ({
                                    ...prev,
                                    category: e.target.value as any,
                                  }))
                                }
                                className="px-3 py-2 border rounded-md"
                              >
                                <option value="technical">Technical</option>
                                <option value="soft">Soft Skill</option>
                                <option value="language">Language</option>
                              </select>
                              <Button onClick={addSkill}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {Object.entries(skillsByCategory).map(
                          ([category, skills]) => (
                            <div key={category}>
                              <div className="flex items-center gap-2 mb-4">
                                {getCategoryIcon(category)}
                                <h3 className="text-lg font-semibold capitalize">
                                  {category === "technical"
                                    ? "Technical Skills"
                                    : category === "soft"
                                    ? "Soft Skills"
                                    : "Languages"}
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {skills.map((skill, index) => (
                                  <motion.div
                                    key={`${category}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium">
                                          {skill.name}
                                        </span>
                                        {skill.verified && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Verified
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            {getSkillLevelText(skill.level)}
                                          </span>
                                          <span className="font-medium">
                                            {skill.level}%
                                          </span>
                                        </div>
                                        <Progress
                                          value={skill.level}
                                          className="h-2"
                                        />
                                      </div>
                                    </div>

                                    {isEditing && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeSkill(
                                            candidate.skills.indexOf(skill)
                                          )
                                        }
                                        className="ml-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="p-6">
                      <div className="space-y-6">
                        {candidate.experience.map((exp, index) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-6"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {exp.position}
                                </h3>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Building2 className="w-4 h-4" />
                                  <span>{exp.company}</span>
                                  <span>•</span>
                                  <Clock className="w-4 h-4" />
                                  <span>{exp.duration}</span>
                                </div>
                              </div>
                              {isEditing && (
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <p className="text-muted-foreground mb-4">
                              {exp.description}
                            </p>

                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium mb-2">
                                  Technologies
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {exp.technologies.map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="outline">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  Key Achievements
                                </h4>
                                <ul className="space-y-1">
                                  {exp.achievements.map(
                                    (achievement, achIndex) => (
                                      <li
                                        key={achIndex}
                                        className="flex items-start gap-2 text-sm"
                                      >
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                                        <span>{achievement}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="p-6">
                      <div className="space-y-4">
                        {candidate.education.map((edu, index) => (
                          <motion.div
                            key={edu.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 border rounded-lg"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {edu.degree} in {edu.field}
                              </h3>
                              <p className="text-muted-foreground">
                                {edu.institution}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>Class of {edu.year}</span>
                                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                              </div>
                            </div>
                            {isEditing && (
                              <Button variant="ghost" size="sm">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="projects" className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {candidate.projects.map((project, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-6"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold">
                                {project.name}
                              </h3>
                              {project.url && (
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <p className="text-muted-foreground mb-4">
                              {project.description}
                            </p>

                            <div>
                              <h4 className="font-medium mb-2">Technologies</h4>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="outline">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="p-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">
                              Work Preferences
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <span>Remote Work</span>
                                <Badge
                                  variant={
                                    candidate.preferences.remoteWork
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {candidate.preferences.remoteWork
                                    ? "Yes"
                                    : "No"}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Travel Willingness</span>
                                  <span>
                                    {candidate.preferences.travelWillingness}%
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    candidate.preferences.travelWillingness
                                  }
                                  className="h-2"
                                />
                              </div>

                              <div className="p-3 border rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">
                                  Available From
                                </div>
                                <div className="font-medium">
                                  {candidate.preferences.availableFrom}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4">
                              Salary Expectations
                            </h3>
                            <div className="p-4 border rounded-lg bg-muted/30">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                  $
                                  {candidate.preferences.salaryRange.min.toLocaleString()}{" "}
                                  - $
                                  {candidate.preferences.salaryRange.max.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Annual Salary Range
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="interviews" className="p-6">
                      <div className="space-y-4">
                        {candidate.interviewHistory.map((interview, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">
                                {interview.position}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(interview.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm">{interview.feedback}</p>
                            </div>

                            <Badge
                              className={cn(
                                interview.result === "passed" &&
                                  "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
                                interview.result === "failed" &&
                                  "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
                                interview.result === "pending" &&
                                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                              )}
                            >
                              {interview.result}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
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
  return <CandidateProfileBuilder />;
}
