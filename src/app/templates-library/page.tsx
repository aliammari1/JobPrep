"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Star,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  Calendar,
  Tag,
  FolderOpen,
  BookOpen,
  Settings,
  Share2,
  Heart,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Users,
  Building,
  Code,
  MessageSquare,
  Zap,
  Target,
  Award,
  Brain,
  Lightbulb,
  Database,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "interview" | "evaluation" | "report" | "question-set";
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  duration: number;
  questions: number;
  author: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
  content?: any;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: any;
  color: string;
}

export default function TemplatesLibraryPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "recent" | "popular" | "rating" | "name"
  >("recent");

  const categories: TemplateCategory[] = [
    {
      id: "all",
      name: "All Templates",
      description: "Browse all available templates",
      count: 45,
      icon: Database,
      color: "text-gray-600",
    },
    {
      id: "technical",
      name: "Technical Interviews",
      description: "Programming and technical skill assessments",
      count: 18,
      icon: Code,
      color: "text-blue-600",
    },
    {
      id: "behavioral",
      name: "Behavioral Interviews",
      description: "Soft skills and personality assessments",
      count: 12,
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      id: "leadership",
      name: "Leadership Interviews",
      description: "Management and leadership evaluations",
      count: 8,
      icon: Users,
      color: "text-purple-600",
    },
    {
      id: "startup",
      name: "Startup Interviews",
      description: "Fast-paced startup environment assessments",
      count: 7,
      icon: Zap,
      color: "text-orange-600",
    },
  ];

  const mockTemplates: Template[] = [
    {
      id: "1",
      name: "Senior Frontend Developer Assessment",
      description:
        "Comprehensive evaluation for senior frontend developers covering React, TypeScript, and system design",
      category: "technical",
      type: "interview",
      difficulty: "Advanced",
      duration: 90,
      questions: 25,
      author: "Sarah Chen",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
      isPublic: true,
      isFavorite: true,
      usageCount: 156,
      rating: 4.8,
      tags: ["React", "TypeScript", "System Design", "CSS", "Performance"],
    },
    {
      id: "2",
      name: "Product Manager Behavioral Interview",
      description:
        "Structured behavioral interview template for product management roles",
      category: "behavioral",
      type: "interview",
      difficulty: "Intermediate",
      duration: 60,
      questions: 15,
      author: "Mike Johnson",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-18"),
      isPublic: true,
      isFavorite: false,
      usageCount: 89,
      rating: 4.5,
      tags: ["Product Management", "Leadership", "Strategy", "Communication"],
    },
    {
      id: "3",
      name: "Engineering Leadership Assessment",
      description:
        "Comprehensive evaluation for engineering management positions",
      category: "leadership",
      type: "evaluation",
      difficulty: "Expert",
      duration: 120,
      questions: 30,
      author: "Alex Rodriguez",
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-15"),
      isPublic: true,
      isFavorite: true,
      usageCount: 67,
      rating: 4.9,
      tags: [
        "Engineering Management",
        "Team Leadership",
        "Technical Strategy",
        "Mentoring",
      ],
    },
    {
      id: "4",
      name: "Startup CTO Evaluation",
      description:
        "Fast-paced technical leadership assessment for startup environments",
      category: "startup",
      type: "interview",
      difficulty: "Expert",
      duration: 75,
      questions: 20,
      author: "Emily Zhang",
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-22"),
      isPublic: true,
      isFavorite: false,
      usageCount: 34,
      rating: 4.7,
      tags: ["CTO", "Startup", "Technical Vision", "Scaling", "Innovation"],
    },
    {
      id: "5",
      name: "Junior Developer Screening",
      description: "Entry-level developer assessment focusing on fundamentals",
      category: "technical",
      type: "question-set",
      difficulty: "Beginner",
      duration: 45,
      questions: 18,
      author: "David Park",
      createdAt: new Date("2024-01-08"),
      updatedAt: new Date("2024-01-16"),
      isPublic: true,
      isFavorite: true,
      usageCount: 234,
      rating: 4.4,
      tags: [
        "Junior Developer",
        "Fundamentals",
        "JavaScript",
        "Problem Solving",
      ],
    },
    {
      id: "6",
      name: "Data Science Interview Template",
      description:
        "Comprehensive data science role evaluation including ML and statistics",
      category: "technical",
      type: "interview",
      difficulty: "Advanced",
      duration: 100,
      questions: 28,
      author: "Lisa Wang",
      createdAt: new Date("2024-01-14"),
      updatedAt: new Date("2024-01-21"),
      isPublic: true,
      isFavorite: false,
      usageCount: 78,
      rating: 4.6,
      tags: ["Data Science", "Machine Learning", "Statistics", "Python", "SQL"],
    },
  ];

  useEffect(() => {
    // Fetch real templates from API
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          setFilteredTemplates(data);
        } else {
          // Fallback to mock data if API fails
          setTemplates(mockTemplates);
          setFilteredTemplates(mockTemplates);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Fallback to mock data
        setTemplates(mockTemplates);
        setFilteredTemplates(mockTemplates);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.usageCount - a.usageCount;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery, sortBy]);

  const toggleFavorite = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      )
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "Expert":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interview":
        return <MessageSquare className="w-4 h-4" />;
      case "evaluation":
        return <CheckCircle className="w-4 h-4" />;
      case "report":
        return <FileText className="w-4 h-4" />;
      case "question-set":
        return <Target className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Templates Library
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Professional interview templates and assessment frameworks
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <BookOpen className="w-4 h-4 mr-2" />
                {filteredTemplates.length} Templates
              </Badge>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? "bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <category.icon
                          className={`w-4 h-4 ${category.color}`}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{category.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {category.count} templates
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sort By</Label>
                  <Select
                    value={sortBy}
                    onValueChange={(
                      value: "recent" | "popular" | "rating" | "name"
                    ) => setSortBy(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently Updated</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>View Mode</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      List
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-emerald-100"
                    >
                      Favorites
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-emerald-100"
                    >
                      Recent
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-emerald-100"
                    >
                      Popular
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Templates
                  </span>
                  <span className="font-semibold">{templates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Your Favorites
                  </span>
                  <span className="font-semibold">
                    {templates.filter((t) => t.isFavorite).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Most Popular
                  </span>
                  <span className="font-semibold">Frontend Dev</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg. Rating
                  </span>
                  <span className="font-semibold">4.6 ⭐</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Actions */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search templates by name, description, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates Grid/List */}
            <StaggeredContainer>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(template.type)}
                              <Badge
                                className={getDifficultyColor(
                                  template.difficulty
                                )}
                              >
                                {template.difficulty}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(template.id);
                              }}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  template.isFavorite
                                    ? "fill-red-500 text-red-500"
                                    : ""
                                }`}
                              />
                            </Button>
                          </div>
                          <CardTitle className="group-hover:text-emerald-600 transition-colors">
                            {template.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {template.description}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {template.duration}m
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {template.questions} questions
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                {template.rating}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.tags.length - 3}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-emerald-600" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {template.author}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(template.type)}
                                <Badge
                                  className={getDifficultyColor(
                                    template.difficulty
                                  )}
                                >
                                  {template.difficulty}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">
                                  {template.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {template.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>{template.duration}m</span>
                                <span>{template.questions} questions</span>
                                <span>★ {template.rating}</span>
                                <span>{template.usageCount} uses</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(template.id);
                                }}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    template.isFavorite
                                      ? "fill-red-500 text-red-500"
                                      : ""
                                  }`}
                                />
                              </Button>
                              <Button variant="outline" size="sm">
                                Use Template
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </StaggeredContainer>

            {filteredTemplates.length === 0 && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No templates found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Template Detail Modal */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedTemplate.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTemplate.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Duration
                          </p>
                          <p className="font-semibold">
                            {selectedTemplate.duration} min
                          </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Questions
                          </p>
                          <p className="font-semibold">
                            {selectedTemplate.questions}
                          </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Usage
                          </p>
                          <p className="font-semibold">
                            {selectedTemplate.usageCount}
                          </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Rating
                          </p>
                          <p className="font-semibold">
                            {selectedTemplate.rating}/5
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="content">
                      <p className="text-gray-600 dark:text-gray-400">
                        Template content preview would be displayed here...
                      </p>
                    </TabsContent>
                    <TabsContent value="settings">
                      <p className="text-gray-600 dark:text-gray-400">
                        Template configuration options would be displayed
                        here...
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="p-6 border-t flex gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600">
                    Use This Template
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
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
