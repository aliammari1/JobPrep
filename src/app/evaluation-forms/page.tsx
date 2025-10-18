"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Plus, FileText } from "lucide-react";

export default function EvaluationFormsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluation Forms</h1>
          <p className="text-muted-foreground mt-1">Custom evaluation criteria and scoring</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Form
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Forms", value: "24", icon: FileText },
          { label: "In Use", value: "12", icon: Scale },
          { label: "Avg Rating", value: "4.5", icon: Scale },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Technical Skills Assessment", criteria: 8, type: "Technical", status: "Active" },
          { title: "Leadership Evaluation", criteria: 6, type: "Behavioral", status: "Active" },
          { title: "Cultural Fit Scorecard", criteria: 5, type: "Cultural", status: "Draft" },
          { title: "Project Management Skills", criteria: 7, type: "Technical", status: "Active" },
        ].map((form) => (
          <Card key={form.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{form.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{form.criteria} criteria</p>
                </div>
                <Badge variant={form.status === "Active" ? "default" : "secondary"}>{form.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{form.type}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm">Use Form</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
