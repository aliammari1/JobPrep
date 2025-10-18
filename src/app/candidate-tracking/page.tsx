"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Eye, Calendar, Clock, Star } from "lucide-react";

const activities = [
  { id: 1, candidate: "Sarah Johnson", action: "Completed technical interview", timestamp: "2 hours ago", status: "success" },
  { id: 2, candidate: "Michael Chen", action: "Scheduled for final round", timestamp: "3 hours ago", status: "info" },
  { id: 3, candidate: "Emily Davis", action: "Submitted code challenge", timestamp: "5 hours ago", status: "success" },
  { id: 4, candidate: "David Kim", action: "Applied for position", timestamp: "6 hours ago", status: "new" },
];

export default function CandidateTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidate Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor candidate progress and activities in real-time</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active Candidates", value: "156", icon: Eye },
          { label: "Interviews Today", value: "12", icon: Calendar },
          { label: "Avg Response Time", value: "2.4h", icon: Clock },
          { label: "Engagement Score", value: "4.7", icon: Star },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search activities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="font-medium">{activity.candidate}</div>
                  <div className="text-sm text-muted-foreground">{activity.action}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                  <Badge variant="secondary">{activity.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
