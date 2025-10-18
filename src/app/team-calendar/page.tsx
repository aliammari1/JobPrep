"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Video } from "lucide-react";

export default function TeamCalendarPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage team interviews</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Today's Interviews", value: "12", icon: Calendar },
          { label: "This Week", value: "45", icon: Clock },
          { label: "Team Members", value: "8", icon: Users },
          { label: "Video Calls", value: "34", icon: Video },
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
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px] border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
              <p className="text-muted-foreground">Calendar component will render here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "10:00 AM", candidate: "Sarah Johnson", type: "Technical", interviewer: "Bob" },
                { time: "02:00 PM", candidate: "Michael Chen", type: "Culture Fit", interviewer: "Alice" },
                { time: "04:00 PM", candidate: "Emily Davis", type: "Final Round", interviewer: "Carol" },
              ].map((event, idx) => (
                <div key={idx} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{event.time}</span>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <p className="text-sm">{event.candidate}</p>
                  <p className="text-xs text-muted-foreground">with {event.interviewer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
