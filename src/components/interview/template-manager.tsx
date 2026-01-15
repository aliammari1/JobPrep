"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export interface Template {
  id: string;
  title: string;
  content: string;
  category: "greeting" | "question" | "closing" | "feedback" | "custom";
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "1",
    title: "Interview Opening",
    content:
      "Thank you for joining this interview. Let's get started! I'll be asking you some questions about your background and experience.",
    category: "greeting",
  },
  {
    id: "2",
    title: "Technical Question",
    content:
      "Can you walk me through your approach to solving technical problems?",
    category: "question",
  },
  {
    id: "3",
    title: "Experience Question",
    content:
      "Can you describe your most challenging project and how you handled it?",
    category: "question",
  },
  {
    id: "4",
    title: "Career Goals",
    content:
      "Where do you see yourself in 5 years, and how does this role fit into your career path?",
    category: "question",
  },
  {
    id: "5",
    title: "Wrap Up",
    content:
      "Thank you for your time today. Do you have any questions for me? We'll be in touch within 2-3 business days.",
    category: "closing",
  },
  {
    id: "6",
    title: "Quick Feedback",
    content:
      "You did a great job explaining your thought process. Let's move on to the next question.",
    category: "feedback",
  },
];

interface TemplateManagerProps {
  onSelectTemplate: (template: Template) => void;
  onClose?: () => void;
}

export function TemplateManager({
  onSelectTemplate,
  onClose,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("interviewTemplates");
      return stored ? JSON.parse(stored) : DEFAULT_TEMPLATES;
    }
    return DEFAULT_TEMPLATES;
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: "", content: "" });

  const saveTemplates = (updatedTemplates: Template[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem(
      "interviewTemplates",
      JSON.stringify(updatedTemplates),
    );
  };

  const handleAddTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    const template: Template = {
      id: Date.now().toString(),
      title: newTemplate.title,
      content: newTemplate.content,
      category: "custom",
    };

    saveTemplates([...templates, template]);
    setNewTemplate({ title: "", content: "" });
    setShowCreateForm(false);
    toast.success("Template created successfully!");
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "greeting":
        return "bg-blue-100 text-blue-800";
      case "question":
        return "bg-purple-100 text-purple-800";
      case "closing":
        return "bg-green-100 text-green-800";
      case "feedback":
        return "bg-yellow-100 text-yellow-800";
      case "custom":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Message Templates</CardTitle>
        <CardDescription>
          Quick access to common interview messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Template Form */}
        {showCreateForm && (
          <div className="space-y-3 p-4 bg-secondary rounded-lg border-2 border-primary/20">
            <h3 className="font-semibold text-sm">Create New Template</h3>
            <div className="space-y-2">
              <Label htmlFor="template-title">Title</Label>
              <Input
                id="template-title"
                placeholder="e.g., Technical Question"
                value={newTemplate.title}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Message</Label>
              <Textarea
                id="template-content"
                placeholder="Your template message..."
                value={newTemplate.content}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, content: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddTemplate} className="flex-1">
                Add Template
              </Button>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{template.title}</h4>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded mt-1 ${getCategoryColor(
                      template.category,
                    )}`}
                  >
                    {template.category}
                  </span>
                </div>
                {template.category === "custom" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {template.content}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7"
                onClick={() => {
                  onSelectTemplate(template);
                  toast.success("Template inserted!");
                }}
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>

        {/* Add Template Button */}
        {!showCreateForm && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Template
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
