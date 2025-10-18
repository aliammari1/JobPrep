"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, MessageSquare } from "lucide-react";

export default function TeamWorkspacePage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Workspace</h1>
        <p className="text-muted-foreground mt-1">Collaborative hiring hub for your team</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Team Members", value: "12", icon: Users },
          { label: "Active Tasks", value: "28", icon: Clock },
          { label: "Completed", value: "145", icon: CheckCircle },
          { label: "Messages", value: "89", icon: MessageSquare },
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Alice Johnson", role: "Hiring Manager", status: "online" },
                { name: "Bob Smith", role: "Technical Lead", status: "online" },
                { name: "Carol White", role: "HR Specialist", status: "away" },
              ].map((member) => (
                <div key={member.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Badge variant={member.status === "online" ? "default" : "secondary"}>{member.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[
                { user: "Alice", action: "reviewed candidate profile", time: "5m ago" },
                { user: "Bob", action: "scheduled interview", time: "12m ago" },
                { user: "Carol", action: "added notes", time: "23m ago" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <p><span className="font-medium">{activity.user}</span> {activity.action}</p>
                  <span className="text-muted-foreground text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
