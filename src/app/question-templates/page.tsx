"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, FileText } from "lucide-react";

export default function QuestionTemplatesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Templates</h1>
          <p className="text-muted-foreground mt-1">Pre-built interview question templates</p>
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
            {[
              { title: "JavaScript Fundamentals", questions: 15, difficulty: "Medium", usage: 145 },
              { title: "React Best Practices", questions: 12, difficulty: "Hard", usage: 89 },
              { title: "System Design Basics", questions: 8, difficulty: "Hard", usage: 56 },
              { title: "Algorithm Problems", questions: 20, difficulty: "Medium", usage: 234 },
            ].map((template) => (
              <Card key={template.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{template.questions} questions</p>
                    </div>
                    <Badge variant={template.difficulty === "Hard" ? "destructive" : "secondary"}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{template.usage} uses</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Preview</Button>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavioral">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Behavioral question templates will appear here
            </CardContent>
          </Card>
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
  );
}
