"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Users, Clock } from "lucide-react";

export default function SharedNotesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shared Notes</h1>
        <p className="text-muted-foreground mt-1">Collaborative note-taking for interviews</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Notes", value: "145", icon: FileText },
          { label: "Collaborators", value: "8", icon: Users },
          { label: "Last Updated", value: "5m ago", icon: Clock },
        ].map((stat, idx) => (
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interview Notes - Sarah Johnson</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Start typing notes..." className="min-h-[400px]" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Technical Interview Notes", author: "Alice", time: "2h ago" },
                { title: "Culture Fit Discussion", author: "Bob", time: "4h ago" },
                { title: "Follow-up Questions", author: "Carol", time: "1d ago" },
              ].map((note) => (
                <div key={note.title} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <p className="font-medium text-sm">{note.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{note.author} • {note.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
