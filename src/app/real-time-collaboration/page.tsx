"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Users, Eye, Edit, MessageSquare } from "lucide-react";

export default function RealTimeCollaborationPage() {
  const [activeUsers] = useState([
    { name: "Alice", color: "bg-blue-500" },
    { name: "Bob", color: "bg-green-500" },
    { name: "Carol", color: "bg-purple-500" },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Collaboration</h1>
          <p className="text-muted-foreground mt-1">Work together in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {activeUsers.map((user) => (
              <Avatar key={user.name} className={`border-2 border-white ${user.color}`}>
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{activeUsers.length} online</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Active Sessions", value: "8", icon: Users },
          { label: "Viewers", value: "12", icon: Eye },
          { label: "Edits Today", value: "145", icon: Edit },
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
          <CardTitle>Live Document Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] border rounded-lg p-4 bg-muted/30">
            <p className="text-muted-foreground">Collaborative editing space - type here to see real-time changes...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
