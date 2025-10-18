"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Code, Video, Brain, Shield, CheckCircle } from "lucide-react";

export default function ScreeningToolsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Screening Tools</h1>
        <p className="text-muted-foreground mt-1">Automated tools to streamline candidate screening</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Technical Assessment", description: "Code challenges and technical questions", icon: Code, count: 45, color: "text-blue-600" },
          { title: "Video Screening", description: "One-way video interviews", icon: Video, count: 32, color: "text-purple-600" },
          { title: "AI Analysis", description: "Automated candidate evaluation", icon: Brain, count: 28, color: "text-green-600" },
        ].map((tool, idx) => (
          <motion.div key={tool.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <tool.icon className={`h-8 w-8 ${tool.color} mb-2`} />
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{tool.count}</div>
                  <Button size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="video">Video Screening</TabsTrigger>
          <TabsTrigger value="ai">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Technical Assessments</CardTitle>
              <CardDescription>Create and manage coding challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "JavaScript Fundamentals", difficulty: "Easy", completed: 145 },
                  { name: "React Component Design", difficulty: "Medium", completed: 89 },
                  { name: "System Design", difficulty: "Hard", completed: 34 },
                ].map((assessment) => (
                  <div key={assessment.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{assessment.name}</h4>
                      <p className="text-sm text-muted-foreground">{assessment.difficulty} • {assessment.completed} completed</p>
                    </div>
                    <Button variant="outline">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Screening</CardTitle>
              <CardDescription>One-way video interview questions</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Configure video screening questions and time limits...
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Tools</CardTitle>
              <CardDescription>Automated candidate evaluation</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              AI assessment and scoring configuration...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
