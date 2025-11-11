"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, FileText, Eye } from "lucide-react";
import { SwipeableQuestionsCard } from "@/components/interview/SwipeableQuestionsCard";

export default function QuestionTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Sample technical questions for preview
  const technicalQuestions = [
    {
      id: 1,
      question: "Explain the difference between var, let, and const in JavaScript",
      type: "technical" as const,
      difficulty: "Easy" as const,
      category: "JavaScript",
      tips: [
        "Discuss hoisting behavior",
        "Explain scope differences",
        "Mention temporal dead zone",
        "Give practical examples"
      ],
      sampleAnswer: "var is function-scoped and hoisted, let and const are block-scoped. const cannot be reassigned but its properties can be modified. let is mutable and block-scoped.",
    },
    {
      id: 2,
      question: "What is event delegation and how does it work?",
      type: "technical" as const,
      difficulty: "Medium" as const,
      category: "JavaScript",
      tips: [
        "Explain event bubbling",
        "Discuss efficiency benefits",
        "Mention event.target vs event.currentTarget",
        "Provide a code example"
      ],
      sampleAnswer: "Event delegation is a technique where you attach a single event listener to a parent element, which handles events for all child elements by leveraging event bubbling.",
    },
    {
      id: 3,
      question: "Design a scalable authentication system for a microservices architecture",
      type: "technical" as const,
      difficulty: "Hard" as const,
      category: "System Design",
      tips: [
        "Discuss OAuth2 and JWT",
        "Consider centralized vs distributed auth",
        "Address token refresh strategies",
        "Mention security best practices"
      ],
      sampleAnswer: "Use JWT tokens with a centralized auth service, implement refresh token rotation, store tokens securely, validate on each service, and use HTTPS for all communication.",
    },
  ];

  const behavioralQuestions = [
    {
      id: 1,
      question: "Tell me about a time when you had to work with a difficult team member",
      type: "behavioral" as const,
      difficulty: "Medium" as const,
      category: "Teamwork",
      tips: [
        "Use STAR format (Situation, Task, Action, Result)",
        "Focus on your actions, not blame",
        "Show empathy and growth",
        "Quantify the results"
      ],
      sampleAnswer: "In a past project, a team member frequently missed deadlines. I scheduled a one-on-one to understand blockers, helped organize their work, and we improved delivery by 40%. I learned the importance of proactive communication.",
    },
    {
      id: 2,
      question: "Describe a situation where you failed and how you handled it",
      type: "behavioral" as const,
      difficulty: "Hard" as const,
      category: "Resilience",
      tips: [
        "Be honest about the failure",
        "Emphasize learning",
        "Show accountability",
        "Explain what you'd do differently"
      ],
      sampleAnswer: "I once shipped a feature with a critical bug to production. I immediately owned the issue, created a hotfix, implemented better testing, and led a blameless retrospective to prevent future occurrences.",
    },
  ];

  const templates = [
    { title: "JavaScript Fundamentals", count: 15, difficulty: "Medium", usage: 145, type: "technical" },
    { title: "React Best Practices", count: 12, difficulty: "Hard", usage: 89, type: "technical" },
    { title: "System Design Basics", count: 8, difficulty: "Hard", usage: 56, type: "technical" },
    { title: "Algorithm Problems", count: 20, difficulty: "Medium", usage: 234, type: "technical" },
    { title: "Teamwork & Collaboration", count: 10, difficulty: "Medium", usage: 167, type: "behavioral" },
    { title: "Leadership & Initiative", count: 8, difficulty: "Hard", usage: 98, type: "behavioral" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePreview = (templateTitle: string) => {
    setSelectedTemplate(templateTitle);
  };

  const getQuestionsForTemplate = (title: string) => {
    if (title.includes("JavaScript") || title.includes("React") || title.includes("System") || title.includes("Algorithm")) {
      return technicalQuestions;
    }
    return behavioralQuestions;
  };

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Question Templates</h1>
            <p className="text-muted-foreground mt-1">Pre-built interview question templates with swipeable preview</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-10" />
        </div>

        <Tabs defaultValue="technical" className="space-y-4">
          <TabsList>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="cultural">Cultural Fit</TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {templates
                .filter((t) => t.type === "technical")
                .map((template) => (
                  <Card key={template.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{template.count} questions</p>
                        </div>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{template.usage} uses</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePreview(template.title)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Button>
                          <Button size="sm">Use Template</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {templates
                .filter((t) => t.type === "behavioral")
                .map((template) => (
                  <Card key={template.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{template.count} questions</p>
                        </div>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{template.usage} uses</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePreview(template.title)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Button>
                          <Button size="sm">Use Template</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="cultural">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Cultural fit question templates will appear here
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Swipeable Questions Modal */}
      {selectedTemplate && (
        <SwipeableQuestionsCard
          questions={getQuestionsForTemplate(selectedTemplate)}
          templateName={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </>
  );
}
