"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Clock, TrendingUp } from "lucide-react";

export default function RealTimeMetricsPage() {
  const [activeInterviews, setActiveInterviews] = useState(8);
  const [onlineRecruiters, setOnlineRecruiters] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInterviews((prev) => prev + Math.floor(Math.random() * 3) - 1);
      setOnlineRecruiters((prev) => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Metrics</h1>
          <p className="text-muted-foreground mt-1">Live dashboard with auto-updating KPIs</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active Interviews", value: activeInterviews.toString(), icon: Activity, live: true },
          { label: "Online Recruiters", value: onlineRecruiters.toString(), icon: Users, live: true },
          { label: "Avg Response Time", value: "2.4h", icon: Clock, live: false },
          { label: "Conversion Rate", value: "87%", icon: TrendingUp, live: false },
        ].map((stat) => (
          <Card key={stat.label} className={stat.live ? "border-green-500/50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                {stat.live && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { interviewer: "Alice Johnson", candidate: "Sarah Miller", duration: "24m", status: "In Progress" },
                { interviewer: "Bob Smith", candidate: "Michael Chen", duration: "18m", status: "In Progress" },
                { interviewer: "Carol White", candidate: "Emily Davis", duration: "32m", status: "In Progress" },
              ].map((session, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{session.interviewer}</p>
                        <p className="text-sm text-muted-foreground">with {session.candidate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{session.status}</Badge>
                        <span className="text-sm text-muted-foreground">{session.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Interview completed", user: "Bob Smith", time: "2m ago" },
                { action: "Candidate added", user: "Alice Johnson", time: "5m ago" },
                { action: "Evaluation submitted", user: "Carol White", time: "8m ago" },
                { action: "Interview scheduled", user: "David Lee", time: "12m ago" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
