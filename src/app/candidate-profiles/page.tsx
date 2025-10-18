"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Search, Users, Star } from "lucide-react";

export default function CandidateProfilesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidate Profiles</h1>
        <p className="text-muted-foreground mt-1">
          Manage your candidate database
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Candidates", value: "156", icon: Users },
          { label: "In Review", value: "34", icon: Star },
          { label: "Interviewed", value: "23", icon: Users },
          { label: "Avg Rating", value: "4.7", icon: Star },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "Sarah Johnson",
            position: "Frontend Developer",
            status: "in-review",
          },
          {
            name: "Michael Chen",
            position: "Full Stack Engineer",
            status: "interviewed",
          },
          {
            name: "Emily Rodriguez",
            position: "UX Designer",
            status: "shortlisted",
          },
        ].map((candidate, idx) => (
          <motion.div
            key={candidate.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {candidate.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {candidate.position}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{candidate.status}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
